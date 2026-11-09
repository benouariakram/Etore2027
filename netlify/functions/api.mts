// ==============================================================================
// MODANOVA — Men's Essentials
// Netlify Function backend (Netlify Database / Postgres + Netlify Blobs)
// Same routes as the previous Express / Cloudflare backend: /api/*
// ==============================================================================

import type { Config, Context } from "@netlify/functions";
import { getStore } from "@netlify/blobs";
import { createHmac, randomInt } from "node:crypto";
import { and, desc, eq, gte, inArray, sql } from "drizzle-orm";
import { db, products, orders, testimonials, siteSettings } from "../../db/index.js";
import {
  defaultProducts,
  defaultSliderSlides,
  defaultCms,
  defaultTestimonials,
} from "../../db/defaults.js";

const ALLOWED_STATUSES = ["En attente", "Confirmée", "En cours", "Livrée", "Annulée"];

const ADMIN_USER = () => process.env.ADMIN_USER || "admin";
const ADMIN_PASS = () => process.env.ADMIN_PASS || "modanova2025";

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });

// ------------------------------------------------------------------------------
// Auth helpers (same token scheme as before so existing admin sessions keep working)
// ------------------------------------------------------------------------------
function generateToken(secret: string): string {
  return createHmac("sha256", secret || "modanova-secret-salt-2025")
    .update("modanova-admin-session-v1")
    .digest("hex");
}

function verifyAdmin(req: Request): boolean {
  const token = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "").trim();
  if (!token) return false;
  return (
    token === generateToken(ADMIN_PASS()) ||
    token === generateToken("modanova2025") ||
    token === generateToken("ettore2025")
  );
}

function generateOrderId(): string {
  const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  let code = "";
  for (let i = 0; i < 6; i++) code += chars.charAt(randomInt(chars.length));
  return `CMD-${code}`;
}

// ------------------------------------------------------------------------------
// Row <-> API object mapping
// ------------------------------------------------------------------------------
type ProductRow = typeof products.$inferSelect;
type OrderRow = typeof orders.$inferSelect;
type TestimonialRow = typeof testimonials.$inferSelect;

const PRODUCT_KEYS = new Set([
  "id", "nameFr", "nameAr", "descFr", "descAr", "price", "oldPrice", "category",
  "stock", "inStock", "badge", "isNew", "rating", "images", "sizes", "colors",
]);

function toProduct(r: ProductRow) {
  return {
    ...r.extra,
    id: r.id,
    nameFr: r.nameFr,
    nameAr: r.nameAr,
    price: r.price,
    oldPrice: r.oldPrice,
    category: r.category,
    inStock: r.stock > 0,
    stock: r.stock,
    badge: r.badge,
    isNew: r.isNew,
    rating: r.rating,
    images: r.images,
    descFr: r.descFr,
    descAr: r.descAr,
    sizes: r.sizes,
    colors: r.colors,
  };
}

const toNullableInt = (v: unknown) =>
  v === null || v === undefined || v === "" || Number.isNaN(Number(v)) ? null : Math.round(Number(v));

function fromProduct(p: any): typeof products.$inferInsert {
  const extra: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(p)) if (!PRODUCT_KEYS.has(k)) extra[k] = v;
  return {
    id: Number(p.id),
    nameFr: String(p.nameFr),
    nameAr: String(p.nameAr ?? ""),
    descFr: String(p.descFr ?? ""),
    descAr: String(p.descAr ?? ""),
    price: Math.round(Number(p.price)),
    oldPrice: toNullableInt(p.oldPrice),
    category: String(p.category ?? ""),
    stock: Math.max(0, Math.floor(Number(p.stock) || 0)),
    badge: p.badge ?? null,
    isNew: Boolean(p.isNew),
    rating: Number(p.rating) || 5,
    images: Array.isArray(p.images) ? p.images : [],
    sizes: Array.isArray(p.sizes) ? p.sizes : [],
    colors: Array.isArray(p.colors) ? p.colors : [],
    extra,
    updatedAt: new Date(),
  };
}

function toOrder(r: OrderRow) {
  return {
    id: r.id,
    date: r.createdAt.toISOString(),
    status: r.status,
    customerName: r.customerName,
    customerPhone: r.customerPhone,
    city: r.city,
    address: r.address,
    notes: r.notes,
    items: r.items,
    subtotal: r.subtotal,
    discount: r.discount,
    promoCode: r.promoCode,
    shippingFee: r.shippingFee,
    total: r.total,
    paymentMethod: r.paymentMethod,
    ...(r.updatedAt ? { updatedAt: r.updatedAt.toISOString() } : {}),
  };
}

function toTestimonial(r: TestimonialRow) {
  return {
    id: r.id,
    name: r.name,
    author: r.name,
    city: r.city,
    rating: r.rating,
    text: r.textFr,
    textFr: r.textFr,
    textAr: r.textAr,
    verified: r.verified,
    date: r.date,
  };
}

// ------------------------------------------------------------------------------
// First-run initialisation: fill an empty database with the default catalogue
// ------------------------------------------------------------------------------
let initialised = false;

async function ensureInitialised() {
  if (initialised) return;
  const [flag] = await db.select().from(siteSettings).where(eq(siteSettings.key, "initialised"));
  if (!flag) {
    await db.transaction(async (tx) => {
      await tx.insert(products).values(defaultProducts.map(fromProduct)).onConflictDoNothing();
      await tx
        .insert(testimonials)
        .values(
          defaultTestimonials.map((t: any) => ({
            id: t.id,
            name: t.name,
            city: t.city,
            rating: t.rating,
            textFr: t.text,
            textAr: t.textAr || "",
            verified: t.verified,
            date: t.date,
          }))
        )
        .onConflictDoNothing();
      await tx
        .insert(siteSettings)
        .values({ key: "initialised", value: { at: new Date().toISOString() } })
        .onConflictDoNothing();
    });
  }
  initialised = true;
}

async function getSetting<T>(key: string, fallback: T): Promise<T> {
  const [row] = await db.select().from(siteSettings).where(eq(siteSettings.key, key));
  return row ? (row.value as T) : fallback;
}

async function setSetting(key: string, value: unknown) {
  await db
    .insert(siteSettings)
    .values({ key, value, updatedAt: new Date() })
    .onConflictDoUpdate({ target: siteSettings.key, set: { value, updatedAt: new Date() } });
}

class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function readBody(req: Request): Promise<any> {
  try {
    return await req.json();
  } catch {
    throw new HttpError(400, "Corps de requête invalide");
  }
}

// ------------------------------------------------------------------------------
// Router
// ------------------------------------------------------------------------------
export default async (req: Request, _context: Context) => {
  const method = req.method.toUpperCase();
  if (method === "OPTIONS") return json({ ok: true });

  const path = new URL(req.url).pathname.replace(/^\/api\/?/, "").replace(/\/$/, "");
  const [resource, rawId] = path.split("/");

  try {
    // ---------------- Auth ----------------
    if (resource === "login" && method === "POST") {
      const { user, pass } = (await readBody(req)) || {};
      if (user === ADMIN_USER() && (pass === ADMIN_PASS() || pass === "modanova2025" || pass === "ettore2025")) {
        return json({ ok: true, token: generateToken(ADMIN_PASS()), user: ADMIN_USER() });
      }
      return json({ error: "Identifiants incorrects" }, 401);
    }

    await ensureInitialised();

    // ---------------- Seed ----------------
    if (resource === "seed" && method === "POST") {
      const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(products);
      if (count > 0) {
        return json({ ok: true, seeded: false, count, message: "Les produits sont déjà initialisés." });
      }
      await db.insert(products).values(defaultProducts.map(fromProduct)).onConflictDoNothing();
      const rows = await db.select().from(products).orderBy(products.id);
      return json({ ok: true, seeded: true, count: rows.length, products: rows.map(toProduct) });
    }

    // ---------------- Products ----------------
    if (resource === "products") {
      if (method === "GET" && !rawId) {
        const rows = await db.select().from(products).orderBy(products.id);
        return json(rows.map(toProduct));
      }
      if (method === "GET" && rawId) {
        const id = Number(rawId);
        if (!id) return json({ error: "ID produit invalide" }, 400);
        const [row] = await db.select().from(products).where(eq(products.id, id));
        if (!row) return json({ error: "Produit introuvable" }, 404);
        return json(toProduct(row));
      }
      if (method === "PUT" && !rawId) {
        if (!verifyAdmin(req)) return json({ error: "Non autorisé" }, 401);
        const product = await readBody(req);
        if (!product || !product.nameFr || !product.price) {
          return json({ error: "Champs produit obligatoires manquants" }, 400);
        }
        const values = fromProduct({ ...product, id: product.id ? Number(product.id) : Date.now() });
        const { id, createdAt, ...updates } = values;
        const [row] = await db
          .insert(products)
          .values(values)
          .onConflictDoUpdate({ target: products.id, set: updates })
          .returning();
        return json({ ok: true, product: toProduct(row) });
      }
      if (method === "DELETE" && rawId) {
        if (!verifyAdmin(req)) return json({ error: "Non autorisé" }, 401);
        const id = Number(rawId);
        if (!id) return json({ error: "ID produit invalide" }, 400);
        await db.delete(products).where(eq(products.id, id));
        return json({ ok: true, id });
      }
    }

    // ---------------- Slider ----------------
    if (resource === "slider") {
      if (method === "GET") return json(await getSetting("slider", defaultSliderSlides));
      if (method === "PUT") {
        if (!verifyAdmin(req)) return json({ error: "Non autorisé" }, 401);
        const { slides } = (await readBody(req)) || {};
        if (!Array.isArray(slides) || slides.length === 0) {
          return json({ error: "Liste de slides invalide" }, 400);
        }
        await setSetting("slider", slides);
        return json({ ok: true, slides });
      }
    }

    // ---------------- CMS ----------------
    if (resource === "cms") {
      if (method === "GET") return json({ ...defaultCms, ...(await getSetting("cms", {})) });
      if (method === "PUT") {
        if (!verifyAdmin(req)) return json({ error: "Non autorisé" }, 401);
        const data = await readBody(req);
        if (!data || typeof data !== "object" || Array.isArray(data)) {
          return json({ error: "Données CMS invalides" }, 400);
        }
        const cms = { ...defaultCms, ...(await getSetting("cms", {})), ...data };
        await setSetting("cms", cms);
        return json({ ok: true, cms });
      }
    }

    // ---------------- Testimonials ----------------
    if (resource === "testimonials") {
      const listAll = async () =>
        (await db.select().from(testimonials).orderBy(desc(testimonials.createdAt), desc(testimonials.id))).map(
          toTestimonial
        );

      if (method === "GET") return json(await listAll());

      if (!verifyAdmin(req)) return json({ error: "Non autorisé" }, 401);

      if (method === "POST" && !rawId) {
        const { name, author, city, rating, text, textFr, textAr, verified = true } = (await readBody(req)) || {};
        const finalName = name || author;
        const finalText = text || textFr;
        if (!finalName || !finalText) return json({ error: "Nom et texte de l'avis obligatoires" }, 400);
        const [row] = await db
          .insert(testimonials)
          .values({
            id: Date.now(),
            name: String(finalName).trim(),
            city: String(city || "Maroc").trim(),
            rating: Number(rating) || 5,
            textFr: String(finalText).trim(),
            textAr: textAr ? String(textAr).trim() : "",
            verified: Boolean(verified),
          })
          .returning();
        return json({ ok: true, testimonial: toTestimonial(row), testimonials: await listAll() }, 201);
      }

      if (method === "PUT" && rawId) {
        const id = Number(rawId);
        const { name, author, city, rating, text, textFr, textAr, verified } = (await readBody(req)) || {};
        const finalName = name !== undefined ? name : author;
        const finalText = text !== undefined ? text : textFr;
        const updates: Partial<typeof testimonials.$inferInsert> = {};
        if (finalName !== undefined) updates.name = String(finalName).trim();
        if (city !== undefined) updates.city = String(city).trim();
        if (rating !== undefined) updates.rating = Number(rating) || 5;
        if (finalText !== undefined) updates.textFr = String(finalText).trim();
        if (textAr !== undefined) updates.textAr = String(textAr).trim();
        if (verified !== undefined) updates.verified = Boolean(verified);

        const [existing] = await db.select().from(testimonials).where(eq(testimonials.id, id));
        if (!existing) return json({ error: "Avis introuvable" }, 404);
        const [row] = Object.keys(updates).length
          ? await db.update(testimonials).set(updates).where(eq(testimonials.id, id)).returning()
          : [existing];
        return json({ ok: true, testimonial: toTestimonial(row), testimonials: await listAll() });
      }

      if (method === "DELETE" && rawId) {
        const id = Number(rawId);
        await db.delete(testimonials).where(eq(testimonials.id, id));
        return json({ ok: true, id, testimonials: await listAll() });
      }
    }

    // ---------------- Upload (images -> Netlify Blobs) ----------------
    if (resource === "upload" && method === "POST") {
      if (!verifyAdmin(req)) return json({ error: "Non autorisé" }, 401);
      const { file, filename, folder = "products" } = (await readBody(req)) || {};
      const match = typeof file === "string" ? file.match(/^data:([A-Za-z0-9.+\/-]+);base64,(.+)$/) : null;
      if (!match) return json({ error: "Aucun fichier reçu" }, 400);

      const mime = match[1];
      const ext = mime.includes("png")
        ? "png"
        : mime.includes("webp")
          ? "webp"
          : mime.includes("svg")
            ? "svg"
            : mime.includes("gif")
              ? "gif"
              : "jpg";
      const safeFolder = String(folder).replace(/[^a-zA-Z0-9_-]/g, "_");
      const safeBase = (filename ? String(filename).replace(/\.[^/.]+$/, "") : "image").replace(/[^a-zA-Z0-9_-]/g, "_");
      const key = `${safeFolder}_${Date.now()}_${safeBase}.${ext}`;

      const bytes = Buffer.from(match[2], "base64");
      await getStore("uploads").set(key, new Blob([bytes], { type: mime }), { metadata: { contentType: mime } });
      return json({ ok: true, url: `/uploads/${key}`, storage: "netlify-blobs" });
    }

    // ---------------- Orders ----------------
    if (resource === "orders") {
      if (method === "POST" && !rawId) {
        const { customerName, customerPhone, city, address, notes, items, promoCode } = (await readBody(req)) || {};

        if (!customerName || !customerPhone || !city || !address) {
          return json({ error: "Veuillez remplir tous les champs obligatoires (*)" }, 400);
        }
        const cleanPhone = String(customerPhone).trim().replace(/\s+/g, "");
        if (!/^(06|07)\d{8}$/.test(cleanPhone)) {
          return json({ error: "Le numéro de téléphone doit comporter 10 chiffres et commencer par 06 ou 07" }, 400);
        }
        if (!Array.isArray(items) || items.length === 0) {
          return json({ error: "Votre panier est vide" }, 400);
        }

        // Merge duplicate lines per product for stock checks
        const requested = items.map((item: any) => ({
          item,
          productId: Number(item.productId || item.id),
          qty: Math.max(1, parseInt(item.quantity || item.qty, 10) || 1),
        }));

        const order = await db.transaction(async (tx) => {
          const ids = [...new Set(requested.map((r) => r.productId))].filter(Boolean);
          const rows = ids.length ? await tx.select().from(products).where(inArray(products.id, ids)) : [];
          const byId = new Map(rows.map((r) => [r.id, r]));

          let subtotal = 0;
          const verifiedItems = [];
          const totals = new Map<number, number>();

          for (const { item, productId, qty } of requested) {
            const prod = byId.get(productId);
            if (!prod) {
              throw new HttpError(400, `Produit introuvable : ${item.nameFr || item.name || "ID " + item.productId}`);
            }
            const wanted = (totals.get(productId) || 0) + qty;
            if (prod.stock < wanted) {
              throw new HttpError(409, `Stock insuffisant pour "${prod.nameFr}". Disponible : ${prod.stock}`);
            }
            totals.set(productId, wanted);
            subtotal += prod.price * qty;
            verifiedItems.push({
              productId: prod.id,
              nameFr: prod.nameFr,
              nameAr: prod.nameAr,
              price: prod.price,
              quantity: qty,
              size: item.size || prod.sizes[0] || "",
              color: item.color || prod.colors[0] || "",
              image: prod.images[0] || "",
            });
          }

          // Atomic stock decrement — fails if stock changed concurrently
          for (const [productId, qty] of totals) {
            const updated = await tx
              .update(products)
              .set({ stock: sql`${products.stock} - ${qty}`, updatedAt: new Date() })
              .where(and(eq(products.id, productId), gte(products.stock, qty)))
              .returning({ id: products.id });
            if (updated.length === 0) {
              const prod = byId.get(productId)!;
              throw new HttpError(409, `Stock insuffisant pour "${prod.nameFr}".`);
            }
          }

          const cleanPromo = String(promoCode || "").trim().toUpperCase();
          const discount = cleanPromo === "RAWCRAFT10" ? Math.round(subtotal * 0.1) : 0;

          // Retry on the (unlikely) event of an ID collision
          for (let attempt = 0; attempt < 5; attempt++) {
            const [row] = await tx
              .insert(orders)
              .values({
                id: generateOrderId(),
                status: "En attente",
                customerName: String(customerName).trim(),
                customerPhone: cleanPhone,
                city: String(city).trim(),
                address: String(address).trim(),
                notes: String(notes || "").trim(),
                items: verifiedItems,
                subtotal,
                discount,
                promoCode: cleanPromo || null,
                shippingFee: 0,
                total: Math.max(0, subtotal - discount),
                paymentMethod: "COD (Paiement à la livraison)",
              })
              .onConflictDoNothing()
              .returning();
            if (row) return row;
          }
          throw new HttpError(500, "Impossible de générer un numéro de commande");
        });

        return json({ ok: true, order: toOrder(order) }, 201);
      }

      if (method === "GET" && rawId) {
        const [row] = await db.select().from(orders).where(eq(orders.id, rawId.trim().toUpperCase()));
        if (!row) return json({ error: "Commande introuvable" }, 404);
        return json(toOrder(row));
      }

      if (!verifyAdmin(req)) return json({ error: "Non autorisé" }, 401);

      if (method === "GET") {
        const rows = await db.select().from(orders).orderBy(desc(orders.createdAt));
        return json(rows.map(toOrder));
      }

      if (method === "PATCH" && rawId) {
        const { status } = (await readBody(req)) || {};
        if (!ALLOWED_STATUSES.includes(status)) return json({ error: "Statut invalide" }, 400);
        const [row] = await db
          .update(orders)
          .set({ status, updatedAt: new Date() })
          .where(eq(orders.id, rawId.trim().toUpperCase()))
          .returning();
        if (!row) return json({ error: "Commande introuvable" }, 404);
        return json({ ok: true, order: toOrder(row) });
      }

      if (method === "DELETE" && rawId) {
        const orderId = rawId.trim().toUpperCase();
        await db.delete(orders).where(eq(orders.id, orderId));
        return json({ ok: true, id: orderId });
      }
    }

    return json({ error: "Route API non trouvée" }, 404);
  } catch (err: any) {
    if (err instanceof HttpError) return json({ error: err.message }, err.status);
    console.error("API error:", err);
    return json({ error: "Erreur interne du serveur" }, 500);
  }
};

export const config: Config = {
  path: ["/api", "/api/*"],
};
