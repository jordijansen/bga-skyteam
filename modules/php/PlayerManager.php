<?php

namespace managers;

use APP_DbObject;

class PlayerManager extends APP_DbObject
{
    public function setInitialPlayerOder() {
        self::DbQuery("UPDATE extra_player ep SET ep.player_custom_order = (SELECT player_no FROM player p WHERE p.player_id = ep.player_id)");
    }

    public function getPlayerIdsInTurnOrder() {
        return $this->getCollectionFromDB("SELECT player_custom_order, player_id FROM extra_player WHERE player_custom_order > 0 ORDER BY player_custom_order ASC");
    }

    public function getPlayerCustomOrderNo($playerId) {
        return intval($this->getUniqueValueFromDB("SELECT player_custom_order FROM extra_player WHERE player_id = $playerId"));
    }
}