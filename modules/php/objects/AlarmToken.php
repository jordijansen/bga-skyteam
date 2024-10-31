<?php
namespace managers\objects;
use APP_GameClass;
use objects\Token;
use SkyTeam;

class AlarmToken extends APP_GameClass {

    public int $id;
    public string $location;
    public int $locationArg;
    public string $type;
    public string $typeArg;
    public bool $isActive;
    public array $blocksSpaces;

    public function __construct($dbCard)
    {
        $this->id = intval($dbCard['card_id'] ?? $dbCard['id']);
        $this->location = $dbCard['card_location'] ?? $dbCard['location'];
        $this->locationArg = intval($dbCard['card_location_arg'] ?? $dbCard['location_arg']);
        $this->type = $dbCard['card_type'] ?? $dbCard['type'];
        $this->typeArg = $dbCard['card_type_arg'] ?? $dbCard['type_arg'];
        $this->isActive = in_array($this->typeArg, SkyTeam::$instance->getGlobalVariable(ACTIVE_ALARMS, true, []));
        $this->blocksSpaces = $this->getBlocksSpaces();
    }
    
    private function getBlocksSpaces() {
        $result = [];
        $type = intval($this->typeArg);
        if ($type === 1) {
            $result = array_filter(SkyTeam::$instance->ACTION_SPACES, fn($space, $spaceId) => $space['type'] === ACTION_SPACE_CONCENTRATION, ARRAY_FILTER_USE_BOTH);
        } else if ($type === 2) {
            $result = array_filter(SkyTeam::$instance->ACTION_SPACES, fn($space, $spaceId) => $space['type'] === ACTION_SPACE_BRAKES, ARRAY_FILTER_USE_BOTH);
        } else if ($type === 3) {
            $result = array_filter(SkyTeam::$instance->ACTION_SPACES, fn($space, $spaceId) => $space['type'] === ACTION_SPACE_LANDING_GEAR, ARRAY_FILTER_USE_BOTH);
        } else if ($type === 4) {
            $result = array_filter(SkyTeam::$instance->ACTION_SPACES, fn($space, $spaceId) => $space['type'] === ACTION_SPACE_FLAPS, ARRAY_FILTER_USE_BOTH);
        } else if ($type === 5) {
            $result = array_filter(SkyTeam::$instance->ACTION_SPACES, fn($space, $spaceId) => $space['type'] === ACTION_SPACE_RADIO && in_array(PILOT, $space[ALLOWED_ROLES]), ARRAY_FILTER_USE_BOTH);
        } else if ($type === 6) {
            $result = array_filter(SkyTeam::$instance->ACTION_SPACES, fn($space, $spaceId) => $space['type'] === ACTION_SPACE_RADIO && in_array(CO_PILOT, $space[ALLOWED_ROLES]), ARRAY_FILTER_USE_BOTH);
        }
        return array_keys($result);
    }

    /**
     * @param $dbCards
     * @return AlarmToken[]
     */
    public static function fromArray($dbCards): array
    {
        return array_map(fn($dbCard) => AlarmToken::from($dbCard), array_values($dbCards));
    }

    public static function from($dbCard): AlarmToken
    {
        return new AlarmToken($dbCard);
    }
}