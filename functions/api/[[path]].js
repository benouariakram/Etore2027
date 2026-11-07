// ==============================================================================
// ETTORE — Men's Essentials
// Cloudflare Pages Functions Backend (D1 Database Binding "DB")
// File: functions/api/[[path]].js
// ==============================================================================

const ALLOWED_STATUSES = [
  "En attente",
  "Confirmée",
  "En cours",
  "Livrée",
  "Annulée"
];

// Helper pour réponse JSON avec en-têtes CORS
function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      ...headers
    }
  });
}

// Génération HMAC-SHA256 avec Web Crypto API
async function generateToken(secret) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret || "ettore-secret-salt-2025"),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    enc.encode("ettore-admin-session-v1")
  );
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

// Vérification du token admin
async function verifyAdmin(request, env) {
  const authHeader = request.headers.get("Authorization") || "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  if (!token) return false;

  const adminPass = env.ADMIN_PASS || "ettore2025";
  const expectedToken = await generateToken(adminPass);
  return token === expectedToken;
}

// Générateur d'ID commande unique "CMD-XXXXXX"
function generateOrderId() {
  const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `CMD-${code}`;
}

// 6 Produits initiaux par défaut
function getDefaultProducts() {
  return [
    {
      id: 1,
      nameFr: "Mules Cuir Artisanales",
      nameAr: "نعال جلدية تقليدية فاخرة",
      price: 1450,
      oldPrice: 1750,
      category: "chaussures",
      inStock: true,
      stock: 7,
      badge: "exclusive",
      isNew: true,
      rating: 5,
      images: [
        "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 600' width='800' height='600'><rect width='800' height='600' fill='%23F3F1EC'/><g transform='translate(150, 160)'><ellipse cx='250' cy='220' rx='210' ry='35' fill='%23E5E0D8'/><path d='M80,180 C110,120 220,90 320,110 C390,125 430,165 410,195 C380,215 260,225 150,220 C100,218 70,200 80,180 Z' fill='%234A3525' stroke='%23342315' stroke-width='4'/><path d='M100,175 C140,135 220,115 300,130 C330,135 340,150 320,170 C270,185 180,190 120,185 Z' fill='%23634731'/><path d='M90,190 C150,210 270,210 390,185' stroke='%23C28B53' stroke-dasharray='4,4' stroke-width='2' fill='none'/><text x='250' y='270' font-family='serif' font-size='20' fill='%239E8C7A' text-anchor='middle' letter-spacing='4'>ETTORE ATELIER</text></g></svg>",
        "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 600' width='800' height='600'><rect width='800' height='600' fill='%23ECE8E1'/><g transform='translate(180, 140)'><ellipse cx='220' cy='240' rx='180' ry='30' fill='%23DDD7CD'/><path d='M60,190 C90,110 200,80 300,100 C370,115 400,160 380,190 C350,210 230,220 130,215 Z' fill='%23342315'/><text x='220' y='270' font-family='serif' font-size='18' fill='%239E8C7A' text-anchor='middle' letter-spacing='3'>SEMELLE VEGETALE</text></g></svg>"
      ],
      descFr: "Façonnées à la main par nos maîtres maroquiniers à Fès. Cuir de veau pleine fleur au tannage végétal, doublure respirante et semelle anatomique souple pour une élégance décontractée sans compromis.",
      descAr: "مصنوعة يدوياً على أيدي أمهر الحرفيين في فاس. جلد عجل طبيعي مدبوغ نباتياً، بطانة مريحة ونعل تشريحي مرن يجمع بين الأصالة والأناقة العصرية.",
      sizes: ["40", "41", "42", "43", "44", "45"],
      colors: ["#3D2B1F", "#171717", "#8B5A2B"]
    },
    {
      id: 2,
      nameFr: "Sérum Botanique Visage & Barbe",
      nameAr: "سيروم نباتي مركز للوجه واللحية",
      price: 680,
      oldPrice: 820,
      category: "soins",
      inStock: true,
      stock: 4,
      badge: "luxury",
      isNew: true,
      rating: 5,
      images: [
        "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 600' width='800' height='600'><rect width='800' height='600' fill='%23F3F1EC'/><g transform='translate(280, 80)'><ellipse cx='120' cy='430' rx='90' ry='20' fill='%23E5E0D8'/><rect x='60' y='180' width='120' height='230' rx='20' fill='%238A4B1A' opacity='0.9'/><rect x='85' y='120' width='70' height='60' fill='%23171717'/><rect x='105' y='60' width='30' height='60' rx='6' fill='%23222'/><rect x='75' y='230' width='90' height='130' fill='%23FAF9F6'/><text x='120' y='270' font-family='serif' font-size='15' font-weight='bold' fill='%23171717' text-anchor='middle'>ETTORE</text><line x1='90' y1='285' x2='150' y2='285' stroke='%23C28B53' stroke-width='1.5'/><text x='120' y='305' font-family='sans-serif' font-size='9' fill='%23444' text-anchor='middle' letter-spacing='1'>SÉRUM PUR</text><text x='120' y='325' font-family='sans-serif' font-size='8' fill='%239E8C7A' text-anchor='middle'>50 ML / 1.7 FL.OZ</text></g></svg>",
        "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 600' width='800' height='600'><rect width='800' height='600' fill='%23ECE8E1'/><g transform='translate(300, 100)'><rect x='50' y='160' width='100' height='200' rx='16' fill='%236B3912'/><circle cx='100' cy='260' r='35' fill='%23FAF9F6' opacity='0.9'/><text x='100' y='265' font-family='serif' font-size='12' fill='%23171717' text-anchor='middle'>100% BIO</text></g></svg>"
      ],
      descFr: "Élixir concentré d'huile de figue de barbarie du Souss, nigelle d'Égypte et cèdre de l'Atlas. Apaise le feu du rasage, hydrate en profondeur et discipline la barbe sans film gras.",
      descAr: "مستخلص مركز من زيت بذور التين الشوكي وزيت الحبة السوداء وخشب الأرز الأطلسي. يهدئ البشرة بعد الحلاقة، يرطب بعمق ويغذي اللحية دون أي ملمس دهني.",
      sizes: ["50ml", "100ml"],
      colors: ["#8A4B1A"]
    },
    {
      id: 3,
      nameFr: "Huile Sèche Précieuse Atlas",
      nameAr: "زيت جاف فاخر بخلاصة الأطلس",
      price: 590,
      oldPrice: null,
      category: "soins",
      inStock: true,
      stock: 8,
      badge: "new",
      isNew: true,
      rating: 5,
      images: [
        "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 600' width='800' height='600'><rect width='800' height='600' fill='%23F3F1EC'/><g transform='translate(290, 90)'><ellipse cx='110' cy='420' rx='80' ry='18' fill='%23E5E0D8'/><rect x='50' y='170' width='120' height='220' rx='24' fill='%23C28B53' opacity='0.85'/><rect x='85' y='110' width='50' height='60' fill='%23222'/><circle cx='110' cy='90' r='16' fill='%23171717'/><rect x='68' y='220' width='84' height='120' fill='%23FAF9F6'/><text x='110' y='260' font-family='serif' font-size='14' font-weight='bold' fill='%23171717' text-anchor='middle'>ETTORE</text><text x='110' y='285' font-family='sans-serif' font-size='8' fill='%23444' text-anchor='middle' letter-spacing='1'>HUILE SÈCHE</text><text x='110' y='305' font-family='sans-serif' font-size='7' fill='%239E8C7A' text-anchor='middle'>ARGAN & NÉROLI</text></g></svg>"
      ],
      descFr: "Texture satinée non comédogène infusée à l'argan biologique et néroli de Khemisset. Pénétration instantanée, parfum subtil boisé et ambré.",
      descAr: "قوام حريري سريع الامتصاص غني بزيت الأركان العضوي وزهر البرتقال. يمنح البشرة إشراقة طبيعية ورائحة خشبية عنبرية راقية.",
      sizes: ["100ml"],
      colors: ["#C28B53"]
    },
    {
      id: 4,
      nameFr: "Peignoir en Lin et Coton Lavé",
      nameAr: "رداء حمام فاخر من الكتان والقطن المغسول",
      price: 2200,
      oldPrice: 2600,
      category: "maison",
      inStock: true,
      stock: 3,
      badge: "exclusive",
      isNew: false,
      rating: 5,
      images: [
        "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 600' width='800' height='600'><rect width='800' height='600' fill='%23F3F1EC'/><g transform='translate(220, 70)'><path d='M100,80 L260,80 L320,160 L280,440 L80,440 L40,160 Z' fill='%23DCD6CD'/><path d='M180,80 L120,240 L180,440 L180,80 Z' fill='%23CBC3B7'/><path d='M80,260 L280,260' stroke='%239E8C7A' stroke-width='14'/><circle cx='180' cy='260' r='12' fill='%236B5E51'/><text x='180' y='490' font-family='serif' font-size='18' fill='%239E8C7A' text-anchor='middle' letter-spacing='2'>LIN PRÉ-LAVÉ 380G/M²</text></g></svg>"
      ],
      descFr: "Tissé selon un grammage généreux de 380g/m². Col châle élégant, poches plaquées profondes et ceinture renforcée. Douceur aérienne et absorption optimale après le bain.",
      descAr: "منسوج بكثافة فاخرة 380 غرام/م². ياقة شال أنيقة مع جيوب عميقة وحزام متين. يوفر راحة فائقة وامتصاصاً مثالياً بعد الاستحمام.",
      sizes: ["M", "L", "XL"],
      colors: ["#DCD6CD", "#2C302E", "#171717"]
    },
    {
      id: 5,
      nameFr: "Tasse Céramique Artisanale",
      nameAr: "كوب قهوة خزفي مصنوع يدوياً",
      price: 320,
      oldPrice: null,
      category: "maison",
      inStock: false,
      stock: 0,
      badge: "out",
      isNew: false,
      rating: 4,
      images: [
        "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 600' width='800' height='600'><rect width='800' height='600' fill='%23F3F1EC'/><g transform='translate(280, 150)'><ellipse cx='120' cy='320' rx='90' ry='20' fill='%23E5E0D8'/><path d='M60,110 L180,110 L165,280 C165,300 75,300 75,280 Z' fill='%23DDD6CD' stroke='%239E8C7A' stroke-width='3'/><path d='M175,150 C210,150 210,230 170,240' stroke='%239E8C7A' stroke-width='8' fill='none'/><rect x='70' y='265' width='100' height='20' fill='%239E8C7A'/><text x='120' y='360' font-family='serif' font-size='16' fill='%239E8C7A' text-anchor='middle'>ÉDITION LIMITÉE SAFI</text></g></svg>"
      ],
      descFr: "Grès chamotté tourné à la main dans les ateliers historiques de Safi. Émail mat minéral coquille d'œuf et base brute texturée. Chaque pièce est unique.",
      descAr: "مصنوع يدوياً من الطين النقي في ورشات آسفي التاريخية. طلاء خزفي معدني غير لامع وقاعدة رملية خشنة. كل قطعة فريدة من نوعها.",
      sizes: ["250ml"],
      colors: ["#DDD6CD", "#171717"]
    },
    {
      id: 6,
      nameFr: "Plaid Laine Mérinos Peignée",
      nameAr: "غطاء فاخر من صوف الميرينو الممشط",
      price: 1650,
      oldPrice: 1950,
      category: "maison",
      inStock: true,
      stock: 5,
      badge: "luxury",
      isNew: false,
      rating: 5,
      images: [
        "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 600' width='800' height='600'><rect width='800' height='600' fill='%23F3F1EC'/><g transform='translate(220, 120)'><rect x='40' y='80' width='280' height='180' rx='12' fill='%239E8C7A'/><rect x='60' y='110' width='240' height='160' rx='8' fill='%23857565'/><rect x='80' y='140' width='200' height='140' rx='6' fill='%23FAF9F6'/><path d='M80,280 L280,280' stroke='%23C28B53' stroke-width='4' stroke-dasharray='6,6'/><text x='180' y='330' font-family='serif' font-size='16' fill='%23171717' text-anchor='middle'>MÉRINOS EXTRA-FIN 140x200 CM</text></g></svg>"
      ],
      descFr: "Tissage chevrons d'une finesse incomparable. Chaleur thermorégulatrice naturelle, franges torsadées nouées à la main. Idéal pour votre salon ou chambre de maître.",
      descAr: "نسيج كلاسيكي بنقشة متعرجة فائقة النعومة. صوف ميرينو طبيعي عازل للحرارة مع أطراف مجدولة يدوياً تضفي لمسة فخامة على مجلسك.",
      sizes: ["140x200cm"],
      colors: ["#9E8C7A", "#2C302E", "#FAF9F6"]
    }
  ];
}

// Router principal Cloudflare Pages Functions
export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const path = url.pathname.replace(/^\/api\/?/, "");
  const method = request.method.toUpperCase();

  // OPTIONS preflight
  if (method === "OPTIONS") {
    return json({ ok: true });
  }

  const db = env.DB;
  if (!db) {
    return json(
      { error: "Binding Cloudflare D1 'DB' manquant dans les paramètres du projet." },
      500
    );
  }

  try {
    // --------------------------------------------------------------------------
    // AUTH ADMIN: POST /api/login
    // --------------------------------------------------------------------------
    if (path === "login" && method === "POST") {
      let body;
      try {
        body = await request.json();
      } catch {
        return json({ error: "Corps de requête invalide" }, 400);
      }
      const { user, pass } = body || {};
      const expectedUser = env.ADMIN_USER || "admin";
      const expectedPass = env.ADMIN_PASS || "ettore2025";

      if (user === expectedUser && pass === expectedPass) {
        const token = await generateToken(expectedPass);
        return json({ ok: true, token, user: expectedUser });
      } else {
        return json({ error: "Identifiants incorrects" }, 401);
      }
    }

    // --------------------------------------------------------------------------
    // SEED: POST /api/seed (public, si table vide)
    // --------------------------------------------------------------------------
    if (path === "seed" && method === "POST") {
      const countRes = await db.prepare("SELECT COUNT(*) AS total FROM products").first();
      const count = countRes?.total || 0;
      if (count > 0) {
        return json({ ok: true, seeded: false, count, message: "Les produits sont déjà initialisés." });
      }

      const defaults = getDefaultProducts();
      const stmts = defaults.map(p =>
        db.prepare("INSERT INTO products (id, data) VALUES (?, ?)").bind(p.id, JSON.stringify(p))
      );
      await db.batch(stmts);
      return json({ ok: true, seeded: true, count: defaults.length, products: defaults });
    }

    // --------------------------------------------------------------------------
    // PRODUITS: GET /api/products (public)
    // --------------------------------------------------------------------------
    if (path === "products" && method === "GET") {
      const { results } = await db.prepare("SELECT data FROM products ORDER BY id ASC").all();
      const list = (results || []).map(r => {
        try {
          return JSON.parse(r.data);
        } catch {
          return null;
        }
      }).filter(Boolean);

      // Si la base est encore vide, on propose les produits de secours
      if (list.length === 0) {
        return json(getDefaultProducts());
      }
      return json(list);
    }

    // --------------------------------------------------------------------------
    // PRODUITS: GET /api/products/:id (public get single product)
    // --------------------------------------------------------------------------
    if (path.startsWith("products/") && method === "GET") {
      const id = Number(path.replace("products/", ""));
      if (!id) return json({ error: "ID produit invalide" }, 400);
      const row = await db.prepare("SELECT data FROM products WHERE id = ?").bind(id).first();
      if (!row || !row.data) return json({ error: "Produit introuvable" }, 404);
      return json(JSON.parse(row.data));
    }

    // --------------------------------------------------------------------------
    // PRODUITS: PUT /api/products (admin upsert)
    // --------------------------------------------------------------------------
    if (path === "products" && method === "PUT") {
      if (!(await verifyAdmin(request, env))) {
        return json({ error: "Non autorisé" }, 401);
      }

      const product = await request.json();
      if (!product || !product.nameFr || !product.price) {
        return json({ error: "Champs produit obligatoires manquants" }, 400);
      }

      const id = product.id ? Number(product.id) : Date.now();
      const payload = {
        ...product,
        id,
        inStock: Number(product.stock) > 0,
        stock: Number(product.stock) || 0
      };

      await db.prepare(
        "INSERT INTO products (id, data) VALUES (?, ?) ON CONFLICT(id) DO UPDATE SET data = excluded.data"
      ).bind(id, JSON.stringify(payload)).run();

      return json({ ok: true, product: payload });
    }

    // --------------------------------------------------------------------------
    // PRODUITS: DELETE /api/products/:id (admin)
    // --------------------------------------------------------------------------
    if (path.startsWith("products/") && method === "DELETE") {
      if (!(await verifyAdmin(request, env))) {
        return json({ error: "Non autorisé" }, 401);
      }

      const id = Number(path.replace("products/", ""));
      if (!id) return json({ error: "ID produit invalide" }, 400);

      await db.prepare("DELETE FROM products WHERE id = ?").bind(id).run();
      return json({ ok: true, id });
    }

    // --------------------------------------------------------------------------
    // COMMANDES: POST /api/orders (public checkout)
    // --------------------------------------------------------------------------
    if (path === "orders" && method === "POST") {
      let body;
      try {
        body = await request.json();
      } catch {
        return json({ error: "Données de commande invalides" }, 400);
      }

      const { customerName, customerPhone, city, address, notes, items, promoCode } = body || {};

      // Validation des champs obligatoires
      if (!customerName || !customerPhone || !city || !address) {
        return json({ error: "Veuillez remplir tous les champs obligatoires (*)" }, 400);
      }

      // Validation stricte du téléphone marocain: 06 ou 07 suivi de 8 chiffres
      const phoneRegex = /^(06|07)\d{8}$/;
      const cleanPhone = String(customerPhone).trim().replace(/\s+/g, "");
      if (!phoneRegex.test(cleanPhone)) {
        return json({ error: "Le numéro de téléphone doit comporter 10 chiffres et commencer par 06 ou 07" }, 400);
      }

      if (!Array.isArray(items) || items.length === 0) {
        return json({ error: "Votre panier est vide" }, 400);
      }

      // Récupération de tous les produits en base pour calcul sécurisé des prix et stocks
      const { results } = await db.prepare("SELECT id, data FROM products").all();
      const productMap = new Map();
      (results || []).forEach(r => {
        try {
          const p = JSON.parse(r.data);
          productMap.set(Number(p.id), p);
        } catch {}
      });

      // Si base vide, repli sur produits initiaux
      if (productMap.size === 0) {
        getDefaultProducts().forEach(p => productMap.set(p.id, p));
      }

      // Vérification des stocks et recalcul des totaux
      let subtotal = 0;
      const verifiedItems = [];
      const stockUpdates = [];

      for (const item of items) {
        const prod = productMap.get(Number(item.productId || item.id));
        if (!prod) {
          return json({ error: `Produit introuvable : ${item.nameFr || item.name || 'ID ' + item.productId}` }, 400);
        }

        const qty = Math.max(1, parseInt(item.quantity || item.qty, 10) || 1);
        if (prod.stock < qty) {
          return json({
            error: `Stock insuffisant pour "${prod.nameFr}". Disponible : ${prod.stock}`
          }, 409);
        }

        const linePrice = Number(prod.price);
        subtotal += linePrice * qty;

        verifiedItems.push({
          productId: prod.id,
          nameFr: prod.nameFr,
          nameAr: prod.nameAr,
          price: linePrice,
          quantity: qty,
          size: item.size || (prod.sizes && prod.sizes[0]) || "",
          color: item.color || (prod.colors && prod.colors[0]) || "",
          image: (prod.images && prod.images[0]) || ""
        });

        // Préparation décrémentation stock
        prod.stock -= qty;
        prod.inStock = prod.stock > 0;
        stockUpdates.push(prod);
      }

      // Gestion du code promo (RAWCRAFT10 = -10%)
      let discount = 0;
      const cleanPromo = String(promoCode || "").trim().toUpperCase();
      if (cleanPromo === "RAWCRAFT10") {
        discount = Math.round(subtotal * 0.10);
      }

      const total = Math.max(0, subtotal - discount);
      const orderId = generateOrderId();
      const orderDate = new Date().toISOString();

      const orderData = {
        id: orderId,
        date: orderDate,
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
        shippingFee: 0, // Livraison gratuite partout au Maroc
        total,
        paymentMethod: "COD (Paiement à la livraison)"
      };

      // Transaction atomique D1 (batch) : mise à jour des stocks + insertion commande
      const statements = [];
      for (const updatedProd of stockUpdates) {
        statements.push(
          db.prepare("INSERT INTO products (id, data) VALUES (?, ?) ON CONFLICT(id) DO UPDATE SET data = excluded.data")
            .bind(updatedProd.id, JSON.stringify(updatedProd))
        );
      }
      statements.push(
        db.prepare("INSERT INTO orders (id, date, data) VALUES (?, ?, ?)")
          .bind(orderId, orderDate, JSON.stringify(orderData))
      );

      await db.batch(statements);

      return json({ ok: true, order: orderData }, 201);
    }

    // --------------------------------------------------------------------------
    // SUIVI / CONSULTATION COMMANDE: GET /api/orders/:id (public)
    // --------------------------------------------------------------------------
    if (path.startsWith("orders/") && method === "GET") {
      const orderId = path.replace("orders/", "").trim().toUpperCase();
      const row = await db.prepare("SELECT data FROM orders WHERE id = ?").bind(orderId).first();
      if (!row || !row.data) {
        return json({ error: "Commande introuvable" }, 404);
      }
      try {
        const order = JSON.parse(row.data);
        return json(order);
      } catch {
        return json({ error: "Données corrompues" }, 500);
      }
    }

    // --------------------------------------------------------------------------
    // LISTE COMMANDES: GET /api/orders (admin)
    // --------------------------------------------------------------------------
    if (path === "orders" && method === "GET") {
      if (!(await verifyAdmin(request, env))) {
        return json({ error: "Non autorisé" }, 401);
      }

      const { results } = await db.prepare("SELECT data FROM orders ORDER BY date DESC").all();
      const list = (results || []).map(r => {
        try {
          return JSON.parse(r.data);
        } catch {
          return null;
        }
      }).filter(Boolean);
      return json(list);
    }

    // --------------------------------------------------------------------------
    // MODIF STATUT: PATCH /api/orders/:id (admin)
    // --------------------------------------------------------------------------
    if (path.startsWith("orders/") && method === "PATCH") {
      if (!(await verifyAdmin(request, env))) {
        return json({ error: "Non autorisé" }, 401);
      }

      const orderId = path.replace("orders/", "").trim().toUpperCase();
      const { status } = await request.json();

      if (!ALLOWED_STATUSES.includes(status)) {
        return json({ error: "Statut invalide" }, 400);
      }

      const row = await db.prepare("SELECT data FROM orders WHERE id = ?").bind(orderId).first();
      if (!row || !row.data) {
        return json({ error: "Commande introuvable" }, 404);
      }

      const order = JSON.parse(row.data);
      order.status = status;
      order.updatedAt = new Date().toISOString();

      await db.prepare("UPDATE orders SET data = ? WHERE id = ?")
        .bind(JSON.stringify(order), orderId)
        .run();

      return json({ ok: true, order });
    }

    // --------------------------------------------------------------------------
    // SUPPRESSION COMMANDE: DELETE /api/orders/:id (admin)
    // --------------------------------------------------------------------------
    if (path.startsWith("orders/") && method === "DELETE") {
      if (!(await verifyAdmin(request, env))) {
        return json({ error: "Non autorisé" }, 401);
      }

      const orderId = path.replace("orders/", "").trim().toUpperCase();
      await db.prepare("DELETE FROM orders WHERE id = ?").bind(orderId).run();
      return json({ ok: true, id: orderId });
    }

    // Route inconnue
    return json({ error: "Route API non trouvée" }, 404);
  } catch (err) {
    console.error("Erreur API Cloudflare:", err);
    return json({ error: "Erreur interne du serveur", details: String(err?.message || err) }, 500);
  }
}
