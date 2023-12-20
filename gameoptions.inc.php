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
        'default' => PREF_SHOW_HELP_ICONS_ENABLED_ID
    ],
    PREF_SHOW_COMMUNICATION_BANNER => [
        'name' => totranslate('Communication reminder banner'),
        'needReload' => true, // after user changes this preference game interface would auto-reload
        'values' => [
            PREF_SHOW_COMMUNICATION_BANNER_ALWAYS => ['name' => totranslate( 'Always visible' ), 'cssPref' => 'communication-banner-visible'],
            PREF_SHOW_COMMUNICATION_BANNER_AUTO_HIDE => ['name' => totranslate( 'Auto hide after 10 seconds' ), 'cssPref' => 'communication-banner-auto-hide'],
            PREF_SHOW_COMMUNICATION_BANNER_HIDE => ['name' => totranslate( 'Always hidden' ), 'cssPref' => 'communication-banner-hidden'],
        ],
        'default' => PREF_SHOW_COMMUNICATION_BANNER_ALWAYS
    ],
    PREF_BACKGROUND => [
        'name' => totranslate('Background'),
        'needReload' => true, // after user changes this preference game interface would auto-reload
        'values' => [
            PREF_BACKGROUND_BLUE => ['name' => totranslate( 'Blue Solid Color' ), 'cssPref' => 'skyteam-background-blue'],
            PREF_BACKGROUND_BGA => ['name' => totranslate( 'Default BGA background (wood)' ), 'cssPref' => 'skyteam-background-bga']
        ],
        'default' => PREF_BACKGROUND_BLUE
    ],
];

$game_options = [
    SCENARIO_OPTION_ID => [
        'name' => totranslate('Scenario'),
        'startcondition' => [
            APPROACH_BLACK_KUL_KUALA_LUMPUR => [
                ['type' => 'otheroptionisnot','id' => 200, 'value' => 10, 'message' => totranslate('This scenario can only be played in Real-Time')],
                ['type' => 'otheroptionisnot','id' => 200, 'value' => 11, 'message' => totranslate('This scenario can only be played in Real-Time')],
                ['type' => 'otheroptionisnot','id' => 200, 'value' => 12, 'message' => totranslate('This scenario can only be played in Real-Time')],
                ['type' => 'otheroptionisnot','id' => 200, 'value' => 13, 'message' => totranslate('This scenario can only be played in Real-Time')],
                ['type' => 'otheroptionisnot','id' => 200, 'value' => 14, 'message' => totranslate('This scenario can only be played in Real-Time')],
                ['type' => 'otheroptionisnot','id' => 200, 'value' => 15, 'message' => totranslate('This scenario can only be played in Real-Time')],
                ['type' => 'otheroptionisnot','id' => 200, 'value' => 16, 'message' => totranslate('This scenario can only be played in Real-Time')],
                ['type' => 'otheroptionisnot','id' => 200, 'value' => 17, 'message' => totranslate('This scenario can only be played in Real-Time')],
                ['type' => 'otheroptionisnot','id' => 200, 'value' => 18, 'message' => totranslate('This scenario can only be played in Real-Time')],
                ['type' => 'otheroptionisnot','id' => 200, 'value' => 19, 'message' => totranslate('This scenario can only be played in Real-Time')],
                ['type' => 'otheroptionisnot','id' => 200, 'value' => 20, 'message' => totranslate('This scenario can only be played in Real-Time')],
                ['type' => 'otheroptionisnot','id' => 200, 'value' => 21, 'message' => totranslate('This scenario can only be played in Real-Time')],
            ],
            APPROACH_BLACK_DUS_DUSSELDORF => [
                ['type' => 'otheroptionisnot','id' => 200, 'value' => 10, 'message' => totranslate('This scenario can only be played in Real-Time')],
                ['type' => 'otheroptionisnot','id' => 200, 'value' => 11, 'message' => totranslate('This scenario can only be played in Real-Time')],
                ['type' => 'otheroptionisnot','id' => 200, 'value' => 12, 'message' => totranslate('This scenario can only be played in Real-Time')],
                ['type' => 'otheroptionisnot','id' => 200, 'value' => 13, 'message' => totranslate('This scenario can only be played in Real-Time')],
                ['type' => 'otheroptionisnot','id' => 200, 'value' => 14, 'message' => totranslate('This scenario can only be played in Real-Time')],
                ['type' => 'otheroptionisnot','id' => 200, 'value' => 15, 'message' => totranslate('This scenario can only be played in Real-Time')],
                ['type' => 'otheroptionisnot','id' => 200, 'value' => 16, 'message' => totranslate('This scenario can only be played in Real-Time')],
                ['type' => 'otheroptionisnot','id' => 200, 'value' => 17, 'message' => totranslate('This scenario can only be played in Real-Time')],
                ['type' => 'otheroptionisnot','id' => 200, 'value' => 18, 'message' => totranslate('This scenario can only be played in Real-Time')],
                ['type' => 'otheroptionisnot','id' => 200, 'value' => 19, 'message' => totranslate('This scenario can only be played in Real-Time')],
                ['type' => 'otheroptionisnot','id' => 200, 'value' => 20, 'message' => totranslate('This scenario can only be played in Real-Time')],
                ['type' => 'otheroptionisnot','id' => 200, 'value' => 21, 'message' => totranslate('This scenario can only be played in Real-Time')],
            ]
        ],
        'values' => [
            // GREEN
            APPROACH_GREEN_YUL_MONTREAL => [
                'name' => totranslate('Green: YUL - Montreal-Trudeau (beginner)'),
                'tmdisplay' => totranslate('Green: YUL - Montreal-Trudeau (beginner)'),
                'description' => totranslate('Difficulty: Green (Routine Landing). Modules: none. Your first flight is going well. The sun is rising over the horizon, and the snow-covered landscape is magnificent as you glide over the St. Lawrence River. Perfect conditions for a smooth landing.'),
                'default' => true,
                'firstgameonly' => true
            ],
            APPROACH_GREEN_HND_HANEDA => [
                'name' => totranslate('Green: HND - Haneda'),
                'tmdisplay' => totranslate('Green: HND - Haneda'),
                'description' => totranslate('Difficulty: Green (Routine Landing). Modules: Traffic & Turns. With iconic Mount Fuji in the background, you must execute a wide left turn to bring your plane over Tokyo Bay and in line with the runway, which juts out into the water.'),
                'nobeginner' => true,
            ],
//            APPROACH_GREEN_BUD_BUDAPEST => [
//                'name' => totranslate('Green: BUD - Budapest Ferenc Liszt'),
//                'tmdisplay' => totranslate('Green: BUD - Budapest Ferenc Liszt'),
//                'description' => totranslate('Difficulty: Green (Routine Landing). Modules: Traffic, Turns & Winds. You are flying over the immense Lake Balaton, approaching the Hungarian capital from the south-west. The wind is pushing hard behind you. Control your approach and line yourself up with the runway.'),
//                'nobeginner' => true,
//            ],
//            APPROACH_GREEN_BLQ_GUGLIELMO_MARCONI => [
//                'name' => totranslate('Green: BLQ - Guglielmo Marconi'),
//                'tmdisplay' => totranslate('Green: BLQ - Guglielmo Marconi'),
//                'description' => totranslate('Difficulty: Green (Routine Landing). Modules: Traffic, Turns & Kerosene Leak. You leave behind the foothills of the Dolomites and Lake Garda, and plunge towards the Emilia-Romagna region. Bologna appears on the horizon. The skies are clear. Stay in your approach corridor.'),
//                'nobeginner' => true,
//            ],
            // YELLOW
            APPROACH_YELLOW_KUL_KUALA_LUMPUR => [
                'name' => totranslate('Yellow: KUL - Kuala Lumpur'),
                'tmdisplay' => totranslate('Yellow: KUL - Kuala Lumpur'),
                'description' => totranslate('Difficulty: Yellow (Exceptional Conditions). Modules: Traffic, Turns, Kerosene & 1 Special Ability. You are right to be concerned about Malaysia’s electrical storms... Keep your plane in line between the storm masses. It will be a bumpy landing in Kuala Lumpur.'),
                'nobeginner' => true,
            ],
            APPROACH_YELLOW_TGU_TONCONTIN => [
                'name' => totranslate('Yellow: TGU - Toncontín'),
                'tmdisplay' => totranslate('Yellow: TGU - Toncontín'),
                'description' => totranslate('Difficulty: Yellow (Exceptional Conditions). Modules: Traffic, Turns, Kerosene & 2 Special Abilities. This airport is nestled at the base of a bowl of mountains; you will need to descend rapidly and make a very tight final turn. Welcome to Honduras!'),
                'nobeginner' => true,
            ],
            APPROACH_YELLOW_LGA_LAGUARDIA => [
                'name' => totranslate('Yellow: LGA - LaGuardia'),
                'tmdisplay' => totranslate('Yellow: LGA - LaGuardia'),
                'description' => totranslate('Difficulty: Yellow (Exceptional Conditions). Modules: Traffic, Turns, Ice Brakes & 2 Special Abilities. A cold front has the Eastern Seaboard in its icy grip. Weather conditions are less than ideal and the run way is frozen. Brooklyn and Manhattan are glistening pillars of frost. It’s up to you now.'),
                'nobeginner' => true,
            ],
            APPROACH_YELLOW_DUS_DUSSELDORF => [
                'name' => totranslate('Yellow: DUS - Düsseldorf'),
                'tmdisplay' => totranslate('Yellow: DUS - Düsseldorf'),
                'description' => totranslate('Difficulty: Yellow (Exceptional Conditions). Modules: Traffic, Turns, Kerosene Leak & 2 Special Abilities. A computer problem paralyses Amsterdam airport and some flights, including yours, have been diverted to Düsseldorf. It’s early October, and the skies are already full. What can be going on...?'),
                'nobeginner' => true,
            ],
            APPROACH_YELLOW_CDG_PARIS => [
                'name' => totranslate('Yellow: CDG - Paris-Charles de Gaulle'),
                'tmdisplay' => totranslate('Yellow: CDG - Paris-Charles de Gaulle'),
                'description' => totranslate('Difficulty: Yellow (Exceptional Conditions). Modules: Traffic, Winds & Intern. Welcome aboard, fellow pilots! It’s time to test your skills and land your plane at the Paris-Charles de Gaulle airport... But be careful, the conditions are difficult today. Powerful winds are sweeping the French capital, and air traffic is very dense. A bit of a baptism by fire for the Intern who will be joining you on this flight. Are you up to the challenge? Max, Airline Pilot Officer (find Max on Social Media: @lepilotedeligne)'),
                'nobeginner' => true,
            ],
            APPROACH_YELLOW_TER_LAJES => [
                'name' => totranslate('Yellow: TER - Lajes, Açores'),
                'tmdisplay' => totranslate('Yellow: TER - Lajes, Açores'),
                'description' => totranslate('Difficulty: Yellow (Exceptional Conditions). Modules: Traffic, Turns, Ice Brakes, Engine Loss & 2 Special Abilities. You need to make an emergency landing. Your plane has run out of kerosene and your Engines are down. You will have to make multiple turns to slow the aircraft down and activate a stronger braking system to successfully pull this off.'),
                'nobeginner' => true,
            ],
            // RED
            APPROACH_RED_TGU_TONCONTIN => [
                'name' => totranslate('Red: TGU - Toncontín'),
                'tmdisplay' => totranslate('Red: TGU - Toncontín'),
                'description' => totranslate('Difficulty: Red (Elite Pilots Only). Modules: Traffic, Turns, Kerosene, Winds & 2 Special Abilities. When are they going to build a new airport at Tegucigalpa? Landing here haunts your dreams. When you learned what your destination was, your stomach flipped. Drop down to the left between the mountains and do what it takes.'),
                'nobeginner' => true,
            ],
            APPROACH_RED_HND_HANEDA => [
                'name' => totranslate('Red: HND - Haneda'),
                'tmdisplay' => totranslate('Red: HND - Haneda'),
                'description' => totranslate('Difficulty: Red (Elite Pilots Only). Modules: Traffic, Turns, Kerosene, Intern & 1 Special Ability. Your air corridor has been cherry blossom festival, and the skies are packed with planes. It will take all your focus to navigate your approach.'),
                'nobeginner' => true,
            ],
            APPROACH_RED_CDG_PARIS => [
                'name' => totranslate('Red: CDG - Paris-Charles de Gaulle'),
                'tmdisplay' => totranslate('Red: CDG - Paris-Charles de Gaulle'),
                'description' => totranslate('Difficulty: Red (Elite Pilots Only). Modules: Traffic, Turns, Kerosene, Winds & Intern. Welcome aboard, fellow pilots! It’s time to test your skills and land your plane at the Paris-Charles de Gaulle airport... But be careful, the conditions are difficult today. Powerful winds are sweeping the French capital, and air traffic is very dense. A bit of a baptism by fire for the Intern who will be joining you on this flight. Are you up to the challenge? Max, Airline Pilot Officer (find Max on Social Media: @lepilotedeligne)'),
                'nobeginner' => true,
            ],
            APPROACH_RED_NZIR => [
                'name' => totranslate('Red: NZIR - Ice Runway'),
                'tmdisplay' => totranslate('Red: NZIR - Ice Runway'),
                'description' => totranslate('Difficulty: Red (Elite Pilots Only). Modules: Traffic, Turns, Ice Brakes, Winds HEAD-ON & 1 Special Ability. A strong headwind from the Pole shakes your cargo and the few passengers you have aboard. Welcome to Antarctica. The all-white landscape suggests a landing strip on the ice floe! In this month of November, the ice is still thick enough to support a landing. This is the first time you’ve seen the famous “Ice Runway” with your own eyes. Landing an airliner in this remote location seems unreal.'),
                'nobeginner' => true,
            ],
//            APPROACH_RED_BLQ_GUGLIELMO_MARCONI => [
//                'name' => totranslate('Red: BLQ - Guglielmo Marconi'),
//                'tmdisplay' => totranslate('Red: BLQ - Guglielmo Marconi'),
//                'description' => totranslate('Difficulty: Red (Elite Pilots Only). Modules: Traffic, Turns, Kerosene & 1 Special Ability. You leave behind the foothills of the Dolomites and Lake Garda, and plunge towards the Emilia-Romagna region. Bologna appears on the horizon. The skies are clear. Stay in your approach corridor.'),
//                'nobeginner' => true,
//            ],
//            APPROACH_RED_BUD_BUDAPEST => [
//                'name' => totranslate('Red: BUD - Budapest Ferenc Liszt'),
//                'tmdisplay' => totranslate('Red: BUD - Budapest Ferenc Liszt'),
//                'description' => totranslate('Difficulty: Red (Elite Pilots Only). Modules: Traffic, Turns, Altitude: 5000, Winds & 2 Special Abilities. You are flying over the immense Lake Balaton, approaching the Hungarian capital from the south-west. The wind is pushing hard behind you. Control your approach and line yourself up with the runway.'),
//                'nobeginner' => true,
//            ],
            // BLACK
            APPROACH_BLACK_KUL_KUALA_LUMPUR => [
                'name' => totranslate('Black: KUL - Kuala Lumpur (Real-Time)'),
                'tmdisplay' => totranslate('Black: KUL - Kuala Lumpur (Real-Time)'),
                'description' => totranslate('Difficulty: Black (Heroic Landing). Modules: Traffic, Turns, Kerosene, Real-Time & 2 Special Abilities. Lightning flashes all around as you approach. This must be what it’s like to fly into hell. Getting to the airport is going to take every last ounce of your concentration. Time is against you. Semoga berjaya, as the locals would say.'),
                'nobeginner' => true,
            ],
            APPROACH_BLACK_LGA_LAGUARDIA => [
                'name' => totranslate('Black: LGA - LaGuardia'),
                'tmdisplay' => totranslate('Black: LGA - LaGuardia'),
                'description' => totranslate('Difficulty: Black (Heroic Landing). Modules: Traffic, Turns, Kerosene, Ice Brakes & 1 Special Ability. A cold front has the Eastern Seaboard in its icy grip. Weather conditions are less than ideal and the run way is frozen. Brooklyn and Manhattan are glistening pillars of frost. It’s up to you now.'),
                'nobeginner' => true,
            ],
            APPROACH_BLACK_DUS_DUSSELDORF => [
                'name' => totranslate('Black: DUS - Düsseldorf (Real-Time)'),
                'tmdisplay' => totranslate('Black: DUS - Düsseldorf (Real-Time)'),
                'description' => totranslate('Difficulty: Black (Heroic Landing). Modules: Traffic, Turns, Kerosene Leak, Real-Time & 1 Special Ability. A computer problem paralyses Amsterdam airport and some flights, including yours, have been diverted to Düsseldorf. It’s early October, and the skies are already full. What can be going on...?'),
                'nobeginner' => true,
            ],
            APPROACH_BLACK_TER_LAJES => [
                'name' => totranslate('Black: TER - Lajes, Açores'),
                'tmdisplay' => totranslate('Black: TER - Lajes, Açores'),
                'description' => totranslate('Difficulty: Black (Heroic Landing). Modules: Traffic, Turns, Ice Brakes, Engine Loss & 2 Special Abilities. You need to make an emergency landing. Your plane has run out of kerosene and your Engines are down. You will have to make multiple turns to slow the aircraft down and activate a stronger braking system to successfully pull this off.'),
                'nobeginner' => true,
            ],
            APPROACH_BLACK_NZIR => [
                'name' => totranslate('Black: NZIR - Ice Runway'),
                'tmdisplay' => totranslate('Black: NZIR - Ice Runway'),
                'description' => totranslate('Difficulty: Black (Heroic Landing). Modules: Traffic, Turns, Ice Brakes, Kerosene, Intern & Winds HEAD-ON. A strong headwind from the Pole shakes your cargo and the few passengers you have aboard. Welcome to Antarctica. The all-white landscape suggests a landing strip on the ice floe! In this month of November, the ice is still thick enough to support a landing. This is the first time you’ve seen the famous “Ice Runway” with your own eyes. Landing an airliner in this remote location seems unreal.'),
                'nobeginner' => true,
            ]
        ]
    ],
    REAL_TIME_SECONDS_OPTION_ID => [
        'name' => totranslate('Timer Duration'),
        'displaycondition' => [
              [
                  'type' => 'otheroption',
                  'id' => SCENARIO_OPTION_ID,
                  'value' => [ APPROACH_BLACK_KUL_KUALA_LUMPUR, APPROACH_BLACK_DUS_DUSSELDORF]
              ]
        ],
        'values' => [
            REAL_TIME_60_SECONDS => [
                'name' => totranslate('60 seconds (default)'),
                'tmdisplay' => totranslate('Real-Time timer duration: 60 seconds'),
                'description' => totranslate('You have 60 seconds to place your dice each round. This is the intended way of playing Real-Time scenarios.'),
                'default' => true,
            ],
            REAL_TIME_70_SECONDS => [
                'name' => totranslate('70 seconds'),
                'tmdisplay' => totranslate('Real-Time timer duration: 70 seconds'),
                'description' => totranslate('You have 70 seconds to place your dice each round. This is a more forgiving experience. Some actions are slower on BGA than in real life.'),
                'default' => true,
            ],
            REAL_TIME_80_SECONDS => [
                'name' => totranslate('80 seconds'),
                'tmdisplay' => totranslate('Real-Time timer duration: 80 seconds'),
                'description' => totranslate('You have 80 seconds to place your dice each round. This is the most forgiving experience. Some actions are slower on BGA than in real life.'),
                'default' => true,
            ],
        ]
        
    ],
];


