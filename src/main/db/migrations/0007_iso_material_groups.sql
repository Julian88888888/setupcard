-- Remap legacy category keys → ISO 513 groups (P/M/K/N/S/H)
UPDATE `materials` SET `category` = 'P' WHERE `category` IN ('steel', 'P');
--> statement-breakpoint
UPDATE `materials` SET `category` = 'M' WHERE `category` IN ('stainless', 'M');
--> statement-breakpoint
UPDATE `materials` SET `category` = 'K' WHERE `category` IN ('cast_iron', 'K');
--> statement-breakpoint
UPDATE `materials` SET `category` = 'N' WHERE `category` IN ('aluminum', 'copper', 'plastic', 'N');
--> statement-breakpoint
UPDATE `materials` SET `category` = 'S' WHERE `category` IN ('titanium', 'S');
--> statement-breakpoint
UPDATE `materials` SET `category` = 'H' WHERE `category` IN ('other', 'H') OR `category` NOT IN ('P', 'M', 'K', 'N', 'S', 'H');
--> statement-breakpoint
-- Apply packaging colors by ISO group
UPDATE `materials` SET `color` = '#1E5AA8' WHERE `category` = 'P';
--> statement-breakpoint
UPDATE `materials` SET `color` = '#E8B923' WHERE `category` = 'M';
--> statement-breakpoint
UPDATE `materials` SET `color` = '#C62828' WHERE `category` = 'K';
--> statement-breakpoint
UPDATE `materials` SET `color` = '#2E7D32' WHERE `category` = 'N';
--> statement-breakpoint
UPDATE `materials` SET `color` = '#8D4E2A' WHERE `category` = 'S';
--> statement-breakpoint
UPDATE `materials` SET `color` = '#424242' WHERE `category` = 'H';
