<?php
/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * skyteam implementation : © <Your name here> <Your email address here>
 * 
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 *
 * material.inc.php
 *
 * skyteam game material description
 *
 * Here, you can describe the material of your game with PHP variables.
 *   
 * This file is loaded in your game logic class constructor, ie these variables
 * are available everywhere in your game logic code.
 *
 */

require_once(__DIR__.'/modules/php/Constants.inc.php');

$this->ROLES = [
    PILOT => clienttranslate('pilot'),
    CO_PILOT => clienttranslate('co-pilot')
];

$this->APPROACH_CATEGORIES = [
  APPROACH_GREEN => clienttranslate('Routine Landing'),
  APPROACH_YELLOW => clienttranslate('Exceptional Conditions'),
  APPROACH_RED => clienttranslate('Elite Pilots Only'),
  APPROACH_BLACK => clienttranslate('Heroic Landing: Success will put you in the history books.'),
];

$this->PLANE_SWITCHES = [
    ACTION_SPACE_LANDING_GEAR.'-1',
    ACTION_SPACE_LANDING_GEAR.'-2',
    ACTION_SPACE_LANDING_GEAR.'-3',

    ACTION_SPACE_FLAPS.'-1',
    ACTION_SPACE_FLAPS.'-2',
    ACTION_SPACE_FLAPS.'-3',
    ACTION_SPACE_FLAPS.'-4',

    ACTION_SPACE_BRAKES.'-1',
    ACTION_SPACE_BRAKES.'-2',
    ACTION_SPACE_BRAKES.'-3',
];

$this->ACTION_TYPES = [
    ACTION_SPACE_AXIS => clienttranslate('axis'),
    ACTION_SPACE_ENGINES => clienttranslate('engines'),
    ACTION_SPACE_RADIO => clienttranslate('radio'),
    ACTION_SPACE_LANDING_GEAR => clienttranslate('landing gear'),
    ACTION_SPACE_FLAPS => clienttranslate('flaps'),
    ACTION_SPACE_BRAKES => clienttranslate('brakes'),
    ACTION_SPACE_CONCENTRATION => clienttranslate('concentration'),
];

$this->ACTION_SPACES = [
    ACTION_SPACE_AXIS.'-1' => ['type' => ACTION_SPACE_AXIS, ALLOWED_ROLES => [PILOT], MANDATORY => true],
    ACTION_SPACE_AXIS.'-2' => ['type' => ACTION_SPACE_AXIS, ALLOWED_ROLES => [CO_PILOT], MANDATORY => true],
    ACTION_SPACE_ENGINES.'-1' => ['type' => ACTION_SPACE_ENGINES, ALLOWED_ROLES => [PILOT], MANDATORY => true],
    ACTION_SPACE_ENGINES.'-2' => ['type' => ACTION_SPACE_ENGINES, ALLOWED_ROLES => [CO_PILOT], MANDATORY => true],
    ACTION_SPACE_RADIO.'-1' => ['type' => ACTION_SPACE_RADIO, ALLOWED_ROLES => [PILOT], MANDATORY => false],
    ACTION_SPACE_RADIO.'-2' => ['type' => ACTION_SPACE_RADIO, ALLOWED_ROLES => [CO_PILOT], MANDATORY => false],
    ACTION_SPACE_RADIO.'-3' => ['type' => ACTION_SPACE_RADIO, ALLOWED_ROLES => [CO_PILOT], MANDATORY => false],
    ACTION_SPACE_LANDING_GEAR.'-1' => ['type' => ACTION_SPACE_LANDING_GEAR, ALLOWED_ROLES => [PILOT], MANDATORY => false, ALLOWED_VALUES => [1,2]],
    ACTION_SPACE_LANDING_GEAR.'-2' => ['type' => ACTION_SPACE_LANDING_GEAR, ALLOWED_ROLES => [PILOT], MANDATORY => false, ALLOWED_VALUES => [3,4]],
    ACTION_SPACE_LANDING_GEAR.'-3' => ['type' => ACTION_SPACE_LANDING_GEAR, ALLOWED_ROLES => [PILOT], MANDATORY => false, ALLOWED_VALUES => [5,6]],
    ACTION_SPACE_FLAPS.'-1' => ['type' => ACTION_SPACE_FLAPS, ALLOWED_ROLES => [CO_PILOT], MANDATORY => false, ALLOWED_VALUES => [1,2]],
    ACTION_SPACE_FLAPS.'-2' => ['type' => ACTION_SPACE_FLAPS, ALLOWED_ROLES => [CO_PILOT], MANDATORY => false, ALLOWED_VALUES => [2,3], REQUIRES_SWITCH_IN => ACTION_SPACE_FLAPS.'-1'],
    ACTION_SPACE_FLAPS.'-3' => ['type' => ACTION_SPACE_FLAPS, ALLOWED_ROLES => [CO_PILOT], MANDATORY => false, ALLOWED_VALUES => [4,5], REQUIRES_SWITCH_IN => ACTION_SPACE_FLAPS.'-2'],
    ACTION_SPACE_FLAPS.'-4' => ['type' => ACTION_SPACE_FLAPS, ALLOWED_ROLES => [CO_PILOT], MANDATORY => false, ALLOWED_VALUES => [5,6], REQUIRES_SWITCH_IN => ACTION_SPACE_FLAPS.'-3'],
    ACTION_SPACE_CONCENTRATION.'-1' => ['type' => ACTION_SPACE_CONCENTRATION, ALLOWED_ROLES => [PILOT, CO_PILOT], MANDATORY => false],
    ACTION_SPACE_CONCENTRATION.'-2' => ['type' => ACTION_SPACE_CONCENTRATION, ALLOWED_ROLES => [PILOT, CO_PILOT], MANDATORY => false],
    ACTION_SPACE_CONCENTRATION.'-3' => ['type' => ACTION_SPACE_CONCENTRATION, ALLOWED_ROLES => [PILOT, CO_PILOT], MANDATORY => false],
    ACTION_SPACE_BRAKES.'-1' => ['type' => ACTION_SPACE_BRAKES, ALLOWED_ROLES => [PILOT], MANDATORY => false, ALLOWED_VALUES => [2]],
    ACTION_SPACE_BRAKES.'-2' => ['type' => ACTION_SPACE_BRAKES, ALLOWED_ROLES => [PILOT], MANDATORY => false, ALLOWED_VALUES => [4], REQUIRES_SWITCH_IN => ACTION_SPACE_BRAKES.'-1'],
    ACTION_SPACE_BRAKES.'-3' => ['type' => ACTION_SPACE_BRAKES, ALLOWED_ROLES => [PILOT], MANDATORY => false, ALLOWED_VALUES => [6], REQUIRES_SWITCH_IN => ACTION_SPACE_BRAKES.'-2'],
];

$this->APPROACH_TRACKS = [
    1 => [
        'type' => 1,
        'category' => APPROACH_GREEN,
        'name' => 'YUL Montreal-Trudeau',
        'size' => 7,
        'spaces' => [
            7 => [TOKEN_PLANE => 2],
            6 => [TOKEN_PLANE => 3],
            5 => [TOKEN_PLANE => 1],
            4 => [TOKEN_PLANE => 2],
            3 => [TOKEN_PLANE => 1],
            2 => [],
            1 => [],
        ]
    ]
];

$this->ALTITUDE_TRACKS = [
    1 => [
        'type' => 1,
        'categories' => [APPROACH_GREEN, APPROACH_YELLOW],
        'size' => 7,
        'spaces' => [
            7 => [ALTITUDE_HEIGHT => '0000', ROUND_START_PLAYER => PILOT],
            6 => [ALTITUDE_HEIGHT => '1000', ROUND_START_PLAYER => CO_PILOT],
            5 => [ALTITUDE_HEIGHT => '2000', ROUND_START_PLAYER => PILOT, TOKEN_REROLL => 1],
            4 => [ALTITUDE_HEIGHT => '3000', ROUND_START_PLAYER => CO_PILOT],
            3 => [ALTITUDE_HEIGHT => '4000', ROUND_START_PLAYER => PILOT],
            2 => [ALTITUDE_HEIGHT => '5000', ROUND_START_PLAYER => CO_PILOT],
            1 => [ALTITUDE_HEIGHT => '6000', ROUND_START_PLAYER => PILOT, TOKEN_REROLL => 1],
        ]
    ]
];


/*

Example:

$this->card_types = array(
    1 => array( "card_name" => ...,
                ...
              )
);

*/




