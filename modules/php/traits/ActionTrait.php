<?php

namespace traits;

use BgaUserException;
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

        // TODO Check value restriction
        $this->dice->moveCard($die->id, LOCATION_PLANE, $actionSpaceId);
        $die = Dice::from($this->dice->getCard($diceId));

        $this->notifyAllPlayers( "diePlaced", clienttranslate('${player_name} places ${icon_dice} on the <b>${action_type}</b>'), [
            'i18n' => ['action_type'],
            'playerId' => intval($playerId),
            'player_name' => $this->getPlayerName($playerId),
            'die' =>  $die,
            'icon_dice' => [$die],
            'action_type' => $actionSpaces[$actionSpaceId]['type']
        ]);

        $this->gamestate->nextState("");
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
