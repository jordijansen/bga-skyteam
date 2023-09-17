<?php

namespace traits;
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

        $this->setInitialPlaneParameters();
        $this->createDice();
        $this->createTokens();

        $this->activeNextPlayer();
    }

    private function setInitialPlaneParameters()
    {
        $this->planeManager->save(new Plane(0, 4, 8, 0, 1, 1));
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
        $dice[] = ['type' => DICE_TRAFFIC, 'type_arg' => DICE_TRAFFIC, 'nbr' => 3];

        $this->dice->createCards($dice, LOCATION_DECK);
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

        foreach ($altitudeTrack->spaces as $spaceId => $space) {
            if (array_key_exists(TOKEN_REROLL, $space) && $space[TOKEN_REROLL] > 0) {
                $rerollTokens = [['type' => TOKEN_REROLL, 'type_arg' => TOKEN_REROLL, 'nbr' => $space[TOKEN_REROLL]]];
                $this->tokens->createCards($rerollTokens, LOCATION_ALTITUDE, $spaceId);
            }
        }
    }
}