<?php
namespace objects;
use APP_GameClass;

class Card extends APP_GameClass {

    public int $id;
    public string $location;
    public int $locationArg;
    public string $type;
    public ?int $typeArg;

    public function __construct($dbCard)
    {
        $this->id = intval($dbCard['card_id'] ?? $dbCard['id']);
        $this->location = $dbCard['card_location'] ?? $dbCard['location'];
        $this->locationArg = intval($dbCard['card_location_arg'] ?? $dbCard['location_arg']);
        $this->type = $dbCard['card_type'] ?? $dbCard['type'];
        $this->typeArg = array_key_exists('card_type_arg', $dbCard) || array_key_exists('type_arg', $dbCard) ? intval($dbCard['card_type_arg'] ?? $dbCard['type_arg']) : null;
    }
}