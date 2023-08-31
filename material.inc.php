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

$this->ACTION_SPACES = [
    ACTION_SPACE_AXIS.'-1' => ['type' => ACTION_SPACE_AXIS, ALLOWED_ROLES => [PILOT], MANDATORY => true],
    ACTION_SPACE_AXIS.'-2' => ['type' => ACTION_SPACE_AXIS, ALLOWED_ROLES => [CO_PILOT], MANDATORY => true]
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
            7 => [ROUND_START_PLAYER => PILOT],
            6 => [ROUND_START_PLAYER => CO_PILOT],
            5 => [ROUND_START_PLAYER => PILOT, TOKEN_REROLL => 1],
            4 => [ROUND_START_PLAYER => CO_PILOT],
            3 => [ROUND_START_PLAYER => PILOT],
            2 => [ROUND_START_PLAYER => CO_PILOT],
            1 => [ROUND_START_PLAYER => PILOT, TOKEN_REROLL => 1],
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




