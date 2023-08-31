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
            'roundNumber' => $newRoundNumber
        ]);

        $this->setGlobalVariable(CURRENT_PHASE, PHASE_STRATEGY);
        $this->notifyAllPlayers("newPhaseStarted", clienttranslate('New phase: ${newPhase}'), [
            'newPhase' => PHASE_STRATEGY
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

        $this->gamestate->setAllPlayersMultiactive();
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
            $playerRole = $this->getPlayerRole($playerId);
            $dice = Dice::fromArray($this->dice->getCardsOfTypeInLocation( DICE_PLAYER, $playerRole, LOCATION_PLAYER));
            foreach ($dice as $die) {
                $die->rollDie();
            }

            $dice = Dice::fromArray($this->dice->getCardsOfTypeInLocation( DICE_PLAYER, $playerRole, LOCATION_PLAYER));
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

        $this->gamestate->changeActivePlayer($startPlayerId);
        $this->gamestate->nextState('');
    }

    function stDicePlacementNext()
    {
        $this->activeNextPlayer();

        $playerRole = $this->getPlayerRole($this->getActivePlayerId());
        $dice = Dice::fromArray($this->dice->getCardsOfTypeInLocation( DICE_PLAYER, $playerRole, LOCATION_PLAYER));
        if (sizeof($dice) > 0) {
            $this->gamestate->nextState('next');
        } else {
            $this->gamestate->nextState('end');
        }
    }


    function stPlaneFailure()
    {
        $this->notifyAllPlayers('planeFailure', clienttranslate('MAYDAY MAYDAY, something went horribly wrong...'), [
            "failureReason" => $this->getGlobalVariable(FAILURE_REASON)
        ]);

        $this->gamestate->nextState('');
    }
}