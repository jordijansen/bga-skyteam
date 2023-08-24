<?php

namespace managers\utils;
class ReflectionUtils
{

    static function extractAllPropertyValues($object)
    {
        if (is_array($object)) {
            return array_map(function ($o) {
                return ReflectionUtils::extractAllPropertyValues($o);
            }, $object);
        } else if (!is_object($object)) {
            return $object;
        }
        $allProperties = [
        ];

        $reflect = new ReflectionClass(get_class($object));
        foreach ($reflect->getProperties() as $property) {
            $property->setAccessible(true); // Bypass private or protected
            $value = $property->getValue($object);
            $allProperties[$property->getName()] = ReflectionUtils::extractAllPropertyValues($value);
        }

        return $allProperties;
    }

    /**
     * @throws ReflectionException
     */
    static function rebuildAllPropertyValues($values, $classId = null)
    {
        $reflect = new ReflectionClass($classId);
        $object = $reflect->newInstanceWithoutConstructor();
        foreach ($values as $propertyName => $value) {
            $value = ReflectionUtils::rebuildAllSimplePropertyValues($value);
            $property = $reflect->getProperty($propertyName);
            $property->setAccessible(true); // Bypass private or protected
            $property->setValue($object, $value);
        }
        return $object;
    }

    static function rebuildAllSimplePropertyValues($values)
    {
        if (!is_array($values)) {
            return $values;
        }
        return array_map(function ($value) {
            return ReflectionUtils::rebuildAllSimplePropertyValues($value);
        }, $values);
    }
}