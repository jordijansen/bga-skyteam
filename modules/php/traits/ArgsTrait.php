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
            'availableActionSpaces' => $this->planeManager->getAvailableActionSpaces($this->getActivePlayerId())
        ];
    }
}