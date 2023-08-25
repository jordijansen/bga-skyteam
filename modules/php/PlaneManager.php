<?php

namespace managers;

use APP_DbObject;
use objects\Plane;

class PlaneManager extends APP_DbObject
{
    function save(Plane $plane)
    {
        self::DbQuery("REPLACE INTO plane 
                            (id, axis, aerodynamics_blue, aerodynamics_orange, brake, approach, altitude)
                          VALUES
                            (1, $plane->axis, $plane->aerodynamicsBlue, $plane->aerodynamicsOrange, $plane->brake, $plane->approach, $plane->altitude);"
        );
    }

    function get() : Plane
    {
        return Plane::from(self::getObjectFromDB("SELECT * FROM plane WHERE id = 1"));
    }
}