<?php

namespace traits;

use BgaUserException;
use DateTimeImmutable;
use managers\objects\SpecialAbilityCard;
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

        $pilotDice = Dice::fromArray($this->dice->getCardsOfTypeInLocation(DICE_PLAYER, PILOT, LOCATION_DECK));
        $coPilotDice = Dice::fromArray($this->dice->getCardsOfTypeInLocation(DICE_PLAYER, CO_PILOT, LOCATION_DECK));

        $this->dice->moveCards(array_map(fn($dice) => $dice->id, $pilotDice), LOCATION_PLAYER, $activePlayerRole == PILOT ? $activePlayerId : $otherPlayerId);
        $this->dice->moveCards(array_map(fn($dice) => $dice->id, $coPilotDice), LOCATION_PLAYER, $activePlayerRole == CO_PILOT ? $activePlayerId : $otherPlayerId);

        $this->notifyAllPlayers( 'playerRoleAssigned', clienttranslate('${player_name} becomes the <b style="color: #${roleColor}">${roleName}</b>'), [
            'i18n' => ['roleName'],
            'playerId' => intval($activePlayerId),
            'player_name' => $this->getPlayerName($activePlayerId),
            'role' => $activePlayerRole,
            'roleName' => $activePlayerRole,
            'roleColor' => $activePlayerIdColor,
            'dice' =>  Dice::fromArray($this->dice->getCardsInLocation(LOCATION_PLAYER, $activePlayerId))
        ]);

        $this->notifyAllPlayers( 'playerRoleAssigned', clienttranslate('${player_name} becomes the <b style="color: #${roleColor}">${roleName}</b>'), [
            'i18n' => ['roleName'],
            'playerId' => intval($otherPlayerId),
            'player_name' => $this->getPlayerName($otherPlayerId),
            'role' => $activePlayerRole == PILOT ? CO_PILOT : PILOT,
            'roleName' => $activePlayerRole == PILOT ? CO_PILOT : PILOT,
            'roleColor' => $otherPlayerIdColor,
            'dice' =>  Dice::fromArray($this->dice->getCardsInLocation(LOCATION_PLAYER, $otherPlayerId))
        ]);

        if ($this->isModuleActive(MODULE_SPECIAL_ABILITIES)) {
            $selectedSpecialAbilities = $settings['specialAbilityCardIds'];
            $cards = SpecialAbilityCard::fromArray($this->specialAbilities->getCards($selectedSpecialAbilities));

            if (sizeof($cards) != $this->getScenario()->nrOfSpecialAbilities) {
                throw new BgaUserException('Not enough abilities selected');
            }

            $this->specialAbilities->moveCards($selectedSpecialAbilities, LOCATION_AVAILABLE);
            $this->notifyAllPlayers( 'specialAbilitiesSelected', clienttranslate('Special abilities selected'), [
                'cards' => SpecialAbilityCard::fromArray($this->specialAbilities->getCards($selectedSpecialAbilities))
            ]);
        }
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
        if (!$this->realTimeOutOfTime()) {
            $this->checkAction(ACT_DICE_PLACEMENT);

            $playerId = $this->getActivePlayerId();
            $actionSpaceId = $placement['actionSpaceId'];
            $diceId = $placement['diceId'];
            $diceSide = $placement['diceValue'];

            if (!isset($actionSpaceId) || !isset($diceId)) {
                throw new BgaUserException('Missing parameter for action confirmPlacement');
            }

            $die = Dice::from($this->dice->getCard($diceId));
            if (!isset($die) || $die->location != LOCATION_PLAYER || $die->locationArg != $playerId) {
                throw new BgaUserException('Invalid dice supplied!');
            }

            $actionSpaces = $this->planeManager->getAvailableActionSpaces($playerId, $die->type == DICE_TRAFFIC, $die->type == DICE_INTERN ? ACTION_SPACE_CONCENTRATION : null);
            if (!array_key_exists($actionSpaceId, $actionSpaces)) {
                throw new BgaUserException('Action space not available.');
            }

            $originalDie = clone $die;
            if (isset($diceSide) && $diceSide != $originalDie->side) {
                $die->setSide($diceSide);

                // Player has used coffee token(s)
                $nrOfCoffeeTokensUsed = abs($originalDie->value - $die->value);
                $coffeeTokensAvailable = Token::fromArray($this->tokens->getCardsOfTypeInLocation(TOKEN_COFFEE, null, LOCATION_AVAILABLE));
                if ($nrOfCoffeeTokensUsed > $coffeeTokensAvailable) {
                    throw new BgaUserException('Not enough coffee tokens');
                }
                if ($diceSide > 6 || $diceSide < 1) {
                    throw new BgaUserException('Can not modify above 6 or below 1');
                }

                $coffeeTokensUsed = array_slice($coffeeTokensAvailable, 0, $nrOfCoffeeTokensUsed);
                foreach ($coffeeTokensUsed as $coffeeToken) {
                    $this->tokens->moveCard($coffeeToken->id, LOCATION_RESERVE, $coffeeToken->locationArg);
                }

                $usedTokens = Token::fromArray($this->tokens->getCards(array_map(fn($token) => $token->id, $coffeeTokensUsed)));
                $this->notifyAllPlayers("coffeeUsed", clienttranslate('${player_name} uses ${icon_tokens} to change ${icon_dice_1} into ${icon_dice_2}'), [
                    'playerId' => intval($playerId),
                    'player_name' => $this->getPlayerName($playerId),
                    'tokens' => $usedTokens,
                    'icon_tokens' => $usedTokens,
                    'icon_dice_1' => [$originalDie],
                    'icon_dice_2' => [$die]
                ]);
            }

            $actionSpace = $actionSpaces[$actionSpaceId];
            if (array_key_exists(ALLOWED_VALUES, $actionSpace) && !in_array($die->value, $actionSpace[ALLOWED_VALUES])) {
                throw new BgaUserException('Value not allowed');
            }

            $plane = $this->planeManager->get();
            if (array_key_exists(REQUIRES_SWITCH_IN, $actionSpace) && !$plane->switches[$actionSpace[REQUIRES_SWITCH_IN]]->value) {
                throw new BgaUserException('Requires switch in other location');
            }

            $this->dice->moveCard($die->id, LOCATION_PLANE, $actionSpaceId);
            $die = Dice::from($this->dice->getCard($diceId));

            $this->notifyAllPlayers("diePlaced", clienttranslate('${player_name} places ${icon_dice} on the <b>${action_type}</b>'), [
                'i18n' => ['action_type'],
                'playerId' => intval($playerId),
                'player_name' => $this->getPlayerName($playerId),
                'die' => $die,
                'icon_dice' => [$die],
                'action_type' => $this->ACTION_TYPES[$actionSpace['type']]
            ]);

            $continue = $this->planeManager->resolveDicePlacement($die);
            if ($continue) {
                if ($this->isSpecialAbilityActive(SYNCHRONISATION) && !$this->getGlobalVariable(SYNCHRONISATION_ACTIVATED)) {
                    $nrOfDiceOnLandingGear = intval($this->getUniqueValueFromDB("SELECT count(1) FROM dice WHERE card_location_arg LIKE 'landing-gear%'"));
                    $nrOfDiceOnFlaps = intval($this->getUniqueValueFromDB("SELECT count(1) FROM dice WHERE card_location_arg LIKE 'flaps%'"));
                    if ($nrOfDiceOnFlaps > 0 && $nrOfDiceOnLandingGear > 0) {
                        $this->setGlobalVariable(ACTIVE_PLAYER_AFTER_SYNCHRONISATION, $this->getActivePlayerId());

                        $this->gamestate->jumpToState(ST_SYNCHRONISATION_START);
                        return;
                    }
                }

                if ($die->type === DICE_INTERN && boolval($this->getGlobalVariable(INTERN_TRIGGERED_THROUGH_TRAFFIC)) === true) {
                    $playerId = $this->getGlobalVariable(ACTIVE_PLAYER_AFTER_SYNCHRONISATION);
                    $this->setGlobalVariable(FORCE_NEXT_PLAYER, $playerId);
                }

                $this->gamestate->nextState("");
            }
        }
    }

    function skipInternPlacement()
    {
        $this->checkAction(ACT_SKIP_INTERN);

        $internDice = Dice::fromArray($this->dice->getCardsOfTypeInLocation(DICE_INTERN, DICE_INTERN, LOCATION_PLAYER));
        if (sizeof($internDice) === 1) {
            $internDie = current($internDice);
            $this->dice->moveCard($internDie->id, LOCATION_DECK);

            $playerId = $this->getActivePlayerId();
            $internDie = Dice::from($this->dice->getCard($internDie->id));
            $this->notifyAllPlayers('internDieSkipped', clienttranslate('${player_name} skips placement of ${icon_dice} (no placement possible)'), [
                'playerId' => intval($playerId),
                'player_name' => $this->getPlayerName($playerId),
                'internDie' => $internDie,
                'icon_dice' => [$internDie]
            ]);

            $this->gamestate->nextState("");
        } else {
            throw new BgaUserException('Not allowed!');
        }
    }

    function requestReroll()
    {
        if (!$this->realTimeOutOfTime()) {
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
            $this->setGlobalVariable(ACTIVE_STATE_AFTER_REROLL, $this->gamestate->state()['name'] === 'dicePlacementSelect' ? ST_DICE_PLACEMENT_SELECT : ST_SYNCHRONISATION);
            $this->notifyAllPlayers("rerollTokenUsed", clienttranslate('${player_name} uses ${icon_tokens}, all players may re-roll dice'), [
                'playerId' => intval($this->getCurrentPlayerId()),
                'player_name' => $this->getPlayerName($this->getCurrentPlayerId()),
                'token' => $rerollToken,
                'icon_tokens' => [$rerollToken],
            ]);

            $pilotPlayerId = $this->getPlayerIdForRole(PILOT);
            $coPilotPlayerId = $this->getPlayerIdForRole(CO_PILOT);

            $playerIdsForReRoll = [];
            if ($this->dice->countCardInLocation(LOCATION_PLAYER, $pilotPlayerId) > 0) {
                $playerIdsForReRoll[] = $pilotPlayerId;
                $this->giveExtraTime($pilotPlayerId);
            }
            if ($this->dice->countCardInLocation(LOCATION_PLAYER, $coPilotPlayerId) > 0) {
                $playerIdsForReRoll[] = $coPilotPlayerId;
                $this->giveExtraTime($coPilotPlayerId);
            }

            $this->gamestate->setPlayersMultiactive($playerIdsForReRoll, '', true);
            $this->setGlobalVariable(REROLL_DICE_AMOUNT, 4);
            $this->gamestate->jumpToState(ST_REROLL_DICE);
        }
    }

    function requestAdaptation()
    {
        if (!$this->realTimeOutOfTime()) {
            if (!in_array(ACT_START_FLIP, $this->gamestate->state()['possibleactions'])) {
                throw new BgaUserException('flip not allowed');
            }

            $canActivateAdaptation = $this->isSpecialAbilityActive(ADAPTATION);
            $canActivateAdaptation = $canActivateAdaptation && !in_array($this->getActivePlayerId(), $this->getGlobalVariable(PLAYERS_THAT_USED_ADAPTATION));
            if (!$canActivateAdaptation) {
                throw new BgaUserException('You cant use adaptation');
            }

            $this->gamestate->jumpToState(ST_FLIP_DIE);
        }
    }

    function requestSwap()
    {
        if (!$this->realTimeOutOfTime()) {
            if (!in_array(ACT_START_SWAP, $this->gamestate->state()['possibleactions'])) {
                throw new BgaUserException('swap not allowed');
            }

            $canActivateWorkingTogether = $this->isSpecialAbilityActive(WORKING_TOGETHER);
            $canActivateWorkingTogether = $canActivateWorkingTogether && !$this->getGlobalVariable(WORKING_TOGETHER_ACTIVATED) && sizeof($this->dice->getCardsInLocation(LOCATION_PLAYER)) >= 2;
            if (!$canActivateWorkingTogether) {
                throw new BgaUserException('You cant use Working Together');
            }

            $this->setGlobalVariable(ACTIVE_PLAYER_AFTER_SWAP, $this->getActivePlayerId());

            $this->gamestate->setPlayersMultiactive([$this->getCurrentPlayerId()], ST_SWAP_DICE, true);
            $this->gamestate->jumpToState(ST_SWAP_DICE);
        }
    }

    function cancelAdaptation()
    {
        if (!$this->realTimeOutOfTime()) {
            $this->gamestate->nextState('');
        }
    }

    function cancelSwap()
    {
        if (!$this->realTimeOutOfTime()) {
            $this->gamestate->changeActivePlayer($this->getGlobalVariable(ACTIVE_PLAYER_AFTER_SWAP));
            $this->gamestate->setAllPlayersNonMultiactive('');
        }
    }

    function rerollDice($selectedDieIds)
    {
        if (!$this->realTimeOutOfTime()) {
            $playerId = $this->getCurrentPlayerId();
            $this->checkAction(ACT_REROLL);
            $isAnticipation = intval($this->getGlobalVariable(REROLL_DICE_AMOUNT)) === 1;

            if (isset($selectedDieIds) && is_array($selectedDieIds) && sizeof($selectedDieIds) > 0) {
                $rolledDice = [];
                foreach ($selectedDieIds as $selectedDieId) {
                    $die = Dice::from($this->dice->getCard($selectedDieId));
                    if ($die->location != LOCATION_PLAYER || $die->locationArg != $playerId) {
                        throw new BgaUserException('Only unused dice can be re-rolled');
                    }

                    $die->rollDie();
                    $rolledDice[] = $die;
                }

                $logMessage = $isAnticipation ? clienttranslate('Anticipation: ${player_name} re-rolls ${icon_dice}'): clienttranslate('${player_name} re-rolls ${icon_dice}');
                $this->notifyPlayer($playerId, "diceRolled", $logMessage, [
                    'playerId' => intval($playerId),
                    'player_name' => $this->getPlayerName($playerId),
                    'dice' => $rolledDice,
                    'icon_dice' => $rolledDice
                ]);

                $logMessage = $isAnticipation ? clienttranslate('Anticipation: ${player_name} re-rolls 1 die'): clienttranslate('${player_name} re-rolls ${nrOfDiceRerolled} dice');
                $this->notifyAllPlayers("gameLog", $logMessage, [
                    'playerId' => intval($playerId),
                    'player_name' => $this->getPlayerName($playerId),
                    'nrOfDiceRerolled' => sizeof($selectedDieIds)
                ]);
            } else {
                $logMessage = $isAnticipation ? clienttranslate('Anticipation: ${player_name} re-rolls no dice'): clienttranslate('${player_name} re-rolls no dice');
                $this->notifyAllPlayers("gameLog", $logMessage, [
                    'playerId' => intval($playerId),
                    'player_name' => $this->getPlayerName($playerId),
                ]);
            }

            $this->gamestate->setPlayerNonMultiactive($playerId, '');
        }
    }

    function flipDie($selectedDieId)
    {
        if (!$this->realTimeOutOfTime()) {
            $playerId = $this->getActivePlayerId();
            $this->checkAction(ACT_FLIP);

            $playersThatUsedAdaptation = $this->getGlobalVariable(PLAYERS_THAT_USED_ADAPTATION);

            $adaptationActive = $this->isSpecialAbilityActive(ADAPTATION);
            $adaptationActive = $adaptationActive && !in_array($this->getCurrentPlayerId(), $playersThatUsedAdaptation);
            if (!$adaptationActive) {
                throw new BgaUserException('You cant use adaptation');
            }

            $originalDice = Dice::from($this->dice->getCard($selectedDieId));
            if ($originalDice->location != LOCATION_PLAYER || $originalDice->locationArg != $playerId) {
                throw new BgaUserException('Unknown die or not owned by you');
            }

            $updatedDice = Dice::from($this->dice->getCard($selectedDieId));
            $updatedDice->setSide(7 - $originalDice->side);

            $playersThatUsedAdaptation = [...$playersThatUsedAdaptation, $playerId];
            $this->setGlobalVariable(PLAYERS_THAT_USED_ADAPTATION, $playersThatUsedAdaptation);

            $this->notifyAllPlayers("playerUsedAdaptation", clienttranslate('${player_name} uses Adaptation'), [
                'playerId' => intval($playerId),
                'player_name' => $this->getPlayerName($playerId),
                'rolesThatUsedAdaptation' => array_map(fn($playerId) => $this->getPlayerRole($playerId), $playersThatUsedAdaptation)
            ]);

            $this->notifyPlayer($playerId, "diceRolled", clienttranslate('${player_name} flips ${icon_dice_1} to ${icon_dice_2}'), [
                'playerId' => intval($playerId),
                'player_name' => $this->getPlayerName($playerId),
                'dice' => [$updatedDice],
                'icon_dice_1' => [$originalDice],
                'icon_dice_2' => [$updatedDice],
            ]);

            $this->gamestate->nextState('');
        }
    }

    function swapDie($selectedDieId)
    {
        if (!$this->realTimeOutOfTime()) {
            $playerId = $this->getCurrentPlayerId();
            $playerRole = $this->getPlayerRole($playerId);
            $this->checkAction(ACT_SWAP);

            if (!in_array($playerId, $this->gamestate->getActivePlayerList())) {
                throw new BgaUserException('Player not active');
            }

            $canActivateWorkingTogether = $this->isSpecialAbilityActive(WORKING_TOGETHER);
            if (!$canActivateWorkingTogether) {
                throw new BgaUserException('You cant use Working Together');
            }

            $die = Dice::from($this->dice->getCard($selectedDieId));
            if ($die->location != LOCATION_PLAYER || $die->locationArg != $playerId) {
                throw new BgaUserException('Unknown die or not owned by you');
            }

            $this->setGlobalVariable(WORKING_TOGETHER_ACTIVATED, true);
            $firstDie = $this->getGlobalVariable(SWAP_DICE_FIRST_DIE);
            if (isset($firstDie)) {
                // This is the second dice being selected
                $firstDie = Dice::from($this->dice->getCard($firstDie));

                $dieValue = $die->value;
                $firstDieValue = $firstDie->value;

                $die->setSide($firstDieValue);
                $firstDie->setSide($dieValue);

                $this->notifyAllPlayers("gameLog", clienttranslate('Working Together: dice are swapped, their new values are ${icon_dice_1} and ${icon_dice_2}'), [
                    'icon_dice_1' => [$firstDie],
                    'icon_dice_2' => [$die]
                ]);

                $this->notifyPlayer($playerId, "diceRolled", '', [
                    'dice' =>  [$die],
                ]);

                $otherPlayerId = $this->getPlayerIdForRole($playerRole == 'pilot' ? 'co-pilot' : 'pilot');
                $this->notifyPlayer($otherPlayerId, "diceRolled", '', [
                    'dice' =>  [$firstDie],
                ]);
                $this->deleteGlobalVariable(SWAP_DICE_FIRST_DIE);

                $this->gamestate->changeActivePlayer($this->getGlobalVariable(ACTIVE_PLAYER_AFTER_SWAP));
                $this->gamestate->setAllPlayersNonMultiactive('');
            } else {
                // This is the first dice being selected
                $this->setGlobalVariable(SWAP_DICE_FIRST_DIE, $die->id);

                $otherPlayerId = $this->getPlayerIdForRole($playerRole == 'pilot' ? 'co-pilot' : 'pilot');
                $this->gamestate->setPlayersMultiactive([$otherPlayerId], ST_SWAP_DICE, true);
                $this->gamestate->jumpToState(ST_SWAP_DICE);
            }
        }
    }

    function realTimeOutOfTime()
    {
        if ($this->isModuleActive(MODULE_REAL_TIME) && $this->gamestate->state()['name'] !== 'gameEnd') {
            $realTimeEndTime = $this->getGlobalVariable(REAL_TIME_END_TIME);
            if (isset($realTimeEndTime)) {
                $date = new DateTimeImmutable();
                $realTimeEndTime = intval($realTimeEndTime);
                $secondsRemaining = $realTimeEndTime - $date->getTimestamp();
                // We add a server correction because the UI might still be behind on seconds.
                $secondsRemaining = $secondsRemaining + 2;
                if ($secondsRemaining <= 0) {
                    $this->deleteGlobalVariable(REAL_TIME_END_TIME);
                    $this->notifyAllPlayers("gameLog", clienttranslate('Timer: 0 seconds remaining, ending dice placement phase'), []);

                    $mandatoryActionSpaceEmpty = false;
                    $mandatoryActionSpaces = array_filter($this->planeManager->getAllActionSpaces(), fn($actionSpace) => $actionSpace[MANDATORY]);
                    foreach ($mandatoryActionSpaces as $spaceId => $mandatoryActionSpace) {
                        if ($this->planeManager->isActionSpaceEmpty($spaceId)) {
                            $mandatoryActionSpaceEmpty = true;
                            break;
                        }
                    }

                    if ($mandatoryActionSpaceEmpty) {
                        $this->setGlobalVariable(FAILURE_REASON, FAILURE_MANDATORY_SPACE_EMPTY);
                        $this->gamestate->jumpToState(ST_PLANE_FAILURE);
                    } else {
                        $this->gamestate->jumpToState(ST_END_OF_ROUND);
                    }
                    return true;
                }
            }
        }
        $this->notifyAllPlayers("gameLog", '', []); // dummy Notif does not keep waiting so UI is updated.
        return false;
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
