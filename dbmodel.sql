
-- ------
-- BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
-- skyteam implementation : © <Your name here> <Your email address here>
-- 
-- This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
-- See http://en.boardgamearena.com/#!doc/Studio for more information.
-- -----

-- dbmodel.sql

-- This is the file where you are describing the database schema of your game
-- Basically, you just have to export from PhpMyAdmin your table structure and copy/paste
-- this export here.
-- Note that the database itself and the standard tables ("global", "stats", "gamelog" and "player") are
-- already created and must not be created here

-- Note: The database schema is created from this file when the game starts. If you modify this file,
--       you have to restart a game to see your changes in database.

-- Example 1: create a standard "card" table to be used with the "Deck" tools (see example game "hearts"):

-- CREATE TABLE IF NOT EXISTS `card` (
--   `card_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
--   `card_type` varchar(16) NOT NULL,
--   `card_type_arg` int(11) NOT NULL,
--   `card_location` varchar(16) NOT NULL,
--   `card_location_arg` int(11) NOT NULL,
--   PRIMARY KEY (`card_id`)
-- ) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;


-- Example 2: add a custom field to the standard "player" table
-- ALTER TABLE `player` ADD `player_my_custom_field` INT UNSIGNED NOT NULL DEFAULT '0';

-- FRAMEWORK TABLES
CREATE TABLE IF NOT EXISTS `global_variables` (
    `name` varchar(200) NOT NULL,
    `value` json,
    PRIMARY KEY (`name`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `command_log` (
    `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
    `player_id` int(11) NOT NULL,
    `name` varchar(200) NOT NULL,
    `value` json,
    PRIMARY KEY (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `extra_player` (
    `player_id` int(10) unsigned NOT NULL,
    `player_custom_order` int(10) unsigned NOT NULL DEFAULT '0',
    PRIMARY KEY (`player_id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1;

-- GAME TABLES
CREATE TABLE IF NOT EXISTS `plane` (
    `id` int(10) unsigned NOT NULL,
    `axis` int(11) NOT NULL,
    `aerodynamics_blue` int(11) unsigned NOT NULL,
    `aerodynamics_orange` int(11) unsigned NOT NULL,
    `brake` int(11) unsigned NOT NULL,
    `approach` int(11) unsigned NOT NULL,
    `altitude` int(11) unsigned NOT NULL,
    PRIMARY KEY (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8;


CREATE TABLE IF NOT EXISTS `dice` (
    `card_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
    `card_type` varchar(100) NOT NULL,
    `card_type_arg` varchar(100) NOT NULL,
    `card_location` varchar(100) NOT NULL,
    `card_location_arg` varchar(100) NOT NULL,
    `card_side` int(1) NOT NULL DEFAULT '1',
    PRIMARY KEY (`card_id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

CREATE TABLE IF NOT EXISTS `token` (
    `card_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
    `card_type` varchar(100) NOT NULL,
    `card_type_arg` varchar(100) NOT NULL,
    `card_location` varchar(100) NOT NULL,
    `card_location_arg` int(11) NOT NULL,
    PRIMARY KEY (`card_id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;


