<?php

namespace traits;

use DateTimeImmutable;
use managers\objects\AlarmToken;
use objects\Dice;
use objects\Token;

trait StateTrait
{

    //////////////////////////////////////////////////////////////////////////////
    //////////// Game state actions
    //////////////////////////////////////////////////////////////////////////////
    /*
        Here, you can create methods defined as "game state actions" (see "action" property in states.inc.php).
        The action method of state X is called everytime the current game state is set to X.
    */

    function stStartRound()
    {
        $newRoundNumber = $this->getGlobalVariable(CURRENT_ROUND) + 1;
        $this->setGlobalVariable(CURRENT_ROUND, $newRoundNumber);

        $totalRounds = 7;
        if ($this->isModuleActive(MODULE_MODIFIED_ALTITUDE)) {
            $totalRounds = $totalRounds - ($this->getScenario()->modifiedAltitude - 1);
        }

        $this->notifyAllPlayers("newRoundStarted", clienttranslate('Round (${roundNumber}/${totalRounds}) started'), [
            'roundNumber' => $newRoundNumber,
            'totalRounds' => $totalRounds,
            'finalRound' => $this->isFinalRound()
        ]);

        $this->setGlobalVariable(CURRENT_PHASE, PHASE_STRATEGY);
        $this->notifyAllPlayers("newPhaseStarted", clienttranslate('New phase: ${newPhaseLabel}'), [
            'i18n' => ['newPhaseLabel'],
            'newPhaseLabel' => clienttranslate('Strategy'),
            'newPhase' => PHASE_STRATEGY
        ]);

        $this->notifyAllPlayers( "victoryConditionsUpdated", '', [
            'victoryConditions' => $this->planeManager->getVictoryConditionsResults()
        ]);

        // If there is a REROLL token in the current slot, move it to the available pile
        $plane = $this->planeManager->get();
        $rerollTokens = Token::fromArray($this->tokens->getCardsOfTypeInLocation(TOKEN_REROLL, null,LOCATION_ALTITUDE, $plane->altitude));
        if (sizeof($rerollTokens) > 0) {
            $tokenIds = array_map(fn($token) => $token->id,$rerollTokens);
            $this->tokens->moveCards($tokenIds, LOCATION_AVAILABLE);
            foreach ($tokenIds as $i => $tokenId) {
                $this->notifyAllPlayers("tokenReceived", clienttranslate('Players receive ${token_1}'), [
                    'token_1' => TOKEN_REROLL,
                    'token' => Token::from($this->tokens->getCard($tokenId))
                ]);
            }
        }

        // If there are TRAFFIC dice in the current slot, roll them and add planes
        $approachTrackSpace = $this->getApproachTrack()->spaces[$plane->approach];
        if ($this->isModuleActive(MODULE_TRAFFIC) && array_key_exists(DICE_TRAFFIC, $approachTrackSpace)) {
            $trafficDice = Dice::fromArray($this->dice->pickCardsForLocation($approachTrackSpace[DICE_TRAFFIC], LOCATION_DECK, LOCATION_TRAFFIC));
            foreach ($trafficDice as $trafficDie) {
                $trafficDie->rollDie();
                $approachSpaceToAddTokenTo = $plane->approach + ($trafficDie->getTrafficDieValue() - 1);
                $approachSpaceToAddTokenTo = min($approachSpaceToAddTokenTo, $this->getApproachTrack()->size);

                $planeTokensInReserve = Token::fromArray($this->tokens->getCardsOfTypeInLocation(TOKEN_PLANE, TOKEN_PLANE, LOCATION_RESERVE));
                if (sizeof($planeTokensInReserve) > 0) {
                    $planeTokenInReserve = current($planeTokensInReserve);
                    $this->tokens->moveCard($planeTokenInReserve->id, LOCATION_APPROACH, $approachSpaceToAddTokenTo);

                    $this->notifyAllPlayers("trafficDieRolled", clienttranslate('Traffic die rolls ${icon_dice}: a ${token_1} is added to space ${approachSpace} on the approach'), [
                        'trafficDie' => $trafficDie,
                        'planeToken' => Token::from($this->tokens->getCard($planeTokenInReserve->id)),
                        'approachSpace' => $approachSpaceToAddTokenTo,
                        'icon_dice' => [$trafficDie],
                        'token_1' => TOKEN_PLANE,
                    ]);
                }
            }
        }

        // If there is an alarm activation in the current slot, activate alarm
        if ($this->isModuleActive(MODULE_ALARMS) && array_key_exists(ALARM, $approachTrackSpace)) {
            $nrOfAlarms = $approachTrackSpace[ALARM];
            $alarmTokens = AlarmToken::fromArray($this->tokens->getCardsOfTypeInLocation(TOKEN_ALARM, null, LOCATION_ALARM));
            $alarmTokens = array_filter($alarmTokens, fn($alarmToken) => !$alarmToken->isActive);
            shuffle($alarmTokens);

            $activatedAlarms = [];
            for ($i = 0; $i < $nrOfAlarms; $i++) {
                if (sizeof($alarmTokens) > 0) {
                    $activatedAlarms[] = array_pop($alarmTokens);
                }
            }

            if (sizeof($activatedAlarms) > 0) {
                $activeAlarms = $this->getGlobalVariable(ACTIVE_ALARMS, true, []);
                foreach ($activatedAlarms as $alarm) {
                    $activeAlarms[] = $alarm->typeArg;
                    $alarm->isActive = true;

                    $this->notifyAllPlayers("alarmActivated", clienttranslate('Alarm Activated: <b>${alarmName}</b>'), [
                        'i18n' => ['alarmName'],
                        'alarmName' => $this->ALARM_TOKENS[$alarm->typeArg]['name'],
                        'alarmToken' => $alarm
                    ]);
                }
                $this->setGlobalVariable(ACTIVE_ALARMS, $activeAlarms);
            } else {
                $this->notifyAllPlayers("gameLog", clienttranslate('No Alarm tokens remaining to activate'), []);
            }


        }

        $this->setGlobalVariable(WORKING_TOGETHER_ACTIVATED, false);
        $this->setGlobalVariable(SYNCHRONISATION_ACTIVATED, false);
        $this->setGlobalVariable(KEROSENE_ACTIVATED, false);

        if ($this->isModuleActive(MODULE_TOTAL_TRUST) && array_key_exists(TOTAL_TRUST, $approachTrackSpace)) {
            $this->notifyAllPlayers("gameLog", clienttranslate('Total Trust: communication has become impossible in the cockpit. Skipping Strategy Phase.'), []);
            $this->gamestate->nextState('startDicePlacement');
        } else if ($this->isPermanentTotalTrust()) {
            $this->notifyAllPlayers("gameLog", clienttranslate('Permanent Total Trust: communication has become impossible in the cockpit. Players have opted to skip the Strategy Phase.'), []);
            $this->gamestate->nextState('startDicePlacement');
        } else {
            $this->gamestate->setAllPlayersMultiactive();
            foreach ($this->gamestate->getActivePlayerList() as $playerId) {
                $this->giveExtraTime($playerId);
            }
            $this->gamestate->nextState('strategy');
        }
    }

    function stDicePlacementStart()
    {
        $this->setGlobalVariable(CURRENT_PHASE, PHASE_DICE_PLACEMENT);

        $this->notifyAllPlayers("newPhaseStarted", clienttranslate('New phase: ${newPhaseLabel}'), [
            'i18n' => ['newPhaseLabel'],
            'newPhaseLabel' => clienttranslate('Dice Placement'),
            'newPhase' => PHASE_DICE_PLACEMENT
        ]);

        $plane = $this->planeManager->get();
        $altitudeTrackSpace = $this->getAltitudeTrack()->spaces[$plane->altitude];

        $playerIds = $this->getPlayerIds();
        foreach ($playerIds as $playerId) {
            $playerRole = $this->getPlayerRole($playerId);
            $playerDice = Dice::fromArray($this->dice->getCardsOfTypeInLocation(DICE_PLAYER, $playerRole, LOCATION_PLANE));
            foreach ($playerDice as $playerDie) {
                $playerDie->setSide(1);
            }
            $playerDiceIds = array_map(fn($die) => $die->id, $playerDice);
            if ($this->isModuleActive(MODULE_BAD_VISIBILITY) && array_key_exists(BAD_VISIBILITY, $altitudeTrackSpace) && $altitudeTrackSpace[BAD_VISIBILITY]) {
                $diceToPutAside = array_slice($playerDiceIds, 0, 2);
                $this->dice->moveCards($diceToPutAside, LOCATION_PLAYER_ASIDE, $playerId);
                $playerDiceIds = array_diff($playerDiceIds, $diceToPutAside);
                $this->notifyAllPlayers("dicePutAside", clienttranslate('<b>Bad Visibility:</b> you can only choose from 2 dice'), [
                    'dice' => Dice::fromArray($this->dice->getCards($diceToPutAside)),
                ]);
            }

            $this->dice->moveCards($playerDiceIds, LOCATION_PLAYER, $playerId);
            $this->notifyAllPlayers( "diceReturnedToPlayer", clienttranslate('${player_name} dice are returned'), [
                'playerId' => intval($playerId),
                'player_name' => $this->getPlayerName($playerId),
                'dice' => Dice::fromArray($this->dice->getCards($playerDiceIds)),
            ]);
        }

        // Remove remaining dice (traffic die if used with synchronisation) (interns)
        $remainingDice = Dice::fromArray($this->dice->getCardsInLocation(LOCATION_PLANE));
        if (sizeof($remainingDice) > 0) {
            $remainingDiceIds = array_map(fn($die) => $die->id, $remainingDice);
            $this->dice->moveCards($remainingDiceIds, LOCATION_DECK);
            $this->notifyAllPlayers('diceRemoved', '', [
                'dice' => Dice::fromArray($this->dice->getCards($remainingDiceIds))
            ]);
        }


        // Roll the player dice, and notify only the player of the results
        $playerIds = $this->getPlayerIds();
        foreach ($playerIds as $playerId) {
            $dice = Dice::fromArray($this->dice->getCardsInLocation(LOCATION_PLAYER, $playerId));
            foreach ($dice as $die) {
                $die->rollDie();
            }

            $dice = Dice::fromArray($this->dice->getCardsInLocation(LOCATION_PLAYER, $playerId));

            $this->notifyPlayer($playerId, "diceRolled", clienttranslate('${player_name} rolls ${icon_dice}'), [
                'playerId' => intval($playerId),
                'player_name' => $this->getPlayerName($playerId),
                'dice' =>  $dice,
                'icon_dice' => $dice
            ]);
        }

        $startRole = $this->getAltitudeTrack()->spaces[$plane->altitude][ROUND_START_PLAYER];
        $startPlayerId = $this->getPlayerIdForRole($startRole);

        if ($this->isModuleActive(MODULE_REAL_TIME)) {
            $date = new DateTimeImmutable();
            $this->setGlobalVariable(REAL_TIME_END_TIME, $date->getTimestamp() + $this->getRealTimeTimerSeconds());
            $this->notifyAllPlayers("realTimeTimerStarted", clienttranslate('Timer: ${timerSeconds} seconds remaining'), ['timerSeconds' => $this->getRealTimeTimerSeconds()]);
        }

        $this->giveExtraTime($startPlayerId);
        if ($this->isSpecialAbilityActive(ANTICIPATION)) {
            $this->setGlobalVariable(ACTIVE_PLAYER_AFTER_REROLL, $startPlayerId);
            $this->setGlobalVariable(ACTIVE_STATE_AFTER_REROLL, ST_DICE_PLACEMENT_SELECT);
            $this->setGlobalVariable(REROLL_DICE_AMOUNT, 1);
            $this->gamestate->setPlayersMultiactive([$startPlayerId], ST_REROLL_DICE, true);
            $this->gamestate->jumpToState(ST_REROLL_DICE);
        } else {
            $this->gamestate->changeActivePlayer($startPlayerId);
            $this->gamestate->nextState('');
        }
    }

    function stDicePlacementNext()
    {
        $forceNextPlayer = $this->getGlobalVariable(FORCE_NEXT_PLAYER);
        if ($forceNextPlayer != null) {
            $this->gamestate->changeActivePlayer($forceNextPlayer);
            $this->deleteGlobalVariable(FORCE_NEXT_PLAYER);
        }

        $endTheGame = false;
        if ($this->isFinalRound()) {
            // Check if we can prematurely end the game.
            // All victory conditions must be success
            $allVictoryConditionResults = $this->planeManager->getVictoryConditionsResults();
            $allSuccessVictoryConditionResults = array_filter($allVictoryConditionResults, fn($condition) => $condition['status'] === 'success');
            $endTheGame = sizeof($allVictoryConditionResults) === sizeof($allSuccessVictoryConditionResults);
            // All mandatory spaces must be filled
            if ($endTheGame) {
                $mandatoryActionSpaces = array_filter($this->planeManager->getAllActionSpaces(), fn($actionSpace) => $actionSpace[MANDATORY]);

                foreach ($mandatoryActionSpaces as $spaceId => $mandatoryActionSpace) {
                    if ($this->planeManager->isActionSpaceEmpty($spaceId)) {
                        $endTheGame = false;
                        break;
                    }
                }
            }

            // If Kerosene Module, a die must be placed there or level 6 or more remaining
            if ($endTheGame && $this->isModuleActive(MODULE_KEROSENE)) {
                if ($this->getGlobalVariable(KEROSENE_ACTIVATED)) {
                    $endTheGame = true;
                } else if ($this->planeManager->get()->kerosene >= 6) {
                    $plane = $this->planeManager->get();
                    $plane->kerosene = $plane->kerosene - 6;
                    $this->planeManager->save($plane);

                    $this->notifyAllPlayers( "planeKeroseneChanged", clienttranslate('Kerosene marker ${icon_kerosene_marker} moves to <b>${kerosene}</b>'), [
                        'kerosene' => $plane->kerosene,
                        'icon_kerosene_marker' => 'kerosene_marker'
                    ]);
                    $endTheGame = true;
                } else {
                    $endTheGame = false;
                }
            }
        }

        if ($endTheGame) {
            $this->clearRealTimeTimeIfApplicable();
            $this->gamestate->nextState('landed');
        } else {
            $this->activeNextPlayer();
            $this->giveExtraTime($this->getActivePlayerId());
            $dice = Dice::fromArray($this->dice->getCardsInLocation(LOCATION_PLAYER, $this->getActivePlayerId()));
            $nrOfDiceToPlaceEachRound = 4;
            if ($this->isModuleActive(MODULE_ENGINE_LOSS)) {
                $nrOfDiceToPlaceEachRound = 3;
            }
            if (sizeof($dice) > (4 - $nrOfDiceToPlaceEachRound)) {
                $this->gamestate->nextState('next');
            } else {
                $this->clearRealTimeTimeIfApplicable();
                $this->gamestate->nextState('endRound');
            }
        }
    }

    function stPlaneFailure()
    {
        $this->flightLogManager->saveScenarioResult(false);

        $this->notifyAllPlayers('planeFailure', clienttranslate('MAYDAY MAYDAY, something went horribly wrong...'), [
            "failureReason" => $this->getGlobalVariable(FAILURE_REASON)
        ]);

        $this->gamestate->nextState('');
    }

    function stPlaneLanded()
    {

        $results = $this->planeManager->getVictoryConditionsResults();
        $failure = sizeof(array_filter($results, fn($victoryCondition) => $victoryCondition['status'] == 'failed')) > 0;
        $score = 0;

        if ($failure) {
            $score = -1;
            $this->flightLogManager->saveScenarioResult(false);
        } else {
            $approachTrack = $this->getApproachTrack();
            if ($approachTrack->category == APPROACH_GREEN) {
                $score = 1;
            } else if ($approachTrack->category == APPROACH_YELLOW) {
                $score = 2;
            } else if ($approachTrack->category == APPROACH_RED) {
                $score = 3;
            } else if ($approachTrack->category == APPROACH_BLACK) {
                $score = 4;
            }
            $this->flightLogManager->saveScenarioResult(true);
        }
        $this->notifyAllPlayers('planeLanded', clienttranslate('Plane landed'), [
            "failure" => $failure,
            "victoryConditions" => $results,
            "score" => $score
        ]);

        foreach ($this->getPlayerIds() as $playerId) {
            $this->updatePlayerScore($playerId, $score);
        }

        $this->setGlobalVariable(PLANE_LANDED, true);

        $this->gamestate->nextState('');
    }

    function stSynchronisationStart()
    {
        $this->setGlobalVariable(SYNCHRONISATION_ACTIVATED, true);

        $playerId = $this->getPlayerIdForRole('co-pilot');
        $trafficDice = Dice::fromArray($this->dice->pickCardsForLocation(1, LOCATION_DECK, LOCATION_PLAYER, $playerId));
        $trafficDie = current($trafficDice);
        $trafficDie->rollDie();

        $copilotPlayerId = $this->getPlayerIdForRole('co-pilot');

        $this->notifyPlayer($copilotPlayerId, "diceRolled", '', [
            'playerId' => intval($copilotPlayerId),
            'player_name' => $this->getPlayerName($copilotPlayerId),
            'dice' =>  [$trafficDie],
        ]);

        $this->setGlobalVariable(SYNCHRONISATION_DIE_ID, $trafficDie->id);

        $this->gamestate->changeActivePlayer($playerId);
        $this->gamestate->nextState('');
    }

    function stSynchronisationEnd()
    {
        $playerId = $this->getGlobalVariable(ACTIVE_PLAYER_AFTER_SYNCHRONISATION);
        $this->gamestate->changeActivePlayer($playerId);
        $this->gamestate->nextState('');
    }

    function stRerollDiceEnd()
    {
        $this->gamestate->changeActivePlayer($this->getGlobalVariable(ACTIVE_PLAYER_AFTER_REROLL));
        $this->gamestate->jumpToState($this->getGlobalVariable(ACTIVE_STATE_AFTER_REROLL));
    }

    function stEndOfRound()
    {
        if ($this->isModuleActive(MODULE_KEROSENE) && !$this->getGlobalVariable(KEROSENE_ACTIVATED)) {
            $plane = $this->planeManager->get();
            $plane->kerosene = $plane->kerosene - 6;
            $this->planeManager->save($plane);

            $this->notifyAllPlayers( "planeKeroseneChanged", clienttranslate('Kerosene marker ${icon_kerosene_marker} moves to <b>${kerosene}</b>'), [
                'kerosene' => $plane->kerosene,
                'icon_kerosene_marker' => 'kerosene_marker'
            ]);

            if ($plane->kerosene < 0) {
                $this->setGlobalVariable(FAILURE_REASON, FAILURE_KEROSENE);
                $this->gamestate->nextState('failure');
                return;
            }
        }

        $trafficDice = Dice::fromArray($this->dice->getCardsInLocation(LOCATION_TRAFFIC));
        $this->dice->moveCards(array_map(fn($die) => $die->id, $trafficDice), LOCATION_DECK);
        $this->notifyAllPlayers("trafficDiceReturned", '', []);

        if ($this->isFinalRound()) {
            $this->gamestate->nextState('landed');
        } else {
            $altitudeTrack = $this->getAltitudeTrack();
            $approachTrack = $this->getApproachTrack();

            $plane = $this->planeManager->get();
            $plane->altitude = $plane->altitude + 1;
            $this->planeManager->save($plane);

            $this->notifyAllPlayers( "planeAltitudeChanged", clienttranslate('The plane is decreasing altitude to <b>${altitudeHeight}</b>'), [
                'altitudeHeight' => $altitudeTrack->spaces[$plane->altitude][ALTITUDE_HEIGHT],
                'altitude' => $plane->altitude
            ]);

            $continue = true;
            if ($this->isModuleActive(MODULE_ENGINE_LOSS)) {
                $this->notifyAllPlayers("gameLog", clienttranslate('Engine Loss: approaching airport by 1 space'), []);
                // Auto Approach 1 space
                $continue = $this->planeManager->approachPlane($plane, 1, true);
            }

            if ($continue) {
                if ($plane->altitude == sizeof($altitudeTrack->spaces)) {
                    // The plane has landed, let's see if we're at the airport
                    if ($plane->approach == sizeof($approachTrack->spaces)) {
                        // We're at the airport, start the last round
                        $this->setGlobalVariable(FINAL_ROUND, true);
                        $this->gamestate->nextState('start');
                    } else {
                        // The plane has landed, but not at the airport -> crash
                        $this->setGlobalVariable(FAILURE_REASON, FAILURE_CRASH_LANDED);
                        $this->gamestate->nextState('failure');
                    }
                } else {
                    $this->gamestate->nextState('start');
                }
            }
        }
    }
}