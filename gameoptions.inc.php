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
 * gameoptions.inc.php
 *
 * skyteam game options description
 * 
 * In this file, you can define your game options (= game variants).
 *   
 * Note: If your game has no variant, you don't have to modify this file.
 *
 * Note²: All options defined in this file should have a corresponding "game state labels"
 *        with the same ID (see "initGameStateLabels" in skyteam.game.php)
 *
 * !! It is not a good idea to modify this file when a game is running !!
 *
 */
require_once(__DIR__.'/modules/php/Constants.inc.php');

$game_preferences = [
    PREF_SHOW_HELP_ICONS => [
        'name' => totranslate('Show ? buttons'),
        'needReload' => true, // after user changes this preference game interface would auto-reload
        'values' => [
            PREF_SHOW_HELP_ICONS_ENABLED_ID => ['name' => totranslate( 'Enabled' ), 'cssPref' => 'help-buttons-enabled'],
            PREF_SHOW_HELP_ICONS_DISABLED_ID => ['name' => totranslate( 'Disabled' ), 'cssPref' => 'help-buttons-disabled'],
        ],
        'default' => 1
    ],
];

$game_options = [

    SCENARIO_OPTION_ID => [
        'name' => totranslate('Scenario'),
        'values' => [
            APPROACH_GREEN_YUL_MONTREAL => [
                'name' => totranslate('Green: YUL - Montreal-Trudeau (beginner)'),
                'description' => totranslate('Difficulty: Green (Routine Landing). Modules: none. Your first flight is going well. The sun is rising over the horizon, and the snow-covered landscape is magnificent as you glide over the St. Lawrence River. Perfect conditions for a smooth landing.'),
                'default' => true,
                'firstgameonly' => true
            ],
            APPROACH_GREEN_HND_HANEDA => [
                'name' => totranslate('Green: HND - Haneda'),
                'description' => totranslate('Difficulty: Green (Routine Landing). Modules: Traffic & Turns. With iconic Mount Fuji in the background, you must execute a wide left turn to bring your plane over Tokyo Bay and in line with the runway, which juts out into the water.'),
                'nobeginner' => true,
            ]
        ]
    ]
];


