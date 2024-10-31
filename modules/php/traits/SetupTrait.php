<?php

namespace traits;
use objects\Dice;
use objects\Plane;

trait SetupTrait
{

    //////////////////////////////////////////////////////////////////////////////
    //////////// Setup
    //////////////////////////////////////////////////////////////////////////////

    /*
        setupNewGame:

        This method is called only once, when a new game is launched.
        In this method, you must setup the game according to the game rules, so that
        the game is ready to be played.
    */
    protected function setupNewGame( $players, $options = array() )
    {
        // Set the colors of the players with HTML color code
        // The default below is red/green/blue/orange/brown
        // The number of colors defined here must correspond to the maximum number of players allowed for the gams
        $gameinfos = self::getGameinfos();
        $default_colors = $gameinfos['player_colors'];

        // Create players
        // Note: if you added some extra field on "player" table in the database (dbmodel.sql), you can initialize it there.
        $sql = "INSERT INTO player (player_id, player_color, player_canal, player_name, player_avatar, player_score) VALUES ";
        $extraSql = "INSERT INTO extra_player (player_id) VALUES ";
        $values = [];
        $extraValues = [];
        foreach( $players as $player_id => $player )
        {
            $color = array_shift( $default_colors );
            $values[] = "('".$player_id."','$color','".$player['player_canal']."','".addslashes( $player['player_name'] )."','".addslashes( $player['player_avatar'] )."', 0)";
            $extraValues[] = "('".$player_id."')";
        }
        $sql .= implode( ',', $values );
        $extraSql .= implode( ',', $extraValues );
        self::DbQuery( $extraSql );
        self::DbQuery( $sql );
        self::reloadPlayersBasicInfos();

        $this->setGlobalVariable(CURRENT_ROUND, 0);
        $this->setGlobalVariable(CURRENT_PHASE, PHASE_SETUP);
        $this->setGlobalVariable(PLAYERS_THAT_USED_ADAPTATION, []);

        $this->setInitialPlaneParameters();
        $this->createDice();
        $this->createTokens();
        $this->createSpecialAbilities();

        $this->activeNextPlayer();

        $this->flightLogManager->setUp();
    }

    private function setInitialPlaneParameters()
    {
        $this->planeManager->save(new Plane(0, 4, 8, 0, 1, $this->getStartingAltitude(), 20, 10));
        $query = 'INSERT INTO plane_switch (id, value) VALUES ';
        $queryValues = [];
        foreach ($this->PLANE_SWITCHES as $i => $planeSwitch) {
            $queryValues[] = "('$planeSwitch', 0)";
        }
        $query .= implode(',', $queryValues);
        self::DbQuery( $query );
    }

    private function createDice()
    {
        $dice = [];
        $dice[] = ['type' => DICE_PLAYER, 'type_arg' => PILOT, 'nbr' => 4];
        $dice[] = ['type' => DICE_PLAYER, 'type_arg' => CO_PILOT, 'nbr' => 4];
        $dice[] = ['type' => DICE_TRAFFIC, 'type_arg' => DICE_TRAFFIC, 'nbr' => 20];
        $dice[] = ['type' => DICE_INTERN, 'type_arg' => DICE_INTERN, 'nbr' => 6];

        $this->dice->createCards($dice, LOCATION_DECK);

        $internDice = Dice::fromArray($this->dice->getCardsOfTypeInLocation(DICE_INTERN, DICE_INTERN, LOCATION_DECK));
        foreach ($internDice as $i => $internDie) {
            $internDie->setSide($i + 1);
            $this->dice->moveCard($internDie->id, LOCATION_INTERN);
        }
        $this->dice->shuffle(LOCATION_INTERN);
    }

    private function createSpecialAbilities()
    {
        $cards = [];
        $specialAbilities = $this->SPECIAL_ABILITIES;
        if ($this->isModuleActive(MODULE_ENGINE_LOSS)) {
            $specialAbilities = array_filter($specialAbilities, fn($value, $key) => $key !== MASTERY, ARRAY_FILTER_USE_BOTH);
        }

        if ($this->isModuleActive(MODULE_STUCK_LANDING_GEAR)) {
            $specialAbilities = array_filter($specialAbilities, fn($value, $key) => $key !== SYNCHRONISATION, ARRAY_FILTER_USE_BOTH);
        }

        foreach ($specialAbilities as $type => $specialAbility) {
            $cards[] = ['type' => $type, 'type_arg' => $type, 'nbr' => 1];
        }
        $this->specialAbilities->createCards($cards, LOCATION_DECK);
    }

    private function createTokens()
    {
        $approachTrack = $this->getApproachTrack();
        $altitudeTrack = $this->getAltitudeTrack();

        $coffeeTokens = [['type' => TOKEN_COFFEE, 'type_arg' => TOKEN_COFFEE, 'nbr' => 3]];
        $this->tokens->createCards($coffeeTokens, LOCATION_RESERVE);

        $planesCreated = 0;
        foreach ($approachTrack->spaces as $spaceId => $space) {
            if (array_key_exists(TOKEN_PLANE, $space) && $space[TOKEN_PLANE] > 0) {
                $planeTokens = [['type' => TOKEN_PLANE, 'type_arg' => TOKEN_PLANE, 'nbr' => $space[TOKEN_PLANE]]];
                $this->tokens->createCards($planeTokens, LOCATION_APPROACH, $spaceId);
                $planesCreated = $planesCreated + $space[TOKEN_PLANE];
            }
        }

        $planeTokens = [['type' => TOKEN_PLANE, 'type_arg' => TOKEN_PLANE, 'nbr' => 12 - $planesCreated]];
        $this->tokens->createCards($planeTokens, LOCATION_RESERVE);

        $rerollCreated = 0;
        $startingAltitude = $this->getStartingAltitude();
        foreach ($altitudeTrack->spaces as $spaceId => $space) {
            if ($spaceId >= $startingAltitude && array_key_exists(TOKEN_REROLL, $space) && $space[TOKEN_REROLL] > 0) {
                $rerollTokens = [['type' => TOKEN_REROLL, 'type_arg' => TOKEN_REROLL, 'nbr' => $space[TOKEN_REROLL]]];
                $this->tokens->createCards($rerollTokens, LOCATION_ALTITUDE, $spaceId);
                $rerollCreated = $rerollCreated + $space[TOKEN_REROLL];
            }
        }
        $rerollTokens = [['type' => TOKEN_REROLL, 'type_arg' => TOKEN_REROLL, 'nbr' => 3 - $rerollCreated]];
        $this->tokens->createCards($rerollTokens, LOCATION_RESERVE);

        if ($this->isModuleActive(MODULE_ALARMS)) {
            $alarmTokens = [];
            foreach ($this->ALARM_TOKENS as $typeArg => $alarmToken) {
                if (!$this->isModuleActive(MODULE_STUCK_LANDING_GEAR)) {
                    $alarmTokens[] = ['type' => TOKEN_ALARM, 'type_arg' => $typeArg, 'nbr' => 1];
                } else {
                    if (in_array($typeArg, [4,6,1])) {
                        $alarmTokens[] = ['type' => TOKEN_ALARM, 'type_arg' => $typeArg, 'nbr' => 1];
                    }
                }
            }
            $this->tokens->createCards($alarmTokens, LOCATION_ALARM);
        }
    }

    private function getStartingAltitude() {
        $altitude = 1;
        if ($this->isModuleActive(MODULE_MODIFIED_ALTITUDE)) {
            $altitude = $this->getScenario()->modifiedAltitude;
        }
        return $altitude;
    }
}