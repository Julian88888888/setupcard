PRAGMA foreign_keys=OFF;
--> statement-breakpoint
CREATE TABLE `__new_machines` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`inventory_number` text NOT NULL,
	`machine_type` text DEFAULT '' NOT NULL,
	`control_system_type` text DEFAULT '' NOT NULL,
	`spindle_taper` text DEFAULT '' NOT NULL,
	`max_spindle_speed` integer,
	`magazine_capacity` integer,
	`max_tool_length` text DEFAULT '' NOT NULL,
	`max_tool_diameter` text DEFAULT '' NOT NULL,
	`max_tool_weight` real,
	`table_size` text DEFAULT '' NOT NULL,
	`axis_travel` text DEFAULT '' NOT NULL,
	`table_load_capacity` real,
	`max_workpiece_size` text DEFAULT '' NOT NULL,
	`number_of_tables` integer,
	`photo_path` text,
	`notes` text DEFAULT '' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_machines`(
	`id`, `name`, `inventory_number`, `machine_type`, `control_system_type`, `spindle_taper`,
	`max_spindle_speed`, `magazine_capacity`, `max_tool_length`, `max_tool_diameter`, `max_tool_weight`,
	`table_size`, `axis_travel`, `table_load_capacity`, `max_workpiece_size`, `number_of_tables`,
	`photo_path`, `notes`, `created_at`, `updated_at`
)
SELECT
	`id`, `name`, `inventory_number`, `machine_type`, `control_system_type`, `spindle_taper`,
	`max_spindle_speed`, `magazine_capacity`,
	COALESCE(CAST(`max_tool_length` AS TEXT), ''),
	COALESCE(CAST(`max_tool_diameter` AS TEXT), ''),
	`max_tool_weight`,
	`table_size`, `axis_travel`, `table_load_capacity`, `max_workpiece_size`, `number_of_tables`,
	`photo_path`, `notes`, `created_at`, `updated_at`
FROM `machines`;
--> statement-breakpoint
DROP TABLE `machines`;
--> statement-breakpoint
ALTER TABLE `__new_machines` RENAME TO `machines`;
--> statement-breakpoint
PRAGMA foreign_keys=ON;
