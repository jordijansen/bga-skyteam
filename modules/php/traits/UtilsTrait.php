<?php

namespace traits;

use managers\objects\Scenario;
use objects\AltitudeTrack;
use utils\ReflectionUtils;
use objects\ApproachTrack;

trait UtilsTrait
{
    /**
     * @return ApproachTrack
     */
    function getApproachTrack()
    {
        // TODO GET BASED ON SCENARIO
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
        return ReflectionUtils::rebuildAllPropertyValues($this->SCENARIOS[$this->getGameStateValue(SCENARIO_OPTION)], Scenario::class);
    }

    function isSpecialAbilityActive($specialAbility)
    {
        return sizeof($this->specialAbilities->getCardsOfTypeInLocation($specialAbility, null, LOCATION_AVAILABLE))  == 1;
    }

    function isModuleActive($module): bool
    {
        return in_array($module, $this->getScenario()->modules);
    }

    function getVictoryConditions()
    {
        $BASE_GAME_CONDITIONS = [
            VICTORY_A => ['letter' => VICTORY_A, 'description' => clienttranslate('There are no Airplane tokens on the Approach Track.')],
            VICTORY_B => ['letter' => VICTORY_B, 'description' => clienttranslate('All your Flaps and Landing Gear Switches show the green light.')],
            VICTORY_C => ['letter' => VICTORY_C, 'description' => clienttranslate('Your Airplane’s Axis is completely horizontal.')],
            VICTORY_D => ['letter' => VICTORY_D, 'description' => clienttranslate('Your Speed is less than your Brakes when you placed your Engine dice.')],
        ];
        // TODO GET BASED ON SCENARIO/MODULES

        return $BASE_GAME_CONDITIONS;
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

    function getGlobalVariable(string $name, $asArray = null) {
        $json_obj = $this->getUniqueValueFromDB("SELECT `value` FROM `global_variables` where `name` = '$name'");
        if ($json_obj) {
            $object = json_decode($json_obj, $asArray);
            return $object;
        } else {
            return null;
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
