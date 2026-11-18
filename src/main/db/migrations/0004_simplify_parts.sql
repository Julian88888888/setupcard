CREATE TABLE `materials` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`category` text DEFAULT 'other' NOT NULL,
	`notes` text DEFAULT '' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `materials_name_unique` ON `materials` (`name`);
--> statement-breakpoint
CREATE TABLE `workpiece_types` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`notes` text DEFAULT '' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `workpiece_types_name_unique` ON `workpiece_types` (`name`);
--> statement-breakpoint
INSERT INTO `materials` (`name`, `category`, `notes`, `created_at`, `updated_at`) VALUES
	('Ст3', 'steel', '', '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'),
	('Сталь 20', 'steel', '', '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'),
	('Сталь 45', 'steel', '', '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'),
	('40Х', 'steel', '', '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'),
	('40ХН', 'steel', '', '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'),
	('30ХГСА', 'steel', '', '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'),
	('18ХГТ', 'steel', '', '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'),
	('20Х', 'steel', '', '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'),
	('65Г', 'steel', '', '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'),
	('ШХ15', 'steel', '', '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'),
	('У8А', 'steel', '', '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'),
	('У10А', 'steel', '', '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'),
	('12Х18Н10Т', 'stainless', '', '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'),
	('08Х18Н10', 'stainless', '', '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'),
	('10Х17Н13М2', 'stainless', '', '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'),
	('20Х13', 'stainless', '', '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'),
	('40Х13', 'stainless', '', '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'),
	('СЧ15', 'cast_iron', '', '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'),
	('СЧ20', 'cast_iron', '', '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'),
	('СЧ25', 'cast_iron', '', '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'),
	('ВЧ40', 'cast_iron', '', '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'),
	('ВЧ50', 'cast_iron', '', '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'),
	('АД31', 'aluminum', '', '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'),
	('АМц', 'aluminum', '', '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'),
	('Д16Т', 'aluminum', '', '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'),
	('АМг5', 'aluminum', '', '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'),
	('АМг6', 'aluminum', '', '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'),
	('В95', 'aluminum', '', '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'),
	('АК6', 'aluminum', '', '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'),
	('Латунь ЛС59', 'copper', '', '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'),
	('Бронза БрАЖ9-4', 'copper', '', '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'),
	('Бронза ОЦС5-5-5', 'copper', '', '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'),
	('Титан ВТ1-0', 'titanium', '', '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'),
	('Титан ВТ6', 'titanium', '', '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'),
	('Капролон', 'plastic', '', '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'),
	('Фторопласт', 'plastic', '', '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z');
--> statement-breakpoint
INSERT INTO `workpiece_types` (`name`, `notes`, `created_at`, `updated_at`) VALUES
	('Пруток', '', '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'),
	('Лист', '', '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'),
	('Плита', '', '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'),
	('Труба', '', '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'),
	('Поковка', '', '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'),
	('Виливок', '', '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'),
	('Штамповка', '', '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'),
	('Заготовка довільна', '', '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z');
--> statement-breakpoint
CREATE TABLE `__new_parts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`code` text NOT NULL,
	`name` text NOT NULL,
	`material_id` integer,
	`workpiece_type_id` integer,
	`notes` text DEFAULT '' NOT NULL,
	`photo_path` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`material_id`) REFERENCES `materials`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`workpiece_type_id`) REFERENCES `workpiece_types`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
INSERT INTO `__new_parts` (`id`, `code`, `name`, `material_id`, `workpiece_type_id`, `notes`, `photo_path`, `created_at`, `updated_at`)
SELECT
	p.`id`,
	p.`code`,
	p.`name`,
	(SELECT m.`id` FROM `materials` m WHERE m.`name` = p.`material` COLLATE NOCASE LIMIT 1),
	(SELECT w.`id` FROM `workpiece_types` w WHERE w.`name` = p.`workpiece_type` COLLATE NOCASE LIMIT 1),
	p.`notes`,
	NULL,
	p.`created_at`,
	p.`updated_at`
FROM `parts` p;
--> statement-breakpoint
INSERT INTO `materials` (`name`, `category`, `notes`, `created_at`, `updated_at`)
SELECT DISTINCT TRIM(p.`material`), 'other', '', '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'
FROM `parts` p
WHERE TRIM(p.`material`) != ''
	AND NOT EXISTS (
		SELECT 1 FROM `materials` m WHERE m.`name` = TRIM(p.`material`) COLLATE NOCASE
	);
--> statement-breakpoint
INSERT INTO `workpiece_types` (`name`, `notes`, `created_at`, `updated_at`)
SELECT DISTINCT TRIM(p.`workpiece_type`), '', '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'
FROM `parts` p
WHERE TRIM(p.`workpiece_type`) != ''
	AND NOT EXISTS (
		SELECT 1 FROM `workpiece_types` w WHERE w.`name` = TRIM(p.`workpiece_type`) COLLATE NOCASE
	);
--> statement-breakpoint
UPDATE `__new_parts`
SET `material_id` = (
	SELECT m.`id` FROM `materials` m
	WHERE m.`name` = (
		SELECT TRIM(p.`material`) FROM `parts` p WHERE p.`id` = `__new_parts`.`id`
	) COLLATE NOCASE
	LIMIT 1
)
WHERE `material_id` IS NULL;
--> statement-breakpoint
UPDATE `__new_parts`
SET `workpiece_type_id` = (
	SELECT w.`id` FROM `workpiece_types` w
	WHERE w.`name` = (
		SELECT TRIM(p.`workpiece_type`) FROM `parts` p WHERE p.`id` = `__new_parts`.`id`
	) COLLATE NOCASE
	LIMIT 1
)
WHERE `workpiece_type_id` IS NULL;
--> statement-breakpoint
DROP TABLE `part_fixture_photos`;
--> statement-breakpoint
DROP TABLE `part_fixtures`;
--> statement-breakpoint
DROP TABLE `part_programs`;
--> statement-breakpoint
DROP TABLE `part_transitions`;
--> statement-breakpoint
DROP TABLE `parts`;
--> statement-breakpoint
ALTER TABLE `__new_parts` RENAME TO `parts`;
