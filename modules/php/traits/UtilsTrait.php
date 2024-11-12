<?php

namespace traits;

use managers\objects\Scenario;
use objects\AltitudeTrack;
use objects\Dice;
use utils\ReflectionUtils;
use objects\ApproachTrack;

trait UtilsTrait
{
    function handleTurbulenceAndBadVisibility($playerId) {
        if ($this->isModuleActive(MODULE_BAD_VISIBILITY)) {
            $dicePutAside = Dice::fromArray($this->dice->getCardsInLocation(LOCATION_PLAYER_ASIDE, $playerId));
            if (sizeof($dicePutAside) > 0) {
                $die = current($dicePutAside);
                $die->rollDie();
                $this->dice->moveCard($die->id, LOCATION_PLAYER, $playerId);
                $diceRevealed = Dice::fromArray($this->dice->getCards([$die->id]));
                $this->notifyPlayer($playerId, "diceRolled", clienttranslate('<b>Bad Visibility:</b> ${player_name} gains ${icon_dice}'), [
                    'playerId' => intval($playerId),
                    'player_name' => $this->getPlayerName($playerId),
                    'dice' => $diceRevealed,
                    'icon_dice' => $diceRevealed
                ]);
                $this->notifyAllPlayers("gameLog", clienttranslate('<b>Bad Visibility:</b> ${player_name} gains a new die and rolls it'), [
                    'playerId' => intval($playerId),
                    'player_name' => $this->getPlayerName($playerId)
                ]);
            }
        }
        if ($this->isModuleActive(MODULE_TURBULENCE)) {
            $plane = $this->planeManager->get();
            $altitudeTrackSpace = $this->getAltitudeTrack()->spaces[$plane->altitude];
            if (array_key_exists(TURBULENCE, $altitudeTrackSpace) && $altitudeTrackSpace[TURBULENCE]) {
                $remainingPlayerDice = Dice::fromArray($this->dice->getCardsOfTypeInLocation(DICE_PLAYER, null, LOCATION_PLAYER, $playerId));
                if (sizeof($remainingPlayerDice) > 0) {
                    foreach ($remainingPlayerDice as $dieToRoll) {
                        $dieToRoll->rollDie();
                    }

                    $this->notifyPlayer($playerId, "diceRolled", clienttranslate('<b>Turbulence:</b> ${player_name} re-rolls ${icon_dice}'), [
                        'playerId' => intval($playerId),
                        'player_name' => $this->getPlayerName($playerId),
                        'dice' => $remainingPlayerDice,
                        'icon_dice' => $remainingPlayerDice
                    ]);

                    $this->notifyAllPlayers("gameLog", clienttranslate('<b>Turbulence:</b> ${player_name} re-rolls remaining dice'), [
                        'playerId' => intval($playerId),
                        'player_name' => $this->getPlayerName($playerId)
                    ]);
                }
            }
        }
    }

    function getRealTimeTimerSeconds(): int
    {
        $value = $this->getGameStateValue(REAL_TIME_SECONDS);
        if ($value != null) {
            return intval($value);
        }
        return 60;
    }

    function isPermanentTotalTrust(): bool
    {
        $value = $this->getGameStateValue(PERMANENT_TOTAL_TRUST_OPTION);
        if ($value != null) {
            if (intval($value) === PERMANENT_TOTAL_TRUST_ENABLED) {
                return true;
            }
        }
        return false;
    }

    /**
     * @return ApproachTrack
     */
    function getApproachTrack()
    {
        return ReflectionUtils::rebuildAllPropertyValues($this->APPROACH_TRACKS[$this->getScenario()->approach], ApproachTrack::class);
    }

    /**
     * @return AltitudeTrack
     */
    function getAltitudeTrack()
    {
        return ReflectionUtils::rebuildAllPropertyValues($this->ALTITUDE_TRACKS[$this->getScenario()->altitude], AltitudeTrack::class);
    }

    /**
     * @return Scenario
     */
    function getScenario()
    {
        $scenarioId = $this->getGameStateValue(SCENARIO_OPTION);
        if (intval($this->getGameStateValue(EXPANSION_OPTION)) === EXPANSION_TURBULENCE) {
            $scenarioId = $this->getGameStateValue(SCENARIO_OPTION_EXPANSION);
        }
        $scenario = ReflectionUtils::rebuildAllPropertyValues($this->SCENARIOS[$scenarioId], Scenario::class);
        $scenario->id = $scenarioId;
        return $scenario;
    }

    function isSpecialAbilityActive($specialAbility)
    {
        return sizeof($this->specialAbilities->getCardsOfTypeInLocation($specialAbility, null, LOCATION_AVAILABLE))  == 1;
    }

    function isModuleActive($module): bool
    {
        return in_array($module, $this->getScenario()->modules);
    }

    function isOneOfModulesActive($module1, $module2): bool
    {
        return $this->isModuleActive($module1) || $this->isModuleActive($module2);
    }

    function getVictoryConditions()
    {
        $VICTORY_CONDITIONS = [
            VICTORY_A => ['letter' => VICTORY_A, 'description' => clienttranslate('There are no Airplane tokens on the Approach Track.')],
            VICTORY_B => ['letter' => VICTORY_B, 'description' => clienttranslate('All your Flaps and Landing Gear Switches show the green light.')],
            VICTORY_C => ['letter' => VICTORY_C, 'description' => clienttranslate('Your Airplane’s Axis is completely horizontal.')],
        ];

        if (!$this->isModuleActive(MODULE_ENGINE_LOSS)) {
            $VICTORY_CONDITIONS[VICTORY_D] = ['letter' => VICTORY_D, 'description' => clienttranslate('Your Speed is less than your Brakes when you placed your Engine dice.')];
        }
        if ($this->isModuleActive(MODULE_INTERN)) {
            $VICTORY_CONDITIONS[VICTORY_E] = ['letter' => VICTORY_E, 'description' => clienttranslate('Fully train the Intern by removing all intern tokens from the board.')];
        }
        if ($this->isModuleActive(MODULE_ICE_BRAKES)) {
            $VICTORY_CONDITIONS[VICTORY_F] = ['letter' => VICTORY_F, 'description' => clienttranslate('Move the Brake marker to the end of the Brake Track (past the 5).')];
        }
        if ($this->isModuleActive(MODULE_STUCK_LANDING_GEAR)) {
            $VICTORY_CONDITIONS[VICTORY_B] = ['letter' => VICTORY_B, 'description' => clienttranslate('All your Flap Switches show the green light.')];
        }

        return $VICTORY_CONDITIONS;
    }

    function clearRealTimeTimeIfApplicable()
    {
        if ($this->isModuleActive(MODULE_REAL_TIME)) {
            $this->deleteGlobalVariable(REAL_TIME_END_TIME);
            $this->notifyAllPlayers("realTimeTimerCleared", clienttranslate('Timer: stopped'), []);
        }
    }

    function isFinalRound()
    {
        $isFinalRound = $this->getGlobalVariable(FINAL_ROUND);
        return isset($isFinalRound) && filter_var($isFinalRound, FILTER_VALIDATE_BOOLEAN);
    }

    function isLanded()
    {
        $isLanded = $this->getGlobalVariable(PLANE_LANDED);
        return isset($isLanded) && filter_var($isLanded, FILTER_VALIDATE_BOOLEAN);
    }

    function getPlayerRole(int $playerId)
    {
        $playerColor = $this->getPlayerColor($playerId);
        if ($playerColor == PILOT_PLAYER_COLOR) {
            return PILOT;
        } else if ($playerColor == CO_PILOT_PLAYER_COLOR) {
            return CO_PILOT;
        }
        return null;
    }

    function getPlayerIdForRole(string $role) {
        $roleColor = $role == PILOT ? PILOT_PLAYER_COLOR : CO_PILOT_PLAYER_COLOR;
        $playerIds = $this->getPlayerIds();
        foreach ($playerIds as $playerId) {
            if ($this->getPlayerColor($playerId) == $roleColor) {
                return $playerId;
            }
        }
        return null;
    }

    //////////////////////////////////////////////////////////////////////////////
    //////////// Generic Utility functions
    ////////////
    function setGlobalVariable(string $name, /*object|array*/ $obj) {
        $jsonObj = json_encode($obj);
        $this->DbQuery("INSERT INTO `global_variables`(`name`, `value`)  VALUES ('$name', '$jsonObj') ON DUPLICATE KEY UPDATE `value` = '$jsonObj'");
    }

    function getGlobalVariable(string $name, $asArray = null, $default = null) {
        $json_obj = $this->getUniqueValueFromDB("SELECT `value` FROM `global_variables` where `name` = '$name'");
        if ($json_obj) {
            $object = json_decode($json_obj, $asArray);
            return $object;
        } else {
            return $default;
        }
    }

    function deleteGlobalVariable(string $name) {
        $this->DbQuery("DELETE FROM `global_variables` where `name` = '$name'");
    }

    function deleteGlobalVariables(array $names) {
        $this->DbQuery("DELETE FROM `global_variables` where `name` in (".implode(',', array_map(fn($name) => "'$name'", $names)).")");
    }

    function getPlayerName(int $playerId) {
        return self::getUniqueValueFromDB("SELECT player_name FROM player WHERE player_id = $playerId");
    }

    function getPlayerColor(int $playerId) {
        return self::getUniqueValueFromDB("SELECT player_color FROM player WHERE player_id = $playerId");
    }

    function getPlayers() {
        return $this->getCollectionFromDB("SELECT * FROM player");
    }

    function getPlayerIds() {
        return array_keys($this->getCollectionFromDB("SELECT player_id FROM player"));
    }

    function getPlayerNo($playerId) {
        return $this->getUniqueValueFromDB("SELECT player_no FROM player WHERE player_id = $playerId");
    }

    function getPlayerScore(int $playerId) {
        return intval($this->getUniqueValueFromDB("SELECT player_score FROM player WHERE player_id = $playerId"));
    }

    function updatePlayerScoreAndAux(int $playerId, int $playerScore, int $playerScoreAux = 0) {
        if ($playerScore < 0) {
            $playerScore = 0;
        }
        $this->DbQuery("UPDATE player SET player_score = ".$playerScore.", player_score_aux = ".$playerScoreAux." WHERE player_id = ". $playerId);
    }

    function updatePlayerScore(int $playerId, int $playerScore) {
        if ($playerScore < 0) {
            $playerScore = 0;
        }
        $this->DbQuery("UPDATE player SET player_score = ".$playerScore." WHERE player_id = ". $playerId);
    }

    function getAllFromTable(string $tableName) {
        return $this->getCollectionFromDB("SELECT * FROM $tableName");
    }
}
