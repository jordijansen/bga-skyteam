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
                            (id, axis, aerodynamics_blue, aerodynamics_orange, brake, approach, altitude, kerosene, wind)
                          VALUES
                            (1, $plane->axis, $plane->aerodynamicsBlue, $plane->aerodynamicsOrange, $plane->brake, $plane->approach, $plane->altitude, $plane->kerosene, $plane->wind);"
        );
    }

    function get(): Plane
    {
        return Plane::from(self::getObjectFromDB("SELECT * FROM plane WHERE id = 1"));
    }

    function getAvailableActionSpaces($playerId, $ignoreRoleRestrictions = false): array
    {
        $playerRole = SkyTeam::$instance->getPlayerRole($playerId);
        $result = [];
        $mandatoryResult = [];
        $plane = $this->get();
        $remainingDice = Dice::fromArray(SkyTeam::$instance->dice->getCardsInLocation(LOCATION_PLAYER, $playerId));
        foreach ($this->getAllActionSpaces() as $actionSpaceId => $actionSpace) {

            if (!array_key_exists($actionSpaceId, $plane->switches) || !$plane->switches[$actionSpaceId]->value) {
                if (($ignoreRoleRestrictions || in_array($playerRole, $actionSpace[ALLOWED_ROLES])) && $this->isActionSpaceEmpty($actionSpaceId)) {
                    if (array_key_exists(REQUIRES_SWITCH_IN, $actionSpace)) {
                        if ($plane->switches[$actionSpace[REQUIRES_SWITCH_IN]]->value) {
                            $result[$actionSpaceId] = $actionSpace;
                            if ($actionSpace[MANDATORY] && !$ignoreRoleRestrictions) {
                                $mandatoryResult[$actionSpaceId] = $actionSpace;
                            }
                        }
                    } else {
                        $result[$actionSpaceId] = $actionSpace;
                        if ($actionSpace[MANDATORY] && !$ignoreRoleRestrictions) {
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
        return array_filter(SkyTeam::$instance->ACTION_SPACES, function ($value, $key) {
            return !array_key_exists(MODULE, $value) || in_array($value[MODULE], SkyTeam::$instance->getScenario()->modules);
        }, ARRAY_FILTER_USE_BOTH);
    }

    function isActionSpaceEmpty($actionSpaceId): bool
    {
        $diceAlreadyPlaced = Dice::fromArray(SkyTeam::$instance->dice->getCardsInLocation(LOCATION_PLANE));
        $diceOnActionSpace = array_filter($diceAlreadyPlaced, fn($die) => $die->locationArg == $actionSpaceId);
        if (sizeof($diceOnActionSpace) == 0) {
            return true;
        }
        //TODO CHECK INTERN
        return false;
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
                $pilotValue = $die->locationArg == 'axis-1' ? $die->value : $otherAxisSpaceDie->value;
                $copilotValue = $die->locationArg == 'axis-2' ? $die->value : $otherAxisSpaceDie->value;
                $axisChange = $copilotValue - $pilotValue;
                $plane->axis = $plane->axis + $axisChange;

                SkyTeam::$instance->notifyAllPlayers("planeAxisChanged", clienttranslate('The plane axis is changed to <b>${axis}</b>'), [
                    'axis' => $plane->axis
                ]);

                if ($pilotValue == $copilotValue && SkyTeam::$instance->isSpecialAbilityActive(CONTROL)) {
                    // Gain a COFFEE token if both Axis values are equal.
                    $availableCoffeeTokens = Token::fromArray(SkyTeam::$instance->tokens->getCardsOfTypeInLocation(TOKEN_COFFEE, null, LOCATION_RESERVE));
                    if (sizeof($availableCoffeeTokens) > 0) {
                        $availableCoffeeToken = current($availableCoffeeTokens);
                        SkyTeam::$instance->tokens->moveCard($availableCoffeeToken->id, LOCATION_AVAILABLE, $availableCoffeeToken->locationArg);

                        SkyTeam::$instance->notifyAllPlayers("tokenReceived", clienttranslate('Players receive ${token_1} (Special Ability: Control)'), [
                            'token_1' => TOKEN_COFFEE,
                            'token' => Token::from(SkyTeam::$instance->tokens->getCard($availableCoffeeToken->id))
                        ]);
                    }
                }

                if ($plane->axis >= 3 || $plane->axis <= -3) {
                    SkyTeam::$instance->setGlobalVariable(FAILURE_REASON, FAILURE_AXIS);
                    SkyTeam::$instance->gamestate->jumpToState(ST_PLANE_FAILURE);
                    $continue = false;
                } else if (SkyTeam::$instance->isModuleActive(MODULE_WINDS)) {
                    $plane->wind = $plane->wind + $plane->axis;
                    SkyTeam::$instance->notifyAllPlayers("windChanged", clienttranslate('The wind changed by ${axis} clicks, new wind modifier is <b>${windModifier}</b>'), [
                        'axis' => $plane->axis,
                        'wind' => $plane->wind,
                        'windModifier' => $plane->getWindModifier() > 0 ? '+' . $plane->getWindModifier() : $plane->getWindModifier()
                    ]);
                }
            }
        } else if ($actionSpace['type'] == ACTION_SPACE_ENGINES) {

            $otherEngineSpace = $die->locationArg == 'engines-1' ? 'engines-2' : 'engines-1';
            $otherEngineSpaceDice = Dice::fromArray(SkyTeam::$instance->dice->getCardsInLocation(LOCATION_PLANE, $otherEngineSpace));
            if (sizeof($otherEngineSpaceDice) > 0) {
                $otherEngineSpaceDie = current($otherEngineSpaceDice);
                if ($die->value == $otherEngineSpaceDie->value && SkyTeam::$instance->isSpecialAbilityActive(MASTERY)) {
                    // Gain a REROLL token if both Engine values are equal.
                    $availableRerollTokens = Token::fromArray(SkyTeam::$instance->tokens->getCardsOfTypeInLocation(TOKEN_REROLL, null, LOCATION_RESERVE));
                    if (sizeof($availableRerollTokens) > 0) {
                        $availableRerollToken = current($availableRerollTokens);
                        SkyTeam::$instance->tokens->moveCard($availableRerollToken->id, LOCATION_AVAILABLE);

                        SkyTeam::$instance->notifyAllPlayers("tokenReceived", clienttranslate('Players receive ${token_1} (Special Ability: Mastery)'), [
                            'token_1' => TOKEN_REROLL,
                            'token' => Token::from(SkyTeam::$instance->tokens->getCard($availableRerollToken->id))
                        ]);
                    }
                }

                if (SkyTeam::$instance->isFinalRound()) {
                    // This is the final round, so the engine / brakes are checked at the end of the game.
                } else {
                    $totalEngineValue = $die->value + $otherEngineSpaceDie->value;
                    $logMessage = clienttranslate('The plane speed is at <b>${totalEngineValue}</b> : approach the airport <b>${advanceApproachSpaces}</b> space(s)');
                    if (SkyTeam::$instance->isModuleActive(MODULE_WINDS)) {
                        $totalEngineValue = $totalEngineValue + $plane->getWindModifier();
                        $logMessage = clienttranslate('The plane speed is at <b>${totalEngineValue} (wind modifier: ${windModifier})</b>: approach the airport <b>${advanceApproachSpaces}</b> space(s)');
                    }

                    $planeCollision = false;
                    $planeTurnFailure = false;
                    if ($totalEngineValue <= $plane->aerodynamicsBlue) {
                        $advanceApproachSpaces = 0;
                    } else if ($totalEngineValue <= $plane->aerodynamicsOrange) {
                        $advanceApproachSpaces = 1;
                        if (sizeof(SkyTeam::$instance->tokens->getCardsInLocation(LOCATION_APPROACH, $plane->approach)) > 0) {
                            $planeCollision = true;
                        }
                    } else {
                        $advanceApproachSpaces = 2;
                        if (sizeof(SkyTeam::$instance->tokens->getCardsInLocation(LOCATION_APPROACH, $plane->approach)) > 0 ||
                            sizeof(SkyTeam::$instance->tokens->getCardsInLocation(LOCATION_APPROACH, $plane->approach + 1)) > 0) {
                            $planeCollision = true;
                        }
                    }

                    SkyTeam::$instance->notifyAllPlayers("gameLog", $logMessage, [
                        'totalEngineValue' => $totalEngineValue,
                        'advanceApproachSpaces' => $advanceApproachSpaces,
                        'windModifier' => $plane->getWindModifier() > 0 ? '+' . $plane->getWindModifier() : $plane->getWindModifier()
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
                        SkyTeam::$instance->notifyAllPlayers("planeApproachChanged", '', [
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
            $spaceToTakePlaneFrom = $plane->approach + ($die->value - 1);
            $planeTokensInSpace = Token::fromArray(SkyTeam::$instance->tokens->getCardsOfTypeInLocation(TOKEN_PLANE, null, LOCATION_APPROACH, $spaceToTakePlaneFrom));
            if (sizeof($planeTokensInSpace) > 0) {
                $planeTokenRemoved = current($planeTokensInSpace);
                SkyTeam::$instance->tokens->moveCard($planeTokenRemoved->id, LOCATION_RESERVE);
                $planeTokenRemoved = Token::from(SkyTeam::$instance->tokens->getCard($planeTokenRemoved->id));
                SkyTeam::$instance->notifyAllPlayers("planeTokenRemoved", clienttranslate('Radio used to divert ${icon_tokens} from approach'), [
                    'icon_tokens' => [$planeTokenRemoved],
                    'plane' => $planeTokenRemoved
                ]);
            }
        } else if ($actionSpace['type'] == ACTION_SPACE_LANDING_GEAR) {
            $switch = $plane->switches[$die->locationArg];
            if (!$switch->value) {
                $switch->value = true;
                $switch->save();

                SkyTeam::$instance->notifyAllPlayers("planeSwitchChanged", clienttranslate('<b>Landing Gear ${landingGearNumber}</b> ${icon_switch} deployed'), [
                    'planeSwitch' => $switch,
                    'landingGearNumber' => str_replace(ACTION_SPACE_LANDING_GEAR . '-', '', $switch->id),
                    'icon_switch' => 1
                ]);

                $plane->aerodynamicsBlue = $plane->aerodynamicsBlue + 1;
                SkyTeam::$instance->notifyAllPlayers("planeAerodynamicsChanged", clienttranslate('Plane aerodynamics marker ${icon_plane_marker} moves to <b>${aerodynamicsBlue}</b>'), [
                    'aerodynamicsBlue' => $plane->aerodynamicsBlue,
                    'icon_plane_marker' => 'aerodynamics-blue'
                ]);
            }
        } else if ($actionSpace['type'] == ACTION_SPACE_FLAPS) {
            $switch = $plane->switches[$die->locationArg];
            if (!$switch->value) {
                $switch->value = true;
                $switch->save();

                SkyTeam::$instance->notifyAllPlayers("planeSwitchChanged", clienttranslate('<b>Flap ${switchNumber}</b> ${icon_switch} deployed'), [
                    'planeSwitch' => $switch,
                    'switchNumber' => str_replace(ACTION_SPACE_FLAPS . '-', '', $switch->id),
                    'icon_switch' => 1
                ]);

                $plane->aerodynamicsOrange = $plane->aerodynamicsOrange + 1;
                SkyTeam::$instance->notifyAllPlayers("planeAerodynamicsChanged", clienttranslate('Plane aerodynamics marker ${icon_plane_marker} moves to <b>${aerodynamicsOrange}</b>'), [
                    'aerodynamicsOrange' => $plane->aerodynamicsOrange,
                    'icon_plane_marker' => 'aerodynamics-orange'
                ]);
            }
        } else if ($actionSpace['type'] == ACTION_SPACE_CONCENTRATION) {
            $reserveCoffeeTokens = Token::fromArray(SkyTeam::$instance->tokens->getCardsOfTypeInLocation(TOKEN_COFFEE, TOKEN_COFFEE, LOCATION_RESERVE));
            if (sizeof($reserveCoffeeTokens) > 0) {
                $coffeeToken = current($reserveCoffeeTokens);
                SkyTeam::$instance->tokens->moveCard($coffeeToken->id, LOCATION_AVAILABLE, $coffeeToken->locationArg);

                SkyTeam::$instance->notifyAllPlayers("tokenReceived", clienttranslate('Concentration: ${icon_tokens} received'), [
                    'token' => Token::from(SkyTeam::$instance->tokens->getCard($coffeeToken->id)),
                    'icon_tokens' => [$coffeeToken],
                ]);
            }
        } else if ($actionSpace['type'] == ACTION_SPACE_BRAKES) {
            $switch = $plane->switches[$die->locationArg];
            if (!$switch->value) {
                $switch->value = true;
                $switch->save();

                SkyTeam::$instance->notifyAllPlayers("planeSwitchChanged", clienttranslate('<b>Brake ${switchNumber}</b> ${icon_switch} deployed'), [
                    'planeSwitch' => $switch,
                    'switchNumber' => str_replace(ACTION_SPACE_BRAKES . '-', '', $switch->id),
                    'icon_switch' => 1
                ]);

                if ($plane->brake == 0) {
                    $plane->brake = 2;
                } else if ($plane->brake == 2) {
                    $plane->brake = 4;
                } else if ($plane->brake == 4) {
                    $plane->brake = 6;
                }
                SkyTeam::$instance->notifyAllPlayers("planeBrakeChanged", clienttranslate('Plane brakes marker ${icon_plane_marker} moves to <b>${brake}</b>'), [
                    'brake' => $plane->brake,
                    'icon_plane_marker' => 'brakes-red'
                ]);
            }
        } else if ($actionSpace['type'] == ACTION_SPACE_KEROSENE) {
            if (SkyTeam::$instance->isModuleActive(MODULE_KEROSENE)) {
                $plane->kerosene = $plane->kerosene - $die->value;

                SkyTeam::$instance->notifyAllPlayers("planeKeroseneChanged", clienttranslate('Kerosene marker ${icon_kerosene_marker} moves to <b>${kerosene}</b>'), [
                    'kerosene' => $plane->kerosene,
                    'icon_kerosene_marker' => 'kerosene_marker'
                ]);

                SkyTeam::$instance->setGlobalVariable(KEROSENE_ACTIVATED, true);

                if ($plane->kerosene < 0) {
                    SkyTeam::$instance->setGlobalVariable(FAILURE_REASON, FAILURE_KEROSENE);
                    SkyTeam::$instance->gamestate->jumpToState(ST_PLANE_FAILURE);
                    $continue = false;
                }
            }
        }

        $this->save($plane);

        SkyTeam::$instance->notifyAllPlayers("victoryConditionsUpdated", '', [
            'victoryConditions' => $this->getVictoryConditionsResults()
        ]);

        return $continue;
    }

    function getVictoryConditionsResults()
    {
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
                        $totalEngineValue = current($dice1)->value + current($dice2)->value;
                        if (SkyTeam::$instance->isModuleActive(MODULE_WINDS)) {
                            $totalEngineValue = $totalEngineValue + $plane->getWindModifier();
                        }
                        if ($totalEngineValue <= $plane->brake) {
                            $victoryCondition['status'] = 'success';
                        }
                    }
                }
            }

        }
        return $victoryConditions;
    }
}
