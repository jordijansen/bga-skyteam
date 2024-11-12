<?php

namespace managers;

use APP_DbObject;
use BgaUserException;
use managers\objects\AlarmToken;
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

    function getAvailableActionSpaces($playerId, $ignoreRoleRestrictions = false, $ignoreActionSpaceType = null): array
    {
        $playerRole = SkyTeam::$instance->getPlayerRole($playerId);
        $result = [];
        $mandatoryResult = [];
        $plane = $this->get();
        $remainingDice = [...Dice::fromArray(SkyTeam::$instance->dice->getCardsInLocation(LOCATION_PLAYER, $playerId)), ...Dice::fromArray(SkyTeam::$instance->dice->getCardsInLocation(LOCATION_PLAYER_ASIDE, $playerId))];
        foreach ($this->getAllActionSpaces() as $actionSpaceId => $actionSpace) {
            if (!array_key_exists($actionSpaceId, $plane->switches) || !$plane->switches[$actionSpaceId]->value) {
                if (($ignoreRoleRestrictions || in_array($playerRole, $actionSpace[ALLOWED_ROLES]))
                    && ($ignoreActionSpaceType == null || $actionSpace['type'] != $ignoreActionSpaceType)
                    && $this->isActionSpaceEmpty($actionSpaceId)
                    && $this->isActionSpaceAvailable($plane, $actionSpaceId, $actionSpace)) {
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

        if (SkyTeam::$instance->isModuleActive(MODULE_ALARMS)) {
            $activeAlarms = SkyTeam::$instance->getGlobalVariable(ACTIVE_ALARMS, true, []);
            foreach ($activeAlarms as $activeAlarm) {
                $alarmToken = current(AlarmToken::fromArray(SkyTeam::$instance->tokens->getCardsOfTypeInLocation(TOKEN_ALARM, $activeAlarm, LOCATION_ALARM)));
                $result = array_filter($result, fn($actionSpace, $actionSpaceId) => !in_array($actionSpaceId, $alarmToken->blocksSpaces), ARRAY_FILTER_USE_BOTH);
            }
        }

        $mandatorySpaces = array_filter($mandatoryResult, fn($actionSpace) => in_array($playerRole, $actionSpace[ALLOWED_ROLES]));
        if ($ignoreRoleRestrictions) {
            $pilotPlayerId = SkyTeam::$instance->getPlayerIdForRole(PILOT);
            $pilotRemainingDice = [...Dice::fromArray(SkyTeam::$instance->dice->getCardsInLocation(LOCATION_PLAYER, $pilotPlayerId)), ...Dice::fromArray(SkyTeam::$instance->dice->getCardsInLocation(LOCATION_PLAYER_ASIDE, $pilotPlayerId))];
            $pilotMandatorySpaces = array_filter($mandatoryResult, fn($actionSpace) => in_array(PILOT, $actionSpace[ALLOWED_ROLES]));
            if (sizeof($pilotRemainingDice) < sizeof($pilotMandatorySpaces)) {
                return $pilotMandatorySpaces;
            }
        }

        $nrOfRemainingDice = sizeof($remainingDice);
        if (SkyTeam::$instance->isModuleActive(MODULE_ENGINE_LOSS)) {
            $nrOfRemainingDice = $nrOfRemainingDice - 1;
        }
        if ($nrOfRemainingDice > sizeof($mandatorySpaces)) {
            return $result;
        } else {
            // Normally we would only be able to place dice on the mandatory spots, but if synchronisation can be used it might be different
            if (SkyTeam::$instance->isSpecialAbilityActive(SYNCHRONISATION) && !SkyTeam::$instance->getGlobalVariable(SYNCHRONISATION_ACTIVATED)) {
                // We can still use SYNCHRONISATION check to see if there is a dice on the opposite side
                $oppositeSideType = $playerRole === PILOT ? ACTION_SPACE_FLAPS : ACTION_SPACE_LANDING_GEAR;
                $nrOfDiceOnOppositeSide = intval($this->getUniqueValueFromDB("SELECT count(1) FROM dice WHERE card_location_arg LIKE '$oppositeSideType%'"));

                if ($nrOfDiceOnOppositeSide > 0) {
                    $thisSideSpaceType = $playerRole === PILOT ? ACTION_SPACE_LANDING_GEAR : ACTION_SPACE_FLAPS;
                    $thisSideSpaces = array_filter($result, fn($space) => $space['type'] === $thisSideSpaceType);
                    foreach ($thisSideSpaces as $actionSpaceId => $actionSpace) {
                        $mandatoryResult[$actionSpaceId] = $actionSpace;
                    }
                }
            }

            if (SkyTeam::$instance->isModuleActive(MODULE_INTERN)) {
                $availableInternSpaces = array_filter($result, fn($actionSpace) => $actionSpace['type'] === ACTION_SPACE_INTERN);
                if (sizeof($availableInternSpaces) > 0) {
                    $actionSpaceId = current(array_keys($availableInternSpaces));
                    $actionSpace = current(array_values($availableInternSpaces));
                    $mandatoryResult[$actionSpaceId] = $actionSpace;
                }
            }
            return $mandatoryResult;
        }
    }

    function getAllActionSpaces(): array
    {
        $actionSpaces =  array_filter(SkyTeam::$instance->ACTION_SPACES, function ($value, $key) {
            $moduleMatch = !array_key_exists(MODULE, $value) || in_array($value[MODULE], SkyTeam::$instance->getScenario()->modules);
            $notModuleMatch = !array_key_exists(NOT_MODULE, $value) || !in_array($value[NOT_MODULE], SkyTeam::$instance->getScenario()->modules);
            return $moduleMatch && $notModuleMatch;
        }, ARRAY_FILTER_USE_BOTH);

        if (array_key_exists(ACTION_SPACE_INTERN .'-1', $actionSpaces)) {
            $internDie = $this->getNextInternForRole(PILOT);
            if ($internDie != null) {
                $actionSpaces[ACTION_SPACE_INTERN .'-1'][ALLOWED_VALUES] = array_values(array_filter([1,2,3,4,5,6], fn($value) => $value != $internDie->value));
            }
        }
        if (array_key_exists(ACTION_SPACE_INTERN .'-2', $actionSpaces)) {
            $internDie = $this->getNextInternForRole(CO_PILOT);
            if ($internDie != null) {
                $actionSpaces[ACTION_SPACE_INTERN . '-2'][ALLOWED_VALUES] = array_values(array_filter([1, 2, 3, 4, 5, 6], fn($value) => $value != $internDie->value));
            }
        }

        return $actionSpaces;
    }

    function getNextInternForRole($role): ?Dice
    {
        $internDice = Dice::fromArray(SkyTeam::$instance->dice->getCardsInLocation(LOCATION_INTERN, null, 'card_location_arg'));
        if (sizeof($internDice) > 0) {
            if ($role == PILOT) {
                return array_shift($internDice);
            } else {
                return end($internDice);
            }
        }
        return null;
    }

    function isActionSpaceEmpty($actionSpaceId): bool
    {
        $diceAlreadyPlaced = Dice::fromArray(SkyTeam::$instance->dice->getCardsInLocation(LOCATION_PLANE));
        $diceOnActionSpace = array_filter($diceAlreadyPlaced, fn($die) => $die->locationArg == $actionSpaceId);
        if (sizeof($diceOnActionSpace) == 0) {
            return true;
        }
        return false;
    }

    function isActionSpaceAvailable(Plane $plane, $actionSpaceId, $actionSpace): bool
    {
        if ($actionSpaceId == 'intern-1' || $actionSpaceId == 'intern-2') {
            return sizeof(SkyTeam::$instance->dice->getCardsInLocation(LOCATION_INTERN)) > 0;
        }
        if ($actionSpace['type'] === ACTION_SPACE_ICE_BRAKES) {
            $availableIceBrakeSpaces = [];
            if ($plane->brake === 0) {
                $availableIceBrakeSpaces = ['ice-brakes-1-1', 'ice-brakes-2-1'];
            } if ($plane->brake === 2) {
                $availableIceBrakeSpaces = ['ice-brakes-1-2', 'ice-brakes-2-2'];
            } else if ($plane->brake === 3) {
                $availableIceBrakeSpaces = ['ice-brakes-1-3', 'ice-brakes-2-3'];
            } else if ($plane->brake === 4) {
                $availableIceBrakeSpaces = ['ice-brakes-1-4', 'ice-brakes-2-4'];
            }
            return in_array($actionSpaceId, $availableIceBrakeSpaces);
        }
        if ($actionSpace['type'] === ACTION_SPACE_ALARMS) {
            $activeAlarms = SkyTeam::$instance->getGlobalVariable(ACTIVE_ALARMS, true, []);
            $typeArg = str_replace(ACTION_SPACE_ALARMS.'-', '', $actionSpaceId);
            return in_array($typeArg, $activeAlarms);
        }
        return true;
    }

    function resolveDicePlacement(Dice $die, $force = false): bool
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
                    if (!$force) {
                        throw new BgaUserException('!!!' .FAILURE_AXIS);
                    }
                    SkyTeam::$instance->setGlobalVariable(FAILURE_REASON, FAILURE_AXIS);
                    SkyTeam::$instance->gamestate->jumpToState(ST_PLANE_FAILURE);
                    $continue = false;

                } else if (SkyTeam::$instance->isOneOfModulesActive(MODULE_WINDS, MODULE_WINDS_HEADON)) {
                    $plane->wind = $plane->wind + $plane->axis;
                    if ($plane->wind < 0) {
                        $plane->wind = 20 - abs($plane->wind);
                    } else if ($plane->wind > 19) {
                        $plane->wind = $plane->wind - 20;
                    }
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

                if (SkyTeam::$instance->isModuleActive(MODULE_KEROSENE_LEAK)) {
                    $keroseneLeaked = abs($die->value - $otherEngineSpaceDie->value) + 1;

                    $plane->kerosene = $plane->kerosene - $keroseneLeaked;

                    SkyTeam::$instance->notifyAllPlayers("planeKeroseneChanged", clienttranslate('Leaking ${keroseneLeaked} unit(s) of Kerosene: kerosene marker ${icon_kerosene_marker} moves to <b>${kerosene}</b>'), [
                        'kerosene' => $plane->kerosene,
                        'keroseneLeaked' => $keroseneLeaked,
                        'icon_kerosene_marker' => 'kerosene_marker'
                    ]);

                    if ($plane->kerosene < 0) {
                        if (!$force) {
                            throw new BgaUserException('!!!' .FAILURE_KEROSENE);
                        }
                        SkyTeam::$instance->setGlobalVariable(FAILURE_REASON, FAILURE_KEROSENE);
                        SkyTeam::$instance->gamestate->jumpToState(ST_PLANE_FAILURE);
                        $continue = false;
                    }
                }
                // If we already failed kerosene leak than we have no reason to check anything else.
                if ($continue) {
                    if (SkyTeam::$instance->isFinalRound()) {
                        // If this is the final round check the engine versus the brakes and fail immediatly if not reached.
                        $totalEngineValue = $die->value + $otherEngineSpaceDie->value;
                        $logMessage = clienttranslate('The plane speed is at <b>${totalEngineValue}</b>');
                        if (SkyTeam::$instance->isOneOfModulesActive(MODULE_WINDS, MODULE_WINDS_HEADON)) {
                            $totalEngineValue = $totalEngineValue + $plane->getWindModifier();
                            $logMessage = clienttranslate('The plane speed is at <b>${totalEngineValue} (wind modifier: ${windModifier})');
                        }
                        SkyTeam::$instance->notifyAllPlayers("gameLog", $logMessage, [
                            'totalEngineValue' => $totalEngineValue,
                            'windModifier' => $plane->getWindModifier() > 0 ? '+' . $plane->getWindModifier() : $plane->getWindModifier()
                        ]);

                        $victoryConditionsResults = $this->getVictoryConditionsResults();
                        $engineBrakeCheck = $victoryConditionsResults[VICTORY_D];
                        if ($engineBrakeCheck['status'] === 'failed') {
                            if (!$force) {
                                throw new BgaUserException('!!!speedHigherThanBrakes');
                            }
                            SkyTeam::$instance->gamestate->jumpToState(ST_PLANE_LANDED);
                            $continue = false;
                        }
                    } else {
                        $totalEngineValue = $die->value + $otherEngineSpaceDie->value;
                        $logMessage = clienttranslate('The plane speed is at <b>${totalEngineValue}</b> : approach the airport <b>${advanceApproachSpaces}</b> space(s)');
                        if (SkyTeam::$instance->isOneOfModulesActive(MODULE_WINDS, MODULE_WINDS_HEADON)) {
                            $totalEngineValue = $totalEngineValue + $plane->getWindModifier();
                            $logMessage = clienttranslate('The plane speed is at <b>${totalEngineValue} (wind modifier: ${windModifier})</b>: approach the airport <b>${advanceApproachSpaces}</b> space(s)');
                        }

                        if ($totalEngineValue <= $plane->aerodynamicsBlue) {
                            $advanceApproachSpaces = 0;
                        } else if ($totalEngineValue <= $plane->aerodynamicsOrange) {
                            $advanceApproachSpaces = 1;
                        } else {
                            $advanceApproachSpaces = 2;
                        }

                        SkyTeam::$instance->notifyAllPlayers("gameLog", $logMessage, [
                            'totalEngineValue' => $totalEngineValue,
                            'advanceApproachSpaces' => $advanceApproachSpaces,
                            'windModifier' => $plane->getWindModifier() > 0 ? '+' . $plane->getWindModifier() : $plane->getWindModifier()
                        ]);

                        $continue = $this->approachPlane($plane, $advanceApproachSpaces, $force);
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
            } else {
                if (!$force) {
                    throw new BgaUserException('!!!radioNoPlaneToken');
                }
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
            } else {
                if (!$force) {
                    throw new BgaUserException('!!!concentrationNoCoffee');
                }
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
                    if (!$force) {
                        throw new BgaUserException('!!!' .FAILURE_KEROSENE);
                    }
                    SkyTeam::$instance->setGlobalVariable(FAILURE_REASON, FAILURE_KEROSENE);
                    SkyTeam::$instance->gamestate->jumpToState(ST_PLANE_FAILURE);
                    $continue = false;
                }
            }
        } else if ($actionSpace['type'] == ACTION_SPACE_INTERN) {
            if (SkyTeam::$instance->isModuleActive(MODULE_INTERN)) {
                $role = $die->locationArg == 'intern-1' ? PILOT : CO_PILOT;
                $intern = $this->getNextInternForRole($role);
                $playerId = SkyTeam::$instance->getActivePlayerId();
                SkyTeam::$instance->dice->moveCard($intern->id, LOCATION_PLAYER, $playerId);

                $intern = Dice::from(SkyTeam::$instance->dice->getCard($intern->id));
                SkyTeam::$instance->notifyAllPlayers( 'internTrained', clienttranslate('${player_name} trains the intern and must place ${icon_dice}'), [
                    'playerId' => intval($playerId),
                    'player_name' => SkyTeam::$instance->getPlayerName($playerId),
                    'icon_dice' => [$intern],
                    'die' =>  $intern
                ]);

                if ($die->type === DICE_TRAFFIC) {
                    SkyTeam::$instance->setGlobalVariable(INTERN_TRIGGERED_THROUGH_TRAFFIC, true);
                } else {
                    SkyTeam::$instance->setGlobalVariable(INTERN_TRIGGERED_THROUGH_TRAFFIC, false);
                }

                SkyTeam::$instance->handleTurbulenceAndBadVisibility($playerId);

                SkyTeam::$instance->gamestate->jumpToState(ST_PLACE_INTERN);
                $continue = false;
            }
        } else if ($actionSpace['type'] == ACTION_SPACE_ICE_BRAKES) {
            if (strpos($die->locationArg, 'ice-brakes-1') === false) {
                $otherActionSpaceId = str_replace('ice-brakes-2', 'ice-brakes-1', $die->locationArg);
            } else {
                $otherActionSpaceId = str_replace('ice-brakes-1', 'ice-brakes-2', $die->locationArg);
            }
            $otherDice = Dice::fromArray(SkyTeam::$instance->dice->getCardsInLocation(LOCATION_PLANE, $otherActionSpaceId));
            if (sizeof($otherDice) > 0) {
                if ($plane->brake == 0) {
                    $plane->brake = 2;
                } else if ($plane->brake == 2) {
                    $plane->brake = 3;
                } else if ($plane->brake == 3) {
                    $plane->brake = 4;
                } else if ($plane->brake == 4) {
                    $plane->brake = 5;
                }

                SkyTeam::$instance->notifyAllPlayers("planeBrakeChanged", clienttranslate('Plane brakes marker ${icon_plane_marker} moves to <b>${brake}</b>'), [
                    'brake' => $plane->brake,
                    'icon_plane_marker' => 'brakes-red'
                ]);
            }
        } else if ($actionSpace['type'] == ACTION_SPACE_ALARMS) {
            $typeArg = str_replace(ACTION_SPACE_ALARMS.'-', '', $die->locationArg);

            $activeAlarms = SkyTeam::$instance->getGlobalVariable(ACTIVE_ALARMS, true, []);
            $activeAlarms = array_filter($activeAlarms, fn ($alarmTypeArg) => $alarmTypeArg !== $typeArg);
            SkyTeam::$instance->setGlobalVariable(ACTIVE_ALARMS, $activeAlarms);

            $alarmToken = current(AlarmToken::fromArray(SkyTeam::$instance->tokens->getCardsOfTypeInLocation(TOKEN_ALARM, $typeArg, LOCATION_ALARM)));
            SkyTeam::$instance->tokens->moveCard($alarmToken->id, LOCATION_OUT_OF_THE_GAME);
            $alarmToken->isActive = false;

            SkyTeam::$instance->notifyAllPlayers("alarmDeactivated", clienttranslate('Alarm Deactivated: <b>${alarmName}</b>'), [
                'i18n' => ['alarmName'],
                'alarmName' => SkyTeam::$instance->ALARM_TOKENS[$alarmToken->typeArg]['name'],
                'alarmToken' => $alarmToken
            ]);
        }

        $this->save($plane);

        SkyTeam::$instance->notifyAllPlayers("victoryConditionsUpdated", '', [
            'victoryConditions' => $this->getVictoryConditionsResults()
        ]);

        return $continue;
    }

    function approachPlane($plane, $nrOfSpacesToApproach, $force) {
        $planeCollision = false;
        $planeTurnFailure = false;

        for ($i = 1; $i <= $nrOfSpacesToApproach; $i++) {
            $currentApproachSpace = SkyTeam::$instance->getApproachTrack()->spaces[$plane->approach];
            if (SkyTeam::$instance->isModuleActive(MODULE_TURNS) && array_key_exists(ALLOWED_AXIS, $currentApproachSpace)) {
                // The current approach track space has turn requirements, checking now to see if they are in the allowed axis range.
                if (!in_array($plane->axis, $currentApproachSpace[ALLOWED_AXIS])) {
                    $planeTurnFailure = true;
                    break;
                }
            }
            if (sizeof(SkyTeam::$instance->tokens->getCardsInLocation(LOCATION_APPROACH, $plane->approach)) > 0) {
                $planeCollision = true;
                break;
            }

            $plane->approach = $plane->approach + 1;
            SkyTeam::$instance->notifyAllPlayers("planeApproachChanged", '', [
                'approach' => $plane->approach
            ]);
            $this->save($plane);
        }

        $continue = true;
        if ($planeTurnFailure) {
            if (!$force) {
                throw new BgaUserException('!!!' .FAILURE_TURN);
            }
            SkyTeam::$instance->setGlobalVariable(FAILURE_REASON, FAILURE_TURN);
            SkyTeam::$instance->gamestate->jumpToState(ST_PLANE_FAILURE);
            $continue = false;
        } else if ($plane->approach > sizeof(SkyTeam::$instance->getApproachTrack()->spaces)) {
            if (!$force) {
                throw new BgaUserException('!!!' .FAILURE_OVERSHOOT);
            }
            SkyTeam::$instance->setGlobalVariable(FAILURE_REASON, FAILURE_OVERSHOOT);
            SkyTeam::$instance->gamestate->jumpToState(ST_PLANE_FAILURE);
            $continue = false;
        } else if ($planeCollision) {
            if (!$force) {
                throw new BgaUserException('!!!' .FAILURE_COLLISION);
            }
            SkyTeam::$instance->setGlobalVariable(FAILURE_REASON, FAILURE_COLLISION);
            SkyTeam::$instance->gamestate->jumpToState(ST_PLANE_FAILURE);
            $continue = false;
        }
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
                    if (substr($planeSwitch->id, 0, strlen(ACTION_SPACE_FLAPS)) === ACTION_SPACE_FLAPS
                        || (!SkyTeam::$instance->isModuleActive(MODULE_STUCK_LANDING_GEAR) && substr($planeSwitch->id, 0, strlen(ACTION_SPACE_LANDING_GEAR)) === ACTION_SPACE_LANDING_GEAR)) {
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
                        if (SkyTeam::$instance->isOneOfModulesActive(MODULE_WINDS, MODULE_WINDS_HEADON)) {
                            $totalEngineValue = $totalEngineValue + $plane->getWindModifier();
                        }
                        if ($totalEngineValue <= $plane->brake && $plane->brake >= 2) {
                            $victoryCondition['status'] = 'success';
                        }
                    }
                }
            } else if ($conditionLetter == VICTORY_E) {
                if (sizeof(SkyTeam::$instance->dice->getCardsInLocation(LOCATION_INTERN)) == 0) {
                    $victoryCondition['status'] = 'success';
                }
            } else if ($conditionLetter == VICTORY_F) {
                if ($plane->brake === 5) {
                    $victoryCondition['status'] = 'success';
                }
            }
        }
        return $victoryConditions;
    }
}
