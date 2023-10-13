<?php
/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * skyteam implementation : © <Your name here> <Your email address here>
 *
 * This code has been produced on the BGA studio platform for use on https://boardgamearena.com.
 * See http://en.doc.boardgamearena.com/Studio for more information.
 * -----
 *
 * skyteam.action.php
 *
 * skyteam main action entry point
 *
 *
 * In this file, you are describing all the methods that can be called from your
 * user interface logic (javascript).
 *
 * If you define a method "myAction" here, then you can call it from your javascript code with:
 * this.ajaxcall( "/skyteam/skyteam/myAction.html", ...)
 *
 */


class action_skyteam extends APP_GameAction
{
    // Constructor: please do not modify
    public function __default()
    {
        if (self::isArg('notifwindow')) {
            $this->view = "common_notifwindow";
            $this->viewArgs['table'] = self::getArg("table", AT_posint, true);
        } else {
            $this->view = "skyteam_skyteam";
            self::trace("Complete reinitialization of board game");
        }
    }

    public function confirmPlayerSetup()
    {
        self::setAjaxMode();

        $settings = self::getArg("settings", AT_json, true);
        $this->validateJSonAlphaNum($settings, 'settings');

        $this->game->confirmPlayerSetup($settings);

        self::ajaxResponse();
    }

    public function confirmReadyStrategy()
    {
        self::setAjaxMode();

        $this->game->confirmReadyStrategy();

        self::ajaxResponse();
    }

    public function confirmPlacement()
    {
        self::setAjaxMode();

        $placement = self::getArg("placement", AT_json, true);
        $this->validateJSonAlphaNum($placement, 'placement');

        $this->game->confirmPlacement($placement);

        self::ajaxResponse();
    }

    public function requestReroll()
    {
        self::setAjaxMode();

        $this->game->requestReroll();

        self::ajaxResponse();
    }

    public function requestAdaptation()
    {
        self::setAjaxMode();

        $this->game->requestAdaptation();

        self::ajaxResponse();
    }

    public function requestSwap()
    {
        self::setAjaxMode();

        $this->game->requestSwap();

        self::ajaxResponse();
    }

    public function cancelAdaptation()
    {
        self::setAjaxMode();

        $this->game->cancelAdaptation();

        self::ajaxResponse();
    }

    public function cancelSwap()
    {
        self::setAjaxMode();

        $this->game->cancelSwap();

        self::ajaxResponse();
    }

    public function rerollDice()
    {
        self::setAjaxMode();

        $payload = self::getArg("payload", AT_json, true);
        $this->validateJSonAlphaNum($payload, 'payload');
        $this->game->rerollDice($payload['selectedDieIds']);

        self::ajaxResponse();
    }

    public function flipDie()
    {
        self::setAjaxMode();

        $payload = self::getArg("payload", AT_json, true);
        $this->validateJSonAlphaNum($payload, 'payload');
        $this->game->flipDie($payload['selectedDieId']);

        self::ajaxResponse();
    }

    public function swapDie()
    {
        self::setAjaxMode();

        $payload = self::getArg("payload", AT_json, true);
        $this->validateJSonAlphaNum($payload, 'payload');
        $this->game->swapDie($payload['selectedDieId']);

        self::ajaxResponse();
    }

    public function realTimeOutOfTime()
    {
        self::setAjaxMode();
        $this->game->realTimeOutOfTime();
        self::ajaxResponse();
    }

    public function undoLast()
    {
        self::setAjaxMode();

        $this->game->undoLast();

        self::ajaxResponse();
    }

    public function undoAll()
    {
        self::setAjaxMode();

        $this->game->undoAll();

        self::ajaxResponse();
    }

    private function validateJSonAlphaNum($value, $argName = 'unknown')
    {
        if (is_array($value)) {
            foreach ($value as $key => $v) {
                $this->validateJSonAlphaNum($key, $argName);
                $this->validateJSonAlphaNum($v, $argName);
            }
            return true;
        }
        if (is_int($value)) {
            return true;
        }

        $bValid = preg_match("/^[_0-9a-zA-Z- ]*$/", $value) === 1; // NOI18N
        if (!$bValid) {
            throw new BgaSystemException("Bad value for: $argName", true, true, FEX_bad_input_argument);
        }
        return true;
    }

}
  

