<?php

/**
 * Game Specific Constants
 */
const PILOT = 'pilot';
const CO_PILOT = 'co-pilot';

const PILOT_PLAYER_COLOR = '365ea5';
const CO_PILOT_PLAYER_COLOR = 'fba919';

const DICE_PLAYER = 'player';
const DICE_WEATHER = 'weather';

const APPROACH_GREEN = 'green';
const APPROACH_YELLOW = 'yellow';
const APPROACH_RED = 'red';
const APPROACH_BLACK = 'black';

const TOKEN_PLANE = 'plane';
const TOKEN_REROLL = 'reroll';
const TOKEN_COFFEE = 'coffee';

const ROUND_START_PLAYER = 'startPlayer';

const PHASE_SETUP = 'setup';
const PHASE_STRATEGY = 'strategy';
const PHASE_DICE_PLACEMENT = 'diceplacement';

const ACTION_SPACE_AXIS = 'axis';

const ALLOWED_ROLES = 'allowedRoles';
const MANDATORY = 'mandatory';

/**
 * Failure Reasons
 */
const FAILURE_AXIS = 'failure-axis';

/**
 * Options
 */


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

const ST_PLANE_FAILURE = 80;

const ST_GAME_END = 99;

/**
 * Actions
 */
const ACT_CONFIRM_PLAYER_SETUP = 'confirmPlayerSetup';
const ACT_READY = 'ready';
const ACT_DICE_PLACEMENT_SELECT = 'dicePlacementSelect';
const ACT_DICE_PLACEMENT_PLACE = 'dicePlacementPlace';
const ACT_DICE_PLACEMENT_NEXT = 'dicePlacementNext';


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


/**
 * Global variables
 */
const CURRENT_ROUND = 'CURRENT_ROUND';
const CURRENT_PHASE = 'CURRENT_PHASE';
const ADDITIONAL_ACTIONS_ = 'ADDITIONAL_ACTIONS_';
const FAILURE_REASON = 'FAILURE_REASON';


/**
 * Additional Actions
 */

/**
 * Stats
 */
