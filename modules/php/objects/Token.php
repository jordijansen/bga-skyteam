<?php
namespace objects;
use APP_GameClass;

class Token extends APP_GameClass {

    public int $id;
    public string $location;
    public int $locationArg;
    public string $type;

    public function __construct($dbCard)
    {
        $this->id = intval($dbCard['card_id'] ?? $dbCard['id']);
        $this->location = $dbCard['card_location'] ?? $dbCard['location'];
        $this->locationArg = intval($dbCard['card_location_arg'] ?? $dbCard['location_arg']);
        $this->type = $dbCard['card_type'] ?? $dbCard['type'];
    }

    /**
     * @param $dbCards
     * @return Token[]
     */
    public static function fromArray($dbCards): array
    {
        return array_map(fn($dbCard) => Token::from($dbCard), array_values($dbCards));
    }

    public static function from($dbCard): Token
    {
        return new Token($dbCard);
    }
}