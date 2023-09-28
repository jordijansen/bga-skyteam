{OVERALL_GAME_HEADER}

<!-- 
--------
-- BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
-- skyteam implementation : © <Your name here> <Your email address here>
-- 
-- This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
-- See http://en.boardgamearena.com/#!doc/Studio for more information.
-------

    skyteam_skyteam.tpl
    
    This is the HTML template of your game.
    
    Everything you are writing in this file will be displayed in the HTML page of your game user interface,
    in the "main game zone" of the screen.
    
    You can use in this template:
    _ variables, with the format {MY_VARIABLE_ELEMENT}.
    _ HTML block, with the BEGIN/END format
    
    See your "view" PHP file to check how to set variables and control blocks
    
    Please REMOVE this comment before publishing your game on BGA
-->
<div id="st-game">
    <div id="st-player-setup" class="whiteblock"></div>
    <div id="st-end-game-info-wrapper" class="whiteblock"></div>
    <div id="st-game-boards-wrapper">
        <div id="st-main-board-wrapper">
            <div id="st-main-board-tracks">
                <div id="st-altitude-track" class="st-altitude"></div>
                <div id="st-approach-track" class="st-approach"></div>
            </div>
            <div id="st-plane-board-wrapper">
                <div id="st-main-board-left">
                    <div id="st-kerosene-board" class="st-board">
                        <div id="st-kerosene-marker" class="st-kerosene-marker token" data-value="-1"></div>
                    </div>
                    <div id="st-token-reserve-coffee" class="st-token-reserve"></div>
                </div>
                <div id="st-main-board" class="st-board">
                    <div id="st-plane-axis-indicator" class="st-plane-axis-indicator token"></div>
                    <div id="st-plane-aerodynamics-blue-marker" class="st-plane-marker token" data-type="aerodynamics-blue"></div>
                    <div id="st-plane-aerodynamics-orange-marker" class="st-plane-marker token" data-type="aerodynamics-orange"></div>
                    <div id="st-plane-brake-marker" class="st-plane-marker token" data-type="brakes-red"></div>
                    <div id="st-available-coffee"></div>
                    <div id="st-available-reroll"></div>
                    <div id="st-action-spaces"></div>
                    <div id="st-plane-switches"></div>
                    <div id="st-token-reserve-plane" class="st-token-reserve"></div>
                    <div id="st-token-reserve-reroll" class="st-token-reserve"></div>
                    <div id="st-traffic-dice-stock"></div>
                    <div id="st-approach-overlay-track">
                        <div id="st-approach-overlay-track-slot"></div>
                    </div>
                    <!-- MODULE BOARDS -->
                </div>
                <div id="st-main-board-right">
                    <div id="st-winds-board" class="st-board">
                        <div id="st-winds-plane" class="st-winds-plane token" data-value="0"></div>
                    </div>
                    <div id="st-main-board-special-abilities"></div>
                </div>
            </div>
        </div>
    </div>
</div>

<div id="zoom-overall" style="width: 100%;"></div>

<script type="text/javascript">



</script>  

{OVERALL_GAME_FOOTER}
