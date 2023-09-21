<?php
namespace objects;
use APP_GameClass;
use managers\objects\PlaneSwitch;

class Plane extends APP_GameClass {

    public int $axis;
    public int $aerodynamicsBlue;
    public int $aerodynamicsOrange;
    public int $brake;
    public int $approach;
    public int $altitude;
    public int $kerosene;
    public int $wind;
    public array $switches;

    public function __construct($axis, $aerodynamicsBlue, $aerodynamicsOrange, $brake, $approach, $altitude, $kerosene, $wind)
    {
        $this->axis = $axis;
        $this->aerodynamicsBlue = $aerodynamicsBlue;
        $this->aerodynamicsOrange = $aerodynamicsOrange;
        $this->brake = $brake;
        $this->approach = $approach;
        $this->altitude = $altitude;
        $this->kerosene = $kerosene;
        $this->wind = $wind;
        $this->switches = PlaneSwitch::fromArray(self::getCollectionFromDB('SELECT * FROM plane_switch'));
    }

    public static function from($dbCard) {
        return new Plane(intval($dbCard['axis']),
            intval($dbCard['aerodynamics_blue']),
            intval($dbCard['aerodynamics_orange']),
            intval($dbCard['brake']),
            intval($dbCard['approach']),
            intval($dbCard['altitude']),
            intval($dbCard['kerosene']),
            intval($dbCard['wind']));
    }

    public function getWindModifier() {
        switch ($this->wind) {
            case 0:
            case 19:
            case 1:
                return -3;
            case 2:
            case 18:
            case 17:
            case 3:
                return -2;
            case 16:
            case 4:
                return -1;
            case 15:
            case 5:
                return 0;
            case 14:
            case 6:
                return +1;
            case 7:
            case 13:
            case 12:
            case 8:
                return +2;
            case 9:
            case 10:
            case 11:
                return +3;
        }
    }
}