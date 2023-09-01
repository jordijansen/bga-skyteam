<?php

namespace traits;

trait ArgsTrait
{

    //////////////////////////////////////////////////////////////////////////////
    //////////// Game state arguments
    //////////////////////////////////////////////////////////////////////////////
    /*
        Here, you can create methods defined as "game state arguments" (see "args" property in states.inc.php).
        These methods function is to return some additional information that is specific to the current
        game state.
    */

    function argDicePlacementSelect()
    {
        return [
            'nrOfRerollAvailable' => sizeof($this->tokens->getCardsOfTypeInLocation(TOKEN_REROLL, null, LOCATION_AVAILABLE)),
            'nrOfCoffeeAvailable' => sizeof($this->tokens->getCardsOfTypeInLocation(TOKEN_COFFEE, null, LOCATION_AVAILABLE)),
            'availableActionSpaces' => $this->planeManager->getAvailableActionSpaces($this->getActivePlayerId())
        ];
    }
}