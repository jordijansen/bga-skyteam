<?php

namespace traits;

trait UtilsTrait
{

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
}
