<?php

namespace traits;

use managers\objects\SpecialAbilityCard;
use objects\Dice;

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
        $canActivateAdaptation = $this->isSpecialAbilityActive(ADAPTATION);
        $canActivateAdaptation = $canActivateAdaptation && !in_array($this->getActivePlayerId(), $this->getGlobalVariable(PLAYERS_THAT_USED_ADAPTATION));

        $canActivateWorkingTogether = $this->isSpecialAbilityActive(WORKING_TOGETHER);
        $canActivateWorkingTogether = $canActivateWorkingTogether && !$this->getGlobalVariable(WORKING_TOGETHER_ACTIVATED) && sizeof($this->dice->getCardsInLocation(LOCATION_PLAYER)) >= 2;

        $plane = $this->planeManager->get();
        $altitudeTrackSpace = $this->getAltitudeTrack()->spaces[$plane->altitude];
        $activeRoundModules = [];
        if ($this->isModuleActive(MODULE_BAD_VISIBILITY) && array_key_exists(BAD_VISIBILITY, $altitudeTrackSpace) && $altitudeTrackSpace[BAD_VISIBILITY]) {
            $activeRoundModules[] = MODULE_BAD_VISIBILITY;
        }
        if ($this->isModuleActive(MODULE_TURBULENCE) && array_key_exists(TURBULENCE, $altitudeTrackSpace) && $altitudeTrackSpace[TURBULENCE]) {
            $activeRoundModules[] = MODULE_TURBULENCE;
        }

        return [
            'activeRoundModules' => $activeRoundModules,
            'nrOfRerollAvailable' => sizeof($this->tokens->getCardsOfTypeInLocation(TOKEN_REROLL, null, LOCATION_AVAILABLE)),
            'nrOfCoffeeAvailable' => sizeof($this->tokens->getCardsOfTypeInLocation(TOKEN_COFFEE, null, LOCATION_AVAILABLE)),
            'availableActionSpaces' => $this->planeManager->getAvailableActionSpaces($this->getActivePlayerId()),
            'canActivateAdaptation' => $canActivateAdaptation,
            'canActivateWorkingTogether' => $canActivateWorkingTogether
        ];
    }

    function argRerollDice()
    {
        return [
          'maxNumberOfDice' => $this->getGlobalVariable(REROLL_DICE_AMOUNT)
        ];
    }

    function argSwapDice()
    {
        $firstDie = $this->getGlobalVariable(SWAP_DICE_FIRST_DIE);
        if (isset($firstDie)) {
            $firstDie = Dice::from($this->dice->getCard($firstDie));
        }
        return [
            'firstDie' => $firstDie
        ];
    }

    function argSynchronisation()
    {
        $trafficDie = Dice::from($this->dice->getCard($this->getGlobalVariable(SYNCHRONISATION_DIE_ID)));
        return [
            'trafficDie' => $trafficDie,
            'availableActionSpaces' => $this->planeManager->getAvailableActionSpaces($this->getActivePlayerId(), true),
            'nrOfRerollAvailable' => sizeof($this->tokens->getCardsOfTypeInLocation(TOKEN_REROLL, null, LOCATION_AVAILABLE)),
            'nrOfCoffeeAvailable' => sizeof($this->tokens->getCardsOfTypeInLocation(TOKEN_COFFEE, null, LOCATION_AVAILABLE)),
        ];
    }

    function argPlaceIntern()
    {
        $internDie = Dice::fromArray($this->dice->getCardsOfTypeInLocation(DICE_INTERN, DICE_INTERN, LOCATION_PLAYER));
        return [
            'internDie' => $internDie,
            'availableActionSpaces' => $this->planeManager->getAvailableActionSpaces($this->getActivePlayerId(), false, ACTION_SPACE_CONCENTRATION)
        ];
    }
}
