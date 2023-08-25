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
            $values[] = "('".$player_id."','$color','".$player['player_canal']."','".addslashes( $player['player_name'] )."','".addslashes( $player['player_avatar'] )."', 5)";
            $extraValues[] = "('".$player_id."')";
        }
        $sql .= implode( ',', $values );
        $extraSql .= implode( ',', $extraValues );
        self::DbQuery( $extraSql );
        self::DbQuery( $sql );
        self::reattributeColorsBasedOnPreferences( $players, $gameinfos['player_colors'] );
        self::reloadPlayersBasicInfos();

        $this->setInitialPlaneParameters();

        $this->gamestate->setAllPlayersMultiactive();
    }

    private function setInitialPlaneParameters()
    {
        $this->planeManager->save(new Plane(0, 4, 8, 0));
    }
}