<?php
namespace objects;
use APP_GameClass;

class ApproachTrack extends APP_GameClass {

    public int $type;
    public string $category;
    public string $name;
    public int $size;
    public array $spaces;

    /**
     * @param int $type
     * @param string $category
     * @param string $name
     * @param int $size
     * @param array $spaces
     */
    public function __construct(int $type, string $category, string $name, int $size, array $spaces)
    {
        $this->type = $type;
        $this->category = $category;
        $this->name = $name;
        $this->size = $size;
        $this->spaces = $spaces;
    }
}