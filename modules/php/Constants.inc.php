<?php

/**
 * Game Specific Constants
 */
const PILOT = 'pilot';
const CO_PILOT = 'co-pilot';

const PILOT_PLAYER_COLOR = '365ea5';
const CO_PILOT_PLAYER_COLOR = 'fba919';

const DICE_PLAYER = 'player';
const DICE_TRAFFIC = 'traffic';
const DICE_INTERN = 'intern';

const APPROACH_GREEN = 'green';
const APPROACH_YELLOW = 'yellow';
const APPROACH_RED = 'red';
const APPROACH_BLACK = 'black';

const TOKEN_PLANE = 'plane';
const TOKEN_REROLL = 'reroll';
const TOKEN_COFFEE = 'coffee';

const ALLOWED_AXIS = 'allowedAxis';

const ALTITUDE_HEIGHT = 'altitudeHeight';
const ROUND_START_PLAYER = 'startPlayer';

const PHASE_SETUP = 'setup';
const PHASE_STRATEGY = 'strategy';
const PHASE_DICE_PLACEMENT = 'diceplacement';

const ACTION_SPACE_AXIS = 'axis';
const ACTION_SPACE_ENGINES = 'engines';
const ACTION_SPACE_RADIO = 'radio';
const ACTION_SPACE_LANDING_GEAR = 'landing-gear';
const ACTION_SPACE_FLAPS = 'flaps';
const ACTION_SPACE_BRAKES = 'brakes';
const ACTION_SPACE_CONCENTRATION = 'concentration';
const ACTION_SPACE_KEROSENE = 'kerosene';
const ACTION_SPACE_INTERN = 'intern';
const ACTION_SPACE_ICE_BRAKES = 'ice-brakes';

const ALLOWED_ROLES = 'allowedRoles';
const ALLOWED_VALUES = 'allowedValues';
const MANDATORY = 'mandatory';
const REQUIRES_SWITCH_IN = 'requiresSwitchIn';
const MODULE = 'module';
const NOT_MODULE = 'notModule';

/**
 * Failure Reasons
 */
const FAILURE_AXIS = 'failure-axis';
const FAILURE_COLLISION = 'failure-collision';
const FAILURE_OVERSHOOT = 'failure-overshoot';
const FAILURE_TURN = 'failure-turn';
const FAILURE_CRASH_LANDED = 'failure-crash-landed';
const FAILURE_KEROSENE = 'failure-kerosene';
const FAILURE_MANDATORY_SPACE_EMPTY = 'failure-mandatory-empty';

/**
 * Victory Conditions
 */
const VICTORY_A = 'A';
const VICTORY_B = 'B';
const VICTORY_C = 'C';
const VICTORY_D = 'D';
const VICTORY_E = 'E';
const VICTORY_F = 'F';

/**
 * Options
 */

const PREF_SHOW_HELP_ICONS = 100;
const PREF_SHOW_HELP_ICONS_ENABLED_ID = 1;
const PREF_SHOW_HELP_ICONS_DISABLED_ID = 2;

const PREF_SHOW_COMMUNICATION_BANNER = 101;
const PREF_SHOW_COMMUNICATION_BANNER_ALWAYS = 1;
const PREF_SHOW_COMMUNICATION_BANNER_AUTO_HIDE = 2;
const PREF_SHOW_COMMUNICATION_BANNER_HIDE = 3;

const PREF_BACKGROUND = 102;
const PREF_BACKGROUND_BLUE = 1;
const PREF_BACKGROUND_BGA = 2;


const SCENARIO_OPTION_ID = 100;
const SCENARIO_OPTION = 'scenario';

const REAL_TIME_SECONDS_OPTION_ID = 101;
const REAL_TIME_SECONDS = 'real-time-seconds';

const REAL_TIME_60_SECONDS = 60;
const REAL_TIME_70_SECONDS = 70;
const REAL_TIME_80_SECONDS = 80;

/**
 * Modules
 */
const MODULE_TRAFFIC = 'traffic';
const MODULE_TURNS = 'turns';
const MODULE_KEROSENE = 'kerosene';
const MODULE_WINDS = 'winds';
const MODULE_SPECIAL_ABILITIES = 'special-abilities';
const MODULE_INTERN = 'intern';
const MODULE_KEROSENE_LEAK = 'kerosene-leak';
const MODULE_REAL_TIME = 'real-time';
const MODULE_ICE_BRAKES = 'ice-brakes';
const MODULE_ENGINE_LOSS = 'engine-loss';
const MODULE_WINDS_HEADON = 'winds-headon';
const MODULE_MODIFIED_ALTITUDE = 'modified-altitude';

/**
 * State
 */
const ST_GAME_SETUP = 1;

const ST_PLAYER_SETUP = 5;

const ST_START_ROUND = 10;

const ST_STRATEGY = 20;

const ST_DICE_PLACEMENT_START = 30;
const ST_DICE_PLACEMENT_SELECT = 35;
const ST_DICE_PLACEMENT_PLACE = 36;
const ST_DICE_PLACEMENT_NEXT = 39;

const ST_END_OF_ROUND = 60;

const ST_REROLL_DICE = 70;
const ST_FLIP_DIE = 71;
const ST_SWAP_DICE = 72;
const ST_SYNCHRONISATION = 73;
const ST_SYNCHRONISATION_START = 74;
const ST_SYNCHRONISATION_END = 75;
const ST_REROLL_DICE_END = 76;

const ST_PLACE_INTERN = 77;

const ST_PLANE_FAILURE = 80;
const ST_PLANE_LANDED = 85;

const ST_GAME_END = 99;

/**
 * Actions
 */
const ACT_CONFIRM_PLAYER_SETUP = 'confirmPlayerSetup';
const ACT_READY = 'ready';
const ACT_DICE_PLACEMENT = 'dicePlacement';
const ACT_START_REROLL = 'startReroll';
const ACT_START_FLIP = 'startFlip';
const ACT_START_SWAP = 'startSwap';
const ACT_REROLL = 'reroll';
const ACT_FLIP = 'flip';
const ACT_SWAP = 'swap';
const ACT_SYNCHRONISATION = 'synchronisation';
const ACT_PLACE_INTERN = 'placeIntern';
const ACT_SKIP_INTERN = 'skipIntern';

const ACT_UNDO = 'undo';

/**
 * Locations
 */
const LOCATION_DECK = 'deck';
const LOCATION_RESERVE = 'reserve';
const LOCATION_APPROACH = 'approach';
const LOCATION_ALTITUDE = 'altitude';
const LOCATION_AVAILABLE = 'available';
const LOCATION_PLAYER = 'player';
const LOCATION_PLANE = 'plane';
const LOCATION_TRAFFIC = 'traffic';
const LOCATION_INTERN = 'intern';


/**
 * Global variables
 */
const CURRENT_ROUND = 'CURRENT_ROUND';
const CURRENT_PHASE = 'CURRENT_PHASE';
const ADDITIONAL_ACTIONS_ = 'ADDITIONAL_ACTIONS_';
const FAILURE_REASON = 'FAILURE_REASON';
const ACTIVE_PLAYER_AFTER_REROLL = 'ACTIVE_PLAYER_AFTER_REROLL';
const ACTIVE_STATE_AFTER_REROLL = 'ACTIVE_STATE_AFTER_REROLL';
const ACTIVE_PLAYER_AFTER_SWAP = 'ACTIVE_PLAYER_AFTER_SWAP';
const ACTIVE_PLAYER_AFTER_SYNCHRONISATION = 'ACTIVE_PLAYER_AFTER_SYNCHRONISATION';
const FINAL_ROUND = 'FINAL_ROUND';
const PLANE_LANDED = 'PLANE_LANDED';
const REROLL_DICE_AMOUNT = 'REROLL_DICE_AMOUNT';
const PLAYERS_THAT_USED_ADAPTATION = 'PLAYERS_THAT_USED_ADAPTATION';
const WORKING_TOGETHER_ACTIVATED = 'WORKING_TOGETHER_ACTIVATED';
const SWAP_DICE_FIRST_DIE = 'SWAP_DICE_FIRST_DIE';
const SYNCHRONISATION_ACTIVATED = 'SYNCHRONISATION_ACTIVATED';
const SYNCHRONISATION_DIE_ID = 'SYNCHRONISATION_DIE_ID';
const KEROSENE_ACTIVATED = 'KEROSENE_ACTIVATED';
const REAL_TIME_END_TIME = 'REAL_TIME_END_TIME';
const INTERN_TRIGGERED_THROUGH_TRAFFIC = 'INTERN_TRIGGERED_THROUGH_TRAFFIC';
const FORCE_NEXT_PLAYER = 'FORCE_NEXT_PLAYER';
/**
 * Approaches
 */
const APPROACH_GREEN_YUL_MONTREAL = 1;
const APPROACH_GREEN_HND_HANEDA = 2;
const APPROACH_YELLOW_KUL_KUALA_LUMPUR = 3;
const APPROACH_RED_TGU_TONCONTIN = 4;
// WAVE 2
const APPROACH_BLACK_KUL_KUALA_LUMPUR = 5;
const APPROACH_YELLOW_TGU_TONCONTIN = 6;
const APPROACH_RED_HND_HANEDA = 7;
const APPROACH_BLACK_LGA_LAGUARDIA = 8;
const APPROACH_YELLOW_LGA_LAGUARDIA = 9;
const APPROACH_BLACK_DUS_DUSSELDORF = 10;
const APPROACH_YELLOW_DUS_DUSSELDORF = 11;
const APPROACH_RED_CDG_PARIS = 12;
const APPROACH_YELLOW_CDG_PARIS = 13;
const APPROACH_YELLOW_TER_LAJES = 14;
const APPROACH_BLACK_TER_LAJES = 15;
// WAVE 3
const APPROACH_BLACK_NZIR = 16;
const APPROACH_RED_NZIR = 17;
const APPROACH_YELLOW_BUD_BUDAPEST = 18;
const APPROACH_RED_BUD_BUDAPEST = 19;
const APPROACH_RED_BLQ_GUGLIELMO_MARCONI = 20;
const APPROACH_GREEN_BLQ_GUGLIELMO_MARCONI = 21;
// WAVE 4
const APPROACH_GREEN_ATL = 22;
const APPROACH_YELLOW_ATL = 23;
const APPROACH_YELLOW_GIG = 24;
const APPROACH_RED_GIG = 25;
const APPROACH_BLACK_PBH = 26;
const APPROACH_RED_PBH = 27;
const APPROACH_RED_OSL = 28;
const APPROACH_GREEN_OSL = 29;
const APPROACH_BLACK_KEF = 30;
const APPROACH_YELLOW_KEF = 31;
const APPROACH_YELLOW_LHR = 32;
const APPROACH_GREEN_LHR = 33;
const APPROACH_YELLOW_PRG = 34;
const APPROACH_GREEN_PRG = 35;

/**
 * Altitude
 */
const ALTITUDE_GREEN_YELLOW = 1;
const ALTITUDE_RED_BLACK = 2;

/**
 * Special Abilities
 */
const ANTICIPATION = 1;
const ADAPTATION = 2;
const MASTERY = 3;
const SYNCHRONISATION = 4;
const WORKING_TOGETHER = 5;
const CONTROL = 6;



/**
 * Additional Actions
 */

/**
 * Stats
 */
