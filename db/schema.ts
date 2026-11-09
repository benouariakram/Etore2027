import {
  pgTable,
  bigint,
  integer,
  text,
  boolean,
  jsonb,
  timestamp,
  date,
  index,
} from "drizzle-orm/pg-core";

// Catalogue produits
export const products = pgTable(
  "products",
  {
    id: bigint({ mode: "number" }).primaryKey(),
    nameFr: text("name_fr").notNull(),
    nameAr: text("name_ar").notNull().default(""),
    descFr: text("desc_fr").notNull().default(""),
    descAr: text("desc_ar").notNull().default(""),
    price: integer().notNull(),
    oldPrice: integer("old_price"),
    category: text().notNull().default(""),
    stock: integer().notNull().default(0),
    badge: text(),
    isNew: boolean("is_new").notNull().default(false),
    rating: integer().notNull().default(5),
    images: jsonb().$type<string[]>().notNull().default([]),
    sizes: jsonb().$type<string[]>().notNull().default([]),
    colors: jsonb().$type<string[]>().notNull().default([]),
    // Any additional fields sent by the admin panel
    extra: jsonb().$type<Record<string, unknown>>().notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("products_category_idx").on(t.category)]
);

export type OrderItem = {
  productId: number;
  nameFr: string;
  nameAr: string;
  price: number;
  quantity: number;
  size: string;
  color: string;
  image: string;
};

// Commandes (paiement à la livraison)
export const orders = pgTable(
  "orders",
  {
    id: text().primaryKey(), // CMD-XXXXXX
    status: text().notNull().default("En attente"),
    customerName: text("customer_name").notNull(),
    customerPhone: text("customer_phone").notNull(),
    city: text().notNull(),
    address: text().notNull(),
    notes: text().notNull().default(""),
    items: jsonb().$type<OrderItem[]>().notNull(),
    subtotal: integer().notNull(),
    discount: integer().notNull().default(0),
    promoCode: text("promo_code"),
    shippingFee: integer("shipping_fee").notNull().default(0),
    total: integer().notNull(),
    paymentMethod: text("payment_method").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (t) => [
    index("orders_created_at_idx").on(t.createdAt.desc()),
    index("orders_status_idx").on(t.status),
  ]
);

// Avis clients
export const testimonials = pgTable("testimonials", {
  id: bigint({ mode: "number" }).primaryKey(),
  name: text().notNull(),
  city: text().notNull().default("Maroc"),
  rating: integer().notNull().default(5),
  textFr: text("text_fr").notNull(),
  textAr: text("text_ar").notNull().default(""),
  verified: boolean().notNull().default(true),
  date: date({ mode: "string" }).notNull().defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// Réglages du site (slider, CMS, ...) stockés en clé / valeur
export const siteSettings = pgTable("site_settings", {
  key: text().primaryKey(),
  value: jsonb().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
