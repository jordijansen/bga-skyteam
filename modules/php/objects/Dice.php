<?php
namespace objects;
use APP_GameClass;

class Dice extends APP_GameClass {

    public int $id;
    public string $type;
    public string $typeArg;
    public string $location;
    public int $locationArg;
    public int $side;


    public function __construct($dbCard)
    {
        $this->id = intval($dbCard['card_id'] ?? $dbCard['id']);
        $this->type = $dbCard['card_type'] ?? $dbCard['type'];
        $this->typeArg = $dbCard['card_type_arg'] ?? $dbCard['type_arg'];
        $this->location = $dbCard['card_location'] ?? $dbCard['location'];
        $this->locationArg = intval($dbCard['card_location_arg'] ?? $dbCard['location_arg']);
        $this->side = self::getUniqueValueFromDB('SELECT card_side FROM dice WHERE card_id = '.$this->id);
    }

    /**
     * @param $dbCards
     * @return Dice[]
     */
    public static function fromArray($dbCards): array
    {
        return array_map(fn($dbCard) => Dice::from($dbCard), array_values($dbCards));
    }

    public static function from($dbCard): Dice
    {
        return new Dice($dbCard);
    }
}