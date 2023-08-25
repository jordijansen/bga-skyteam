<?php
namespace objects;
use APP_GameClass;

class Plane extends APP_GameClass {

    public int $axis;
    public int $aerodynamicsBlue;
    public int $aerodynamicsOrange;
    public int $brake;

    public function __construct($axis, $aerodynamicsBlue, $aerodynamicsOrange, $brake)
    {
        $this->axis = $axis;
        $this->aerodynamicsBlue = $aerodynamicsBlue;
        $this->aerodynamicsOrange = $aerodynamicsOrange;
        $this->brake = $brake;
    }

    public static function from($dbCard) {
        return new Plane(intval($dbCard['axis']),
            intval($dbCard['aerodynamics_blue']),
            intval($dbCard['aerodynamics_orange']),
            intval($dbCard['brake']));
    }
}