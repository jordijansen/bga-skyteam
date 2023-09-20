<?php
namespace managers\objects;
use APP_GameClass;

class Scenario extends APP_GameClass {

    public int $approach;
    public int $altitude;
    public array $modules;
    public ?int $nrOfSpecialAbilities;

    /**
     * @param int $approach
     * @param int $altitude
     * @param array $modules
     */
    public function __construct(int $approach, int $altitude, array $modules, ?int $nrOfSpecialAbilities)
    {
        $this->approach = $approach;
        $this->altitude = $altitude;
        $this->modules = $modules;
        $this->nrOfSpecialAbilities = $nrOfSpecialAbilities;
    }

}