<?php

namespace traits;

use BgaUserException;
use objects\Dice;
use objects\Token;

trait ActionTrait
{

    //////////////////////////////////////////////////////////////////////////////
    //////////// Player actions
    //////////// 

    /*
        Each time a player is doing some game action, one of the methods below is called.
        (note: each method below must match an input method in nicodemus.action.php)
    */
    function confirmPlayerSetup($settings)
    {
        $activePlayerRole = $settings['activePlayerRole'];
        $otherPlayerRole = $activePlayerRole == PILOT ? CO_PILOT : PILOT;
        $this->checkAction(ACT_CONFIRM_PLAYER_SETUP);

        $activePlayerId = $this->getActivePlayerId();
        $otherPlayerId = current(array_filter($this->getPlayerIds(), function($playerId) use ($activePlayerId) {return intval($playerId) !== intval($activePlayerId);}));

        $activePlayerIdColor = $activePlayerRole == PILOT ? PILOT_PLAYER_COLOR : CO_PILOT_PLAYER_COLOR;
        $otherPlayerIdColor = $otherPlayerRole == PILOT ? PILOT_PLAYER_COLOR : CO_PILOT_PLAYER_COLOR;

        self::DbQuery("UPDATE player SET player_color = '$activePlayerIdColor' WHERE player_id = $activePlayerId");
        self::DbQuery("UPDATE player SET player_color = '$otherPlayerIdColor' WHERE player_id = $otherPlayerId");

        $this->reloadPlayersBasicInfos();

        $playerDice = Dice::fromArray($this->dice->getCardsOfTypeInLocation(DICE_PLAYER, null, LOCATION_DECK));
        $playerDiceIds = array_map(fn($dice) => $dice->id, $playerDice);
        $this->dice->moveCards($playerDiceIds, LOCATION_PLAYER);

        $this->notifyAllPlayers( 'playerRoleAssigned', clienttranslate('${player_name} becomes the <b style="color: #${roleColor}">${role}</b>'), [
            'i18n' => ['roleName'],
            'playerId' => intval($activePlayerId),
            'player_name' => $this->getPlayerName($activePlayerId),
            'role' => $activePlayerRole,
            'roleColor' => $activePlayerIdColor,
            'dice' =>  Dice::fromArray($this->dice->getCardsOfTypeInLocation(DICE_PLAYER, $activePlayerRole, LOCATION_PLAYER))
        ]);

        $this->notifyAllPlayers( 'playerRoleAssigned', clienttranslate('${player_name} becomes the <b style="color: #${roleColor}">${role}</b>'), [
            'i18n' => ['role'],
            'playerId' => intval($otherPlayerId),
            'player_name' => $this->getPlayerName($otherPlayerId),
            'role' => $activePlayerRole == PILOT ? CO_PILOT : PILOT,
            'roleColor' => $otherPlayerIdColor,
            'dice' =>  Dice::fromArray($this->dice->getCardsOfTypeInLocation(DICE_PLAYER, $otherPlayerRole, LOCATION_PLAYER))
        ]);

        $this->gamestate->nextState('');
    }

    function confirmReadyStrategy()
    {
        $this->checkAction(ACT_READY);
        $playerId = $this->getCurrentPlayerId();

        $this->notifyAllPlayers( 'gameLog', clienttranslate('${player_name} is ready'), [
            'playerId' => $playerId,
            'player_name' => $this->getPlayerName($playerId),
        ]);

        $this->gamestate->setPlayerNonMultiactive($playerId, '');
    }

    function confirmPlacement($placement)
    {
        $playerId = $this->getActivePlayerId();
        $playerRole = $this->getPlayerRole($playerId);
        $actionSpaceId = $placement['actionSpaceId'];
        $diceId = $placement['diceId'];
        $diceValue = $placement['diceValue'];

        if (!isset($actionSpaceId) || !isset($diceId)) {
            throw new BgaUserException('Missing parameter for action confirmPlacement');
        }

        $actionSpaces = $this->planeManager->getAvailableActionSpaces($playerId);
        if (!array_key_exists($actionSpaceId, $actionSpaces)) {
            throw new BgaUserException('Action space not available.');
        }

        $die = Dice::from($this->dice->getCard($diceId));
        if (!isset($die) || $die->type != DICE_PLAYER || $die->typeArg != $playerRole) {
            throw new BgaUserException('Invalid dice supplied!');
        }

        $originalDie = clone $die;
        if (isset($diceValue) && $diceValue != $originalDie->side) {
            // Player has used coffee token(s)
            $nrOfCoffeeTokensUsed = abs($die->side - $diceValue);
            $coffeeTokensAvailable = Token::fromArray($this->tokens->getCardsOfTypeInLocation(TOKEN_COFFEE, null, LOCATION_AVAILABLE));
            if ($nrOfCoffeeTokensUsed > $coffeeTokensAvailable) {
                throw new BgaUserException('Not enough coffee tokens');
            }
            if ($diceValue > 6 || $diceValue < 1) {
                throw new BgaUserException('Can not modify above 6 or below 1');
            }

            $die->setSide($diceValue);
            $coffeeTokensUsed = array_slice($coffeeTokensAvailable, 0, $nrOfCoffeeTokensUsed);
            foreach ($coffeeTokensUsed as $coffeeToken) {
                $this->tokens->moveCard($coffeeToken->id, LOCATION_RESERVE, $coffeeToken->locationArg);
            }

            $usedTokens = Token::fromArray($this->tokens->getCards(array_map(fn ($token) => $token->id, $coffeeTokensUsed)));
            $this->notifyAllPlayers( "coffeeUsed", clienttranslate('${player_name} uses ${icon_tokens} to change ${icon_dice_1} into ${icon_dice_2}'), [
                'playerId' => intval($playerId),
                'player_name' => $this->getPlayerName($playerId),
                'tokens' =>  $usedTokens,
                'icon_tokens' => $usedTokens,
                'icon_dice_1' => [$originalDie],
                'icon_dice_2' => [$die]
            ]);
        }

        $actionSpace = $actionSpaces[$actionSpaceId];
        if (array_key_exists(ALLOWED_VALUES, $actionSpace) && !in_array($die->side, $actionSpace[ALLOWED_VALUES])) {
            throw new BgaUserException('Value not allowed');
        }

        $plane = $this->planeManager->get();
        if (array_key_exists(REQUIRES_SWITCH_IN, $actionSpace) && !$plane->switches[$actionSpace[REQUIRES_SWITCH_IN]]->value) {
            throw new BgaUserException('Requires switch in other location');
        }

        $this->dice->moveCard($die->id, LOCATION_PLANE, $actionSpaceId);
        $die = Dice::from($this->dice->getCard($diceId));

        $this->notifyAllPlayers( "diePlaced", clienttranslate('${player_name} places ${icon_dice} on the <b>${action_type}</b>'), [
            'i18n' => ['action_type'],
            'playerId' => intval($playerId),
            'player_name' => $this->getPlayerName($playerId),
            'die' =>  $die,
            'icon_dice' => [$die],
            'action_type' => $actionSpace['type']
        ]);

        $continue = $this->planeManager->resolveDicePlacement($die);
        if ($continue) {
            $this->gamestate->nextState("");
        }
    }

    function requestReroll()
    {
        if (!in_array(ACT_START_REROLL, $this->gamestate->state()['possibleactions'])) {
            throw new BgaUserException('reroll not allowed');
        }

        $rerollTokens = Token::fromArray($this->tokens->getCardsOfTypeInLocation(TOKEN_REROLL, null, LOCATION_AVAILABLE));
        if (sizeof($rerollTokens) < 1) {
            throw new BgaUserException('No reroll tokens');
        }

        $rerollToken = current($rerollTokens);
        $this->tokens->moveCard($rerollToken->id, LOCATION_RESERVE);
        $rerollToken = Token::from($this->tokens->getCard($rerollToken->id));

        $this->setGlobalVariable(ACTIVE_PLAYER_AFTER_REROLL, $this->getActivePlayerId());
        $this->notifyAllPlayers( "rerollTokenUsed", clienttranslate('${player_name} uses ${icon_tokens}, all players may re-roll dice'), [
            'playerId' => intval($this->getCurrentPlayerId()),
            'player_name' => $this->getPlayerName($this->getCurrentPlayerId()),
            'token' =>  $rerollToken,
            'icon_tokens' => [$rerollToken],
        ]);

        $this->gamestate->setAllPlayersMultiactive();
        foreach ($this->gamestate->getActivePlayerList() as $playerId) {
            $this->giveExtraTime($playerId);
        }
        $this->gamestate->jumpToState(ST_REROLL_DICE);
    }

    function rerollDice($selectedDieIds)
    {
        $playerId = $this->getCurrentPlayerId();
        $this->checkAction(ACT_REROLL);

        if (isset($selectedDieIds) && is_array($selectedDieIds) && sizeof($selectedDieIds) > 0) {
            $playerRole = $this->getPlayerRole($playerId);
            $rolledDice = [];
            foreach ($selectedDieIds as $selectedDieId) {
                $die = Dice::from($this->dice->getCard($selectedDieId));
                if ($die->location != LOCATION_PLAYER) {
                    throw new BgaUserException('Only unused dice can be re-rolled');
                } else if ($die->type != DICE_PLAYER || $die->typeArg != $playerRole) {
                    throw new BgaUserException('You can only re-roll your own dice');
                }

                $die->rollDie();
                $rolledDice[] = $die;
            }

            $this->notifyPlayer($playerId, "diceRolled", clienttranslate('${player_name} rolls ${icon_dice}'), [
                'playerId' => intval($playerId),
                'player_name' => $this->getPlayerName($playerId),
                'dice' =>  $rolledDice,
                'icon_dice' => $rolledDice
            ]);
        }

        $this->gamestate->setPlayerNonMultiactive($playerId, '');
        if (sizeof($this->gamestate->getActivePlayerList()) == 0) {
            $this->gamestate->changeActivePlayer($this->getGlobalVariable(ACTIVE_PLAYER_AFTER_REROLL));
        }
    }

//    function undoLast() {
//        $this->checkAction(ACT_UNDO);
//
//        $playerId = $this->getCurrentPlayerId();
//        $lastRemovedCommand = $this->commandManager->removeLastCommand($playerId);
//
//        $this->redirectAfterUndo($playerId, $lastRemovedCommand);
//    }
//
//    function undoAll() {
//        $this->checkAction(ACT_UNDO);
//
//        $playerId = $this->getCurrentPlayerId();
//        $lastRemovedCommand = $this->commandManager->removeAllCommands($playerId);
//
//        $this->redirectAfterUndo($playerId, $lastRemovedCommand);
//    }
}
