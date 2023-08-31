<?php

namespace managers;

use APP_DbObject;
use objects\Dice;
use objects\Plane;
use SkyTeam;

class PlaneManager extends APP_DbObject
{
    function save(Plane $plane)
    {
        self::DbQuery("REPLACE INTO plane 
                            (id, axis, aerodynamics_blue, aerodynamics_orange, brake, approach, altitude)
                          VALUES
                            (1, $plane->axis, $plane->aerodynamicsBlue, $plane->aerodynamicsOrange, $plane->brake, $plane->approach, $plane->altitude);"
        );
    }

    function get() : Plane
    {
        return Plane::from(self::getObjectFromDB("SELECT * FROM plane WHERE id = 1"));
    }

    function getAvailableActionSpaces($playerId): array
    {
        $playerRole = SkyTeam::$instance->getPlayerRole($playerId);
        $result = [];

        $diceAlreadyPlaced = Dice::fromArray(SkyTeam::$instance->dice->getCardsInLocation(LOCATION_PLANE));
        foreach ($this->getAllActionSpaces() as $actionSpaceId => $actionSpace) {
            $diceOnActionSpace = array_filter($diceAlreadyPlaced, fn($die) => $die->locationArg == $actionSpaceId);

            if (in_array($playerRole, $actionSpace[ALLOWED_ROLES]) && sizeof($diceOnActionSpace) == 0) {
                $result[$actionSpaceId] = $actionSpace;
            }
        }
        return $result;
    }

    function getAllActionSpaces(): array
    {
        // TODO filter out module spaces
        return SkyTeam::$instance->ACTION_SPACES;
    }

    function resolveDicePlacement(Dice $die): bool
    {
        $plane = $this->get();
        $actionSpace = $this->getAllActionSpaces()[$die->locationArg];
        if ($actionSpace['type'] == ACTION_SPACE_AXIS) {
            $otherAxisSpace = $die->locationArg == 'axis-1' ? 'axis-2' : 'axis-1';
            $otherAxisSpaceDice = Dice::fromArray(SkyTeam::$instance->dice->getCardsInLocation(LOCATION_PLANE, $otherAxisSpace));
            if (sizeof($otherAxisSpaceDice) > 0) {
                $otherAxisSpaceDie = current($otherAxisSpaceDice);
                $pilotValue = $die->locationArg == 'axis-1' ? $die->side : $otherAxisSpaceDie->side;
                $copilotValue = $die->locationArg == 'axis-2' ? $die->side : $otherAxisSpaceDie->side;
                $axisChange = $pilotValue - $copilotValue;
                $plane->axis = $plane->axis + $axisChange;

                SkyTeam::$instance->notifyAllPlayers( "planeAxisChanged", clienttranslate('The plane axis is changed to <b>${axis}</b>'), [
                    'axis' => $plane->axis
                ]);

                if ($plane->axis >= 3 || $plane->axis <= -3) {
                    SkyTeam::$instance->setGlobalVariable(FAILURE_REASON, FAILURE_AXIS);
                    SkyTeam::$instance->gamestate->jumpToState(ST_PLANE_FAILURE);
                }
            }
        }
        $this->save($plane);
        return true;
    }
}
