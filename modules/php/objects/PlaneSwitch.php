<?php
namespace managers\objects;
use APP_GameClass;

class PlaneSwitch extends APP_GameClass {

    public string $id;
    public bool $value;

    /**
     * @param string $id
     * @param bool $value
     */
    public function __construct(string $id, bool $value)
    {
        $this->id = $id;
        $this->value = $value;
    }

    public function save() {
        self::DbQuery("UPDATE plane_switch SET value = $this->value WHERE id = '$this->id'");
    }

    /**
     * @param $dbCards
     * @return PlaneSwitch[]
     */
    public static function fromArray($dbCards): array
    {
        return array_map(fn($dbCard) => PlaneSwitch::from($dbCard), $dbCards);
    }

    public static function from($dbCard) {
        return new PlaneSwitch($dbCard['id'], intval($dbCard['value']) == 1);
    }
}