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
  * skyteam.game.php
  *
  * This is the main file for your game logic.
  *
  * In this PHP file, you are going to defines the rules of the game.
  *
  */

use actions\ActionManager;
use commands\CommandManager;
use managers\objects\AlarmToken;
use managers\objects\SpecialAbilityCard;
use managers\PlayerManager;
use managers\PlaneManager;
use objects\Dice;
use objects\Token;
use traits\ActionTrait;
use traits\ArgsTrait;
use traits\DebugTrait;
use traits\SetupTrait;
use traits\StateTrait;
use traits\UtilsTrait;

require_once( APP_GAMEMODULE_PATH.'module/table/table.game.php' );

require_once('modules/php/Constants.inc.php');

require_once('modules/php/utils/ReflectionUtils.php');

require_once('modules/php/objects/Card.php');
require_once('modules/php/objects/Token.php');
require_once('modules/php/objects/AlarmToken.php');
require_once('modules/php/objects/Plane.php');
require_once('modules/php/objects/PlaneSwitch.php');
require_once('modules/php/objects/Dice.php');
require_once('modules/php/objects/ApproachTrack.php');
require_once('modules/php/objects/AltitudeTrack.php');
require_once('modules/php/objects/Scenario.php');
require_once('modules/php/objects/SpecialAbilityCard.php');

require_once('modules/php/commands/CommandManager.php');
require_once('modules/php/commands/BaseCommand.php');

require_once('modules/php/actions/ActionManager.php');
require_once('modules/php/actions/AdditionalAction.php');

require_once('modules/php/traits/UtilsTrait.php');
require_once('modules/php/traits/ActionTrait.php');
require_once('modules/php/traits/StateTrait.php');
require_once('modules/php/traits/ArgsTrait.php');
require_once('modules/php/traits/DebugTrait.php');
require_once('modules/php/traits/SetupTrait.php');

require_once('modules/php/PlayerManager.php');
require_once('modules/php/PlaneManager.php');
require_once('modules/php/FlightLogManager.php');


class SkyTeam extends Table
{
    use SetupTrait;
    use ActionTrait;
    use StateTrait;
    use ArgsTrait;
    use UtilsTrait;
    use DebugTrait;

    public static $instance = null;

    // CARDS & TOKENS

    // MANAGERS
    public CommandManager $commandManager;
    public PlayerManager $playerManager;
    public ActionManager $actionManager;

    public PlaneManager $planeManager;

    public Deck $dice;
    public Deck $tokens;
    public Deck $specialAbilities;

    function __construct( )
	{
        // Your global variables labels:
        //  Here, you can assign labels to global variables you are using for this game.
        //  You can use any number of global variables with IDs between 10 and 99.
        //  If your game has options (variants), you also have to associate here a label to
        //  the corresponding ID in gameoptions.inc.php.
        // Note: afterwards, you can get/set the global variables with getGameStateValue/setGameStateInitialValue/setGameStateValue
        parent::__construct();

        // EXPERIMENTAL to avoid deadlocks.  This locks the global table early in the game constructor.
        $this->bSelectGlobalsForUpdate = true;

        self::initGameStateLabels( array(
            EXPANSION_OPTION => EXPANSION_OPTION_ID,
            SCENARIO_OPTION => SCENARIO_OPTION_ID,
            SCENARIO_OPTION_EXPANSION => SCENARIO_OPTION_EXPANSION_ID,
            REAL_TIME_SECONDS => REAL_TIME_SECONDS_OPTION_ID,
            PERMANENT_TOTAL_TRUST_OPTION => PERMANENT_TOTAL_TRUST_OPTION_ID
        ));

        self::$instance = $this;

        $this->dice = self::getNew("module.common.deck");
        $this->dice->init('dice');

        $this->tokens = self::getNew("module.common.deck");
        $this->tokens->init('token');

        $this->specialAbilities = self::getNew("module.common.deck");
        $this->specialAbilities->init('special_ability');

        $this->commandManager = new CommandManager();
        $this->playerManager = new PlayerManager();
        $this->actionManager = new ActionManager();
        $this->flightLogManager = new FlightLogManager();

        $this->planeManager = new PlaneManager();
	}

    protected function getGameName( )
    {
		// Used for translations and stuff. Please do not modify.
        return "skyteam";
    }

    /*
        getAllDatas: 
        
        Gather all informations about current game situation (visible by the current player).
        
        The method is called each time the game interface is displayed to a player, ie:
        _ when the game starts
        _ when a player refreshes the game page (F5)
    */
    protected function getAllDatas()
    {
        $result = array();
    
        $current_player_id = self::getCurrentPlayerId();    // !! We must only return informations visible by this player !!
    
        // Get information about players
        // Note: you can retrieve some extra field you added for "player" table in "dbmodel.sql" if you need it.
        $sql = "SELECT player_id id, player_score score, player_color color FROM player ";
        $result['players'] = self::getCollectionFromDb( $sql );

        foreach($result['players'] as $playerId => &$player) {
            $player['role'] = $this->getPlayerRole($playerId);
            if ($current_player_id == $playerId) {
                $player['dice'] =  Dice::fromArray($this->dice->getCardsInLocation(LOCATION_PLAYER, $playerId));
            }
            $player['flightLog'] = $this->flightLogManager->getPlayerFlightLog($playerId);
        }

        $result['round'] = $this->getGlobalVariable(CURRENT_ROUND);
        $result['phase'] = $this->getGlobalVariable(CURRENT_PHASE);
        $result['actionSpaces'] = $this->planeManager->getAllActionSpaces();

        $result['approach'] = $this->getApproachTrack();
        $result['altitude'] = $this->getAltitudeTrack();

        $allTokens = Token::fromArray($this->getAllFromTable('token'));
        $result['coffeeTokens'] = array_filter($allTokens, fn($token) => $token->type == TOKEN_COFFEE);
        $result['planeTokens'] = array_filter($allTokens, fn($token) => $token->type == TOKEN_PLANE);
        $result['rerollTokens'] = array_filter($allTokens, fn($token) => $token->type == TOKEN_REROLL);

        $result['plane'] = $this->planeManager->get();

        $result['planeDice'] = Dice::fromArray($this->dice->getCardsInLocation(LOCATION_PLANE));
        $result['internDice'] = Dice::fromArray($this->dice->getCardsInLocation(LOCATION_INTERN));
        $result['trafficDice'] = Dice::fromArray($this->dice->getCardsInLocation(LOCATION_TRAFFIC));

        $result['failureReason'] = $this->getGlobalVariable(FAILURE_REASON);

        $result['finalRound'] = $this->isFinalRound();
        $result['isLanded'] = $this->isLanded();
        $result['victoryConditions'] = $this->planeManager->getVictoryConditionsResults();
        $result['scenario'] = $this->getScenario();

        $result['flightLog'] = $this->flightLogManager->getTeamFlightLog();

        $result['chosenSpecialAbilities'] = SpecialAbilityCard::fromArray($this->specialAbilities->getCardsInLocation(LOCATION_AVAILABLE));
        $result['rolesThatUsedAdaptation'] = [];
        $playersThatUsedAdaptation = $this->getGlobalVariable(PLAYERS_THAT_USED_ADAPTATION);
        if (isset($playersThatUsedAdaptation) && sizeof($playersThatUsedAdaptation) > 0) {
            $result['rolesThatUsedAdaptation'] = array_map(fn($playerId) => $this->getPlayerRole($playerId), $playersThatUsedAdaptation);
        }

        $result['timerNeedsClearing'] = false;
        $result['timerSeconds'] = $this->getRealTimeTimerSeconds();
        if ($this->isModuleActive(MODULE_REAL_TIME)) {
            $realTimeEndTime = $this->getGlobalVariable(REAL_TIME_END_TIME);
            if (isset($realTimeEndTime)) {
                $date = new DateTimeImmutable();
                $realTimeEndTime = intval($realTimeEndTime);
                $secondsRemaining = $realTimeEndTime - $date->getTimestamp();
                if ($secondsRemaining >= 0) {
                    $result['realTimeSecondsRemaining'] = $secondsRemaining;
                } else {
                    $result['timerNeedsClearing'] = true;
                }
            }
        }

        $result['scenarioData'] = $this->SCENARIOS;
        $result['approachTrackData'] = $this->APPROACH_TRACKS;

        $result['alarmTokens'] = AlarmToken::fromArray($this->tokens->getCardsOfTypeInLocation(TOKEN_ALARM, null, LOCATION_ALARM));
        $result['alarmTokenData'] = $this->ALARM_TOKENS;

        return $result;
    }
    /*
           getGameProgression:

           Compute and return the current game progression.
           The number returned must be an integer beween 0 (=the game just started) and
           100 (= the game is finished or almost finished).

           This method is called each time we are in a game state with the "updateGameProgression" property set to true
           (see states.inc.php)
       */
    function getGameProgression()
    {
        $multiplier = intval($this->getGlobalVariable(CURRENT_ROUND)) - 1;
        $result = round($multiplier * (100 / 7));
        return $result;
    }


//////////////////////////////////////////////////////////////////////////////
//////////// Utility functions
////////////

    /*
        In this space, you can put any utility methods useful for your game logic
    */



//////////////////////////////////////////////////////////////////////////////
//////////// Player actions
////////////

    /*
        Each time a player is doing some game action, one of the methods below is called.
        (note: each method below must match an input method in canvas.action.php)
    */

    /*

    Example:

    function playCard( $card_id )
    {
        // Check that this is the player's turn and that it is a "possible action" at this game state (see states.inc.php)
        self::checkAction( 'playCard' );

        $player_id = self::getActivePlayerId();

        // Add your game logic to play a card there
        ...

        // Notify all players about the card played
        self::notifyAllPlayers( "cardPlayed", clienttranslate( '${player_name} plays ${card_name}' ), array(
            'player_id' => $player_id,
            'player_name' => self::getActivePlayerName(),
            'card_name' => $card_name,
            'card_id' => $card_id
        ) );

    }

    */


//////////////////////////////////////////////////////////////////////////////
//////////// Game state arguments
////////////

    /*
        Here, you can create methods defined as "game state arguments" (see "args" property in states.inc.php).
        These methods function is to return some additional information that is specific to the current
        game state.
    */

    /*

    Example for game state "MyGameState":

    function argMyGameState()
    {
        // Get some values from the current game situation in database...

        // return values:
        return array(
            'variable1' => $value1,
            'variable2' => $value2,
            ...
        );
    }
    */

//////////////////////////////////////////////////////////////////////////////
//////////// Game state actions
////////////

    /*
        Here, you can create methods defined as "game state actions" (see "action" property in states.inc.php).
        The action method of state X is called everytime the current game state is set to X.
    */

    /*

    Example for game state "MyGameState":

    function stMyGameState()
    {
        // Do some stuff ...

        // (very often) go to another gamestate
        $this->gamestate->nextState( 'some_gamestate_transition' );
    }
    */

//////////////////////////////////////////////////////////////////////////////
//////////// Zombie
////////////

    /*
        zombieTurn:

        This method is called each time it is the turn of a player who has quit the game (= "zombie" player).
        You can do whatever you want in order to make sure the turn of this player ends appropriately
        (ex: pass).

        Important: your zombie code will be called when the player leaves the game. This action is triggered
        from the main site and propagated to the gameserver from a server, not from a browser.
        As a consequence, there is no current player associated to this action. In your zombieTurn function,
        you must _never_ use getCurrentPlayerId() or getCurrentPlayerName(), otherwise it will fail with a "Not logged" error message.
    */

    function zombieTurn( $state, $active_player )
    {
        $this->gamestate->jumpToState(ST_GAME_END);
    }

///////////////////////////////////////////////////////////////////////////////////:
////////// DB upgrade
//////////

    /*
        upgradeTableDb:

        You don't have to care about this until your game has been published on BGA.
        Once your game is on BGA, this method is called everytime the system detects a game running with your old
        Database scheme.
        In this case, if you change your Database scheme, you just have to apply the needed changes in order to
        update the game database and allow the game to continue to run with your new version.

    */

    function upgradeTableDb( $from_version )
    {
        // $from_version is the current version of this game database, in numerical form.
        // For example, if the game was running with a release of your game named "140430-1345",
        // $from_version is equal to 1404301345

        // Example:
        //        if( $from_version <= 1404301345 )
        //        {
        //            // ! important ! Use DBPREFIX_<table_name> for all tables
        //
        //            $sql = "ALTER TABLE DBPREFIX_xxxxxxx ....";
        //            self::applyDbUpgradeToAllDB( $sql );
        //        }
        //        if( $from_version <= 1405061421 )
        //        {
        //            // ! important ! Use DBPREFIX_<table_name> for all tables
        //
        //            $sql = "CREATE TABLE DBPREFIX_xxxxxxx ....";
        //            self::applyDbUpgradeToAllDB( $sql );
        //        }
        //        // Please add your future database scheme changes here
        //
        //
    }
}
