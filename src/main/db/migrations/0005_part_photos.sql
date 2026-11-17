CREATE TABLE `__tmp_part_photos` (
	`part_id` integer NOT NULL,
	`photo_path` text NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
INSERT INTO `__tmp_part_photos` (`part_id`, `photo_path`, `sort_order`)
SELECT `id`, `photo_path`, 0 FROM `parts` WHERE `photo_path` IS NOT NULL AND TRIM(`photo_path`) != '';
--> statement-breakpoint
CREATE TABLE `__new_parts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`code` text NOT NULL,
	`name` text NOT NULL,
	`material_id` integer,
	`workpiece_type_id` integer,
	`notes` text DEFAULT '' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`material_id`) REFERENCES `materials`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`workpiece_type_id`) REFERENCES `workpiece_types`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
INSERT INTO `__new_parts` (`id`, `code`, `name`, `material_id`, `workpiece_type_id`, `notes`, `created_at`, `updated_at`)
SELECT `id`, `code`, `name`, `material_id`, `workpiece_type_id`, `notes`, `created_at`, `updated_at` FROM `parts`;
--> statement-breakpoint
PRAGMA foreign_keys=OFF;
--> statement-breakpoint
DROP TABLE `parts`;
--> statement-breakpoint
ALTER TABLE `__new_parts` RENAME TO `parts`;
--> statement-breakpoint
PRAGMA foreign_keys=ON;
--> statement-breakpoint
CREATE TABLE `part_photos` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`part_id` integer NOT NULL,
	`photo_path` text NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`part_id`) REFERENCES `parts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `part_photos` (`part_id`, `photo_path`, `sort_order`)
SELECT `part_id`, `photo_path`, `sort_order` FROM `__tmp_part_photos`;
--> statement-breakpoint
DROP TABLE `__tmp_part_photos`;
