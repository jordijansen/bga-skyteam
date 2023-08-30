<?php
namespace objects;
use APP_GameClass;

class AltitudeTrack extends APP_GameClass {

    public int $type;
    public array $categories;
    public int $size;
    public array $spaces;

    /**
     * @param int $type
     * @param array $categories
     * @param int $size
     * @param array $spaces
     */
    public function __construct(int $type, array $categories, int $size, array $spaces)
    {
        $this->type = $type;
        $this->categories = $categories;
        $this->size = $size;
        $this->spaces = $spaces;
    }
}