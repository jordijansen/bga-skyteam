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
    <div id="st-communication-info" class="whiteblock"></div>
    <div id="st-player-setup" class="whiteblock"></div>
    <div id="st-end-game-info-wrapper" class="whiteblock"></div>
    <div id="st-game-boards-wrapper">
        <div id="st-main-board-wrapper">
            <div id="st-main-board-tracks">
                <div id="st-altitude-track" class="st-altitude"></div>
                <div id="st-approach-track" class="st-approach"></div>
            </div>
            <div id="st-plane-board-wrapper">
                <div id="st-main-board" class="st-board">
                    <div id="st-plane-axis-indicator" class="token"></div>
                    <div id="st-plane-aerodynamics-blue-marker" class="st-plane-marker token" data-type="aerodynamics-blue"></div>
                    <div id="st-plane-aerodynamics-orange-marker" class="st-plane-marker token" data-type="aerodynamics-orange"></div>
                    <div id="st-plane-brake-marker" class="st-plane-marker token" data-type="brakes-red"></div>
                    <div id="st-available-coffee"></div>
                    <div id="st-available-reroll"></div>
                    <div class="st-action-spaces">
                        <div id="axis-1" class="st-action-space"></div>
                        <div id="axis-2" class="st-action-space"></div>
                        <div id="engines-1" class="st-action-space"></div>
                        <div id="engines-2" class="st-action-space"></div>
                        <div id="radio-1" class="st-action-space"></div>
                        <div id="radio-2" class="st-action-space"></div>
                        <div id="radio-3" class="st-action-space"></div>
                        <div id="landing-gear-1" class="st-action-space"></div>
                        <div id="landing-gear-2" class="st-action-space"></div>
                        <div id="landing-gear-3" class="st-action-space"></div>
                    </div>
                    <div class="st-plane-switches">
                        <div id="plane-switch-landing-gear-1" class="st-plane-switch-wrapper"><div class="st-plane-switch token"></div></div>
                        <div id="plane-switch-landing-gear-2" class="st-plane-switch-wrapper"><div class="st-plane-switch token"></div></div>
                        <div id="plane-switch-landing-gear-3" class="st-plane-switch-wrapper"><div class="st-plane-switch token"></div></div>
                        <div id="plane-switch-flaps-1" class="st-plane-switch-wrapper"><div class="st-plane-switch token"></div></div>
                        <div id="plane-switch-flaps-2" class="st-plane-switch-wrapper"><div class="st-plane-switch token"></div></div>
                        <div id="plane-switch-flaps-3" class="st-plane-switch-wrapper"><div class="st-plane-switch token"></div></div>
                        <div id="plane-switch-flaps-4" class="st-plane-switch-wrapper"><div class="st-plane-switch token"></div></div>
                        <div id="plane-switch-brakes-1" class="st-plane-switch-wrapper"><div class="st-plane-switch token"></div></div>
                        <div id="plane-switch-brakes-2" class="st-plane-switch-wrapper"><div class="st-plane-switch token"></div></div>
                        <div id="plane-switch-brakes-3" class="st-plane-switch-wrapper"><div class="st-plane-switch token"></div></div>

                    </div>
                </div>
                <div id="st-token-reserves">
                    <div id="st-token-reserve-coffee" class="st-token-reserve"></div>
                    <div id="st-token-reserve-plane" class="st-token-reserve"></div>
                    <div id="st-token-reserve-reroll" class="st-token-reserve"></div>
                </div>
            </div>
        </div>
    </div>
</div>

<div id="zoom-overall" style="width: 100%;"></div>

<script type="text/javascript">



</script>  

{OVERALL_GAME_FOOTER}
