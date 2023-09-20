<?php

namespace managers;

use APP_DbObject;
use objects\Dice;
use objects\Plane;
use objects\Token;
use SkyTeam;

class PlaneManager extends APP_DbObject
{
    function save(Plane $plane)
    {
        self::DbQuery("REPLACE INTO plane 
                            (id, axis, aerodynamics_blue, aerodynamics_orange, brake, approach, altitude)
                          VALUES
                            (1, $plane->axis, $plane->aerodynamicsBlue, $plane->aerodynamicsOrange, $plane->brake, $plane->approach, $plane->altitude);"
        );
    }

    function get() : Plane
    {
        return Plane::from(self::getObjectFromDB("SELECT * FROM plane WHERE id = 1"));
    }

    function getAvailableActionSpaces($playerId): array
    {
        $playerRole = SkyTeam::$instance->getPlayerRole($playerId);
        $result = [];
        $mandatoryResult = [];
        $plane = $this->get();
        $remainingDice = Dice::fromArray(SkyTeam::$instance->dice->getCardsOfTypeInLocation(DICE_PLAYER, $playerRole, LOCATION_PLAYER));
        $diceAlreadyPlaced = Dice::fromArray(SkyTeam::$instance->dice->getCardsInLocation(LOCATION_PLANE));
        foreach ($this->getAllActionSpaces() as $actionSpaceId => $actionSpace) {
            $diceOnActionSpace = array_filter($diceAlreadyPlaced, fn($die) => $die->locationArg == $actionSpaceId);

            if (!array_key_exists($actionSpaceId, $plane->switches) || !$plane->switches[$actionSpaceId]->value) {
                if (in_array($playerRole, $actionSpace[ALLOWED_ROLES]) && sizeof($diceOnActionSpace) == 0) {
                    if (array_key_exists(REQUIRES_SWITCH_IN, $actionSpace)) {
                        if ($plane->switches[$actionSpace[REQUIRES_SWITCH_IN]]->value) {
                            $result[$actionSpaceId] = $actionSpace;
                            if ($actionSpace[MANDATORY]) {
                                $mandatoryResult[$actionSpaceId] = $actionSpace;
                            }
                        }
                    } else {
                        $result[$actionSpaceId] = $actionSpace;
                        if ($actionSpace[MANDATORY]) {
                            $mandatoryResult[$actionSpaceId] = $actionSpace;
                        }
                    }
                }
            }
        }

        if (sizeof($remainingDice) > sizeof($mandatoryResult)) {
            return $result;
        } else {
            return $mandatoryResult;
        }
    }

    function getAllActionSpaces(): array
    {
        // TODO filter out module spaces
        return SkyTeam::$instance->ACTION_SPACES;
    }

    function resolveDicePlacement(Dice $die): bool
    {
        $continue = true;
        $plane = $this->get();
        $actionSpace = $this->getAllActionSpaces()[$die->locationArg];
        if ($actionSpace['type'] == ACTION_SPACE_AXIS) {
            $otherAxisSpace = $die->locationArg == 'axis-1' ? 'axis-2' : 'axis-1';
            $otherAxisSpaceDice = Dice::fromArray(SkyTeam::$instance->dice->getCardsInLocation(LOCATION_PLANE, $otherAxisSpace));
            if (sizeof($otherAxisSpaceDice) > 0) {
                $otherAxisSpaceDie = current($otherAxisSpaceDice);
                $pilotValue = $die->locationArg == 'axis-1' ? $die->side : $otherAxisSpaceDie->side;
                $copilotValue = $die->locationArg == 'axis-2' ? $die->side : $otherAxisSpaceDie->side;
                $axisChange = $copilotValue - $pilotValue;
                $plane->axis = $plane->axis + $axisChange;

                SkyTeam::$instance->notifyAllPlayers( "planeAxisChanged", clienttranslate('The plane axis is changed to <b>${axis}</b>'), [
                    'axis' => $plane->axis
                ]);

                if ($plane->axis >= 3 || $plane->axis <= -3) {
                    SkyTeam::$instance->setGlobalVariable(FAILURE_REASON, FAILURE_AXIS);
                    SkyTeam::$instance->gamestate->jumpToState(ST_PLANE_FAILURE);
                    $continue = false;
                }
            }
        } else if ($actionSpace['type'] == ACTION_SPACE_ENGINES) {
            if (SkyTeam::$instance->isFinalRound()) {
                // This is the final round, so the engine / breaks are checked at the end of the game.
            } else {
                $otherEngineSpace = $die->locationArg == 'engines-1' ? 'engines-2' : 'engines-1';
                $otherEngineSpaceDice = Dice::fromArray(SkyTeam::$instance->dice->getCardsInLocation(LOCATION_PLANE, $otherEngineSpace));
                if (sizeof($otherEngineSpaceDice) > 0) {
                    $otherEngineSpaceDie = current($otherEngineSpaceDice);
                    $totalEngineValue = $die->side + $otherEngineSpaceDie->side;
                    $planeCollision = false;
                    $planeTurnFailure = false;
                    if ($totalEngineValue < $plane->aerodynamicsBlue) {
                        $advanceApproachSpaces = 0;
                    } else if ($totalEngineValue >= $plane->aerodynamicsBlue && $totalEngineValue <= $plane->aerodynamicsOrange) {
                        $advanceApproachSpaces = 1;
                        if (sizeof(SkyTeam::$instance->tokens->getCardsInLocation(LOCATION_APPROACH,$plane->approach)) > 0) {
                            $planeCollision = true;
                        }
                    } else {
                        $advanceApproachSpaces = 2;
                        if (sizeof(SkyTeam::$instance->tokens->getCardsInLocation(LOCATION_APPROACH,$plane->approach)) > 0 ||
                            sizeof(SkyTeam::$instance->tokens->getCardsInLocation(LOCATION_APPROACH,$plane->approach + 1)) > 0) {
                            $planeCollision = true;
                        }
                    }

                    SkyTeam::$instance->notifyAllPlayers( "gameLog", clienttranslate('The plane engines are at <b>${totalEngineValue}</b>: approach the airport <b>${advanceApproachSpaces}</b> space(s)'), [
                        'totalEngineValue' => $totalEngineValue,
                        'advanceApproachSpaces' => $advanceApproachSpaces
                    ]);

                    for ($i = 1; $i <= $advanceApproachSpaces; $i++) {
                        $currentApproachSpace = SkyTeam::$instance->getApproachTrack()->spaces[$plane->approach];
                        if (SkyTeam::$instance->isModuleActive(MODULE_TURNS) && array_key_exists(ALLOWED_AXIS, $currentApproachSpace)) {
                            // The current approach track space has turn requirements, checking now to see if they are in the allowed axis range.
                            if (!in_array($plane->axis, $currentApproachSpace[ALLOWED_AXIS])) {
                                $planeTurnFailure = true;
                                break;
                            }
                        }

                        $plane->approach = $plane->approach + 1;
                        SkyTeam::$instance->notifyAllPlayers( "planeApproachChanged", '', [
                            'approach' => $plane->approach
                        ]);
                    }

                    if ($planeTurnFailure) {
                        SkyTeam::$instance->setGlobalVariable(FAILURE_REASON, FAILURE_TURN);
                        SkyTeam::$instance->gamestate->jumpToState(ST_PLANE_FAILURE);
                        $continue = false;
                    } else if ($plane->approach > sizeof(SkyTeam::$instance->getApproachTrack()->spaces)) {
                        SkyTeam::$instance->setGlobalVariable(FAILURE_REASON, FAILURE_OVERSHOOT);
                        SkyTeam::$instance->gamestate->jumpToState(ST_PLANE_FAILURE);
                        $continue = false;
                    } else if ($planeCollision) {
                        SkyTeam::$instance->setGlobalVariable(FAILURE_REASON, FAILURE_COLLISION);
                        SkyTeam::$instance->gamestate->jumpToState(ST_PLANE_FAILURE);
                        $continue = false;
                    }
                }
            }
        } else if ($actionSpace['type'] == ACTION_SPACE_RADIO) {
            $spaceToTakePlaneFrom = $plane->approach + ($die->side - 1);
            $planeTokensInSpace = Token::fromArray(SkyTeam::$instance->tokens->getCardsOfTypeInLocation(TOKEN_PLANE, null, LOCATION_APPROACH, $spaceToTakePlaneFrom));
            if (sizeof($planeTokensInSpace) > 0) {
                $planeTokenRemoved = current($planeTokensInSpace);
                SkyTeam::$instance->tokens->moveCard($planeTokenRemoved->id, LOCATION_RESERVE);
                $planeTokenRemoved = Token::from(SkyTeam::$instance->tokens->getCard($planeTokenRemoved->id));
                SkyTeam::$instance->notifyAllPlayers( "planeTokenRemoved", clienttranslate('Radio used to divert ${icon_tokens} from approach'), [
                    'icon_tokens' => [$planeTokenRemoved],
                    'plane' => $planeTokenRemoved
                ]);
            }
        } else if ($actionSpace['type'] == ACTION_SPACE_LANDING_GEAR) {
            $switch = $plane->switches[$die->locationArg];
            if (!$switch->value) {
                $switch->value = true;
                $switch->save();

                SkyTeam::$instance->notifyAllPlayers( "planeSwitchChanged", clienttranslate('<b>Landing Gear ${landingGearNumber}</b> ${icon_switch} deployed'), [
                    'planeSwitch' => $switch,
                    'landingGearNumber' => str_replace(ACTION_SPACE_LANDING_GEAR.'-', '', $switch->id),
                    'icon_switch' => 1
                ]);

                $plane->aerodynamicsBlue = $plane->aerodynamicsBlue + 1;
                SkyTeam::$instance->notifyAllPlayers( "planeAerodynamicsChanged", clienttranslate('Plane aerodynamics marker ${icon_plane_marker} moves to <b>${aerodynamicsBlue}</b>'), [
                    'aerodynamicsBlue' => $plane->aerodynamicsBlue,
                    'icon_plane_marker' => 'aerodynamics-blue'
                ]);
            }
        } else if ($actionSpace['type'] == ACTION_SPACE_FLAPS) {
            $switch = $plane->switches[$die->locationArg];
            if (!$switch->value) {
                $switch->value = true;
                $switch->save();

                SkyTeam::$instance->notifyAllPlayers( "planeSwitchChanged", clienttranslate('<b>Flap ${switchNumber}</b> ${icon_switch} deployed'), [
                    'planeSwitch' => $switch,
                    'switchNumber' => str_replace(ACTION_SPACE_FLAPS.'-', '', $switch->id),
                    'icon_switch' => 1
                ]);

                $plane->aerodynamicsOrange = $plane->aerodynamicsOrange + 1;
                SkyTeam::$instance->notifyAllPlayers( "planeAerodynamicsChanged", clienttranslate('Plane aerodynamics marker ${icon_plane_marker} moves to <b>${aerodynamicsOrange}</b>'), [
                    'aerodynamicsOrange' => $plane->aerodynamicsOrange,
                    'icon_plane_marker' => 'aerodynamics-orange'
                ]);
            }
        } else if ($actionSpace['type'] == ACTION_SPACE_CONCENTRATION) {
            $reserveCoffeeTokens = Token::fromArray(SkyTeam::$instance->tokens->getCardsOfTypeInLocation(TOKEN_COFFEE, TOKEN_COFFEE, LOCATION_RESERVE));
            if (sizeof($reserveCoffeeTokens) > 0) {
                $coffeeToken = current ($reserveCoffeeTokens);
                SkyTeam::$instance->tokens->moveCard($coffeeToken->id, LOCATION_AVAILABLE, $coffeeToken->locationArg);

                SkyTeam::$instance->notifyAllPlayers( "tokenReceived", clienttranslate('Concentration: ${icon_tokens} received'), [
                    'token' => Token::from(SkyTeam::$instance->tokens->getCard($coffeeToken->id)),
                    'icon_tokens' => [$coffeeToken],
                ]);
            }
        } else if ($actionSpace['type'] == ACTION_SPACE_BRAKES) {
            $switch = $plane->switches[$die->locationArg];
            if (!$switch->value) {
                $switch->value = true;
                $switch->save();

                SkyTeam::$instance->notifyAllPlayers( "planeSwitchChanged", clienttranslate('<b>Brake ${switchNumber}</b> ${icon_switch} deployed'), [
                    'planeSwitch' => $switch,
                    'switchNumber' => str_replace(ACTION_SPACE_BRAKES.'-', '', $switch->id),
                    'icon_switch' => 1
                ]);

                if ($plane->brake == 0) {
                    $plane->brake = 2;
                } else if ($plane->brake == 2) {
                    $plane->brake = 4;
                } else if ($plane->brake == 4) {
                    $plane->brake = 6;
                }
                SkyTeam::$instance->notifyAllPlayers( "planeBrakeChanged", clienttranslate('Plane brakes marker ${icon_plane_marker} moves to <b>${brake}</b>'), [
                    'brake' => $plane->brake,
                    'icon_plane_marker' => 'brakes-red'
                ]);
            }
        }

        $this->save($plane);

        SkyTeam::$instance->notifyAllPlayers( "victoryConditionsUpdated", '', [
            'victoryConditions' => $this->getVictoryConditionsResults()
        ]);

        return $continue;
    }

    function getVictoryConditionsResults() {
        $victoryConditions = SkyTeam::$instance->getVictoryConditions();
        $isFinalRound = SkyTeam::$instance->isFinalRound();
        $plane = $this->get();
        foreach ($victoryConditions as $conditionLetter => &$victoryCondition) {
            $victoryCondition['status'] = $isFinalRound ? 'failed' : 'pending';
            if ($conditionLetter == VICTORY_A) {
                $planeTokens = Token::fromArray(SkyTeam::$instance->tokens->getCardsOfTypeInLocation(TOKEN_PLANE, null, LOCATION_APPROACH));
                if (sizeof($planeTokens) == 0) {
                    $victoryCondition['status'] = 'success';
                }
            } else if ($conditionLetter == VICTORY_B) {
                $allSwitchesTrue = true;
                foreach ($plane->switches as $planeSwitch) {
                    if (substr($planeSwitch->id, 0, strlen(ACTION_SPACE_FLAPS)) === ACTION_SPACE_FLAPS || substr($planeSwitch->id, 0, strlen(ACTION_SPACE_LANDING_GEAR)) === ACTION_SPACE_LANDING_GEAR) {
                        if (!$planeSwitch->value) {
                            $allSwitchesTrue = false;
                            break;
                        }
                    }
                }
                if ($allSwitchesTrue) {
                    $victoryCondition['status'] = 'success';
                }
            } else if ($conditionLetter == VICTORY_C) {
                if ($plane->axis == 0) {
                    $victoryCondition['status'] = 'success';
                }
            } else if ($conditionLetter == VICTORY_D) {
                if ($isFinalRound) {
                    $dice1 = Dice::fromArray(SkyTeam::$instance->dice->getCardsInLocation(LOCATION_PLANE, 'engines-1'));
                    $dice2 = Dice::fromArray(SkyTeam::$instance->dice->getCardsInLocation(LOCATION_PLANE, 'engines-2'));
                    if (sizeof($dice1) == 1 && sizeof($dice2) == 1) {
                        $totalEngineValue = current($dice1)->side + current($dice2)->side;
                        if ($totalEngineValue < $plane->brake) {
                            $victoryCondition['status'] = 'success';
                        }
                    }
                }
            }

        }
        return $victoryConditions;
    }
}
