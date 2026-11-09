CREATE TABLE "orders" (
	"id" text PRIMARY KEY,
	"status" text DEFAULT 'En attente' NOT NULL,
	"customer_name" text NOT NULL,
	"customer_phone" text NOT NULL,
	"city" text NOT NULL,
	"address" text NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"items" jsonb NOT NULL,
	"subtotal" integer NOT NULL,
	"discount" integer DEFAULT 0 NOT NULL,
	"promo_code" text,
	"shipping_fee" integer DEFAULT 0 NOT NULL,
	"total" integer NOT NULL,
	"payment_method" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" bigint PRIMARY KEY,
	"name_fr" text NOT NULL,
	"name_ar" text DEFAULT '' NOT NULL,
	"desc_fr" text DEFAULT '' NOT NULL,
	"desc_ar" text DEFAULT '' NOT NULL,
	"price" integer NOT NULL,
	"old_price" integer,
	"category" text DEFAULT '' NOT NULL,
	"stock" integer DEFAULT 0 NOT NULL,
	"badge" text,
	"is_new" boolean DEFAULT false NOT NULL,
	"rating" integer DEFAULT 5 NOT NULL,
	"images" jsonb DEFAULT '[]' NOT NULL,
	"sizes" jsonb DEFAULT '[]' NOT NULL,
	"colors" jsonb DEFAULT '[]' NOT NULL,
	"extra" jsonb DEFAULT '{}' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "site_settings" (
	"key" text PRIMARY KEY,
	"value" jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "testimonials" (
	"id" bigint PRIMARY KEY,
	"name" text NOT NULL,
	"city" text DEFAULT 'Maroc' NOT NULL,
	"rating" integer DEFAULT 5 NOT NULL,
	"text_fr" text NOT NULL,
	"text_ar" text DEFAULT '' NOT NULL,
	"verified" boolean DEFAULT true NOT NULL,
	"date" date DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "orders_created_at_idx" ON "orders" ("created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "orders_status_idx" ON "orders" ("status");--> statement-breakpoint
CREATE INDEX "products_category_idx" ON "products" ("category");