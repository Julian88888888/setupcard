CREATE TABLE IF NOT EXISTS "settings" (
	"key" text PRIMARY KEY NOT NULL,
	"value" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "machines" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"inventory_number" text NOT NULL,
	"machine_type" text DEFAULT '' NOT NULL,
	"control_system_type" text DEFAULT '' NOT NULL,
	"spindle_taper" text DEFAULT '' NOT NULL,
	"max_spindle_speed" integer,
	"magazine_capacity" integer,
	"max_tool_length" text DEFAULT '' NOT NULL,
	"max_tool_diameter" text DEFAULT '' NOT NULL,
	"max_tool_weight" real,
	"table_size" text DEFAULT '' NOT NULL,
	"axis_travel" text DEFAULT '' NOT NULL,
	"table_load_capacity" real,
	"max_workpiece_size" text DEFAULT '' NOT NULL,
	"number_of_tables" integer,
	"photo_path" text,
	"notes" text DEFAULT '' NOT NULL,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "materials" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"category" text DEFAULT 'P' NOT NULL,
	"color" text DEFAULT '#1E5AA8' NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL,
	CONSTRAINT "materials_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "workpiece_types" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL,
	CONSTRAINT "workpiece_types_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "parts" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"material_id" integer,
	"workpiece_type_id" integer,
	"notes" text DEFAULT '' NOT NULL,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "part_photos" (
	"id" serial PRIMARY KEY NOT NULL,
	"part_id" integer NOT NULL,
	"photo_path" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "parts" ADD CONSTRAINT "parts_material_id_materials_id_fk" FOREIGN KEY ("material_id") REFERENCES "public"."materials"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "parts" ADD CONSTRAINT "parts_workpiece_type_id_workpiece_types_id_fk" FOREIGN KEY ("workpiece_type_id") REFERENCES "public"."workpiece_types"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "part_photos" ADD CONSTRAINT "part_photos_part_id_parts_id_fk" FOREIGN KEY ("part_id") REFERENCES "public"."parts"("id") ON DELETE cascade ON UPDATE no action;
