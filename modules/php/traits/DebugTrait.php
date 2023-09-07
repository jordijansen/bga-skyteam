<?php

namespace traits;

use objects\Token;

trait DebugTrait
{

    function startFinalRound()
    {
        $this->setGlobalVariable(FINAL_ROUND, true);

        $plane = $this->planeManager->get();

        $plane->approach = 7;
        $plane->altitude = 7;

        // A
        $planeTokens = Token::fromArray($this->tokens->getCardsOfTypeInLocation(TOKEN_PLANE, null, LOCATION_APPROACH));
        $this->tokens->moveCards(array_map(fn($planeToken) => $planeToken->id, $planeTokens), LOCATION_RESERVE);
        // B
        foreach ($plane->switches as $planeSwitch) {
            if (substr($planeSwitch->id, 0, strlen(ACTION_SPACE_FLAPS)) === ACTION_SPACE_FLAPS || substr($planeSwitch->id, 0, strlen(ACTION_SPACE_LANDING_GEAR)) === ACTION_SPACE_LANDING_GEAR) {
                $planeSwitch->value = true;
                $planeSwitch->save();
            }
        }
        // C
        $plane->axis = 0;
        // D
        $plane->brake = 6;

        $this->planeManager->save($plane);
    }

}
