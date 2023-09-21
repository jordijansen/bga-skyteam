<?php

namespace traits;

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

        $this->notifyAllPlayers("newRoundStarted", clienttranslate('Round (${roundNumber}/7) started'), [
            'roundNumber' => $newRoundNumber,
            'finalRound' => $this->isFinalRound()
        ]);

        $this->setGlobalVariable(CURRENT_PHASE, PHASE_STRATEGY);
        $this->notifyAllPlayers("newPhaseStarted", clienttranslate('New phase: ${newPhase}'), [
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

        $this->setGlobalVariable(WORKING_TOGETHER_ACTIVATED, false);
        $this->setGlobalVariable(SYNCHRONISATION_ACTIVATED, false);

        $this->gamestate->setAllPlayersMultiactive();
        foreach ($this->gamestate->getActivePlayerList() as $playerId) {
            $this->giveExtraTime($playerId);
        }
        $this->gamestate->nextState('');
    }

    function stDicePlacementStart()
    {
        $this->setGlobalVariable(CURRENT_PHASE, PHASE_DICE_PLACEMENT);
        $this->notifyAllPlayers("newPhaseStarted", clienttranslate('New phase: ${newPhase}'), [
            'newPhase' => PHASE_DICE_PLACEMENT
        ]);

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

        $plane = $this->planeManager->get();
        $startRole = $this->getAltitudeTrack()->spaces[$plane->altitude][ROUND_START_PLAYER];
        $startPlayerId = $this->getPlayerIdForRole($startRole);

        $this->giveExtraTime($startPlayerId);
        if ($this->isSpecialAbilityActive(ANTICIPATION)) {
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
        $this->activeNextPlayer();
        $this->giveExtraTime($this->getActivePlayerId());
        $dice = Dice::fromArray($this->dice->getCardsInLocation(LOCATION_PLAYER, $this->getActivePlayerId()));
        if (sizeof($dice) > 0) {
            $this->gamestate->nextState('next');
        } else {
            $this->gamestate->nextState('endRound');
        }
    }

    function stPlaneFailure()
    {
        $this->notifyAllPlayers('planeFailure', clienttranslate('MAYDAY MAYDAY, something went horribly wrong...'), [
            "failureReason" => $this->getGlobalVariable(FAILURE_REASON)
        ]);

        $this->gamestate->nextState('');
    }

    function stPlaneLanded()
    {
        $results = $this->planeManager->getVictoryConditionsResults();
        $failure = sizeof(array_filter($results, fn($victoryCondition) => $victoryCondition['status'] == 'failed')) > 0;
        $score = $failure ? -1 : 1;
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

    function stEndOfRound()
    {
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

            $playerIds = $this->getPlayerIds();
            foreach ($playerIds as $playerId) {
                $playerRole = $this->getPlayerRole($playerId);
                $playerDice = Dice::fromArray($this->dice->getCardsOfTypeInLocation(DICE_PLAYER, $playerRole, LOCATION_PLANE));
                foreach ($playerDice as $playerDie) {
                    $playerDie->setSide(1);
                }
                $playerDiceIds = array_map(fn($die) => $die->id, $playerDice);
                $this->dice->moveCards($playerDiceIds, LOCATION_PLAYER, $playerId);
                $this->notifyAllPlayers( "diceReturnedToPlayer", clienttranslate('${player_name} dice are returned'), [
                    'playerId' => intval($playerId),
                    'player_name' => $this->getPlayerName($playerId),
                    'dice' => Dice::fromArray($this->dice->getCards($playerDiceIds)),
                ]);
            }

            // Remove remaining dice (traffic die if used with synchronisation)
            $this->dice->moveAllCardsInLocation(LOCATION_PLANE, LOCATION_DECK);

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