<?php

namespace traits;

use objects\Dice;

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

        $this->gamestate->setAllPlayersMultiactive();
        $this->gamestate->nextState('');
    }

    function undoLast() {
        $this->checkAction(ACT_UNDO);

        $playerId = $this->getCurrentPlayerId();
        $lastRemovedCommand = $this->commandManager->removeLastCommand($playerId);

        $this->redirectAfterUndo($playerId, $lastRemovedCommand);
    }

    function undoAll() {
        $this->checkAction(ACT_UNDO);

        $playerId = $this->getCurrentPlayerId();
        $lastRemovedCommand = $this->commandManager->removeAllCommands($playerId);

        $this->redirectAfterUndo($playerId, $lastRemovedCommand);
    }
}
