<?php

namespace traits;

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
        $this->checkAction(ACT_CONFIRM_PLAYER_SETUP);

        $activePlayerId = $this->getActivePlayerId();
        $otherPlayerId = current(array_filter($this->getPlayerIds(), function($playerId) use ($activePlayerId) {return intval($playerId) !== intval($activePlayerId);}));

        $activePlayerIdColor = $activePlayerRole == PILOT ? PILOT_PLAYER_COLOR : CO_PILOT_PLAYER_COLOR;
        $otherPlayerIdColor = $activePlayerRole == PILOT ? CO_PILOT_PLAYER_COLOR : PILOT_PLAYER_COLOR;

        self::DbQuery("UPDATE player SET player_color = '$activePlayerIdColor' WHERE player_id = $activePlayerId");
        self::DbQuery("UPDATE player SET player_color = '$otherPlayerIdColor' WHERE player_id = $otherPlayerId");

        $this->reloadPlayersBasicInfos();

        $this->notifyAllPlayers( 'playerRoleAssigned', clienttranslate('${player_name} becomes the <b style="color: #${roleColor}">${role}</b>'), [
            'i18n' => ['roleName'],
            'playerId' => intval($activePlayerId),
            'player_name' => $this->getPlayerName($activePlayerId),
            'role' => $activePlayerRole,
            'roleColor' => $activePlayerIdColor
        ]);

        $this->notifyAllPlayers( 'playerRoleAssigned', clienttranslate('${player_name} becomes the <b style="color: #${roleColor}">${role}</b>'), [
            'i18n' => ['role'],
            'playerId' => intval($otherPlayerId),
            'player_name' => $this->getPlayerName($otherPlayerId),
            'role' => $activePlayerRole == PILOT ? CO_PILOT : PILOT,
            'roleColor' => $otherPlayerIdColor
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
