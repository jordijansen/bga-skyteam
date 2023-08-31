<?php

namespace managers;

use APP_DbObject;
use objects\Dice;
use objects\Plane;
use objects\Token;
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
        $continue = true;
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
                    $continue = false;
                }
            }
        } else if ($actionSpace['type'] == ACTION_SPACE_ENGINES) {
            $otherEngineSpace = $die->locationArg == 'engines-1' ? 'engines-2' : 'engines-1';
            $otherEngineSpaceDice = Dice::fromArray(SkyTeam::$instance->dice->getCardsInLocation(LOCATION_PLANE, $otherEngineSpace));
            if (sizeof($otherEngineSpaceDice) > 0) {
                $otherEngineSpaceDie = current($otherEngineSpaceDice);
                $totalEngineValue = $die->side + $otherEngineSpaceDie->side;
                $planeCollision = false;
                if ($totalEngineValue < $plane->aerodynamicsBlue) {
                    $advanceApproachSpaces = 0;
                } else if ($totalEngineValue > $plane->aerodynamicsBlue && $totalEngineValue < $plane->aerodynamicsOrange) {
                    $advanceApproachSpaces = 1;
                    if (sizeof(SkyTeam::$instance->tokens->getCardsInLocation(LOCATION_APPROACH,$plane->approach)) > 0) {
                        $planeCollision = true;
                    }
                } else {
                    $advanceApproachSpaces = 2;
                    if (sizeof(SkyTeam::$instance->tokens->getCardsInLocation(LOCATION_APPROACH,$plane->approach)) > 0 ||
                        sizeof(SkyTeam::$instance->tokens->getCardsInLocation(LOCATION_APPROACH,$plane->approach + 1)) > 0) {
                        $planeCollision = true;
                    }
                }

                $plane->approach = $plane->approach + $advanceApproachSpaces;
                SkyTeam::$instance->notifyAllPlayers( "planeApproachChanged", clienttranslate('The plane engines are at <b>${totalEngineValue}</b>: approach the airport <b>${advanceApproachSpaces}</b> space(s)'), [
                    'totalEngineValue' => $totalEngineValue,
                    'advanceApproachSpaces' => $advanceApproachSpaces,
                    'approach' => $plane->approach
                ]);

                if ($plane->approach > sizeof(SkyTeam::$instance->getApproachTrack()->spaces)) {
                    SkyTeam::$instance->setGlobalVariable(FAILURE_REASON, FAILURE_OVERSHOOT);
                    SkyTeam::$instance->gamestate->jumpToState(ST_PLANE_FAILURE);
                    $continue = false;
                } else if ($planeCollision) {
                    SkyTeam::$instance->setGlobalVariable(FAILURE_REASON, FAILURE_COLLISION);
                    SkyTeam::$instance->gamestate->jumpToState(ST_PLANE_FAILURE);
                    $continue = false;
                }
            }
        } else if ($actionSpace['type'] == ACTION_SPACE_RADIO) {
            $spaceToTakePlaneFrom = $plane->approach + ($die->side - 1);
            $planeTokensInSpace = Token::fromArray(SkyTeam::$instance->tokens->getCardsOfTypeInLocation(TOKEN_PLANE, null, LOCATION_APPROACH, $spaceToTakePlaneFrom));
            $planeTokenRemoved = null;
            if (sizeof($planeTokensInSpace) > 0) {
                $planeTokenRemoved = current($planeTokensInSpace);
                SkyTeam::$instance->tokens->moveCard($planeTokenRemoved->id, LOCATION_RESERVE);
                $planeTokenRemoved = Token::from(SkyTeam::$instance->tokens->getCard($planeTokenRemoved->id));
            }

            SkyTeam::$instance->notifyAllPlayers( "planeTokenRemoved", clienttranslate('Radio used to divert <b>${nrOfPlanesRemoved}</b> plane(s) from approach'), [
                'nrOfPlanesRemoved' => $planeTokenRemoved != null ? 1 : 0,
                'plane' => $planeTokenRemoved
            ]);
        }
        $this->save($plane);
        return $continue;
    }
}
