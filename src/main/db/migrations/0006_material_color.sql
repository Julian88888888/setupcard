ALTER TABLE `materials` ADD `color` text DEFAULT '#7A8B99' NOT NULL;
--> statement-breakpoint
UPDATE `materials` SET `color` = '#6B7280' WHERE `category` = 'steel';
--> statement-breakpoint
UPDATE `materials` SET `color` = '#94A3B8' WHERE `category` = 'stainless';
--> statement-breakpoint
UPDATE `materials` SET `color` = '#A8B4C0' WHERE `category` = 'aluminum';
--> statement-breakpoint
UPDATE `materials` SET `color` = '#4B5563' WHERE `category` = 'cast_iron';
--> statement-breakpoint
UPDATE `materials` SET `color` = '#B45309' WHERE `category` = 'copper';
--> statement-breakpoint
UPDATE `materials` SET `color` = '#9CA3AF' WHERE `category` = 'titanium';
--> statement-breakpoint
UPDATE `materials` SET `color` = '#0EA5E9' WHERE `category` = 'plastic';
--> statement-breakpoint
UPDATE `materials` SET `color` = '#7A8B99' WHERE `category` = 'other';
