<?php
namespace managers\objects;
use APP_GameClass;

class Scenario extends APP_GameClass {

    public int $approach;
    public int $altitude;
    public array $modules;

    /**
     * @param int $approach
     * @param int $altitude
     * @param array $modules
     */
    public function __construct(int $approach, int $altitude, array $modules)
    {
        $this->approach = $approach;
        $this->altitude = $altitude;
        $this->modules = $modules;
    }

}