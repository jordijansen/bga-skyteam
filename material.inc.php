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
    ACTION_SPACE_KEROSENE => clienttranslate('kerosene'),
    ACTION_SPACE_INTERN => clienttranslate('intern'),
    ACTION_SPACE_ICE_BRAKES => clienttranslate('ice-brakes')
];

$this->ACTION_SPACES = [
    ACTION_SPACE_AXIS.'-1' => ['type' => ACTION_SPACE_AXIS, ALLOWED_ROLES => [PILOT], MANDATORY => true],
    ACTION_SPACE_AXIS.'-2' => ['type' => ACTION_SPACE_AXIS, ALLOWED_ROLES => [CO_PILOT], MANDATORY => true],
    ACTION_SPACE_ENGINES.'-1' => ['type' => ACTION_SPACE_ENGINES, NOT_MODULE => MODULE_ENGINE_LOSS, ALLOWED_ROLES => [PILOT], MANDATORY => true],
    ACTION_SPACE_ENGINES.'-2' => ['type' => ACTION_SPACE_ENGINES, NOT_MODULE => MODULE_ENGINE_LOSS, ALLOWED_ROLES => [CO_PILOT], MANDATORY => true],
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
    ACTION_SPACE_BRAKES.'-1' => ['type' => ACTION_SPACE_BRAKES, NOT_MODULE => MODULE_ICE_BRAKES, ALLOWED_ROLES => [PILOT], MANDATORY => false, ALLOWED_VALUES => [2]],
    ACTION_SPACE_BRAKES.'-2' => ['type' => ACTION_SPACE_BRAKES, NOT_MODULE => MODULE_ICE_BRAKES, ALLOWED_ROLES => [PILOT], MANDATORY => false, ALLOWED_VALUES => [4], REQUIRES_SWITCH_IN => ACTION_SPACE_BRAKES.'-1'],
    ACTION_SPACE_BRAKES.'-3' => ['type' => ACTION_SPACE_BRAKES, NOT_MODULE => MODULE_ICE_BRAKES, ALLOWED_ROLES => [PILOT], MANDATORY => false, ALLOWED_VALUES => [6], REQUIRES_SWITCH_IN => ACTION_SPACE_BRAKES.'-2'],
    ACTION_SPACE_KEROSENE => ['type' => ACTION_SPACE_KEROSENE, MODULE => MODULE_KEROSENE, ALLOWED_ROLES => [PILOT, CO_PILOT], MANDATORY => false],
    ACTION_SPACE_INTERN.'-1' => ['type' => ACTION_SPACE_INTERN, MODULE => MODULE_INTERN, ALLOWED_ROLES => [PILOT], MANDATORY => false],
    ACTION_SPACE_INTERN.'-2' => ['type' => ACTION_SPACE_INTERN, MODULE => MODULE_INTERN, ALLOWED_ROLES => [CO_PILOT], MANDATORY => false],
    ACTION_SPACE_ICE_BRAKES.'-1-1' => ['type'=> ACTION_SPACE_ICE_BRAKES, MODULE => MODULE_ICE_BRAKES, ALLOWED_ROLES => [PILOT], ALLOWED_VALUES => [2], MANDATORY => false],
    ACTION_SPACE_ICE_BRAKES.'-1-2' => ['type'=> ACTION_SPACE_ICE_BRAKES, MODULE => MODULE_ICE_BRAKES, ALLOWED_ROLES => [PILOT], ALLOWED_VALUES => [3], MANDATORY => false],
    ACTION_SPACE_ICE_BRAKES.'-1-3' => ['type'=> ACTION_SPACE_ICE_BRAKES, MODULE => MODULE_ICE_BRAKES, ALLOWED_ROLES => [PILOT], ALLOWED_VALUES => [4], MANDATORY => false],
    ACTION_SPACE_ICE_BRAKES.'-1-4' => ['type'=> ACTION_SPACE_ICE_BRAKES, MODULE => MODULE_ICE_BRAKES, ALLOWED_ROLES => [PILOT], ALLOWED_VALUES => [5], MANDATORY => false],
    ACTION_SPACE_ICE_BRAKES.'-2-1' => ['type'=> ACTION_SPACE_ICE_BRAKES, MODULE => MODULE_ICE_BRAKES, ALLOWED_ROLES => [PILOT, CO_PILOT], ALLOWED_VALUES => [2], MANDATORY => false],
    ACTION_SPACE_ICE_BRAKES.'-2-2' => ['type'=> ACTION_SPACE_ICE_BRAKES, MODULE => MODULE_ICE_BRAKES, ALLOWED_ROLES => [PILOT, CO_PILOT], ALLOWED_VALUES => [3], MANDATORY => false],
    ACTION_SPACE_ICE_BRAKES.'-2-3' => ['type'=> ACTION_SPACE_ICE_BRAKES, MODULE => MODULE_ICE_BRAKES, ALLOWED_ROLES => [PILOT, CO_PILOT], ALLOWED_VALUES => [4], MANDATORY => false],
    ACTION_SPACE_ICE_BRAKES.'-2-4' => ['type'=> ACTION_SPACE_ICE_BRAKES, MODULE => MODULE_ICE_BRAKES, ALLOWED_ROLES => [PILOT, CO_PILOT], ALLOWED_VALUES => [5], MANDATORY => false],
];

$this->APPROACH_TRACKS = [
    APPROACH_GREEN_YUL_MONTREAL => [
        'type' => APPROACH_GREEN_YUL_MONTREAL,
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
    ],
    APPROACH_GREEN_HND_HANEDA => [
        'type' => APPROACH_GREEN_HND_HANEDA,
        'category' => APPROACH_GREEN,
        'name' => 'HND Haneda',
        'size' => 8,
        'spaces' => [
            8 => [TOKEN_PLANE => 1],
            7 => [TOKEN_PLANE => 2],
            6 => [ALLOWED_AXIS => [-2, -1, 0]],
            5 => [ALLOWED_AXIS => [-2, -1], TOKEN_PLANE => 1],
            4 => [TOKEN_PLANE => 2],
            3 => [ALLOWED_AXIS => [-1, 0], TOKEN_PLANE => 1],
            2 => [TOKEN_PLANE => 1],
            1 => [DICE_TRAFFIC => 2],
        ]
    ],
    APPROACH_YELLOW_KUL_KUALA_LUMPUR => [
        'type' => APPROACH_YELLOW_KUL_KUALA_LUMPUR,
        'category' => APPROACH_YELLOW,
        'name' => 'KUL Kuala Lumpur',
        'size' => 8,
        'spaces' => [
            8 => [TOKEN_PLANE => 1],
            7 => [TOKEN_PLANE => 1, ALLOWED_AXIS => [1, 2]],
            6 => [TOKEN_PLANE => 1],
            5 => [ALLOWED_AXIS => [1, 2]],
            4 => [TOKEN_PLANE => 1, ALLOWED_AXIS => [0, 1], DICE_TRAFFIC => 1],
            3 => [TOKEN_PLANE => 1],
            2 => [ALLOWED_AXIS => [1, 2]],
            1 => [DICE_TRAFFIC => 2],
        ]
    ],
    APPROACH_RED_TGU_TONCONTIN => [
        'type' => APPROACH_RED_TGU_TONCONTIN,
        'category' => APPROACH_RED,
        'name' => 'TGU Toncontin',
        'size' => 5,
        'spaces' => [
            5 => [TOKEN_PLANE => 2],
            4 => [TOKEN_PLANE => 1, ALLOWED_AXIS => [-2, -1]],
            3 => [TOKEN_PLANE => 1, DICE_TRAFFIC => 2, ALLOWED_AXIS => [-1, 0]],
            2 => [TOKEN_PLANE => 1, ALLOWED_AXIS => [-2, -1]],
            1 => [DICE_TRAFFIC => 3],
        ]
    ],
    // WAVE 2
    APPROACH_BLACK_KUL_KUALA_LUMPUR => [
        'type' => APPROACH_BLACK_KUL_KUALA_LUMPUR,
        'category' => APPROACH_BLACK,
        'name' => 'KUL Kuala Lumpur',
        'size' => 8,
        'spaces' => [
            8 => [TOKEN_PLANE => 1],
            7 => [TOKEN_PLANE => 1, ALLOWED_AXIS => [1, 2]],
            6 => [TOKEN_PLANE => 1, ALLOWED_AXIS => [0, 1], DICE_TRAFFIC => 1],
            5 => [TOKEN_PLANE => 1, ALLOWED_AXIS => [-1, 0]],
            4 => [ALLOWED_AXIS => [-2]],
            3 => [TOKEN_PLANE => 1, DICE_TRAFFIC => 1],
            2 => [ALLOWED_AXIS => [0, 1]],
            1 => [DICE_TRAFFIC => 3],
        ],
    ],
    APPROACH_YELLOW_TGU_TONCONTIN => [
        'type' => APPROACH_YELLOW_TGU_TONCONTIN,
        'category' => APPROACH_YELLOW,
        'name' => 'TGU Toncontin',
        'size' => 5,
        'spaces' => [
            5 => [TOKEN_PLANE => 1],
            4 => [TOKEN_PLANE => 1, ALLOWED_AXIS => [-2, -1]],
            3 => [TOKEN_PLANE => 1, ALLOWED_AXIS => [-1, 0]],
            2 => [TOKEN_PLANE => 1, ALLOWED_AXIS => [-2, -1]],
            1 => [DICE_TRAFFIC => 3],
        ]
    ],
    APPROACH_RED_HND_HANEDA => [
        'type' => APPROACH_RED_HND_HANEDA,
        'category' => APPROACH_RED,
        'name' => 'HND Haneda',
        'size' => 8,
        'spaces' => [
            8 => [TOKEN_PLANE => 1],
            7 => [TOKEN_PLANE => 1, ALLOWED_AXIS => [-2, -1]],
            6 => [TOKEN_PLANE => 2, DICE_TRAFFIC => 1],
            5 => [TOKEN_PLANE => 1, ALLOWED_AXIS => [-1, 0], DICE_TRAFFIC => 1],
            4 => [TOKEN_PLANE => 1, ALLOWED_AXIS => [-2, -1], DICE_TRAFFIC => 1],
            3 => [TOKEN_PLANE => 1],
            2 => [ALLOWED_AXIS => [-1, 0]],
            1 => [TOKEN_PLANE => 1, DICE_TRAFFIC => 3],
        ]
    ],
    APPROACH_BLACK_LGA_LAGUARDIA => [
        'type' => APPROACH_BLACK_LGA_LAGUARDIA,
        'category' => APPROACH_BLACK,
        'name' => 'LGA LaGuardia',
        'size' => 7,
        'spaces' => [
            7 => [],
            6 => [TOKEN_PLANE => 1],
            5 => [TOKEN_PLANE => 1, ALLOWED_AXIS => [-2, -1], DICE_TRAFFIC => 1],
            4 => [],
            3 => [ALLOWED_AXIS => [1, 2], DICE_TRAFFIC => 1],
            2 => [],
            1 => [ALLOWED_AXIS => [0, 1, 2]],
        ]
    ],
    APPROACH_YELLOW_LGA_LAGUARDIA => [
        'type' => APPROACH_YELLOW_LGA_LAGUARDIA,
        'category' => APPROACH_YELLOW,
        'name' => 'LGA LaGuardia',
        'size' => 7,
        'spaces' => [
            7 => [TOKEN_PLANE => 1],
            6 => [TOKEN_PLANE => 1],
            5 => [TOKEN_PLANE => 2, DICE_TRAFFIC => 1],
            4 => [TOKEN_PLANE => 1, ALLOWED_AXIS => [-2, -1, 0]],
            3 => [DICE_TRAFFIC => 1],
            2 => [ALLOWED_AXIS => [0, 1, 2]],
            1 => [DICE_TRAFFIC => 1],
        ]
    ],
    APPROACH_BLACK_DUS_DUSSELDORF => [
        'type' => APPROACH_BLACK_DUS_DUSSELDORF,
        'category' => APPROACH_BLACK,
        'name' => 'DUS Düsseldorf',
        'size' => 8,
        'spaces' => [
            8 => [TOKEN_PLANE => 2],
            7 => [TOKEN_PLANE => 3],
            6 => [DICE_TRAFFIC => 1, TOKEN_PLANE => 1, ALLOWED_AXIS => [1, 2]],
            5 => [TOKEN_PLANE => 2],
            4 => [TOKEN_PLANE => 1, ALLOWED_AXIS => [-2, -1], DICE_TRAFFIC => 2],
            3 => [DICE_TRAFFIC => 1],
            2 => [ALLOWED_AXIS => [0]],
            1 => [TOKEN_PLANE => 1, DICE_TRAFFIC => 2],
        ]
    ],
    APPROACH_YELLOW_DUS_DUSSELDORF => [
        'type' => APPROACH_YELLOW_DUS_DUSSELDORF,
        'category' => APPROACH_YELLOW,
        'name' => 'DUS Düsseldorf',
        'size' => 8,
        'spaces' => [
            8 => [TOKEN_PLANE => 1],
            7 => [TOKEN_PLANE => 1],
            6 => [TOKEN_PLANE => 2, ALLOWED_AXIS => [-1, 0, 1], DICE_TRAFFIC => 2],
            5 => [TOKEN_PLANE => 1],
            4 => [TOKEN_PLANE => 2, ALLOWED_AXIS => [-1, 0, 1]],
            3 => [TOKEN_PLANE => 1],
            2 => [TOKEN_PLANE => 1],
            1 => [DICE_TRAFFIC => 3],
        ]
    ],
    APPROACH_RED_CDG_PARIS => [
        'type' => APPROACH_RED_CDG_PARIS,
        'category' => APPROACH_RED,
        'name' => 'CDG Paris-Charles de Gaulle',
        'size' => 8,
        'spaces' => [
            8 => [TOKEN_PLANE => 1],
            7 => [TOKEN_PLANE => 2],
            6 => [TOKEN_PLANE => 1, ALLOWED_AXIS => [1, 2], DICE_TRAFFIC => 1],
            5 => [TOKEN_PLANE => 1],
            4 => [DICE_TRAFFIC => 1, ALLOWED_AXIS => [-2, -1]],
            3 => [],
            2 => [],
            1 => [TOKEN_PLANE => 1, DICE_TRAFFIC => 2],
        ]
    ],
    APPROACH_YELLOW_CDG_PARIS => [
        'type' => APPROACH_YELLOW_CDG_PARIS,
        'category' => APPROACH_YELLOW,
        'name' => 'CDG Paris-Charles de Gaulle',
        'size' => 8,
        'spaces' => [
            8 => [TOKEN_PLANE => 2],
            7 => [TOKEN_PLANE => 1],
            6 => [TOKEN_PLANE => 2, DICE_TRAFFIC => 1],
            5 => [TOKEN_PLANE => 2, DICE_TRAFFIC => 1],
            4 => [DICE_TRAFFIC => 1],
            3 => [],
            2 => [TOKEN_PLANE => 1],
            1 => [DICE_TRAFFIC => 3],
        ]
    ],
    APPROACH_YELLOW_TER_LAJES => [
        'type' => APPROACH_YELLOW_TER_LAJES,
        'category' => APPROACH_YELLOW,
        'name' => 'TER Lajes, Açores',
        'size' => 7,
        'spaces' => [
            7 => [TOKEN_PLANE => 1],
            6 => [TOKEN_PLANE => 1, ALLOWED_AXIS => [1, 2]],
            5 => [TOKEN_PLANE => 1, ALLOWED_AXIS => [-2, -1]],
            4 => [ALLOWED_AXIS => [1, 2]],
            3 => [ALLOWED_AXIS => [-2, -1]],
            2 => [ALLOWED_AXIS => [0, 1, 2]],
            1 => [DICE_TRAFFIC => 3, ALLOWED_AXIS => [-2, -1]],
        ]
    ],
    APPROACH_BLACK_TER_LAJES => [
        'type' => APPROACH_BLACK_TER_LAJES,
        'category' => APPROACH_BLACK,
        'name' => 'TER Lajes, Açores',
        'size' => 7,
        'spaces' => [
            7 => [TOKEN_PLANE => 1],
            6 => [TOKEN_PLANE => 1, ALLOWED_AXIS => [1, 2]],
            5 => [TOKEN_PLANE => 1, ALLOWED_AXIS => [-2, -1]],
            4 => [TOKEN_PLANE => 1, ALLOWED_AXIS => [1, 2]],
            3 => [ALLOWED_AXIS => [-2, -1]],
            2 => [ALLOWED_AXIS => [1, 2]],
            1 => [DICE_TRAFFIC => 3, ALLOWED_AXIS => [-2, -1]],
        ]
    ],
    // WAVE 3
    APPROACH_BLACK_NZIR => [
        'type' => APPROACH_BLACK_NZIR,
        'category' => APPROACH_BLACK,
        'name' => 'NZIR Ice Runway',
        'size' => 8,
        'spaces' => [
            8 => [],
            7 => [ALLOWED_AXIS => [-1, 0]],
            6 => [],
            5 => [ALLOWED_AXIS => [1, 2]],
            4 => [],
            3 => [ALLOWED_AXIS => [-1, 0]],
            2 => [TOKEN_PLANE => 1],
            1 => [DICE_TRAFFIC => 2],
        ]
    ],
    APPROACH_RED_NZIR => [
        'type' => APPROACH_RED_NZIR,
        'category' => APPROACH_RED,
        'name' => 'NZIR Ice Runway',
        'size' => 8,
        'spaces' => [
            8 => [],
            7 => [],
            6 => [TOKEN_PLANE => 1],
            5 => [TOKEN_PLANE => 1, ALLOWED_AXIS => [0, 1]],
            4 => [TOKEN_PLANE => 1],
            3 => [],
            2 => [ALLOWED_AXIS => [-2, -1]],
            1 => [DICE_TRAFFIC => 3],
        ]
    ],
    APPROACH_YELLOW_BUD_BUDAPEST => [
        'type' => APPROACH_YELLOW_BUD_BUDAPEST,
        'category' => APPROACH_GREEN,
        'name' => 'BUD Budapest Liszt Ferenc',
        'size' => 6,
        'spaces' => [
            6 => [TOKEN_PLANE => 2],
            5 => [TOKEN_PLANE => 1, ALLOWED_AXIS => [-2, -1]],
            4 => [DICE_TRAFFIC => 1, TOKEN_PLANE => 2],
            3 => [TOKEN_PLANE => 1, ALLOWED_AXIS => [0, 1]],
            2 => [TOKEN_PLANE => 1],
            1 => [DICE_TRAFFIC => 3],
        ]
    ],
    APPROACH_RED_BUD_BUDAPEST => [
        'type' => APPROACH_RED_BUD_BUDAPEST,
        'category' => APPROACH_RED,
        'name' => 'BUD Budapest Liszt Ferenc',
        'size' => 6,
        'spaces' => [
            6 => [TOKEN_PLANE => 1],
            5 => [TOKEN_PLANE => 1, ALLOWED_AXIS => [-2, -1]],
            4 => [DICE_TRAFFIC => 1, TOKEN_PLANE => 1, ALLOWED_AXIS => [1, 2]],
            3 => [DICE_TRAFFIC => 1, TOKEN_PLANE => 1, ALLOWED_AXIS => [0, 1]],
            2 => [TOKEN_PLANE => 1],
            1 => [TOKEN_PLANE => 1, DICE_TRAFFIC => 4],
        ]
    ],
    APPROACH_RED_BLQ_GUGLIELMO_MARCONI => [
        'type' => APPROACH_RED_BLQ_GUGLIELMO_MARCONI,
        'category' => APPROACH_RED,
        'name' => 'BLQ Guglielmo Marconi',
        'size' => 6,
        'spaces' => [
            6 => [TOKEN_PLANE => 2],
            5 => [TOKEN_PLANE => 1],
            4 => [TOKEN_PLANE => 1, ALLOWED_AXIS => [0]],
            3 => [TOKEN_PLANE => 2],
            2 => [TOKEN_PLANE => 1, ALLOWED_AXIS => [0]],
            1 => [TOKEN_PLANE => 1, DICE_TRAFFIC => 3],
        ]
    ],
    APPROACH_GREEN_BLQ_GUGLIELMO_MARCONI => [
        'type' => APPROACH_GREEN_BLQ_GUGLIELMO_MARCONI,
        'category' => APPROACH_GREEN,
        'name' => 'BLQ Guglielmo Marconi',
        'size' => 6,
        'spaces' => [
            6 => [TOKEN_PLANE => 2],
            5 => [TOKEN_PLANE => 2],
            4 => [TOKEN_PLANE => 1, ALLOWED_AXIS => [0, 1]],
            3 => [TOKEN_PLANE => 1, DICE_TRAFFIC => 1],
            2 => [TOKEN_PLANE => 1, ALLOWED_AXIS => [-1, 0]],
            1 => [TOKEN_PLANE => 1, DICE_TRAFFIC => 3],
        ]
    ],
    // WAVE 4
    APPROACH_GREEN_ATL => [
        'type' => APPROACH_GREEN_ATL,
        'category' => APPROACH_GREEN,
        'name' => 'ATL Hartsfield-Jackson',
        'size' => 8,
        'spaces' => [
            8 => [TOKEN_PLANE => 2],
            7 => [TOKEN_PLANE => 1],
            6 => [DICE_TRAFFIC => 1, TOKEN_PLANE => 2],
            5 => [DICE_TRAFFIC => 1, TOKEN_PLANE => 1],
            4 => [],
            3 => [DICE_TRAFFIC => 1],
            2 => [],
            1 => [DICE_TRAFFIC => 4],
        ]
    ],
    APPROACH_YELLOW_ATL => [
        'type' => APPROACH_YELLOW_ATL,
        'category' => APPROACH_YELLOW,
        'name' => 'ATL Hartsfield-Jackson',
        'size' => 8,
        'spaces' => [
            8 => [TOKEN_PLANE => 1],
            7 => [ALLOWED_AXIS => [1, 2], TOKEN_PLANE => 3],
            6 => [TOKEN_PLANE => 1],
            5 => [DICE_TRAFFIC => 1, TOKEN_PLANE => 2],
            4 => [DICE_TRAFFIC => 2, TOKEN_PLANE => 2],
            3 => [ALLOWED_AXIS => [-1, 0, 1]],
            2 => [DICE_TRAFFIC => 1, TOKEN_PLANE => 1],
            1 => [DICE_TRAFFIC => 1],
        ]
    ],
    APPROACH_YELLOW_GIG => [
        'type' => APPROACH_YELLOW_GIG,
        'category' => APPROACH_YELLOW,
        'name' => 'GIG Galeão',
        'size' => 7,
        'spaces' => [
            7 => [TOKEN_PLANE => 1],
            6 => [TOKEN_PLANE => 3],
            5 => [DICE_TRAFFIC => 1, TOKEN_PLANE => 2],
            4 => [DICE_TRAFFIC => 1, TOKEN_PLANE => 1],
            3 => [TOKEN_PLANE => 2],
            2 => [],
            1 => [DICE_TRAFFIC => 2],
        ]
    ],
    APPROACH_RED_GIG => [
        'type' => APPROACH_RED_GIG,
        'category' => APPROACH_RED,
        'name' => 'GIG Galeão',
        'size' => 7,
        'spaces' => [
            7 => [TOKEN_PLANE => 2],
            6 => [TOKEN_PLANE => 1],
            5 => [DICE_TRAFFIC => 1, TOKEN_PLANE => 1],
            4 => [TOKEN_PLANE => 2],
            3 => [DICE_TRAFFIC => 1, TOKEN_PLANE => 2],
            2 => [TOKEN_PLANE => 1],
            1 => [DICE_TRAFFIC => 3],
        ]
    ],
    APPROACH_BLACK_PBH => [
        'type' => APPROACH_BLACK_PBH,
        'category' => APPROACH_BLACK,
        'name' => 'PBH Paro',
        'size' => 6,
        'spaces' => [
            6 => [TOKEN_PLANE => 1],
            5 => [ALLOWED_AXIS => [2], DICE_TRAFFIC => 1, TOKEN_PLANE => 1],
            4 => [ALLOWED_AXIS => [-2, -1], DICE_TRAFFIC => 1, TOKEN_PLANE => 1],
            3 => [ALLOWED_AXIS => [-2, -1], DICE_TRAFFIC => 1, TOKEN_PLANE => 1],
            2 => [],
            1 => [TOKEN_PLANE => 1, DICE_TRAFFIC => 3],
        ]
    ],
    APPROACH_RED_PBH => [
        'type' => APPROACH_RED_PBH,
        'category' => APPROACH_RED,
        'name' => 'PBH Paro',
        'size' => 6,
        'spaces' => [
            6 => [TOKEN_PLANE => 1],
            5 => [ALLOWED_AXIS => [1, 2], TOKEN_PLANE => 1],
            4 => [ALLOWED_AXIS => [-2, -1, 0], DICE_TRAFFIC => 1, TOKEN_PLANE => 1],
            3 => [ALLOWED_AXIS => [-2, -1], TOKEN_PLANE => 1],
            2 => [TOKEN_PLANE => 1],
            1 => [DICE_TRAFFIC => 3],
        ]
    ],
    APPROACH_RED_OSL => [
        'type' => APPROACH_RED_OSL,
        'category' => APPROACH_RED,
        'name' => 'OSL Gardermoen',
        'size' => 8,
        'spaces' => [
            8 => [],
            7 => [DICE_TRAFFIC => 1],
            6 => [TOKEN_PLANE => 1],
            5 => [DICE_TRAFFIC => 1],
            4 => [],
            3 => [TOKEN_PLANE => 1, DICE_TRAFFIC => 1],
            2 => [],
            1 => [TOKEN_PLANE => 1, DICE_TRAFFIC => 3],
        ]
    ],
    APPROACH_GREEN_OSL => [
        'type' => APPROACH_GREEN_OSL,
        'category' => APPROACH_GREEN,
        'name' => 'OSL Gardermoen',
        'size' => 8,
        'spaces' => [
            8 => [],
            7 => [TOKEN_PLANE => 1],
            6 => [TOKEN_PLANE => 1],
            5 => [TOKEN_PLANE => 1],
            4 => [DICE_TRAFFIC => 1],
            3 => [TOKEN_PLANE => 1],
            2 => [],
            1 => [DICE_TRAFFIC => 2],
        ]
    ],
    APPROACH_BLACK_KEF => [
        'type' => APPROACH_BLACK_KEF,
        'category' => APPROACH_BLACK,
        'name' => 'KEF Keflavik',
        'size' => 6,
        'spaces' => [
            6 => [],
            5 => [ALLOWED_AXIS => [-1, 0, 1], TOKEN_PLANE => 1],
            4 => [ALLOWED_AXIS => [0, 1, 2], TOKEN_PLANE => 1],
            3 => [DICE_TRAFFIC => 1, TOKEN_PLANE => 2],
            2 => [ALLOWED_AXIS => [-2, -1, 0]],
            1 => [DICE_TRAFFIC => 2],
        ]
    ],
    APPROACH_YELLOW_KEF => [
        'type' => APPROACH_YELLOW_KEF,
        'category' => APPROACH_YELLOW,
        'name' => 'KEF Keflavik',
        'size' => 6,
        'spaces' => [
            6 => [],
            5 => [DICE_TRAFFIC => 1, TOKEN_PLANE => 1],
            4 => [TOKEN_PLANE => 1],
            3 => [DICE_TRAFFIC => 1, TOKEN_PLANE => 1],
            2 => [],
            1 => [DICE_TRAFFIC => 2],
        ]
    ],
    APPROACH_YELLOW_LHR => [
        'type' => APPROACH_YELLOW_LHR,
        'category' => APPROACH_YELLOW,
        'name' => 'LHR Heathrow',
        'size' => 6,
        'spaces' => [
            6 => [TOKEN_PLANE => 2],
            5 => [DICE_TRAFFIC => 1, TOKEN_PLANE => 1],
            4 => [DICE_TRAFFIC => 1, TOKEN_PLANE => 2],
            3 => [DICE_TRAFFIC => 1, TOKEN_PLANE => 1],
            2 => [TOKEN_PLANE => 1],
            1 => [DICE_TRAFFIC => 2, TOKEN_PLANE => 1],
        ]
    ],
    APPROACH_GREEN_LHR => [
        'type' => APPROACH_GREEN_LHR,
        'category' => APPROACH_GREEN,
        'name' => 'LHR Heathrow',
        'size' => 6,
        'spaces' => [
            6 => [TOKEN_PLANE => 2],
            5 => [DICE_TRAFFIC => 1, TOKEN_PLANE => 2],
            4 => [TOKEN_PLANE => 2],
            3 => [DICE_TRAFFIC => 1, TOKEN_PLANE => 1],
            2 => [TOKEN_PLANE => 1],
            1 => [DICE_TRAFFIC => 1],
        ]
    ],
    APPROACH_YELLOW_PRG => [
        'type' => APPROACH_YELLOW_PRG,
        'category' => APPROACH_YELLOW,
        'name' => 'PRG Václav Havel',
        'size' => 8,
        'spaces' => [
            8 => [TOKEN_PLANE => 3],
            7 => [TOKEN_PLANE => 2],
            6 => [DICE_TRAFFIC => 1, TOKEN_PLANE => 3],
            5 => [],
            4 => [DICE_TRAFFIC => 1, TOKEN_PLANE => 3],
            3 => [TOKEN_PLANE => 1],
            2 => [],
            1 => [],
        ]
    ],
    APPROACH_GREEN_PRG => [
        'type' => APPROACH_GREEN_PRG,
        'category' => APPROACH_GREEN,
        'name' => 'PRG Václav Havel',
        'size' => 8,
        'spaces' => [
            8 => [TOKEN_PLANE => 1],
            7 => [TOKEN_PLANE => 1],
            6 => [DICE_TRAFFIC => 1, TOKEN_PLANE => 1],
            5 => [],
            4 => [ALLOWED_AXIS => [1, 2], TOKEN_PLANE => 1],
            3 => [DICE_TRAFFIC => 1, TOKEN_PLANE => 1],
            2 => [ALLOWED_AXIS => [-1, 0]],
            1 => [DICE_TRAFFIC => 1],
        ]
    ],
];

$this->SCENARIOS = [
    APPROACH_GREEN_YUL_MONTREAL => [
        'approach' => APPROACH_GREEN_YUL_MONTREAL,
        'altitude' => ALTITUDE_GREEN_YELLOW,
        'modules' => []
    ],
    APPROACH_GREEN_HND_HANEDA => [
        'approach' => APPROACH_GREEN_HND_HANEDA,
        'altitude' => ALTITUDE_GREEN_YELLOW,
        'modules' => [MODULE_TRAFFIC, MODULE_TURNS]
    ],
    APPROACH_YELLOW_KUL_KUALA_LUMPUR => [
        'approach' => APPROACH_YELLOW_KUL_KUALA_LUMPUR,
        'altitude' => ALTITUDE_GREEN_YELLOW,
        'modules' => [MODULE_TRAFFIC, MODULE_TURNS, MODULE_KEROSENE, MODULE_SPECIAL_ABILITIES],
        'nrOfSpecialAbilities' => 1
    ],
    APPROACH_RED_TGU_TONCONTIN => [
        'approach' => APPROACH_RED_TGU_TONCONTIN,
        'altitude' => ALTITUDE_RED_BLACK,
        'modules' => [MODULE_TRAFFIC, MODULE_TURNS, MODULE_KEROSENE, MODULE_WINDS, MODULE_SPECIAL_ABILITIES],
        'nrOfSpecialAbilities' => 2
    ],
    // WAVE 2
    APPROACH_BLACK_KUL_KUALA_LUMPUR => [
        'approach' => APPROACH_BLACK_KUL_KUALA_LUMPUR,
        'altitude' => ALTITUDE_RED_BLACK,
        'modules' => [MODULE_TRAFFIC, MODULE_TURNS, MODULE_KEROSENE, MODULE_REAL_TIME, MODULE_SPECIAL_ABILITIES],
        'nrOfSpecialAbilities' => 2
    ],
    APPROACH_YELLOW_TGU_TONCONTIN => [
        'approach' => APPROACH_YELLOW_TGU_TONCONTIN,
        'altitude' => ALTITUDE_GREEN_YELLOW,
        'modules' => [MODULE_TRAFFIC, MODULE_TURNS, MODULE_KEROSENE, MODULE_SPECIAL_ABILITIES],
        'nrOfSpecialAbilities' => 2
    ],
    APPROACH_RED_HND_HANEDA => [
        'approach' => APPROACH_RED_HND_HANEDA,
        'altitude' => ALTITUDE_RED_BLACK,
        'modules' => [MODULE_TRAFFIC, MODULE_TURNS, MODULE_KEROSENE, MODULE_INTERN, MODULE_SPECIAL_ABILITIES],
        'nrOfSpecialAbilities' => 1
    ],
    APPROACH_BLACK_LGA_LAGUARDIA => [
        'approach' => APPROACH_BLACK_LGA_LAGUARDIA,
        'altitude' => ALTITUDE_RED_BLACK,
        'modules' => [MODULE_TRAFFIC, MODULE_TURNS, MODULE_KEROSENE, MODULE_ICE_BRAKES, MODULE_SPECIAL_ABILITIES],
        'nrOfSpecialAbilities' => 1
    ],
    APPROACH_YELLOW_LGA_LAGUARDIA => [
        'approach' => APPROACH_YELLOW_LGA_LAGUARDIA,
        'altitude' => ALTITUDE_GREEN_YELLOW,
        'modules' => [MODULE_TRAFFIC, MODULE_TURNS, MODULE_ICE_BRAKES, MODULE_SPECIAL_ABILITIES],
        'nrOfSpecialAbilities' => 2
    ],
    APPROACH_BLACK_DUS_DUSSELDORF => [
        'approach' => APPROACH_BLACK_DUS_DUSSELDORF,
        'altitude' => ALTITUDE_RED_BLACK,
        'modules' => [MODULE_TRAFFIC, MODULE_TURNS, MODULE_KEROSENE_LEAK, MODULE_REAL_TIME, MODULE_SPECIAL_ABILITIES],
        'nrOfSpecialAbilities' => 1
    ],
    APPROACH_YELLOW_DUS_DUSSELDORF => [
        'approach' => APPROACH_YELLOW_DUS_DUSSELDORF,
        'altitude' => ALTITUDE_GREEN_YELLOW,
        'modules' => [MODULE_TRAFFIC, MODULE_TURNS, MODULE_KEROSENE_LEAK, MODULE_SPECIAL_ABILITIES],
        'nrOfSpecialAbilities' => 2
    ],
    APPROACH_RED_CDG_PARIS => [
        'approach' => APPROACH_RED_CDG_PARIS,
        'altitude' => ALTITUDE_RED_BLACK,
        'modules' => [MODULE_TRAFFIC, MODULE_TURNS, MODULE_KEROSENE, MODULE_WINDS, MODULE_INTERN],
    ],
    APPROACH_YELLOW_CDG_PARIS => [
        'approach' => APPROACH_YELLOW_CDG_PARIS,
        'altitude' => ALTITUDE_GREEN_YELLOW,
        'modules' => [MODULE_TRAFFIC, MODULE_WINDS, MODULE_INTERN],
    ],
    APPROACH_YELLOW_TER_LAJES => [
        'approach' => APPROACH_YELLOW_TER_LAJES,
        'altitude' => ALTITUDE_GREEN_YELLOW,
        'modules' => [MODULE_TRAFFIC, MODULE_TURNS, MODULE_ICE_BRAKES, MODULE_ENGINE_LOSS, MODULE_SPECIAL_ABILITIES],
        'nrOfSpecialAbilities' => 2
    ],
    APPROACH_BLACK_TER_LAJES => [
        'approach' => APPROACH_BLACK_TER_LAJES,
        'altitude' => ALTITUDE_RED_BLACK,
        'modules' => [MODULE_TRAFFIC, MODULE_TURNS, MODULE_ICE_BRAKES, MODULE_ENGINE_LOSS, MODULE_SPECIAL_ABILITIES],
        'nrOfSpecialAbilities' => 1
    ],
    // WAVE 3
    APPROACH_BLACK_NZIR => [
        'approach' => APPROACH_BLACK_NZIR,
        'altitude' => ALTITUDE_RED_BLACK,
        'modules' => [MODULE_TRAFFIC, MODULE_TURNS, MODULE_ICE_BRAKES, MODULE_KEROSENE, MODULE_INTERN, MODULE_WINDS_HEADON],
    ],
    APPROACH_RED_NZIR => [
        'approach' => APPROACH_RED_NZIR,
        'altitude' => ALTITUDE_RED_BLACK,
        'modules' => [MODULE_TRAFFIC, MODULE_TURNS, MODULE_ICE_BRAKES, MODULE_WINDS_HEADON, MODULE_SPECIAL_ABILITIES],
        'nrOfSpecialAbilities' => 1
    ],
    APPROACH_YELLOW_BUD_BUDAPEST => [
        'approach' => APPROACH_YELLOW_BUD_BUDAPEST,
        'altitude' => ALTITUDE_GREEN_YELLOW,
        'modules' => [MODULE_TRAFFIC, MODULE_TURNS, MODULE_WINDS],
    ],
    APPROACH_RED_BUD_BUDAPEST => [
        'approach' => APPROACH_RED_BUD_BUDAPEST,
        'altitude' => ALTITUDE_RED_BLACK,
        'modules' => [MODULE_TRAFFIC, MODULE_TURNS, MODULE_WINDS, MODULE_SPECIAL_ABILITIES, MODULE_MODIFIED_ALTITUDE],
        'nrOfSpecialAbilities' => 2,
        'modifiedAltitude' => 2
    ],
    APPROACH_RED_BLQ_GUGLIELMO_MARCONI => [
        'approach' => APPROACH_RED_BLQ_GUGLIELMO_MARCONI,
        'altitude' => ALTITUDE_RED_BLACK,
        'modules' => [MODULE_TRAFFIC, MODULE_TURNS, MODULE_KEROSENE, MODULE_SPECIAL_ABILITIES],
        'nrOfSpecialAbilities' => 1,
    ],
    APPROACH_GREEN_BLQ_GUGLIELMO_MARCONI => [
        'approach' => APPROACH_GREEN_BLQ_GUGLIELMO_MARCONI,
        'altitude' => ALTITUDE_GREEN_YELLOW,
        'modules' => [MODULE_TRAFFIC, MODULE_TURNS, MODULE_KEROSENE_LEAK],
    ],
    // WAVE 4
    APPROACH_GREEN_ATL => [
        'approach' => APPROACH_GREEN_ATL,
        'altitude' => ALTITUDE_GREEN_YELLOW,
        'modules' => [MODULE_TRAFFIC, MODULE_INTERN],
    ],
    APPROACH_YELLOW_ATL => [
        'approach' => APPROACH_YELLOW_ATL,
        'altitude' => ALTITUDE_GREEN_YELLOW,
        'modules' => [MODULE_TRAFFIC, MODULE_TURNS, MODULE_KEROSENE_LEAK, MODULE_SPECIAL_ABILITIES],
        'nrOfSpecialAbilities' => 1,
    ],
    APPROACH_YELLOW_GIG => [
        'approach' => APPROACH_YELLOW_GIG,
        'altitude' => ALTITUDE_GREEN_YELLOW,
        'modules' => [MODULE_TRAFFIC, MODULE_WINDS, MODULE_SPECIAL_ABILITIES],
        'nrOfSpecialAbilities' => 1,
    ],
    APPROACH_RED_GIG => [
        'approach' => APPROACH_RED_GIG,
        'altitude' => ALTITUDE_RED_BLACK,
        'modules' => [MODULE_TRAFFIC, MODULE_WINDS, MODULE_KEROSENE_LEAK, MODULE_SPECIAL_ABILITIES],
        'nrOfSpecialAbilities' => 2,
    ],
    APPROACH_BLACK_PBH => [
        'approach' => APPROACH_BLACK_PBH,
        'altitude' => ALTITUDE_RED_BLACK,
        'modules' => [MODULE_TRAFFIC, MODULE_TURNS, MODULE_KEROSENE, MODULE_REAL_TIME, MODULE_SPECIAL_ABILITIES],
        'nrOfSpecialAbilities' => 2,
    ],
    APPROACH_RED_PBH => [
        'approach' => APPROACH_RED_PBH,
        'altitude' => ALTITUDE_RED_BLACK,
        'modules' => [MODULE_TRAFFIC, MODULE_TURNS, MODULE_KEROSENE, MODULE_REAL_TIME, MODULE_SPECIAL_ABILITIES],
        'nrOfSpecialAbilities' => 2,
    ],
    APPROACH_RED_OSL => [
        'approach' => APPROACH_RED_OSL,
        'altitude' => ALTITUDE_RED_BLACK,
        'modules' => [MODULE_TRAFFIC, MODULE_KEROSENE_LEAK, MODULE_ICE_BRAKES, MODULE_SPECIAL_ABILITIES],
        'nrOfSpecialAbilities' => 2,
    ],
    APPROACH_GREEN_OSL => [
        'approach' => APPROACH_GREEN_OSL,
        'altitude' => ALTITUDE_GREEN_YELLOW,
        'modules' => [MODULE_TRAFFIC, MODULE_KEROSENE],
    ],
    APPROACH_BLACK_KEF => [
        'approach' => APPROACH_BLACK_KEF,
        'altitude' => ALTITUDE_RED_BLACK,
        'modules' => [MODULE_TRAFFIC, MODULE_TURNS, MODULE_WINDS, MODULE_ICE_BRAKES, MODULE_SPECIAL_ABILITIES],
        'nrOfSpecialAbilities' => 2,
    ],
    APPROACH_YELLOW_KEF => [
        'approach' => APPROACH_YELLOW_KEF,
        'altitude' => ALTITUDE_GREEN_YELLOW,
        'modules' => [MODULE_TRAFFIC, MODULE_ICE_BRAKES, MODULE_SPECIAL_ABILITIES],
        'nrOfSpecialAbilities' => 1,
    ],
    APPROACH_YELLOW_LHR => [
        'approach' => APPROACH_YELLOW_LHR,
        'altitude' => ALTITUDE_GREEN_YELLOW,
        'modules' => [MODULE_TRAFFIC, MODULE_INTERN],
    ],
    APPROACH_GREEN_LHR => [
        'approach' => APPROACH_GREEN_LHR,
        'altitude' => ALTITUDE_GREEN_YELLOW,
        'modules' => [MODULE_TRAFFIC],
    ],
    APPROACH_YELLOW_PRG => [
        'approach' => APPROACH_YELLOW_PRG,
        'altitude' => ALTITUDE_GREEN_YELLOW,
        'modules' => [MODULE_TRAFFIC, MODULE_KEROSENE_LEAK, MODULE_SPECIAL_ABILITIES],
        'nrOfSpecialAbilities' => 2,
    ],
    APPROACH_GREEN_PRG => [
        'approach' => APPROACH_GREEN_PRG,
        'altitude' => ALTITUDE_GREEN_YELLOW,
        'modules' => [MODULE_TRAFFIC, MODULE_TURNS, MODULE_KEROSENE, MODULE_SPECIAL_ABILITIES],
        'nrOfSpecialAbilities' => 2,
    ],
];

$this->ALTITUDE_TRACKS = [
    ALTITUDE_GREEN_YELLOW => [
        'type' => ALTITUDE_GREEN_YELLOW,
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
    ],
    ALTITUDE_RED_BLACK => [
        'type' => ALTITUDE_RED_BLACK,
        'categories' => [APPROACH_RED, APPROACH_BLACK],
        'size' => 7,
        'spaces' => [
            7 => [ALTITUDE_HEIGHT => '0000', ROUND_START_PLAYER => PILOT],
            6 => [ALTITUDE_HEIGHT => '1000', ROUND_START_PLAYER => CO_PILOT],
            5 => [ALTITUDE_HEIGHT => '2000', ROUND_START_PLAYER => PILOT],
            4 => [ALTITUDE_HEIGHT => '3000', ROUND_START_PLAYER => CO_PILOT],
            3 => [ALTITUDE_HEIGHT => '4000', ROUND_START_PLAYER => PILOT],
            2 => [ALTITUDE_HEIGHT => '5000', ROUND_START_PLAYER => CO_PILOT],
            1 => [ALTITUDE_HEIGHT => '6000', ROUND_START_PLAYER => PILOT, TOKEN_REROLL => 1],
        ]
    ]
];

$this->SPECIAL_ABILITIES = [
    ANTICIPATION => ['name' => clienttranslate('Anticipation'), 'description' => clienttranslate('Each round, before placing their 1st die, the First Player may choose to reroll one of their dice.')],
    ADAPTATION => ['name' => clienttranslate('Adaptation'), 'description' => clienttranslate('Once per game, each player can turn one of their unplayed dice to its opposite face.')],
    MASTERY => ['name' => clienttranslate('Mastery'), 'description' => clienttranslate('If you play 2 dice with the same value on the <b>ENGINES</b>, immediately gain <b>a Reroll token</b> (only if a token is available).')],
    SYNCHRONISATION => ['name' => clienttranslate('Synchronisation'), 'description' => clienttranslate('If you have placed at least one die on Landing Gear and one die on Flaps, immediately roll the Traffic die. The Co-Pilot must place it on any empty space on the Control Panel regardless of its colour. Apply the effect of the Traffic die as if it were a normal die. It counts as an extra action for this turn. You can use coffee to change the value, but be aware that the Traffic die has no faces with value 1 or 6.')],
    WORKING_TOGETHER => ['name' => clienttranslate('Working Together'), 'description' => clienttranslate('Once per round, at any time, a player may request to swap the dice values of two unplaced dice. Once the player has chosen a die to swap values for, the other player MUST choose a die as well. The values are then swapped.')],
    CONTROL => ['name' => clienttranslate('Control'), 'description' => clienttranslate('If you play 2 dice of the same value on the <b>AXIS</b>, immediately gain a Coffee token.')],
];


/*

Example:

$this->card_types = array(
    1 => array( "card_name" => ...,
                ...
              )
);

*/




