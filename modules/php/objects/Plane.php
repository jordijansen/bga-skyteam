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
    public array $switches;

    public function __construct($axis, $aerodynamicsBlue, $aerodynamicsOrange, $brake, $approach, $altitude)
    {
        $this->axis = $axis;
        $this->aerodynamicsBlue = $aerodynamicsBlue;
        $this->aerodynamicsOrange = $aerodynamicsOrange;
        $this->brake = $brake;
        $this->approach = $approach;
        $this->altitude = $altitude;
        $this->switches = PlaneSwitch::fromArray(self::getCollectionFromDB('SELECT * FROM plane_switch'));
    }

    public static function from($dbCard) {
        return new Plane(intval($dbCard['axis']),
            intval($dbCard['aerodynamics_blue']),
            intval($dbCard['aerodynamics_orange']),
            intval($dbCard['brake']),
            intval($dbCard['approach']),
            intval($dbCard['altitude']));
    }
}