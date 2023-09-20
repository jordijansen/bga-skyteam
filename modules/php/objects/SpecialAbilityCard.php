<?php
namespace managers\objects;
use APP_GameClass;
use SkyTeam;

class SpecialAbilityCard extends APP_GameClass {

    public int $id;
    public int $type;
    public string $location;
    public int $locationArg;
    public string $name;
    public string $description;

    public function __construct($dbCard)
    {
        $this->id = intval($dbCard['card_id'] ?? $dbCard['id']);
        $this->location = $dbCard['card_location'] ?? $dbCard['location'];
        $this->locationArg = intval($dbCard['card_location_arg'] ?? $dbCard['location_arg']);
        $this->type = intval($dbCard['card_type'] ?? $dbCard['type']);
        $this->name = SkyTeam::$instance->SPECIAL_ABILITIES[$this->type]['name'];
        $this->description = SkyTeam::$instance->SPECIAL_ABILITIES[$this->type]['description'];
    }

    /**
     * @param $dbCards
     * @return SpecialAbilityCard[]
     */
    public static function fromArray($dbCards): array
    {
        return array_map(fn($dbCard) => SpecialAbilityCard::from($dbCard), array_values($dbCards));
    }

    public static function from($dbCard): SpecialAbilityCard
    {
        return new SpecialAbilityCard($dbCard);
    }
}