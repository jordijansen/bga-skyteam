<?php

class FlightLogManager extends APP_DbObject
{
    public function setUp() {
        $teamFlightLog = $this->retrieveTeamFlightLog();
        SkyTeam::$instance->setGlobalVariable(FLIGHT_LOG_TEAM, $teamFlightLog);
        foreach (SkyTeam::$instance->getPlayerIds() as $playerId) {
            $playerFlightLog = $this->retrievePlayerFlightLog($playerId);
            SkyTeam::$instance->setGlobalVariable(FLIGHT_LOG_PLAYER_ .$playerId, $playerFlightLog);
        }
    }

    public function saveScenarioResult($isWin) {
        $scenarioId = SkyTeam::$instance->getScenario()->id;

        $data = [];

        $teamFlightLog = $this->retrieveTeamFlightLog();
        $teamFlightLog = $this->updateFlightLog($scenarioId, $teamFlightLog, $isWin);
        try {
            SkyTeam::$instance->storeLegacyTeamData($teamFlightLog);
        } catch(feException $e) {
            if ($e->getCode() == FEX_legacy_size_exceeded ) {
                // Do something here to free some space in Legacy data (ex: by removing some variables)
                $this->warn('[LEGACY-SYSTEM] WARNING team has reached legacy limit, removing Flight Log');
                $this->warn('[LEGACY-SYSTEM] FlightLog Data: ' .json_encode($teamFlightLog));
                SkyTeam::$instance->removeLegacyTeamData();
            } else {
                throw $e;
            }
        }
        SkyTeam::$instance->setGlobalVariable(FLIGHT_LOG_TEAM, $teamFlightLog);
        $data['team'] = $teamFlightLog;

        $data['players'] = [];
        foreach (SkyTeam::$instance->getPlayerIds() as $playerId) {
            $playerFlightLog = $this->retrievePlayerFlightLog($playerId);
            $playerFlightLog = $this->updateFlightLog($scenarioId, $playerFlightLog, $isWin);
            try {
                SkyTeam::$instance->storeLegacyData($playerId, FLIGHTLOG, $playerFlightLog);
            } catch(feException $e) {
                if ($e->getCode() == FEX_legacy_size_exceeded ) {
                    $this->warn('[LEGACY-SYSTEM] WARNING player has reached legacy limit, removing Flight Log');
                    $this->warn('[LEGACY-SYSTEM] FlightLog Data: ' .json_encode($playerFlightLog));
                    // Do something here to free some space in Legacy data (ex: by removing some variables)
                    SkyTeam::$instance->removeLegacyData($playerId, FLIGHTLOG);
                } else {
                    throw $e;
                }
            }
            SkyTeam::$instance->setGlobalVariable(FLIGHT_LOG_PLAYER_ .$playerId, $playerFlightLog);
            $data['players'][$playerId] = $playerFlightLog;
        }

        SkyTeam::$instance->notifyAllPlayers('flightLogUpdated', '', $data);
    }

    private function updateFlightLog($scenarioId, $flightLog, $isWin) {
        if (!array_key_exists($scenarioId, $flightLog)) {
            $flightLog[$scenarioId] = [0, 0];
        }

        if ($isWin) {
            $flightLog[$scenarioId][0] = $flightLog[$scenarioId][0] + 1;
        } else {
            $flightLog[$scenarioId][1] = $flightLog[$scenarioId][1] + 1;
        }
        return $flightLog;
    }

    public function getTeamFlightLog() {
        $flightLog = SkyTeam::$instance->getGlobalVariable(FLIGHT_LOG_TEAM, true, null);
        if ($flightLog === null) {
            $this->setUp();
            $flightLog = SkyTeam::$instance->getGlobalVariable(FLIGHT_LOG_TEAM, true);
        }
        return $flightLog;
    }
    public function getPlayerFlightLog($playerId) {
        $flightLog = SkyTeam::$instance->getGlobalVariable(FLIGHT_LOG_PLAYER_ .$playerId, true, null);
        if ($flightLog === null) {
            $this->setUp();
            $flightLog = SkyTeam::$instance->getGlobalVariable(FLIGHT_LOG_PLAYER_ .$playerId, true);
        }
        return $flightLog;
    }

    private function retrieveTeamFlightLog() {
        $data = SkyTeam::$instance->retrieveLegacyTeamData();
        if (is_string($data)) {
            return json_decode($data, true);
        } else {
            return [];
        }
    }

    private function retrievePlayerFlightLog($playerId) {
        $data = SkyTeam::$instance->retrieveLegacyData($playerId, FLIGHTLOG);
        if (is_array($data) && array_key_exists(FLIGHTLOG, $data)) {
            return json_decode($data[FLIGHTLOG], true);
        } else {
            return [];
        }
    }
}