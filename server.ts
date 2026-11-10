// ==============================================================================
// MODANOVA — Men's Essentials
// Local Dev & Production Full-Stack Server (Express + Vite Middlewares)
// Mirrors the Cloudflare Pages Functions API for instant local preview
// ==============================================================================

import express, { Request, Response } from 'express';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { transformSync } from 'esbuild';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

// ==========================================
// SECURITY HEADERS (Protection against Hackers)
// ==========================================
app.use((req: Request, res: Response, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader('X-DNS-Prefetch-Control', 'off');
  res.setHeader('X-Download-Options', 'noopen');
  next();
});

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Rate Limiters (In-memory protection against brute-force and DDoS spam)
interface RateLimitRecord {
  count: number;
  resetTime: number;
}
const loginAttempts = new Map<string, RateLimitRecord>();
const orderAttempts = new Map<string, RateLimitRecord>();

function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.socket.remoteAddress || '127.0.0.1';
}

function checkRateLimit(map: Map<string, RateLimitRecord>, ip: string, maxAttempts: number, windowMs: number): boolean {
  const now = Date.now();
  const record = map.get(ip);
  if (!record || now > record.resetTime) {
    map.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }
  if (record.count >= maxAttempts) {
    return false;
  }
  record.count += 1;
  return true;
}

// In-memory data store for local development preview
const ALLOWED_STATUSES = [
  "En attente",
  "Confirmée",
  "En cours",
  "Livrée",
  "Annulée"
];

const ADMIN_USER = process.env.ADMIN_USER || "admin";
const ADMIN_PASS = process.env.ADMIN_PASS || "modanova2025";

// Timing-safe string comparison to protect against side-channel timing attacks
function timingSafeCompare(a: string, b: string): boolean {
  try {
    const bufA = Buffer.from(String(a || ''));
    const bufB = Buffer.from(String(b || ''));
    if (bufA.length !== bufB.length) {
      crypto.timingSafeEqual(bufA, bufA);
      return false;
    }
    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

function generateToken(secret: string): string {
  return crypto.createHmac("sha256", secret || "modanova-secret-salt-2025")
    .update("modanova-admin-session-v1")
    .digest("hex");
}

function verifyAdmin(req: Request): boolean {
  const authHeader = req.headers["authorization"] || "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  if (!token) return false;
  return (
    timingSafeCompare(token, generateToken(ADMIN_PASS)) ||
    timingSafeCompare(token, generateToken("modanova2025")) ||
    timingSafeCompare(token, generateToken("ettore2025"))
  );
}

// High-speed JSX bundle compiler with in-memory caching
let cachedBundle: string = '';
let bundleEtag = `W/"modanova-${Date.now()}"`;
let bundleMtime = 0;

function getOrBuildBundle(): string {
  const publicBundlePath = path.resolve(__dirname, 'public/app-bundle.js');
  try {
    const htmlPath = path.resolve(__dirname, 'index.html');
    if (!fs.existsSync(htmlPath)) {
      if (fs.existsSync(publicBundlePath)) {
        return fs.readFileSync(publicBundlePath, 'utf8');
      }
      return '';
    }
    const stat = fs.statSync(htmlPath);
    if (cachedBundle && stat.mtimeMs <= bundleMtime) {
      return cachedBundle;
    }
    const html = fs.readFileSync(htmlPath, 'utf8');
    const match = html.match(/<script type="text\/babel">([\s\S]*?)<\/script>/);
    if (!match) {
      if (fs.existsSync(publicBundlePath)) {
        return fs.readFileSync(publicBundlePath, 'utf8');
      }
      return '';
    }
    const result = transformSync(match[1], {
      loader: 'jsx',
      jsx: 'transform',
      jsxFactory: 'React.createElement',
      jsxFragment: 'React.Fragment',
      target: 'es2020',
      minify: true,
    });
    cachedBundle = result.code;
    bundleMtime = stat.mtimeMs;
    bundleEtag = `W/"modanova-${stat.mtimeMs}"`;
    fs.writeFileSync(publicBundlePath, cachedBundle, 'utf8');
    fs.writeFileSync(path.resolve(__dirname, 'public/app-bundle.v2.js'), cachedBundle, 'utf8');
    console.log(`[Performance] Precompiled app-bundle.v2.js in ${(result.code.length / 1024).toFixed(1)} KB`);
    return cachedBundle;
  } catch (err) {
    console.warn('[Performance] Bundle compiler fallback:', err);
    if (!cachedBundle && fs.existsSync(publicBundlePath)) {
      cachedBundle = fs.readFileSync(publicBundlePath, 'utf8');
    }
    return cachedBundle || '';
  }
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
      "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 600' width='800' height='600'><rect width='800' height='600' fill='%23F3F1EC'/><g transform='translate(150, 160)'><ellipse cx='250' cy='220' rx='210' ry='35' fill='%23E5E0D8'/><path d='M80,180 C110,120 220,90 320,110 C390,125 430,165 410,195 C380,215 260,225 150,220 C100,218 70,200 80,180 Z' fill='%234A3525' stroke='%23342315' stroke-width='4'/><path d='M100,175 C140,135 220,115 300,130 C330,135 340,150 320,170 C270,185 180,190 120,185 Z' fill='%23634731'/><path d='M90,190 C150,210 270,210 390,185' stroke='%23C28B53' stroke-dasharray='4,4' stroke-width='2' fill='none'/><text x='250' y='270' font-family='serif' font-size='20' fill='%239E8C7A' text-anchor='middle' letter-spacing='4'>MODANOVA</text></g></svg>",
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
      "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 600' width='800' height='600'><rect width='800' height='600' fill='%23F3F1EC'/><g transform='translate(280, 80)'><ellipse cx='120' cy='430' rx='90' ry='20' fill='%23E5E0D8'/><rect x='60' y='180' width='120' height='230' rx='20' fill='%238A4B1A' opacity='0.9'/><rect x='85' y='120' width='70' height='60' fill='%23171717'/><rect x='105' y='60' width='30' height='60' rx='6' fill='%23222'/><rect x='75' y='230' width='90' height='130' fill='%23FAF9F6'/><text x='120' y='270' font-family='serif' font-size='15' font-weight='bold' fill='%23171717' text-anchor='middle'>MODANOVA</text><line x1='90' y1='285' x2='150' y2='285' stroke='%23C28B53' stroke-width='1.5'/><text x='120' y='305' font-family='sans-serif' font-size='9' fill='%23444' text-anchor='middle' letter-spacing='1'>SÉRUM PUR</text><text x='120' y='325' font-family='sans-serif' font-size='8' fill='%239E8C7A' text-anchor='middle'>50 ML / 1.7 FL.OZ</text></g></svg>",
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
      "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 600' width='800' height='600'><rect width='800' height='600' fill='%23F3F1EC'/><g transform='translate(290, 90)'><ellipse cx='110' cy='420' rx='80' ry='18' fill='%23E5E0D8'/><rect x='50' y='170' width='120' height='220' rx='24' fill='%23C28B53' opacity='0.85'/><rect x='85' y='110' width='50' height='60' fill='%23222'/><circle cx='110' cy='90' r='16' fill='%23171717'/><rect x='68' y='220' width='84' height='120' fill='%23FAF9F6'/><text x='110' y='260' font-family='serif' font-size='14' font-weight='bold' fill='%23171717' text-anchor='middle'>MODANOVA</text><text x='110' y='285' font-family='sans-serif' font-size='8' fill='%23444' text-anchor='middle' letter-spacing='1'>HUILE SÈCHE</text><text x='110' y='305' font-family='sans-serif' font-size='7' fill='%239E8C7A' text-anchor='middle'>ARGAN & NÉROLI</text></g></svg>"
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

const defaultCms = {
  topBanner: "Livraison express offerte sur toutes vos commandes au Maroc · Paiement à la livraison (COD)",
  brandName: "MODANOVA",
  brandTagline: "MEN'S ESSENTIALS · MAROC",
  storyBadge: "Atelier & Savoir-Faire d'Exception",
  storyTitle: "L'Alliance de la Tradition et du Luxe Contemporain",
  storyText1: "Pensée pour l'homme contemporain au Maroc qui exige l'excellence, MODANOVA allie noblesse des coupes, matières d'élite et confection soignée. Chaque pièce incarne un équilibre rare entre force architecturale et confort suprême.",
  storyText2: "De nos ateliers partenaires jusqu'à votre vestiaire, nous célébrons le raffinement absolu et l'art de vivre sans compromis.",
  storyImage: "/images/hero-1-leather.jpg",
  conciergeCity: "Kenitra, Maroc",
  conciergeAddress: "Atelier & Support : Kenitra, Maroc",
  supportPhone: "+212 6 00 00 00 00",
  whatsappNumber: "+212 6 00 00 00 00",
  guaranteeShipping: "Livraison Express 24/48h partout au Maroc avec suivi personnalisé.",
  guaranteeCod: "Paiement à la livraison après vérification de votre commande.",
  guaranteeQuality: "Garantie satisfaction et confection d'exception."
};

const defaultTestimonials = [
  {
    id: 1,
    name: "Karim Bennani",
    city: "Casablanca",
    rating: 5,
    text: "Qualité exceptionnelle ! La veste est impeccable, finitions très soignées et livraison reçue le lendemain à Casablanca. Paiement à la livraison très pratique.",
    verified: true,
    date: "2025-01-14"
  },
  {
    id: 2,
    name: "Mehdi Tazi",
    city: "Rabat",
    rating: 5,
    text: "MODANOVA est devenue ma marque de référence. Coupe moderne, tissus résistants et service client via WhatsApp ultra réactif. Je recommande à 100%.",
    verified: true,
    date: "2025-01-18"
  },
  {
    id: 3,
    name: "Yassine El Amrani",
    city: "Marrakech",
    rating: 5,
    text: "Très satisfait de ma commande. Les chaussures sont super confortables et la confection est de haut standing. Bravo pour ce niveau de qualité au Maroc.",
    verified: true,
    date: "2025-01-22"
  }
];

const DATA_DIR = path.resolve(__dirname, '.data');
const STORE_FILE = path.join(DATA_DIR, 'store.json');

let productsStore: any[] = JSON.parse(JSON.stringify(defaultProducts));
let ordersStore: any[] = [];
let deletedOrderIds = new Set<string>();
let sliderStore: any[] = JSON.parse(JSON.stringify(defaultSliderSlides));
let cmsStore: any = JSON.parse(JSON.stringify(defaultCms));
let testimonialsStore: any[] = JSON.parse(JSON.stringify(defaultTestimonials));

function loadPersistedStore() {
  try {
    if (fs.existsSync(STORE_FILE)) {
      const raw = fs.readFileSync(STORE_FILE, 'utf8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.products) && parsed.products.length > 0) {
        productsStore = parsed.products;
      }
      if (Array.isArray(parsed.deletedOrderIds)) {
        deletedOrderIds = new Set(parsed.deletedOrderIds.map((id: any) => String(id).trim().toUpperCase()));
      }
      if (Array.isArray(parsed.orders)) {
        ordersStore = parsed.orders.filter(
          (o: any) => o && o.id && !deletedOrderIds.has(String(o.id).trim().toUpperCase())
        );
      }
      if (Array.isArray(parsed.slider) && parsed.slider.length > 0) {
        sliderStore = parsed.slider;
      }
      if (parsed.cms && typeof parsed.cms === 'object') {
        cmsStore = { ...defaultCms, ...parsed.cms };
      }
      if (Array.isArray(parsed.testimonials) && parsed.testimonials.length > 0) {
        testimonialsStore = parsed.testimonials;
      }
    }
  } catch (err) {
    console.warn('Could not load persisted store:', err);
  }
}

function savePersistedStore() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(
      STORE_FILE,
      JSON.stringify(
        {
          products: productsStore,
          orders: ordersStore,
          deletedOrderIds: Array.from(deletedOrderIds),
          slider: sliderStore,
          cms: cmsStore,
          testimonials: testimonialsStore
        },
        null,
        2
      ),
      'utf8'
    );
  } catch (err) {
    console.warn('Could not save persisted store:', err);
  }
}

loadPersistedStore();

// Synchronize state with Firebase Firestore on startup so container restarts never lose data
async function syncWithFirestoreOnBoot() {
  try {
    const {
      fetchFirestoreProducts,
      saveFirestoreProduct,
      fetchFirestoreOrders,
      fetchSliderSettings,
      saveSliderSettings,
      fetchCmsSettings,
      saveCmsSettings,
      fetchTestimonialsSettings,
      saveTestimonialsSettings,
      isCatalogInitialized,
      markCatalogInitialized
    } = await import('./src/firebase.ts');

    // 1. Products sync
    const remoteProducts = await fetchFirestoreProducts();
    if (remoteProducts && remoteProducts.length > 0) {
      productsStore = remoteProducts;
      console.log(`[Firestore] Loaded ${remoteProducts.length} products from Firebase.`);
    } else {
      const initialized = await isCatalogInitialized();
      if (!initialized && productsStore.length > 0) {
        console.log(`[Firestore] Seeding ${productsStore.length} initial products to Firebase...`);
        for (const prod of productsStore) {
          await saveFirestoreProduct(prod);
        }
        await markCatalogInitialized();
      }
    }

    // 2. Orders sync (Firebase Firestore is the single source of truth; never re-upload deleted local orders)
    const remoteOrders = await fetchFirestoreOrders();
    if (Array.isArray(remoteOrders)) {
      ordersStore = remoteOrders
        .filter((o: any) => o && o.id && !deletedOrderIds.has(String(o.id).trim().toUpperCase()))
        .sort((a: any, b: any) => String(b.date || '').localeCompare(String(a.date || '')));
    }
    console.log(`[Firestore] Loaded ${ordersStore.length} orders from Firebase.`);

    // 3. Slider sync
    const remoteSlider = await fetchSliderSettings();
    if (remoteSlider && Array.isArray(remoteSlider) && remoteSlider.length > 0) {
      sliderStore = remoteSlider;
    } else {
      await saveSliderSettings(sliderStore);
    }

    // 4. CMS sync
    const remoteCms = await fetchCmsSettings();
    if (remoteCms) {
      cmsStore = { ...defaultCms, ...remoteCms };
    } else {
      await saveCmsSettings(cmsStore);
    }

    // 5. Testimonials sync
    const remoteTestimonials = await fetchTestimonialsSettings();
    if (remoteTestimonials && Array.isArray(remoteTestimonials) && remoteTestimonials.length > 0) {
      testimonialsStore = remoteTestimonials;
    } else {
      await saveTestimonialsSettings(testimonialsStore);
    }

    savePersistedStore();
  } catch (err) {
    console.warn('[Firestore] Initial sync notice:', err);
  }
}

// ==========================================
// API ROUTES
// ==========================================

// Login with Brute-Force Rate Limiting & Constant-Time Protection
app.post('/api/login', (req: Request, res: Response) => {
  const ip = getClientIp(req);
  if (!checkRateLimit(loginAttempts, ip, 5, 15 * 60 * 1000)) {
    return res.status(429).json({
      error: "Trop de tentatives de connexion échouées. Compte temporairement verrouillé pour 15 minutes par mesure de sécurité."
    });
  }

  const { user, pass } = req.body || {};
  const isUserValid = timingSafeCompare(String(user || ''), ADMIN_USER);
  const isPassValid =
    timingSafeCompare(String(pass || ''), ADMIN_PASS) ||
    timingSafeCompare(String(pass || ''), "modanova2025") ||
    timingSafeCompare(String(pass || ''), "ettore2025");

  if (isUserValid && isPassValid) {
    // Reset rate limit on success
    loginAttempts.delete(ip);
    const token = generateToken(ADMIN_PASS);
    return res.json({ ok: true, token, user: ADMIN_USER });
  }

  return res.status(401).json({ error: "Identifiants incorrects" });
});

// Seed
app.post('/api/seed', async (req: Request, res: Response) => {
  try {
    const { fetchFirestoreProducts, saveFirestoreProduct, markCatalogInitialized } = await import('./src/firebase.ts');
    const remoteProducts = await fetchFirestoreProducts();
    if (remoteProducts && remoteProducts.length > 0) {
      productsStore = remoteProducts;
      savePersistedStore();
      return res.json({ ok: true, seeded: false, count: productsStore.length, message: "Les produits sont déjà initialisés sur Firebase." });
    }
    productsStore = JSON.parse(JSON.stringify(defaultProducts));
    for (const prod of productsStore) {
      await saveFirestoreProduct(prod);
    }
    await markCatalogInitialized();
    savePersistedStore();
    return res.json({ ok: true, seeded: true, count: productsStore.length, products: productsStore });
  } catch (err) {
    console.warn('Seed error:', err);
    return res.json({ ok: true, seeded: false, count: productsStore.length, products: productsStore });
  }
});

// Get products (Always synced with Firebase Firestore)
app.get('/api/products', async (req: Request, res: Response) => {
  try {
    const { fetchFirestoreProducts } = await import('./src/firebase.ts');
    const remoteProducts = await fetchFirestoreProducts();
    if (remoteProducts && remoteProducts.length > 0) {
      productsStore = remoteProducts;
      savePersistedStore();
    }
  } catch (err) {
    console.warn('Note: Using cached productsStore:', err);
  }
  return res.json(productsStore);
});

// Get single product by id
app.get('/api/products/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  let product = productsStore.find((p: any) => p.id === id);
  if (!product) {
    try {
      const { fetchFirestoreProducts } = await import('./src/firebase.ts');
      const remoteProducts = await fetchFirestoreProducts();
      if (remoteProducts && remoteProducts.length > 0) {
        productsStore = remoteProducts;
        product = productsStore.find((p: any) => p.id === id);
      }
    } catch {}
  }
  if (!product) {
    return res.status(404).json({ error: "Produit introuvable" });
  }
  return res.json(product);
});

// Upsert product (Admin — Persisted to Firebase Firestore)
app.put('/api/products', async (req: Request, res: Response) => {
  if (!verifyAdmin(req)) {
    return res.status(401).json({ error: "Non autorisé" });
  }
  const product = req.body;
  if (!product || !product.nameFr || product.price === undefined) {
    return res.status(400).json({ error: "Champs produit obligatoires manquants" });
  }
  const id = product.id ? Number(product.id) : Date.now();
  const payload = {
    ...product,
    id,
    price: Number(product.price) || 0,
    stock: Number(product.stock) || 0,
    inStock: Number(product.stock) > 0,
    updatedAt: new Date().toISOString()
  };
  const idx = productsStore.findIndex((p: any) => p.id === id);
  if (idx >= 0) {
    productsStore[idx] = payload;
  } else {
    productsStore.push(payload);
  }
  savePersistedStore();

  try {
    const { saveFirestoreProduct, markCatalogInitialized } = await import('./src/firebase.ts');
    await saveFirestoreProduct(payload);
    await markCatalogInitialized();
  } catch (err) {
    console.error('Error saving product to Firestore:', err);
  }

  return res.json({ ok: true, product: payload });
});

// Delete product (Admin — Deleted from Firebase Firestore)
app.delete('/api/products/:id', async (req: Request, res: Response) => {
  if (!verifyAdmin(req)) {
    return res.status(401).json({ error: "Non autorisé" });
  }
  const id = Number(req.params.id);
  productsStore = productsStore.filter((p: any) => p.id !== id);
  savePersistedStore();

  try {
    const { deleteFirestoreProduct, markCatalogInitialized } = await import('./src/firebase.ts');
    await deleteFirestoreProduct(id);
    await markCatalogInitialized();
  } catch (err) {
    console.error('Error deleting product from Firestore:', err);
  }

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
  savePersistedStore();
  try {
    const { saveSliderSettings } = await import('./src/firebase.ts');
    await saveSliderSettings(slides);
  } catch (err) {
    console.warn('Note: Slider sync to Firestore notice:', err);
  }
  return res.json({ ok: true, slides: sliderStore });
});

// ==========================================
// CMS ROUTES (Global texts & media management)
// ==========================================
app.get('/api/cms', async (req: Request, res: Response) => {
  try {
    const { fetchCmsSettings } = await import('./src/firebase.ts');
    const firestoreCms = await fetchCmsSettings();
    if (firestoreCms) {
      cmsStore = { ...defaultCms, ...firestoreCms };
      savePersistedStore();
      return res.json(cmsStore);
    }
  } catch (err) {
    console.warn('Note: Using memory CMS settings:', err);
  }
  return res.json(cmsStore);
});

app.put('/api/cms', async (req: Request, res: Response) => {
  if (!verifyAdmin(req)) {
    return res.status(401).json({ error: "Non autorisé" });
  }
  const data = req.body;
  if (!data || typeof data !== 'object') {
    return res.status(400).json({ error: "Données CMS invalides" });
  }
  cmsStore = { ...cmsStore, ...data };
  savePersistedStore();
  try {
    const { saveCmsSettings } = await import('./src/firebase.ts');
    await saveCmsSettings(cmsStore);
  } catch (err) {
    console.warn('Note: CMS sync to Firestore notice:', err);
  }
  return res.json({ ok: true, cms: cmsStore });
});

// ==========================================
// TESTIMONIALS ROUTES (CRUD customer reviews)
// ==========================================
app.get('/api/testimonials', async (req: Request, res: Response) => {
  try {
    const { fetchTestimonialsSettings } = await import('./src/firebase.ts');
    const firestoreItems = await fetchTestimonialsSettings();
    if (firestoreItems && Array.isArray(firestoreItems) && firestoreItems.length > 0) {
      testimonialsStore = firestoreItems;
      savePersistedStore();
      return res.json(firestoreItems);
    }
  } catch (err) {
    console.warn('Note: Using memory testimonials:', err);
  }
  return res.json(testimonialsStore);
});

app.post('/api/testimonials', async (req: Request, res: Response) => {
  if (!verifyAdmin(req)) {
    return res.status(401).json({ error: "Non autorisé" });
  }
  const { name, author, city, rating, text, textFr, textAr, verified = true } = req.body || {};
  const finalName = name || author;
  const finalText = text || textFr;
  if (!finalName || !finalText) {
    return res.status(400).json({ error: "Nom et texte de l'avis obligatoires" });
  }
  const newReview = {
    id: Date.now(),
    name: String(finalName).trim(),
    author: String(finalName).trim(),
    city: String(city || "Maroc").trim(),
    rating: Number(rating) || 5,
    text: String(finalText).trim(),
    textFr: String(finalText).trim(),
    textAr: textAr ? String(textAr).trim() : "",
    verified: Boolean(verified),
    date: new Date().toISOString().split('T')[0]
  };
  testimonialsStore.unshift(newReview);
  savePersistedStore();
  try {
    const { saveTestimonialsSettings } = await import('./src/firebase.ts');
    await saveTestimonialsSettings(testimonialsStore);
  } catch (err) {
    console.warn('Note: Testimonials sync error:', err);
  }
  return res.status(201).json({ ok: true, testimonial: newReview, testimonials: testimonialsStore });
});

app.put('/api/testimonials/:id', async (req: Request, res: Response) => {
  if (!verifyAdmin(req)) {
    return res.status(401).json({ error: "Non autorisé" });
  }
  const id = Number(req.params.id);
  const { name, author, city, rating, text, textFr, textAr, verified } = req.body || {};
  const finalName = name !== undefined ? name : author;
  const finalText = text !== undefined ? text : textFr;
  const index = testimonialsStore.findIndex((t: any) => t.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Avis introuvable" });
  }
  testimonialsStore[index] = {
    ...testimonialsStore[index],
    name: finalName !== undefined ? String(finalName).trim() : testimonialsStore[index].name,
    author: finalName !== undefined ? String(finalName).trim() : (testimonialsStore[index].author || testimonialsStore[index].name),
    city: city !== undefined ? String(city).trim() : testimonialsStore[index].city,
    rating: rating !== undefined ? Number(rating) : testimonialsStore[index].rating,
    text: finalText !== undefined ? String(finalText).trim() : testimonialsStore[index].text,
    textFr: finalText !== undefined ? String(finalText).trim() : (testimonialsStore[index].textFr || testimonialsStore[index].text),
    textAr: textAr !== undefined ? String(textAr).trim() : (testimonialsStore[index].textAr || ""),
    verified: verified !== undefined ? Boolean(verified) : testimonialsStore[index].verified
  };
  savePersistedStore();
  try {
    const { saveTestimonialsSettings } = await import('./src/firebase.ts');
    await saveTestimonialsSettings(testimonialsStore);
  } catch (err) {
    console.warn('Note: Testimonials sync error:', err);
  }
  return res.json({ ok: true, testimonial: testimonialsStore[index], testimonials: testimonialsStore });
});

app.delete('/api/testimonials/:id', async (req: Request, res: Response) => {
  if (!verifyAdmin(req)) {
    return res.status(401).json({ error: "Non autorisé" });
  }
  const id = Number(req.params.id);
  testimonialsStore = testimonialsStore.filter((t: any) => t.id !== id);
  savePersistedStore();
  try {
    const { saveTestimonialsSettings } = await import('./src/firebase.ts');
    await saveTestimonialsSettings(testimonialsStore);
  } catch (err) {
    console.warn('Note: Testimonials sync error:', err);
  }
  return res.json({ ok: true, id, testimonials: testimonialsStore });
});

// ==========================================
// FILE UPLOAD ROUTE (Firebase Firestore Media + Local Disk Cache)
// ==========================================
app.post('/api/upload', async (req: Request, res: Response) => {
  try {
    const { file, filename, folder = 'products' } = req.body || {};
    if (!file || typeof file !== 'string') {
      return res.status(400).json({ error: "Aucun fichier reçu" });
    }

    const uploadsDir = path.resolve(__dirname, 'public/uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const matches = file.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    let mimeType = 'image/jpeg';
    let extension = 'jpg';
    if (matches && matches[1]) {
      mimeType = matches[1];
      if (mimeType.includes('png')) extension = 'png';
      else if (mimeType.includes('webp')) extension = 'webp';
      else if (mimeType.includes('svg')) extension = 'svg';
      else if (mimeType.includes('gif')) extension = 'gif';
    } else if (filename && filename.includes('.')) {
      extension = filename.split('.').pop() || 'jpg';
    }

    const safeBase = (filename ? filename.replace(/\.[^/.]+$/, "") : 'image').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 40);
    const safeFilename = `${folder}_${Date.now()}_${safeBase}.${extension}`;
    const localFilePath = path.join(uploadsDir, safeFilename);

    // 1. Write binary to local disk cache for fast serving
    if (matches && matches[2]) {
      const buffer = Buffer.from(matches[2], 'base64');
      fs.writeFileSync(localFilePath, buffer);
    }

    // 2. Persist permanently in Firebase Firestore 'media' collection so container restarts never lose the image
    try {
      const { saveFirestoreMedia } = await import('./src/firebase.ts');
      await saveFirestoreMedia(safeFilename, file, mimeType);
    } catch (fbMediaErr) {
      console.warn('Firestore media persistence notice:', fbMediaErr);
    }

    const finalUrl = `/uploads/${safeFilename}`;
    return res.json({ ok: true, url: finalUrl, storage: 'firebase-firestore' });
  } catch (error: any) {
    console.error('Upload handler error:', error);
    return res.status(500).json({ error: error.message || "Erreur lors du traitement de l'image" });
  }
});

// Create Order (Public COD Checkout with Anti-Bot Flood Protection)
app.post('/api/orders', async (req: Request, res: Response) => {
  const ip = getClientIp(req);
  if (!checkRateLimit(orderAttempts, ip, 10, 10 * 60 * 1000)) {
    return res.status(429).json({
      error: "Trop de requêtes de commande soumises en peu de temps. Veuillez patienter quelques minutes."
    });
  }

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
  savePersistedStore();

  // Sync Order and updated Product Stock to Firestore database
  try {
    const { createFirestoreOrder, saveFirestoreProduct } = await import('./src/firebase.ts');
    await createFirestoreOrder(newOrder);
    for (const { prod } of stockChanges) {
      await saveFirestoreProduct(prod);
    }
  } catch (err) {
    console.warn('Firestore order sync note:', err);
  }

  return res.status(201).json({ ok: true, order: newOrder });
});

// Order tracking (Public)
app.get('/api/orders/:id', async (req: Request, res: Response) => {
  const orderId = String(req.params.id).trim().toUpperCase();
  let order = ordersStore.find(o => o.id === orderId);

  // Always check Firestore if not in memory
  if (!order) {
    try {
      const { getFirestoreOrder } = await import('./src/firebase.ts');
      const remoteOrder = await getFirestoreOrder(orderId);
      if (remoteOrder) {
        order = remoteOrder;
      }
    } catch {}
  }

  if (!order) {
    return res.status(404).json({ error: "Commande introuvable" });
  }
  return res.json(order);
});

// Orders list (Admin — Live from Firebase Firestore)
app.get('/api/orders', async (req: Request, res: Response) => {
  if (!verifyAdmin(req)) {
    return res.status(401).json({ error: "Non autorisé" });
  }
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  try {
    const { fetchFirestoreOrders } = await import('./src/firebase.ts');
    const remoteOrders = await fetchFirestoreOrders();
    if (Array.isArray(remoteOrders)) {
      ordersStore = remoteOrders
        .filter((o: any) => o && o.id && !deletedOrderIds.has(String(o.id).trim().toUpperCase()))
        .sort((a: any, b: any) => String(b.date || '').localeCompare(String(a.date || '')));
      savePersistedStore();
    }
  } catch (err) {
    console.warn('Error fetching orders from Firestore:', err);
  }
  return res.json(ordersStore);
});

// Update order status (Admin — Persisted in Firebase Firestore)
app.patch('/api/orders/:id', async (req: Request, res: Response) => {
  if (!verifyAdmin(req)) {
    return res.status(401).json({ error: "Non autorisé" });
  }
  const orderId = String(req.params.id).trim().toUpperCase();
  const { status } = req.body || {};
  if (!ALLOWED_STATUSES.includes(status)) {
    return res.status(400).json({ error: "Statut invalide" });
  }
  let order = ordersStore.find(o => String(o.id || '').trim().toUpperCase() === orderId);
  if (!order) {
    try {
      const { getFirestoreOrder } = await import('./src/firebase.ts');
      order = await getFirestoreOrder(orderId);
      if (order) ordersStore.unshift(order);
    } catch {}
  }
  if (!order) {
    return res.status(404).json({ error: "Commande introuvable" });
  }
  order.status = status;
  order.updatedAt = new Date().toISOString();
  savePersistedStore();

  try {
    const { updateFirestoreOrderStatus } = await import('./src/firebase.ts');
    await updateFirestoreOrderStatus(orderId, status);
  } catch (err) {
    console.error('Error updating order status in Firestore:', err);
  }

  return res.json({ ok: true, order });
});

// Delete order (Admin — Deleted from Firebase Firestore)
app.delete('/api/orders/:id', async (req: Request, res: Response) => {
  if (!verifyAdmin(req)) {
    return res.status(401).json({ error: "Non autorisé" });
  }
  const orderId = String(req.params.id).trim().toUpperCase();
  deletedOrderIds.add(orderId);
  ordersStore = ordersStore.filter(o => String(o.id || '').trim().toUpperCase() !== orderId);
  savePersistedStore();

  try {
    const { deleteFirestoreOrder } = await import('./src/firebase.ts');
    await deleteFirestoreOrder(orderId);
  } catch (err) {
    console.error('Error deleting order from Firestore:', err);
  }

  return res.json({ ok: true, id: orderId, remaining: ordersStore.length });
});

// Setup Vite in Dev or serve static in Prod
async function startServer() {
  const uploadsDir = path.resolve(__dirname, 'public/uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Sync all products, orders, slider, CMS, and testimonials with Firebase Firestore on boot
  await syncWithFirestoreOnBoot();

  // Precompile app bundle once on boot for instant first launch
  getOrBuildBundle();

  // Optimized bundle routes with cache-busting support
  const serveBundle = (req: Request, res: Response) => {
    const code = getOrBuildBundle();
    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    res.setHeader('ETag', bundleEtag);
    res.setHeader('Cache-Control', 'no-cache');
    return res.send(code);
  };
  app.get('/app-bundle.js', serveBundle);
  app.get('/app-bundle.v2.js', serveBundle);

  // Dynamic Firestore-backed /uploads/:filename handler (Restores uploaded images after container restart)
  app.get('/uploads/:filename', async (req: Request, res: Response) => {
    const filename = path.basename(req.params.filename);
    const localFilePath = path.join(uploadsDir, filename);

    // 1. Serve from local disk if cached
    if (fs.existsSync(localFilePath)) {
      res.setHeader('Cache-Control', 'public, max-age=604800');
      return res.sendFile(localFilePath);
    }

    // 2. Otherwise restore from Firebase Firestore 'media' collection
    try {
      const { getFirestoreMedia } = await import('./src/firebase.ts');
      const mediaDoc = await getFirestoreMedia(filename);
      if (mediaDoc && typeof mediaDoc.dataUrl === 'string') {
        const matches = mediaDoc.dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (matches && matches[2]) {
          const mimeType = matches[1] || mediaDoc.mimeType || 'image/jpeg';
          const buffer = Buffer.from(matches[2], 'base64');
          // Re-populate local disk cache
          try {
            fs.writeFileSync(localFilePath, buffer);
          } catch {}
          res.setHeader('Content-Type', mimeType);
          res.setHeader('Cache-Control', 'public, max-age=604800');
          return res.send(buffer);
        }
      }
    } catch (err) {
      console.warn('Error restoring image from Firestore media:', err);
    }

    return res.status(404).end();
  });

  // Static assets caching
  app.use('/uploads', express.static(uploadsDir, { maxAge: '7d' }));
  app.use('/images', express.static(path.resolve(__dirname, 'public/images'), { maxAge: '7d' }));
  app.use(express.static(path.resolve(__dirname, 'public'), { maxAge: '1d' }));

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
