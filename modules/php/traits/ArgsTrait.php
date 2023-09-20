<?php

namespace traits;

use managers\objects\SpecialAbilityCard;

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

    function argPlayerSetup()
    {
        $specialAbilities = $this->isModuleActive(MODULE_SPECIAL_ABILITIES);
        $nrOfSpecialAbilitiesToSelect = $specialAbilities ? $this->getScenario()->nrOfSpecialAbilities : 0;
        return [
            'specialAbilities' => $specialAbilities ? SpecialAbilityCard::fromArray($this->specialAbilities->getCardsInLocation(LOCATION_DECK)) : [],
            'nrOfSpecialAbilitiesToSelect' => $nrOfSpecialAbilitiesToSelect
        ];
    }

    function argDicePlacementSelect()
    {
        $adaptationActive = $this->isSpecialAbilityActive(ADAPTATION);
        $adaptationActive = $adaptationActive && !in_array($this->getCurrentPlayerId(), $this->getGlobalVariable(PLAYERS_THAT_USED_ADAPTATION));

        return [
            'nrOfRerollAvailable' => sizeof($this->tokens->getCardsOfTypeInLocation(TOKEN_REROLL, null, LOCATION_AVAILABLE)),
            'nrOfCoffeeAvailable' => sizeof($this->tokens->getCardsOfTypeInLocation(TOKEN_COFFEE, null, LOCATION_AVAILABLE)),
            'availableActionSpaces' => $this->planeManager->getAvailableActionSpaces($this->getActivePlayerId()),
            'canActivateAdaptation' => $adaptationActive
        ];
    }

    function argRerollDice()
    {
        return [
          'maxNumberOfDice' => $this->getGlobalVariable(REROLL_DICE_AMOUNT)
        ];
    }
}