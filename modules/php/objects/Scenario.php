<?php
namespace managers\objects;
use APP_GameClass;

class Scenario extends APP_GameClass {

    public int $id;
    public int $approach;
    public int $altitude;
    public array $modules;
    public array $tags;
    public ?int $nrOfSpecialAbilities;
    public ?int $modifiedAltitude;

}