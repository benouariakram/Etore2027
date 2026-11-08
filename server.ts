// ==============================================================================
// ETTORE — Men's Essentials
// Local Dev & Production Full-Stack Server (Express + Vite Middlewares)
// Mirrors the Cloudflare Pages Functions API for instant local preview
// ==============================================================================

import express, { Request, Response } from 'express';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// In-memory data store for local development preview
const ALLOWED_STATUSES = [
  "En attente",
  "Confirmée",
  "En cours",
  "Livrée",
  "Annulée"
];

const ADMIN_USER = process.env.ADMIN_USER || "admin";
const ADMIN_PASS = process.env.ADMIN_PASS || "ettore2025";

function generateToken(secret: string): string {
  return crypto.createHmac("sha256", secret || "ettore-secret-salt-2025")
    .update("ettore-admin-session-v1")
    .digest("hex");
}

function verifyAdmin(req: Request): boolean {
  const authHeader = req.headers["authorization"] || "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  if (!token) return false;
  return token === generateToken(ADMIN_PASS);
}

function generateOrderId(): string {
  const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `CMD-${code}`;
}

const defaultProducts = [
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

const defaultSliderSlides = [
  {
    id: 0,
    wallpaper: '/images/hero-1-leather.jpg',
    badge: "Maison de maroquinerie & soins d'exception",
    title: "L'Essence du Luxe Brut & Minimaliste",
    subtitle: "Pensé pour l'homme contemporain au Maroc. Matières nobles, savoir-faire séculaire et livraison express avec paiement sécurisé à la livraison.",
    categoryFilter: 'Jackets',
    cta1: "Explorer la Collection",
    cta1Href: "#collection",
    cta2: "Notre Savoir-Faire",
    cta2Href: "#savoir-faire",
    tag: "01 - Jackets"
  },
  {
    id: 1,
    wallpaper: '/images/hero-2-botanical.jpg',
    badge: "Accessoires & Maroquinerie d'Exception",
    title: "L'Art du Détail & des Matières Nobles",
    subtitle: "Sélection rigoureuse d'accessoires, maroquinerie d'exception et souliers façonnés par des maîtres artisans pour parfaire votre vestiaire.",
    categoryFilter: 'Accessoires',
    cta1: "Découvrir la Sélection",
    cta1Href: "#collection",
    cta2: "Savoir-Faire Artisanal",
    cta2Href: "#savoir-faire",
    tag: "02 - Accessoires"
  },
  {
    id: 2,
    wallpaper: '/images/hero-3-linen.jpg',
    badge: "Soulier & Chaussures Sartoriales",
    title: "Élégance Éternelle & Confort Suprême",
    subtitle: "Mules, souliers et cuirs pleine fleur assemblés à la main au Maroc pour une démarche affirmée et un confort absolu.",
    categoryFilter: 'Chaussures',
    cta1: "Voir les Chaussures",
    cta1Href: "#collection",
    cta2: "Cuirs Sélectionnés",
    cta2Href: "#savoir-faire",
    tag: "03 - Chaussures"
  }
];

let productsStore: any[] = JSON.parse(JSON.stringify(defaultProducts));
let ordersStore: any[] = [];
let sliderStore: any[] = JSON.parse(JSON.stringify(defaultSliderSlides));

// ==========================================
// API ROUTES
// ==========================================

// Login
app.post('/api/login', (req: Request, res: Response) => {
  const { user, pass } = req.body || {};
  if (user === ADMIN_USER && pass === ADMIN_PASS) {
    const token = generateToken(ADMIN_PASS);
    return res.json({ ok: true, token, user: ADMIN_USER });
  }
  return res.status(401).json({ error: "Identifiants incorrects" });
});

// Seed
app.post('/api/seed', (req: Request, res: Response) => {
  if (productsStore.length > 0) {
    return res.json({ ok: true, seeded: false, count: productsStore.length, message: "Les produits sont déjà initialisés." });
  }
  productsStore = JSON.parse(JSON.stringify(defaultProducts));
  return res.json({ ok: true, seeded: true, count: productsStore.length, products: productsStore });
});

// Get products
app.get('/api/products', (req: Request, res: Response) => {
  return res.json(productsStore);
});

// Get single product by id
app.get('/api/products/:id', (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const product = productsStore.find((p: any) => p.id === id);
  if (!product) {
    return res.status(404).json({ error: "Produit introuvable" });
  }
  return res.json(product);
});

// Upsert product (Admin)
app.put('/api/products', (req: Request, res: Response) => {
  if (!verifyAdmin(req)) {
    return res.status(401).json({ error: "Non autorisé" });
  }
  const product = req.body;
  if (!product || !product.nameFr || !product.price) {
    return res.status(400).json({ error: "Champs produit obligatoires manquants" });
  }
  const id = product.id ? Number(product.id) : Date.now();
  const payload = {
    ...product,
    id,
    stock: Number(product.stock) || 0,
    inStock: Number(product.stock) > 0
  };
  const idx = productsStore.findIndex((p: any) => p.id === id);
  if (idx >= 0) {
    productsStore[idx] = payload;
  } else {
    productsStore.push(payload);
  }
  return res.json({ ok: true, product: payload });
});

// Delete product (Admin)
app.delete('/api/products/:id', (req: Request, res: Response) => {
  if (!verifyAdmin(req)) {
    return res.status(401).json({ error: "Non autorisé" });
  }
  const id = Number(req.params.id);
  productsStore = productsStore.filter((p: any) => p.id !== id);
  return res.json({ ok: true, id });
});

// ==========================================
// HERO SLIDER ROUTES (Admin Dynamic Management)
// ==========================================
app.get('/api/slider', async (req: Request, res: Response) => {
  try {
    const { fetchSliderSettings } = await import('./src/firebase.ts');
    const firestoreSlides = await fetchSliderSettings();
    if (firestoreSlides && Array.isArray(firestoreSlides) && firestoreSlides.length > 0) {
      sliderStore = firestoreSlides;
      return res.json(firestoreSlides);
    }
  } catch (err) {
    console.warn('Note: Using memory slider slides:', err);
  }
  return res.json(sliderStore);
});

app.put('/api/slider', async (req: Request, res: Response) => {
  if (!verifyAdmin(req)) {
    return res.status(401).json({ error: "Non autorisé" });
  }
  const { slides } = req.body || {};
  if (!Array.isArray(slides) || slides.length === 0) {
    return res.status(400).json({ error: "Liste de slides invalide" });
  }
  sliderStore = slides;
  try {
    const { saveSliderSettings } = await import('./src/firebase.ts');
    await saveSliderSettings(slides);
  } catch (err) {
    console.warn('Note: Slider sync to Firestore notice:', err);
  }
  return res.json({ ok: true, slides: sliderStore });
});

// ==========================================
// FILE UPLOAD ROUTE (Firebase Storage + Server Cache)
// ==========================================
app.post('/api/upload', async (req: Request, res: Response) => {
  try {
    const { file, filename, folder = 'products' } = req.body || {};
    if (!file) {
      return res.status(400).json({ error: "Aucun fichier reçu" });
    }

    let downloadUrl = '';
    // 1. Attempt upload directly to Firebase Storage
    try {
      const { uploadImageToFirebase } = await import('./src/firebase.ts');
      downloadUrl = await uploadImageToFirebase(file, folder, filename);
    } catch (fbErr) {
      console.warn('Firebase Storage upload notice (using fallback):', fbErr);
    }

    // 2. Also save to /public/uploads directory as resilient fallback
    const uploadsDir = path.resolve(__dirname, 'public/uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const matches = typeof file === 'string' ? file.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/) : null;
    let extension = 'jpg';
    if (matches && matches[1]) {
      if (matches[1].includes('png')) extension = 'png';
      else if (matches[1].includes('webp')) extension = 'webp';
      else if (matches[1].includes('svg')) extension = 'svg';
      else if (matches[1].includes('gif')) extension = 'gif';
    } else if (filename && filename.includes('.')) {
      extension = filename.split('.').pop() || 'jpg';
    }

    const safeBase = (filename ? filename.replace(/\.[^/.]+$/, "") : 'image').replace(/[^a-zA-Z0-9_-]/g, '_');
    const safeFilename = `${folder}_${Date.now()}_${safeBase}.${extension}`;
    const localFilePath = path.join(uploadsDir, safeFilename);

    if (matches && matches[2]) {
      const buffer = Buffer.from(matches[2], 'base64');
      fs.writeFileSync(localFilePath, buffer);
    }

    const finalUrl = downloadUrl || `/uploads/${safeFilename}`;
    return res.json({ ok: true, url: finalUrl, storage: Boolean(downloadUrl) ? 'firebase' : 'local' });
  } catch (error: any) {
    console.error('Upload handler error:', error);
    return res.status(500).json({ error: error.message || "Erreur lors du traitement de l'image" });
  }
});


// Create Order (Public COD Checkout)
app.post('/api/orders', async (req: Request, res: Response) => {
  const { customerName, customerPhone, city, address, notes, items, promoCode } = req.body || {};

  if (!customerName || !customerPhone || !city || !address) {
    return res.status(400).json({ error: "Veuillez remplir tous les champs obligatoires (*)" });
  }

  const phoneRegex = /^(06|07)\d{8}$/;
  const cleanPhone = String(customerPhone).trim().replace(/\s+/g, "");
  if (!phoneRegex.test(cleanPhone)) {
    return res.status(400).json({ error: "Le numéro de téléphone doit comporter 10 chiffres et commencer par 06 ou 07" });
  }

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Votre panier est vide" });
  }

  let subtotal = 0;
  const verifiedItems: any[] = [];
  const stockChanges: { prod: any; qty: number }[] = [];

  for (const item of items) {
    const prod = productsStore.find((p: any) => p.id === Number(item.productId || item.id));
    if (!prod) {
      return res.status(400).json({ error: `Produit introuvable : ${item.nameFr || item.name || 'ID ' + item.productId}` });
    }

    const qty = Math.max(1, parseInt(item.quantity || item.qty, 10) || 1);
    if (prod.stock < qty) {
      return res.status(409).json({
        error: `Stock insuffisant pour "${prod.nameFr}". Disponible : ${prod.stock}`
      });
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

    stockChanges.push({ prod, qty });
  }

  // Apply stock decrement atomically
  for (const { prod, qty } of stockChanges) {
    prod.stock -= qty;
    prod.inStock = prod.stock > 0;
  }

  let discount = 0;
  const cleanPromo = String(promoCode || "").trim().toUpperCase();
  if (cleanPromo === "RAWCRAFT10") {
    discount = Math.round(subtotal * 0.10);
  }

  const total = Math.max(0, subtotal - discount);
  const orderId = generateOrderId();
  const orderDate = new Date().toISOString();

  const newOrder = {
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
    shippingFee: 0,
    total,
    paymentMethod: "COD (Paiement à la livraison)"
  };

  ordersStore.unshift(newOrder);

  // Sync to Firestore database
  try {
    const { setDoc, doc } = await import('firebase/firestore');
    const { db } = await import('./src/firebase.ts');
    await setDoc(doc(db, 'orders', orderId), newOrder);
  } catch (err) {
    console.warn('Firestore sync note:', err);
  }

  return res.status(201).json({ ok: true, order: newOrder });
});

// Order tracking (Public)
app.get('/api/orders/:id', async (req: Request, res: Response) => {
  const orderId = String(req.params.id).trim().toUpperCase();
  let order = ordersStore.find(o => o.id === orderId);

  // If not found in local memory, check Firestore
  if (!order) {
    try {
      const { getDoc, doc } = await import('firebase/firestore');
      const { db } = await import('./src/firebase.ts');
      const snap = await getDoc(doc(db, 'orders', orderId));
      if (snap.exists()) {
        order = snap.data();
      }
    } catch {}
  }

  if (!order) {
    return res.status(404).json({ error: "Commande introuvable" });
  }
  return res.json(order);
});

// Orders list (Admin)
app.get('/api/orders', (req: Request, res: Response) => {
  if (!verifyAdmin(req)) {
    return res.status(401).json({ error: "Non autorisé" });
  }
  return res.json(ordersStore);
});

// Update order status (Admin)
app.patch('/api/orders/:id', (req: Request, res: Response) => {
  if (!verifyAdmin(req)) {
    return res.status(401).json({ error: "Non autorisé" });
  }
  const orderId = String(req.params.id).trim().toUpperCase();
  const { status } = req.body || {};
  if (!ALLOWED_STATUSES.includes(status)) {
    return res.status(400).json({ error: "Statut invalide" });
  }
  const order = ordersStore.find(o => o.id === orderId);
  if (!order) {
    return res.status(404).json({ error: "Commande introuvable" });
  }
  order.status = status;
  order.updatedAt = new Date().toISOString();
  return res.json({ ok: true, order });
});

// Delete order (Admin)
app.delete('/api/orders/:id', (req: Request, res: Response) => {
  if (!verifyAdmin(req)) {
    return res.status(401).json({ error: "Non autorisé" });
  }
  const orderId = String(req.params.id).trim().toUpperCase();
  ordersStore = ordersStore.filter(o => o.id !== orderId);
  return res.json({ ok: true, id: orderId });
});

// Setup Vite in Dev or serve static in Prod
async function startServer() {
  const uploadsDir = path.resolve(__dirname, 'public/uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  app.use('/uploads', express.static(uploadsDir));
  app.use('/images', express.static(path.resolve(__dirname, 'public/images')));
  app.use(express.static(path.resolve(__dirname, 'public')));

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

startServer();
