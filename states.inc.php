<?php
/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * game implementation : © <Your name here> <Your email address here>
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 *
 * states.inc.php
 *
 */

/*
   Game state machine is a tool used to facilitate game developpement by doing common stuff that can be set up
   in a very easy way from this configuration file.

   Please check the BGA Studio presentation about game state to understand this, and associated documentation.

   Summary:

   States types:
   _ activeplayer: in this type of state, we expect some action from the active player.
   _ multipleactiveplayer: in this type of state, we expect some action from multiple players (the active players)
   _ game: this is an intermediary state where we don't expect any actions from players. Your game logic must decide what is the next game state.
   _ manager: special type for initial and final state

   Arguments of game states:
   _ name: the name of the GameState, in order you can recognize it on your own code.
   _ description: the description of the current game state is always displayed in the action status bar on
                  the top of the game. Most of the time this is useless for game state with "game" type.
   _ descriptionmyturn: the description of the current game state when it's your turn.
   _ type: defines the type of game states (activeplayer / multipleactiveplayer / game / manager)
   _ action: name of the method to call when this game state become the current game state. Usually, the
             action method is prefixed by "st" (ex: "stMyGameStateName").
   _ possibleactions: array that specify possible player actions on this step. It allows you to use "checkAction"
                      method on both client side (Javacript: this.checkAction) and server side (PHP: self::checkAction).
   _ transitions: the transitions are the possible paths to go from a game state to another. You must name
                  transitions in order to use transition names in "nextState" PHP method, and use IDs to
                  specify the next game state for each transition.
   _ args: name of the method to call to retrieve arguments for this gamestate. Arguments are sent to the
           client side to be used on "onEnteringState" or to set arguments in the gamestate description.
   _ updateGameProgression: when specified, the game progression is updated (=> call to your getGameProgression
                            method).
*/

//    !! It is not a good idea to modify this file when a game is running !!
require_once("modules/php/Constants.inc.php");

$basicGameStates = [

    // The initial state. Please do not modify.
    ST_GAME_SETUP => [
        "name" => 'gameSetup',
        "description" => clienttranslate("Game setup"),
        "type" => "manager",
        "action" => "stGameSetup",
        "transitions" => [ "" => ST_PLAYER_SETUP ]
    ],

    // Final state.
    // Please do not modify.
    ST_GAME_END => [
        "name" => 'gameEnd',
        "description" => clienttranslate("End of game"),
        "type" => "manager",
        "action" => "stGameEnd",
        "args" => "argGameEnd"
    ],
];

$gameStates = [
    ST_PLAYER_SETUP => [
        "name" => "playerSetup",
        "description" => clienttranslate('${actplayer} confirm roles'),
        "descriptionmyturn" => clienttranslate('${you} must confirm roles'),
        "type" => "activeplayer",
        "possibleactions" => [
            ACT_CONFIRM_PLAYER_SETUP
        ],
        "transitions" => [
            "" => ST_START_ROUND
        ],
    ],
    ST_START_ROUND => [
        "name" => "startRound",
        "description" => clienttranslate('Starting a new round...'),
        "type" => "game",
        "action" => "stStartRound",
        "transitions" => [
            '' => ST_STRATEGY
        ]
    ],
    ST_STRATEGY => [
        "name" => "strategy",
        "description" => clienttranslate('Waiting for players to confirm they are ready'),
        "descriptionmyturn" => clienttranslate('Players may discuss strategy, once you are ready to start the round click the ready button'),
        "type" => "multipleactiveplayer",
        "possibleactions" => [
            ACT_READY
        ],
        "transitions" => [
            "" => ST_DICE_PLACEMENT_START
        ],
    ],
    ST_DICE_PLACEMENT_START => [
        "name" => "dicePlacementStart",
        "description" => clienttranslate('Starting dice placement phase...'),
        "type" => "game",
        "action" => "stDicePlacementStart",
        "transitions" => [
            '' => ST_DICE_PLACEMENT_SELECT
        ]
    ],
    ST_DICE_PLACEMENT_SELECT => [
        "name" => "dicePlacementSelect",
        "description" => clienttranslate('${actplayer} must place a die'),
        "descriptionmyturn" => clienttranslate('${you} must must place a die'),
        "type" => "activeplayer",
        "args" => "argDicePlacementSelect",
        "possibleactions" => [
            ACT_DICE_PLACEMENT_SELECT,
            ACT_START_REROLL
        ],
        "transitions" => [
            "" => ST_DICE_PLACEMENT_NEXT
        ],
    ],
    ST_DICE_PLACEMENT_NEXT => [
        "name" => "dicePlacementNext",
        "description" => '',
        "type" => "game",
        "action" => "stDicePlacementNext",
        "transitions" => [
            'next' => ST_DICE_PLACEMENT_SELECT
        ]
    ],
    ST_REROLL_DICE => [
        "name" => "rerollDice",
        "description" => clienttranslate('Waiting for players to re-roll any number of dice'),
        "descriptionmyturn" => clienttranslate('${you} may re-roll any number of dice'),
        "type" => "multipleactiveplayer",
        "possibleactions" => [
            ACT_REROLL
        ],
        "transitions" => [
            "" => ST_DICE_PLACEMENT_SELECT
        ],
    ],
    ST_PLANE_FAILURE => [
        "name" => "planeFailure",
        "description" => clienttranslate('MAYDAY MAYDAY, something went horribly wrong...'),
        "type" => "game",
        "action" => "stPlaneFailure",
        "transitions" => [
            '' => 98
        ]
    ],

    98 => [
        "name" => "catchState",
        "description" => clienttranslate('${actplayer} catch'),
        "descriptionmyturn" => clienttranslate('${you} catch'),
        "type" => "activeplayer",
        "transitions" => [
//            '' => ST_GAME_END
        ]
    ],
];



$machinestates = $basicGameStates + $gameStates;



