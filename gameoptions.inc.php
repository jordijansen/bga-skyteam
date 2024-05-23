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
            ],
            APPROACH_RED_PBH => [
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
            APPROACH_BLACK_PBH => [
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
            APPROACH_GREEN_BLQ_GUGLIELMO_MARCONI => [
                'name' => totranslate('Green: BLQ - Guglielmo Marconi [PROMO]'),
                'tmdisplay' => totranslate('Green: BLQ - Guglielmo Marconi [PROMO]'),
                'description' => totranslate('Difficulty: Green (Routine Landing). Modules: Traffic, Turns & Kerosene Leak. You leave behind the foothills of the Dolomites and Lake Garda, and plunge towards the Emilia-Romagna region. Bologna appears on the horizon. The skies are clear. Stay in your approach corridor.'),
                'nobeginner' => true,
            ],
            // WAVE 4
            APPROACH_GREEN_ATL => [
                'name' => totranslate('Green: ATL - Hartsfield-Jackson'),
                'tmdisplay' => totranslate('Green: ATL - Hartsfield-Jackson'),
                'description' => totranslate('Difficulty: Green (Routine Landing). Modules: Traffic & Intern. As you break through the clouds, you pass over the Appalachian foothills to see Atlanta... and a sky packed with traffic. On top of that, you have a nervous Intern to train. Good luck.'),
                'nobeginner' => true,
            ],
//            APPROACH_GREEN_OSL => [
//                'name' => totranslate('Green: OSL - Gardermoen'),
//                'tmdisplay' => totranslate('Green: OSL - Gardermoen'),
//                'description' => totranslate('Difficulty: Green (Routine Landing). Modules: Traffic & Kerosene. You begin your descent into Oslo, the city to your left, with the sun shimmering off the long narrow Øyeren Lake to your right. Keep your eyes on your kerosene. Happy landing!'),
//                'nobeginner' => true,
//            ],
//            APPROACH_GREEN_LHR => [
//                'name' => totranslate('Green: LHR - Heathrow'),
//                'tmdisplay' => totranslate('Green: LHR - Heathrow'),
//                'description' => totranslate('Difficulty: Green (Routine Landing). Modules: Traffic. You see the river Thames cutting a black channel through the lights of London as you near the airport. There is traffic at the end of your approach. Stay calm and land your plane.'),
//                'nobeginner' => true,
//            ],
//            APPROACH_GREEN_PRG => [
//                'name' => totranslate('Green: PRG - Václav Havel'),
//                'tmdisplay' => totranslate('Green: PRG - Václav Havel'),
//                'description' => totranslate('Difficulty: Green (Routine Landing). Modules: Traffic, Turns, Kerosene & 2 Special Abilities. Your skill set is improving. Use these abilities to land safely in Prague, one of Europe’s cultural centres, in the heart of Old Bohemia.'),
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
                'name' => totranslate('Yellow: LGA - LaGuardia [PROMO]'),
                'tmdisplay' => totranslate('Yellow: LGA - LaGuardia [PROMO]'),
                'description' => totranslate('Difficulty: Yellow (Exceptional Conditions). Modules: Traffic, Turns, Ice Brakes & 2 Special Abilities. A cold front has the Eastern Seaboard in its icy grip. Weather conditions are less than ideal and the run way is frozen. Brooklyn and Manhattan are glistening pillars of frost. It’s up to you now.'),
                'nobeginner' => true,
            ],
            APPROACH_YELLOW_DUS_DUSSELDORF => [
                'name' => totranslate('Yellow: DUS - Düsseldorf [PROMO]'),
                'tmdisplay' => totranslate('Yellow: DUS - Düsseldorf [PROMO]'),
                'description' => totranslate('Difficulty: Yellow (Exceptional Conditions). Modules: Traffic, Turns, Kerosene Leak & 2 Special Abilities. A computer problem paralyses Amsterdam airport and some flights, including yours, have been diverted to Düsseldorf. It’s early October, and the skies are already full. What can be going on...?'),
                'nobeginner' => true,
            ],
            APPROACH_YELLOW_CDG_PARIS => [
                'name' => totranslate('Yellow: CDG - Paris-Charles de Gaulle [PROMO]'),
                'tmdisplay' => totranslate('Yellow: CDG - Paris-Charles de Gaulle [PROMO]'),
                'description' => totranslate('Difficulty: Yellow (Exceptional Conditions). Modules: Traffic, Winds & Intern. Welcome aboard, fellow pilots! It’s time to test your skills and land your plane at the Paris-Charles de Gaulle airport... But be careful, the conditions are difficult today. Powerful winds are sweeping the French capital, and air traffic is very dense. A bit of a baptism by fire for the Intern who will be joining you on this flight. Are you up to the challenge? Max, Airline Pilot Officer (find Max on Social Media: @lepilotedeligne)'),
                'nobeginner' => true,
            ],
            APPROACH_YELLOW_TER_LAJES => [
                'name' => totranslate('Yellow: TER - Lajes, Açores'),
                'tmdisplay' => totranslate('Yellow: TER - Lajes, Açores'),
                'description' => totranslate('Difficulty: Yellow (Exceptional Conditions). Modules: Traffic, Turns, Ice Brakes, Engine Loss & 2 Special Abilities. You need to make an emergency landing. Your plane has run out of kerosene and your Engines are down. You will have to make multiple turns to slow the aircraft down and activate a stronger braking system to successfully pull this off.'),
                'nobeginner' => true,
            ],
            APPROACH_YELLOW_BUD_BUDAPEST => [
                'name' => totranslate('Yellow: BUD - Budapest Ferenc Liszt [PROMO]'),
                'tmdisplay' => totranslate('Yellow: BUD - Budapest Ferenc Liszt [PROMO]'),
                'description' => totranslate('Difficulty: Yellow (Exceptional Conditions). Modules: Traffic, Turns & Winds. You are flying over the immense Lake Balaton, approaching the Hungarian capital from the south-west. The wind is pushing hard behind you. Control your approach and line yourself up with the runway.'),
                'nobeginner' => true,
            ],
            // WAVE 4
            APPROACH_YELLOW_ATL => [
                'name' => totranslate('Yellow: ATL - Hartsfield-Jackson'),
                'tmdisplay' => totranslate('Yellow: ATL - Hartsfield-Jackson'),
                'description' => totranslate('Difficulty: Yellow (Exceptional Conditions). Modules: Traffic, Turns, Kerosene Leak & 1 Special Ability. As you break through the clouds, you pass over the Appalachian foothills to see Atlanta... and a sky packed with traffic. On top of that, you have a nervous Intern to train. Good luck.'),
                'nobeginner' => true,
            ],
            APPROACH_YELLOW_GIG => [
                'name' => totranslate('Yellow: GIG - Galeão'),
                'tmdisplay' => totranslate('Yellow: GIG - Galeão'),
                'description' => totranslate('Difficulty: Yellow (Exceptional Conditions). Modules: Traffic, Winds & 1 Special Ability. The Rio de Janeiro control tower is not responding. The strong tail wind is bringing you in much too fast as you pass over Copacabana beach. Make a wide turn and control your approach speed.'),
                'nobeginner' => true,
            ],
//            APPROACH_YELLOW_KEF => [
//                'name' => totranslate('Yellow: KEF - Keflavík'),
//                'tmdisplay' => totranslate('Yellow: KEF - Keflavík'),
//                'description' => totranslate('Difficulty: Yellow (Exceptional Conditions). Modules: Traffic, Ice Brakes & 1 Special Ability. As you pierce the clouds, you find yourself in the midst of an incredible blizzard. The runway lights can be dimly seen through the snow. Your passengers are depending on you. Concentrate. Focus. Land.'),
//                'nobeginner' => true,
//            ],
//            APPROACH_YELLOW_LHR => [
//                'name' => totranslate('Yellow: LHR - Heathrow'),
//                'tmdisplay' => totranslate('Yellow: LHR - Heathrow'),
//                'description' => totranslate('Difficulty: Yellow (Exceptional Conditions). Modules: Traffic & Intern. Heavy fog, common in London, has caused the sky to fill with planes in holding patterns over the British capital. You will need to stay alert right from the start of your approach!'),
//                'nobeginner' => true,
//            ],
//            APPROACH_YELLOW_PRG => [
//                'name' => totranslate('Yellow: PRG - Václav Havel'),
//                'tmdisplay' => totranslate('Yellow: PRG - Václav Havel'),
//                'description' => totranslate('Difficulty: Yellow (Exceptional Conditions). Modules: Traffic, Kerosene Leak & 2 Special Abilities. The sky is clear, giving a gorgeous view of the Carpathian mountains in the distance... An alarm sounds. You are losing fuel. Will you have enough to make it? Manage your speed, and may luck be on your side.'),
//                'nobeginner' => true,
//            ],
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
                'name' => totranslate('Red: CDG - Paris-Charles de Gaulle [PROMO]'),
                'tmdisplay' => totranslate('Red: CDG - Paris-Charles de Gaulle [PROMO]'),
                'description' => totranslate('Difficulty: Red (Elite Pilots Only). Modules: Traffic, Turns, Kerosene, Winds & Intern. Welcome aboard, fellow pilots! It’s time to test your skills and land your plane at the Paris-Charles de Gaulle airport... But be careful, the conditions are difficult today. Powerful winds are sweeping the French capital, and air traffic is very dense. A bit of a baptism by fire for the Intern who will be joining you on this flight. Are you up to the challenge? Max, Airline Pilot Officer (find Max on Social Media: @lepilotedeligne)'),
                'nobeginner' => true,
            ],
            APPROACH_RED_NZIR => [
                'name' => totranslate('Red: NZIR - Ice Runway'),
                'tmdisplay' => totranslate('Red: NZIR - Ice Runway'),
                'description' => totranslate('Difficulty: Red (Elite Pilots Only). Modules: Traffic, Turns, Ice Brakes, Winds HEAD-ON & 1 Special Ability. A strong headwind from the Pole shakes your cargo and the few passengers you have aboard. Welcome to Antarctica. The all-white landscape suggests a landing strip on the ice floe! In this month of November, the ice is still thick enough to support a landing. This is the first time you’ve seen the famous “Ice Runway” with your own eyes. Landing an airliner in this remote location seems unreal.'),
                'nobeginner' => true,
            ],
            APPROACH_RED_BLQ_GUGLIELMO_MARCONI => [
                'name' => totranslate('Red: BLQ - Guglielmo Marconi [PROMO]'),
                'tmdisplay' => totranslate('Red: BLQ - Guglielmo Marconi [PROMO]'),
                'description' => totranslate('Difficulty: Red (Elite Pilots Only). Modules: Traffic, Turns, Kerosene & 1 Special Ability. You leave behind the foothills of the Dolomites and Lake Garda, and plunge towards the Emilia-Romagna region. Bologna appears on the horizon. The skies are clear. Stay in your approach corridor.'),
                'nobeginner' => true,
            ],
            APPROACH_RED_BUD_BUDAPEST => [
                'name' => totranslate('Red: BUD - Budapest Ferenc Liszt [PROMO]'),
                'tmdisplay' => totranslate('Red: BUD - Budapest Ferenc Liszt [PROMO]'),
                'description' => totranslate('Difficulty: Red (Elite Pilots Only). Modules: Traffic, Turns, Altitude: 5000, Winds & 2 Special Abilities. You are flying over the immense Lake Balaton, approaching the Hungarian capital from the south-west. The wind is pushing hard behind you. Control your approach and line yourself up with the runway.'),
                'nobeginner' => true,
            ],
            // WAVE 4
            APPROACH_RED_GIG => [
                'name' => totranslate('Red: GIG - Galeão'),
                'tmdisplay' => totranslate('Red: GIG - Galeão'),
                'description' => totranslate('Difficulty: Red (Elite Pilots Only). Modules: Traffic, Winds, Kerosene Leak & 2 Special Abilities. The Rio de Janeiro control tower is not responding. The strong tail wind is bringing you in much too fast as you pass over Copacabana beach. Make a wide turn and control your approach speed.'),
                'nobeginner' => true,
            ],
//            APPROACH_RED_PBH => [
//                'name' => totranslate('Red: PBH - Paro (Real-Time)'),
//                'tmdisplay' => totranslate('Red: PBH - Paro (Real-Time)'),
//                'description' => totranslate('Difficulty: Red (Elite Pilots Only). Modules: Traffic, Turns, Kerosene, Real-Time & 2 Special Abilities. They call them foothills, but anywhere else they’d be called mountains. You are landing in Bhutan, on the edge of the Himalayas, at an altitude of over 7,000 feet. It’s a narrow valley. The mountains are so high and jagged...'),
//                'nobeginner' => true,
//            ],
//            APPROACH_RED_OSL => [
//                'name' => totranslate('Red: OSL - Gardermoen'),
//                'tmdisplay' => totranslate('Red: OSL - Gardermoen'),
//                'description' => totranslate('Difficulty: Red (Elite Pilots Only). Modules: Traffic, Kerosene Leak, Ice Brakes & 2 Special Abilities. The runway is frozen solid and your kerosene gauge has been running low for 30 minutes already. 150 passengers and crew are depending on you. Don’t let them down.'),
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
                'name' => totranslate('Black: LGA - LaGuardia [PROMO]'),
                'tmdisplay' => totranslate('Black: LGA - LaGuardia [PROMO]'),
                'description' => totranslate('Difficulty: Black (Heroic Landing). Modules: Traffic, Turns, Kerosene, Ice Brakes & 1 Special Ability. A cold front has the Eastern Seaboard in its icy grip. Weather conditions are less than ideal and the run way is frozen. Brooklyn and Manhattan are glistening pillars of frost. It’s up to you now.'),
                'nobeginner' => true,
            ],
            APPROACH_BLACK_DUS_DUSSELDORF => [
                'name' => totranslate('Black: DUS - Düsseldorf (Real-Time) [PROMO]'),
                'tmdisplay' => totranslate('Black: DUS - Düsseldorf (Real-Time) [PROMO]'),
                'description' => totranslate('Difficulty: Black (Heroic Landing). Modules: Traffic, Turns, Kerosene Leak, Real-Time & 1 Special Ability. A computer problem paralyses Amsterdam airport and some flights, including yours, have been diverted to Düsseldorf. It’s early October, and the skies are already full. What can be going on...?'),
                'nobeginner' => true,
            ],
            APPROACH_BLACK_TER_LAJES => [
                'name' => totranslate('Black: TER - Lajes, Açores'),
                'tmdisplay' => totranslate('Black: TER - Lajes, Açores'),
                'description' => totranslate('Difficulty: Black (Heroic Landing). Modules: Traffic, Turns, Ice Brakes, Engine Loss & 1 Special Abilities. You need to make an emergency landing. Your plane has run out of kerosene and your Engines are down. You will have to make multiple turns to slow the aircraft down and activate a stronger braking system to successfully pull this off.'),
                'nobeginner' => true,
            ],
            APPROACH_BLACK_NZIR => [
                'name' => totranslate('Black: NZIR - Ice Runway'),
                'tmdisplay' => totranslate('Black: NZIR - Ice Runway'),
                'description' => totranslate('Difficulty: Black (Heroic Landing). Modules: Traffic, Turns, Ice Brakes, Kerosene, Intern & Winds HEAD-ON. A strong headwind from the Pole shakes your cargo and the few passengers you have aboard. Welcome to Antarctica. The all-white landscape suggests a landing strip on the ice floe! In this month of November, the ice is still thick enough to support a landing. This is the first time you’ve seen the famous “Ice Runway” with your own eyes. Landing an airliner in this remote location seems unreal.'),
                'nobeginner' => true,
            ],
            // WAVE 4
//            APPROACH_BLACK_PBH => [
//                'name' => totranslate('Black: PBH - Paro (Real-Time)'),
//                'tmdisplay' => totranslate('Black: PBH - Paro (Real-Time)'),
//                'description' => totranslate('Difficulty: Black (Heroic Landing). Modules: Traffic, Turns, Kerosene, Real-Time & 2 Special Abilities. They call them foothills, but anywhere else they’d be called mountains. You are landing in Bhutan, on the edge of the Himalayas, at an altitude of over 7,000 feet. It’s a narrow valley. The mountains are so high and jagged...'),
//                'nobeginner' => true,
//            ],
//            APPROACH_BLACK_KEF => [
//                'name' => totranslate('Black: KEF - Keflavík'),
//                'tmdisplay' => totranslate('Black: KEF - Keflavík'),
//                'description' => totranslate('Difficulty: Black (Heroic Landing). Modules: Traffic, Winds, Ice Brakes & 2 Special Abilities. As you pierce the clouds, you find yourself in the midst of an incredible blizzard. The runway lights can be dimly seen through the snow. Your passengers are depending on you. Concentrate. Focus. Land.'),
//                'nobeginner' => true,
//            ],
        ]
    ],
    REAL_TIME_SECONDS_OPTION_ID => [
        'name' => totranslate('Timer Duration'),
        'displaycondition' => [
              [
                  'type' => 'otheroption',
                  'id' => SCENARIO_OPTION_ID,
                  'value' => [ APPROACH_BLACK_KUL_KUALA_LUMPUR, APPROACH_BLACK_DUS_DUSSELDORF, APPROACH_BLACK_PBH, APPROACH_RED_PBH]
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


