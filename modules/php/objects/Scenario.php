<?php
namespace managers\objects;

class Scenario {

    public int $id;
    public int $approach;
    public int $altitude;
    public array $modules;
    public array $tags;
    public ?int $nrOfSpecialAbilities;
    public ?int $modifiedAltitude;

}