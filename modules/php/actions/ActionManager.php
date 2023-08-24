<?php

namespace actions;

use SkyTeam;

class ActionManager
{
    function addAction($playerId, $action)
    {
        $existingActions = $this->getActions($playerId);
        SkyTeam::$instance->setGlobalVariable(ADDITIONAL_ACTIONS_ . $playerId, [...$existingActions, $action]);
    }

    function addActions($playerId, $actions)
    {
        $existingActions = $this->getActions($playerId);
        SkyTeam::$instance->setGlobalVariable(ADDITIONAL_ACTIONS_ . $playerId, [...$existingActions, ...$actions]);
    }

    /**
     * @return AdditionalAction[]
     */
    function getActions($playerId, $includeOnlyUnperformed = false)
    {
        $actions = SkyTeam::$instance->getGlobalVariable(ADDITIONAL_ACTIONS_ . $playerId);
        $actions = AdditionalAction::fromArray($actions);
        if ($includeOnlyUnperformed) {
            $actions = array_filter($actions, function ($action) {
                return $action->performed == false;
            });
        }
        return [...$actions];
    }

    public function getAction($playerId, $actionId): ?AdditionalAction
    {
        $actions = $this->getActions($playerId);
        foreach ($actions as $action) {
            if ($action->id == $actionId) {
                return $action;
            }
        }
        return null;
    }

    public function removeAction($playerId, $actionId)
    {
        $actions = $this->getActions($playerId);
        $newActions = array_filter($actions, function ($action) use ($actionId) {
            return strcmp($action->id, $actionId) !== 0;
        });
        SkyTeam::$instance->setGlobalVariable(ADDITIONAL_ACTIONS_ . $playerId, [...$newActions]);
    }

    public function clear(int $playerId)
    {
        SkyTeam::$instance->deleteGlobalVariable(ADDITIONAL_ACTIONS_ . $playerId);
    }

    public function markActionPerformed(int $playerId, string $actionId)
    {
        $action = $this->getAction($playerId, $actionId);
        $this->removeAction($playerId, $actionId);
        $action->performed = true;
        $this->addAction($playerId, $action);
    }

    public function unmarkActionPerformed(int $playerId, string $actionId)
    {
        $action = $this->getAction($playerId, $actionId);
        $this->removeAction($playerId, $actionId);
        $action->performed = false;
        $this->addAction($playerId, $action);
    }

    public function removeActionsForOriginActionId(int $playerId, string $originActionId)
    {
        $actions = $this->getActionsForOriginActionId($playerId, $originActionId);
        foreach ($actions as $action) {
            $this->removeAction($playerId, $action->id);
        }
    }

    /**
     * @return AdditionalAction[]
     */
    public function getActionsForOriginActionId(int $playerId, string $originActionId): array
    {
        $actions = $this->getActions($playerId);
        return array_filter($actions, function ($action) use ($originActionId) {
            return $action->originActionId == $originActionId;
        });
    }

}