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
  "Échange en cours",
  "Livrée",
  "Annulée"
];

const ADMIN_USER = process.env.ADMIN_USER || "admin";
const ADMIN_PASS = process.env.ADMIN_PASS || "modanova2025";

function hashPassword(rawPass: string): string {
  return crypto
    .createHmac("sha256", "modanova-admin-pwd-salt-2025")
    .update(String(rawPass || ""))
    .digest("hex");
}

const DEFAULT_CITY_SHIPPING_COSTS: Record<string, number> = {
  "Casablanca": 25,
  "Rabat": 30,
  "Salé": 30,
  "Kénitra": 25,
  "Témara": 30,
  "Mohammédia": 25,
  "Tanger": 35,
  "Tétouan": 35,
  "Marrakech": 35,
  "Fès": 35,
  "Meknès": 35,
  "Agadir": 40,
  "Oujda": 45,
  "Nador": 45,
  "Beni Mellal": 40,
  "El Jadida": 35,
  "Safi": 40,
  "Essaouira": 40,
  "Khouribga": 35,
  "Settat": 30,
  "Laâyoune": 55,
  "Dakhla": 65
};

interface CarrierCredentialConfig {
  enabled: boolean;
  customerId?: string;
  clientCode?: string;
  apiKey: string;
  secretKey?: string;
  apiUrl: string;
  openPackage?: boolean;
  fragile?: boolean;
  stockMode?: boolean;
}

interface CarriersConfig {
  defaultCarrier: 'ozon' | 'cathedis' | 'amana';
  pickupCity: string;
  autoSyncOnOrder?: boolean;
  autoSyncOnConfirm?: boolean;
  ozon: CarrierCredentialConfig;
  cathedis: CarrierCredentialConfig;
  amana: CarrierCredentialConfig;
}

interface AdminConfig {
  adminUser: string;
  passwordHash: string;
  customPasswordSet: boolean;
  adminWhatsappPhone: string;
  whatsappAutoNotifyEnabled: boolean;
  autoRedirectCustomerToWhatsapp: boolean;
  callmebotApiKey: string;
  whatsappWebhookUrl: string;
  ogImageUrl: string;
  defaultShippingCost: number;
  cityShippingCosts: Record<string, number>;
  carriersConfig: CarriersConfig;
}

let adminConfigStore: AdminConfig = {
  adminUser: ADMIN_USER,
  passwordHash: hashPassword(ADMIN_PASS),
  customPasswordSet: false,
  adminWhatsappPhone: "+212600773716",
  whatsappAutoNotifyEnabled: true,
  autoRedirectCustomerToWhatsapp: true,
  callmebotApiKey: process.env.CALLMEBOT_API_KEY || "",
  whatsappWebhookUrl: process.env.WHATSAPP_WEBHOOK_URL || "",
  ogImageUrl: "",
  defaultShippingCost: 35,
  cityShippingCosts: { ...DEFAULT_CITY_SHIPPING_COSTS },
  carriersConfig: {
    defaultCarrier: 'ozon',
    pickupCity: 'Kénitra',
    autoSyncOnOrder: false,
    autoSyncOnConfirm: false,
    ozon: { enabled: true, customerId: '', apiKey: '', apiUrl: 'https://api.ozonexpress.ma/customers', openPackage: true, fragile: false, stockMode: false },
    cathedis: { enabled: true, apiKey: '', secretKey: '', apiUrl: 'https://api.cathedis.delivery/api' },
    amana: { enabled: true, clientCode: '', apiKey: '', apiUrl: 'https://tracking.poste.ma/api' }
  }
};

function normalizePhoneParts(rawPhone: string) {
  let digits = String(rawPhone || "+212600773716").replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.startsWith("0") && digits.length === 10) {
    digits = "212" + digits.slice(1);
  }
  if (!digits) digits = "212600773716";
  const e164 = `+${digits}`;
  let display = e164;
  if (digits.startsWith("212") && digits.length === 12) {
    display = `+212 ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return { digits, e164, display };
}

function getCityRealShippingCost(cityName: string): number {
  const cleanCity = String(cityName || "").trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const costs = adminConfigStore.cityShippingCosts || DEFAULT_CITY_SHIPPING_COSTS;
  if (cleanCity) {
    for (const [k, v] of Object.entries(costs)) {
      const kNorm = String(k).trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      if (kNorm === cleanCity) {
        return Math.max(0, Number(v) || 0);
      }
    }
  }
  return Math.max(0, Number(adminConfigStore.defaultShippingCost ?? 35) || 35);
}

function sanitizeProductForClient(product: any, isAdmin: boolean) {
  if (!product || typeof product !== 'object') return product;
  if (isAdmin) {
    return {
      ...product,
      costPrice: product.costPrice !== undefined && product.costPrice !== null ? Math.max(0, Number(product.costPrice) || 0) : 0
    };
  }
  const { costPrice, ...publicFields } = product;
  return publicFields;
}

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

function verifyPasswordInput(rawInput: string): boolean {
  const inputHash = hashPassword(String(rawInput || ""));
  if (timingSafeCompare(inputHash, adminConfigStore.passwordHash)) {
    return true;
  }
  if (!adminConfigStore.customPasswordSet) {
    return (
      timingSafeCompare(String(rawInput || ""), ADMIN_PASS) ||
      timingSafeCompare(String(rawInput || ""), "modanova2025") ||
      timingSafeCompare(String(rawInput || ""), "ettore2025")
    );
  }
  return false;
}

function verifyAdmin(req: Request): boolean {
  const authHeader = req.headers["authorization"] || "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  if (!token) return false;
  if (timingSafeCompare(token, generateToken(adminConfigStore.passwordHash))) {
    return true;
  }
  if (!adminConfigStore.customPasswordSet) {
    return (
      timingSafeCompare(token, generateToken(ADMIN_PASS)) ||
      timingSafeCompare(token, generateToken("modanova2025")) ||
      timingSafeCompare(token, generateToken("ettore2025"))
    );
  }
  return false;
}

function formatAdminWhatsappDigits(phone: string): string {
  return normalizePhoneParts(phone).digits;
}

function buildOrderWhatsAppAlertText(order: any): string {
  const itemsLines = (order.items || [])
    .map((it: any) => {
      const sizePart = it.size ? `Taille: ${it.size}` : "";
      const rawCol = it.colorLabel || (it.color ? formatColorLabelFr(it.color) : "");
      const colPart = rawCol ? `Couleur: ${rawCol}` : "";
      const meta = [sizePart, colPart].filter(Boolean).join(" | ");
      return `- ${it.quantity || 1}x ${it.nameFr}${meta ? ` (${meta})` : ""} -- ${Number(it.price || 0) * Number(it.quantity || 1)} MAD`;
    })
    .join("\n");
  const discountLine = Number(order.discount || 0) > 0
    ? `- *Remise${order.promoCode ? ` (${order.promoCode})` : ""} :* -${order.discount} MAD\n`
    : "";
  return (
    `*NOUVELLE COMMANDE MODANOVA*\n` +
    `------------------------------\n` +
    `- *N° Commande :* ${order.id}\n` +
    `- *Client :* ${order.customerName}\n` +
    `- *Téléphone :* ${order.customerPhone}\n` +
    `- *Ville :* ${order.city}\n` +
    `- *Adresse :* ${order.address}\n` +
    (order.notes ? `- *Note :* ${order.notes}\n` : "") +
    `------------------------------\n` +
    `*Articles :*\n${itemsLines}\n` +
    `------------------------------\n` +
    discountLine +
    `*TOTAL COD : ${order.total} MAD*`
  );
}

async function sendAdminWhatsAppOrderAlert(order: any): Promise<{ sentViaApi: boolean; whatsappUrl: string }> {
  const targetDigits = formatAdminWhatsappDigits(adminConfigStore.adminWhatsappPhone || cmsStore?.whatsappNumber || "+212600773716");
  const alertText = buildOrderWhatsAppAlertText(order);
  const whatsappUrl = `https://wa.me/${targetDigits}?text=${encodeURIComponent(alertText)}`;

  if (!adminConfigStore.whatsappAutoNotifyEnabled) {
    return { sentViaApi: false, whatsappUrl };
  }

  let sentViaApi = false;

  // 1. Automatic CallMeBot WhatsApp API push (if API key configured)
  const apiKey = String(adminConfigStore.callmebotApiKey || "").trim();
  if (apiKey) {
    try {
      const callmebotUrl = `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(targetDigits)}&text=${encodeURIComponent(alertText)}&apikey=${encodeURIComponent(apiKey)}`;
      const resp = await fetch(callmebotUrl, { method: "GET" });
      if (resp.ok) {
        sentViaApi = true;
        console.log(`[WhatsApp Auto-Notify] Sent order ${order.id} alert via CallMeBot to +${targetDigits}`);
      }
    } catch (err) {
      console.warn("[WhatsApp Auto-Notify] CallMeBot error:", err);
    }
  }

  // 2. Custom WhatsApp Webhook push (if Webhook URL configured)
  const webhookUrl = String(adminConfigStore.whatsappWebhookUrl || "").trim();
  if (webhookUrl) {
    try {
      const resp = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: `+${targetDigits}`,
          text: alertText,
          order
        })
      });
      if (resp.ok) {
        sentViaApi = true;
        console.log(`[WhatsApp Auto-Notify] Sent order ${order.id} alert via Webhook`);
      }
    } catch (err) {
      console.warn("[WhatsApp Auto-Notify] Webhook error:", err);
    }
  }

  return { sentViaApi, whatsappUrl };
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
  supportPhone: "+212 600-773716",
  whatsappNumber: "+212600773716",
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

const defaultCoupons = [
  {
    id: 1,
    code: "RAWCRAFT10",
    type: "percent",
    value: 10,
    minOrder: 0,
    maxUses: null,
    usedCount: 0,
    expiresAt: "",
    active: true,
    description: "Code promo de bienvenue (-10%)",
    createdAt: "2025-01-01T00:00:00.000Z"
  }
];

const DATA_DIR = path.resolve(__dirname, '.data');
const STORE_FILE = path.join(DATA_DIR, 'store.json');

let productsStore: any[] = JSON.parse(JSON.stringify(defaultProducts));
let ordersStore: any[] = [];
let draftOrdersStore: any[] = [];
let deletedOrderIds = new Set<string>();
let sliderStore: any[] = JSON.parse(JSON.stringify(defaultSliderSlides));
let cmsStore: any = JSON.parse(JSON.stringify(defaultCms));
let testimonialsStore: any[] = JSON.parse(JSON.stringify(defaultTestimonials));
let couponsStore: any[] = JSON.parse(JSON.stringify(defaultCoupons));

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
      if (Array.isArray(parsed.draftOrders)) {
        draftOrdersStore = parsed.draftOrders;
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
      if (Array.isArray(parsed.coupons)) {
        couponsStore = parsed.coupons;
      }
      if (parsed.adminConfig && typeof parsed.adminConfig === 'object') {
        adminConfigStore = { ...adminConfigStore, ...parsed.adminConfig };
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
          draftOrders: draftOrdersStore,
          deletedOrderIds: Array.from(deletedOrderIds),
          slider: sliderStore,
          cms: cmsStore,
          testimonials: testimonialsStore,
          coupons: couponsStore,
          adminConfig: adminConfigStore
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

function validateAndComputeCoupon(rawCode: string, subtotal: number) {
  const cleanCode = String(rawCode || '').trim().toUpperCase();
  if (!cleanCode) {
    return { valid: false, discount: 0, errorFr: "Veuillez saisir un code promo.", errorAr: "يرجى إدخال رمز الخصم." };
  }
  const coupon = couponsStore.find((c: any) => String(c?.code || '').trim().toUpperCase() === cleanCode);
  if (!coupon) {
    return { valid: false, discount: 0, errorFr: "Code promo invalide ou inexistant.", errorAr: "رمز الخصم غير صحيح." };
  }
  if (!coupon.active) {
    return { valid: false, discount: 0, errorFr: "Ce coupon est actuellement désactivé.", errorAr: "هذا الكوبون معطل حالياً." };
  }
  if (coupon.expiresAt && String(coupon.expiresAt).trim()) {
    const todayStr = new Date().toISOString().split('T')[0];
    if (String(coupon.expiresAt).trim() < todayStr) {
      return { valid: false, discount: 0, errorFr: "Ce code promo est expiré.", errorAr: "انتهت صلاحية رمز الخصم." };
    }
  }
  const maxUses = coupon.maxUses !== null && coupon.maxUses !== undefined && coupon.maxUses !== '' ? Number(coupon.maxUses) : 0;
  if (maxUses > 0 && Number(coupon.usedCount || 0) >= maxUses) {
    return { valid: false, discount: 0, errorFr: "Ce coupon a atteint son nombre maximal d'utilisations.", errorAr: "تم استنفاد الحد الأقصى لاستخدام هذا الكوبون." };
  }
  const minOrder = Math.max(0, Number(coupon.minOrder) || 0);
  if (subtotal < minOrder) {
    return {
      valid: false,
      discount: 0,
      errorFr: `Montant minimum requis : ${minOrder} MAD pour utiliser ce coupon.`,
      errorAr: `الحد الأدنى للطلب هو ${minOrder} درهم لاستخدام هذا الكوبون.`
    };
  }
  const value = Math.max(0, Number(coupon.value) || 0);
  const type = coupon.type === 'fixed' ? 'fixed' : 'percent';
  const discount = type === 'fixed'
    ? Math.min(subtotal, Math.round(value))
    : Math.min(subtotal, Math.round(subtotal * (Math.min(100, value) / 100)));

  const labelFr = type === 'fixed'
    ? `Code ${coupon.code} appliqué (-${value} MAD)`
    : `Code ${coupon.code} appliqué (-${value}%)`;
  const labelAr = type === 'fixed'
    ? `تم تطبيق خصم ${value} درهم (${coupon.code})`
    : `تم تطبيق خصم ${value}% (${coupon.code})`;

  return {
    valid: true,
    coupon,
    code: coupon.code,
    type,
    value,
    minOrder,
    discount,
    labelFr,
    labelAr
  };
}

// Synchronize state with Firebase Firestore on startup so container restarts never lose data
async function syncWithFirestoreOnBoot() {
  try {
    const {
      fetchFirestoreProducts,
      saveFirestoreProduct,
      fetchFirestoreOrders,
      fetchFirestoreDraftOrders,
      fetchSliderSettings,
      saveSliderSettings,
      fetchCmsSettings,
      saveCmsSettings,
      fetchTestimonialsSettings,
      saveTestimonialsSettings,
      fetchCouponsSettings,
      saveCouponsSettings,
      fetchAdminConfig,
      saveAdminConfig,
      saveFirestoreMedia,
      getFirestoreMedia,
      isCatalogInitialized,
      markCatalogInitialized,
      getFirestoreDriverMode
    } = await import('./src/firebase.ts');

    console.log(`[Firestore] Active backend driver: ${getFirestoreDriverMode()}`);

    // 0. Admin Security & WhatsApp Config sync
    const remoteAdminConfig = await fetchAdminConfig();
    if (remoteAdminConfig && typeof remoteAdminConfig === 'object') {
      adminConfigStore = { ...adminConfigStore, ...remoteAdminConfig };
      console.log(`[Firestore] Loaded Admin Security & WhatsApp config from Firebase.`);
    } else {
      await saveAdminConfig(adminConfigStore);
    }

    // Ensure brand social preview logos (og-logo.jpg, og-logo-square.jpg, logo.png) are backed up in Firestore media
    const brandLogoFiles = [
      { file: 'og-logo.jpg', mime: 'image/jpeg' },
      { file: 'og-logo-square.jpg', mime: 'image/jpeg' },
      { file: 'logo.png', mime: 'image/png' }
    ];
    for (const item of brandLogoFiles) {
      const publicFilePath = path.resolve(__dirname, 'public', item.file);
      if (fs.existsSync(publicFilePath)) {
        const existingMedia = await getFirestoreMedia(item.file);
        if (!existingMedia) {
          const b64 = fs.readFileSync(publicFilePath).toString('base64');
          await saveFirestoreMedia(item.file, `data:${item.mime};base64,${b64}`, item.mime);
        }
      } else {
        const existingMedia = await getFirestoreMedia(item.file);
        if (existingMedia && typeof existingMedia.dataUrl === 'string') {
          const m = existingMedia.dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
          if (m && m[2]) {
            fs.writeFileSync(publicFilePath, Buffer.from(m[2], 'base64'));
          }
        }
      }
    }

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

    // 6. Discount Coupons sync
    const remoteCoupons = await fetchCouponsSettings();
    if (remoteCoupons && Array.isArray(remoteCoupons)) {
      couponsStore = remoteCoupons;
    } else {
      await saveCouponsSettings(couponsStore);
    }

    // 7. Draft Orders (Abandoned Carts) sync
    const remoteDrafts = await fetchFirestoreDraftOrders();
    if (Array.isArray(remoteDrafts)) {
      draftOrdersStore = remoteDrafts.sort((a: any, b: any) =>
        String(b.updatedAt || b.createdAt || '').localeCompare(String(a.updatedAt || a.createdAt || ''))
      );
    }

    savePersistedStore();
  } catch (err) {
    console.warn('[Firestore] Initial sync notice:', err);
  }
}

let firestoreSyncPromise: Promise<void> | null = null;

// ==========================================
// API ROUTES
// ==========================================

// Login with Brute-Force Rate Limiting & Constant-Time Protection
app.post('/api/login', async (req: Request, res: Response) => {
  if (firestoreSyncPromise) {
    await Promise.race([firestoreSyncPromise, new Promise((resolve) => setTimeout(resolve, 4000))]);
  }
  const ip = getClientIp(req);
  if (!checkRateLimit(loginAttempts, ip, 5, 15 * 60 * 1000)) {
    return res.status(429).json({
      error: "Trop de tentatives de connexion échouées. Compte temporairement verrouillé pour 15 minutes par mesure de sécurité."
    });
  }

  const { user, pass } = req.body || {};
  const expectedUser = adminConfigStore.adminUser || ADMIN_USER;
  const isUserValid =
    timingSafeCompare(String(user || '').trim(), expectedUser) ||
    timingSafeCompare(String(user || '').trim(), ADMIN_USER);
  const isPassValid = verifyPasswordInput(String(pass || ''));

  if (isUserValid && isPassValid) {
    // Reset rate limit on success
    loginAttempts.delete(ip);
    const token = generateToken(adminConfigStore.passwordHash);
    return res.json({ ok: true, token, user: expectedUser });
  }

  return res.status(401).json({ error: "Identifiants incorrects" });
});

// Public Config (for Store Phone & WhatsApp order auto-notification settings)
app.get('/api/public-config', (req: Request, res: Response) => {
  const rawPhone = adminConfigStore.adminWhatsappPhone || cmsStore?.whatsappNumber || "+212600773716";
  const { digits, e164, display } = normalizePhoneParts(rawPhone);
  return res.json({
    storePhone: e164,
    storePhoneDigits: digits,
    storePhoneDisplay: display,
    adminWhatsappPhone: e164,
    whatsappAutoNotifyEnabled: adminConfigStore.whatsappAutoNotifyEnabled !== false,
    autoRedirectCustomerToWhatsapp: adminConfigStore.autoRedirectCustomerToWhatsapp !== false
  });
});

// Unified Store Phone PUT (Updates site header, footer, floating buttons, invoices, WhatsApp checkout & admin alerts everywhere)
app.put('/api/admin/phone', async (req: Request, res: Response) => {
  if (!verifyAdmin(req)) {
    return res.status(401).json({ error: "Non autorisé" });
  }
  const rawInput = req.body?.phone ?? req.body?.storePhone ?? req.body?.whatsappNumber ?? '';
  if (!String(rawInput).replace(/\D/g, '')) {
    return res.status(400).json({ error: "Veuillez saisir un numéro de téléphone valide." });
  }
  const { digits, e164, display } = normalizePhoneParts(String(rawInput));

  adminConfigStore = {
    ...adminConfigStore,
    adminWhatsappPhone: e164
  };
  cmsStore = {
    ...cmsStore,
    whatsappNumber: e164,
    supportPhone: display
  };
  savePersistedStore();

  try {
    const { saveAdminConfig, saveCmsSettings } = await import('./src/firebase.ts');
    await Promise.all([
      saveAdminConfig(adminConfigStore),
      saveCmsSettings(cmsStore)
    ]);
  } catch (err) {
    console.warn('Error syncing unified store phone to Firestore:', err);
  }

  return res.json({
    ok: true,
    storePhone: e164,
    storePhoneDigits: digits,
    storePhoneDisplay: display,
    cms: cmsStore
  });
});

// Carrier Credentials GET / PUT (Ozon Express, Cathedis, Amana)
app.get('/api/admin/carriers', (req: Request, res: Response) => {
  if (!verifyAdmin(req)) {
    return res.status(401).json({ error: "Non autorisé" });
  }
  return res.json(adminConfigStore.carriersConfig || {
    defaultCarrier: 'ozon',
    pickupCity: 'Kénitra',
    ozon: { enabled: true, customerId: '', apiKey: '', apiUrl: 'https://api.ozonexpress.ma/customers' },
    cathedis: { enabled: true, apiKey: '', secretKey: '', apiUrl: 'https://api.cathedis.delivery/api' },
    amana: { enabled: true, clientCode: '', apiKey: '', apiUrl: 'https://tracking.poste.ma/api' }
  });
});

app.put('/api/admin/carriers', async (req: Request, res: Response) => {
  if (!verifyAdmin(req)) {
    return res.status(401).json({ error: "Non autorisé" });
  }
  const body = req.body || {};
  const prev = adminConfigStore.carriersConfig || {
    defaultCarrier: 'ozon',
    pickupCity: 'Kénitra',
    ozon: { enabled: true, customerId: '', apiKey: '', apiUrl: 'https://api.ozonexpress.ma/customers' },
    cathedis: { enabled: true, apiKey: '', secretKey: '', apiUrl: 'https://api.cathedis.delivery/api' },
    amana: { enabled: true, clientCode: '', apiKey: '', apiUrl: 'https://tracking.poste.ma/api' }
  };
  const nextCarriers: CarriersConfig = {
    defaultCarrier: ['ozon', 'cathedis', 'amana'].includes(body.defaultCarrier) ? body.defaultCarrier : prev.defaultCarrier,
    pickupCity: String(body.pickupCity ?? prev.pickupCity ?? 'Kénitra').trim() || 'Kénitra',
    autoSyncOnOrder: body.autoSyncOnOrder !== undefined ? Boolean(body.autoSyncOnOrder) : Boolean(prev.autoSyncOnOrder),
    autoSyncOnConfirm: body.autoSyncOnConfirm !== undefined ? Boolean(body.autoSyncOnConfirm) : Boolean(prev.autoSyncOnConfirm),
    ozon: { ...prev.ozon, ...(body.ozon || {}) },
    cathedis: { ...prev.cathedis, ...(body.cathedis || {}) },
    amana: { ...prev.amana, ...(body.amana || {}) }
  };
  adminConfigStore = {
    ...adminConfigStore,
    carriersConfig: nextCarriers
  };
  savePersistedStore();
  try {
    const { saveAdminConfig } = await import('./src/firebase.ts');
    await saveAdminConfig(adminConfigStore);
  } catch (err) {
    console.warn('Error saving carriersConfig to Firestore:', err);
  }
  return res.json({ ok: true, carriersConfig: nextCarriers });
});

// Test Ozon Express API credentials live & list cached cities count
app.post('/api/admin/carriers/test-ozon', async (req: Request, res: Response) => {
  if (!verifyAdmin(req)) {
    return res.status(401).json({ error: "Non autorisé" });
  }
  const customerId = String(req.body?.customerId ?? adminConfigStore.carriersConfig?.ozon?.customerId ?? '').trim();
  const apiKey = String(req.body?.apiKey ?? adminConfigStore.carriersConfig?.ozon?.apiKey ?? '').trim();
  const rawApiUrl = String(req.body?.apiUrl ?? adminConfigStore.carriersConfig?.ozon?.apiUrl ?? 'https://api.ozonexpress.ma/customers').trim();

  if (!customerId || !apiKey) {
    return res.status(400).json({ ok: false, error: "Veuillez renseigner l'ID Client et la Clé API Ozon Express." });
  }

  try {
    const cleanBase = rawApiUrl.replace(/\/+$/, '');
    const trackEndpoint = cleanBase.includes(`/${customerId}/${apiKey}`)
      ? `${cleanBase.replace(/\/(add-parcel|tracking)$/i, '')}/tracking`
      : `${cleanBase}/${encodeURIComponent(customerId)}/${encodeURIComponent(apiKey)}/tracking`;

    const resp = await fetch(trackEndpoint, {
      method: 'POST',
      body: new URLSearchParams({ 'tracking-number': 'MODANOVA-PING' }),
      signal: AbortSignal.timeout(7000)
    });
    const text = await resp.text();
    let json: any = null;
    try { json = JSON.parse(text); } catch {}

    if (json?.CHECK_API?.RESULT === 'ERROR') {
      return res.status(400).json({
        ok: false,
        error: `Ozon Express a refusé les identifiants : ${json.CHECK_API.MESSAGE || 'Vérifiez votre ID Client et Clé API.'}`,
        raw: json
      });
    }

    const cities = await fetchOzonCities(true);
    return res.json({
      ok: true,
      message: `Connexion Ozon Express validée ! (${cities.length} villes marocaines synchronisées)`,
      citiesCount: cities.length,
      raw: json || text.slice(0, 200)
    });
  } catch (err: any) {
    return res.status(502).json({
      ok: false,
      error: `Impossible de joindre api.ozonexpress.ma (${err?.message || 'timeout'})`
    });
  }
});

// List cached Ozon Express Moroccan cities (Admin)
app.get('/api/admin/ozon/cities', async (req: Request, res: Response) => {
  if (!verifyAdmin(req)) {
    return res.status(401).json({ error: "Non autorisé" });
  }
  const cities = await fetchOzonCities(Boolean(req.query.refresh));
  return res.json({ ok: true, count: cities.length, cities });
});

// Profitability Settings PUT (Real Shipping Cost per City & Default Cost)
app.put('/api/admin/profitability-settings', async (req: Request, res: Response) => {
  if (!verifyAdmin(req)) {
    return res.status(401).json({ error: "Non autorisé" });
  }
  const { defaultShippingCost, cityShippingCosts } = req.body || {};
  const cleanCosts: Record<string, number> = { ...(adminConfigStore.cityShippingCosts || DEFAULT_CITY_SHIPPING_COSTS) };
  if (cityShippingCosts && typeof cityShippingCosts === 'object') {
    for (const [cityKey, val] of Object.entries(cityShippingCosts)) {
      const name = String(cityKey || '').trim();
      if (name) {
        cleanCosts[name] = Math.max(0, Number(val) || 0);
      }
    }
  }
  adminConfigStore = {
    ...adminConfigStore,
    defaultShippingCost: defaultShippingCost !== undefined ? Math.max(0, Number(defaultShippingCost) || 0) : (adminConfigStore.defaultShippingCost ?? 35),
    cityShippingCosts: cleanCosts
  };
  savePersistedStore();
  try {
    const { saveAdminConfig } = await import('./src/firebase.ts');
    await saveAdminConfig(adminConfigStore);
  } catch (err) {
    console.warn('Error saving profitability settings to Firestore:', err);
  }
  return res.json({
    ok: true,
    defaultShippingCost: adminConfigStore.defaultShippingCost,
    cityShippingCosts: adminConfigStore.cityShippingCosts
  });
});

// Admin Config GET (Admin — WhatsApp Notification, Phone, Carriers, Profitability & Security Settings)
app.get('/api/admin/config', async (req: Request, res: Response) => {
  if (!verifyAdmin(req)) {
    return res.status(401).json({ error: "Non autorisé" });
  }
  try {
    const { fetchAdminConfig } = await import('./src/firebase.ts');
    const remote = await fetchAdminConfig();
    if (remote && typeof remote === 'object') {
      adminConfigStore = {
        ...adminConfigStore,
        ...remote,
        cityShippingCosts: { ...DEFAULT_CITY_SHIPPING_COSTS, ...(remote.cityShippingCosts || {}) },
        carriersConfig: {
          ...adminConfigStore.carriersConfig,
          ...(remote.carriersConfig || {}),
          ozon: { ...adminConfigStore.carriersConfig.ozon, ...(remote.carriersConfig?.ozon || {}) },
          cathedis: { ...adminConfigStore.carriersConfig.cathedis, ...(remote.carriersConfig?.cathedis || {}) },
          amana: { ...adminConfigStore.carriersConfig.amana, ...(remote.carriersConfig?.amana || {}) }
        }
      };
      savePersistedStore();
    }
  } catch {}
  const phoneVal = adminConfigStore.adminWhatsappPhone || "+212600773716";
  const { digits, e164, display } = normalizePhoneParts(phoneVal);
  return res.json({
    adminUser: adminConfigStore.adminUser || ADMIN_USER,
    customPasswordSet: Boolean(adminConfigStore.customPasswordSet),
    adminWhatsappPhone: e164,
    adminWhatsappNumber: e164,
    storePhone: e164,
    storePhoneDigits: digits,
    storePhoneDisplay: display,
    whatsappAutoNotifyEnabled: adminConfigStore.whatsappAutoNotifyEnabled !== false,
    autoRedirectCustomerToWhatsapp: adminConfigStore.autoRedirectCustomerToWhatsapp !== false,
    callmebotApiKey: adminConfigStore.callmebotApiKey || "",
    whatsappWebhookUrl: adminConfigStore.whatsappWebhookUrl || "",
    ogImageUrl: adminConfigStore.ogImageUrl || "",
    defaultShippingCost: adminConfigStore.defaultShippingCost ?? 35,
    cityShippingCosts: adminConfigStore.cityShippingCosts || DEFAULT_CITY_SHIPPING_COSTS,
    carriersConfig: adminConfigStore.carriersConfig
  });
});

// Admin Config PUT (Admin — Save WhatsApp Auto-Notification, Unified Phone & Social Preview Settings to Firebase)
app.put('/api/admin/config', async (req: Request, res: Response) => {
  if (!verifyAdmin(req)) {
    return res.status(401).json({ error: "Non autorisé" });
  }
  const {
    adminWhatsappPhone,
    adminWhatsappNumber,
    whatsappAutoNotifyEnabled,
    autoRedirectCustomerToWhatsapp,
    callmebotApiKey,
    whatsappWebhookUrl,
    ogImageUrl,
    defaultShippingCost,
    cityShippingCosts,
    carriersConfig
  } = req.body || {};

  const incomingPhone = adminWhatsappPhone !== undefined ? adminWhatsappPhone : adminWhatsappNumber;
  const normalizedPhone = incomingPhone !== undefined && String(incomingPhone).replace(/\D/g, '')
    ? normalizePhoneParts(String(incomingPhone))
    : normalizePhoneParts(adminConfigStore.adminWhatsappPhone);

  adminConfigStore = {
    ...adminConfigStore,
    adminWhatsappPhone: incomingPhone !== undefined ? normalizedPhone.e164 : adminConfigStore.adminWhatsappPhone,
    whatsappAutoNotifyEnabled: whatsappAutoNotifyEnabled !== undefined ? Boolean(whatsappAutoNotifyEnabled) : adminConfigStore.whatsappAutoNotifyEnabled,
    autoRedirectCustomerToWhatsapp: autoRedirectCustomerToWhatsapp !== undefined ? Boolean(autoRedirectCustomerToWhatsapp) : adminConfigStore.autoRedirectCustomerToWhatsapp,
    callmebotApiKey: callmebotApiKey !== undefined ? String(callmebotApiKey).trim() : adminConfigStore.callmebotApiKey,
    whatsappWebhookUrl: whatsappWebhookUrl !== undefined ? String(whatsappWebhookUrl).trim() : adminConfigStore.whatsappWebhookUrl,
    ogImageUrl: ogImageUrl !== undefined ? String(ogImageUrl).trim().slice(0, 1000) : (adminConfigStore.ogImageUrl || ""),
    defaultShippingCost: defaultShippingCost !== undefined ? Math.max(0, Number(defaultShippingCost) || 0) : adminConfigStore.defaultShippingCost,
    cityShippingCosts: cityShippingCosts && typeof cityShippingCosts === 'object' ? { ...adminConfigStore.cityShippingCosts, ...cityShippingCosts } : adminConfigStore.cityShippingCosts,
    carriersConfig: carriersConfig && typeof carriersConfig === 'object' ? { ...adminConfigStore.carriersConfig, ...carriersConfig } : adminConfigStore.carriersConfig
  };

  if (incomingPhone !== undefined) {
    cmsStore = {
      ...cmsStore,
      whatsappNumber: normalizedPhone.e164,
      supportPhone: normalizedPhone.display
    };
  }
  savePersistedStore();

  try {
    const { saveAdminConfig, saveCmsSettings } = await import('./src/firebase.ts');
    await saveAdminConfig(adminConfigStore);
    if (incomingPhone !== undefined) {
      await saveCmsSettings(cmsStore);
    }
  } catch (err) {
    console.warn('Error saving adminConfig to Firestore:', err);
  }

  return res.json({
    ok: true,
    config: {
      adminUser: adminConfigStore.adminUser,
      customPasswordSet: adminConfigStore.customPasswordSet,
      adminWhatsappPhone: adminConfigStore.adminWhatsappPhone,
      adminWhatsappNumber: adminConfigStore.adminWhatsappPhone,
      storePhone: normalizedPhone.e164,
      storePhoneDigits: normalizedPhone.digits,
      storePhoneDisplay: normalizedPhone.display,
      whatsappAutoNotifyEnabled: adminConfigStore.whatsappAutoNotifyEnabled,
      autoRedirectCustomerToWhatsapp: adminConfigStore.autoRedirectCustomerToWhatsapp,
      callmebotApiKey: adminConfigStore.callmebotApiKey,
      whatsappWebhookUrl: adminConfigStore.whatsappWebhookUrl,
      ogImageUrl: adminConfigStore.ogImageUrl || "",
      defaultShippingCost: adminConfigStore.defaultShippingCost,
      cityShippingCosts: adminConfigStore.cityShippingCosts,
      carriersConfig: adminConfigStore.carriersConfig
    }
  });
});

// Change Admin Password (Admin — Persisted in Firebase Firestore)
app.put('/api/admin/password', async (req: Request, res: Response) => {
  if (!verifyAdmin(req)) {
    return res.status(401).json({ error: "Non autorisé" });
  }
  const { currentPassword, newPassword, confirmPassword, newUsername, newUser } = req.body || {};
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: "Veuillez renseigner le mot de passe actuel et le nouveau mot de passe." });
  }
  if (!verifyPasswordInput(String(currentPassword))) {
    return res.status(403).json({ error: "Le mot de passe actuel est incorrect." });
  }
  if (String(newPassword).length < 4) {
    return res.status(400).json({ error: "Le nouveau mot de passe doit contenir au moins 4 caractères." });
  }
  if (confirmPassword !== undefined && String(newPassword) !== String(confirmPassword)) {
    return res.status(400).json({ error: "La confirmation du mot de passe ne correspond pas." });
  }

  const candidateUser = newUsername || newUser;
  const updatedUser = candidateUser && String(candidateUser).trim().length >= 3
    ? String(candidateUser).trim()
    : (adminConfigStore.adminUser || ADMIN_USER);

  adminConfigStore = {
    ...adminConfigStore,
    adminUser: updatedUser,
    passwordHash: hashPassword(String(newPassword)),
    customPasswordSet: true
  };
  savePersistedStore();

  try {
    const { saveAdminConfig } = await import('./src/firebase.ts');
    await saveAdminConfig(adminConfigStore);
  } catch (err) {
    console.error('Error saving new password to Firestore:', err);
  }

  const newToken = generateToken(adminConfigStore.passwordHash);
  return res.json({
    ok: true,
    token: newToken,
    user: adminConfigStore.adminUser,
    adminUser: adminConfigStore.adminUser,
    message: "Votre mot de passe administrateur a été modifié et sauvegardé sur Firebase."
  });
});

// Test Automatic WhatsApp Notification (Admin)
app.post('/api/admin/test-whatsapp', async (req: Request, res: Response) => {
  if (!verifyAdmin(req)) {
    return res.status(401).json({ error: "Non autorisé" });
  }
  const sampleOrder = {
    id: "CMD-TEST01",
    customerName: "Client Test MODANOVA",
    customerPhone: "0600000000",
    city: "Casablanca",
    address: "Boulevard d'Anfa, Casablanca",
    notes: "Test de notification WhatsApp automatique",
    items: [{ nameFr: "Article Test MODANOVA", quantity: 1, price: 650, size: "42" }],
    total: 650
  };
  const result = await sendAdminWhatsAppOrderAlert(sampleOrder);
  return res.json({
    ok: true,
    sentViaApi: result.sentViaApi,
    whatsappUrl: result.whatsappUrl,
    adminWhatsappUrl: result.whatsappUrl
  });
});

// Clear Server & Local Cache and Resynchronize from Firebase Firestore (Admin)
app.post('/api/admin/clear-cache', async (req: Request, res: Response) => {
  if (!verifyAdmin(req)) {
    return res.status(401).json({ error: "Non autorisé" });
  }
  try {
    // 1. Clear in-memory rate-limit caches
    loginAttempts.clear();
    orderAttempts.clear();

    // 2. Remove local disk cache file (.data/store.json) without touching Firebase Firestore
    try {
      if (fs.existsSync(STORE_FILE)) {
        fs.unlinkSync(STORE_FILE);
      }
    } catch (unlinkErr) {
      console.warn('Could not unlink local store cache file:', unlinkErr);
    }

    // 3. Re-fetch and resynchronize all live data directly from Firebase Firestore
    await syncWithFirestoreOnBoot();

    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    return res.json({
      ok: true,
      clearedAt: new Date().toISOString(),
      counts: {
        products: productsStore.length,
        orders: ordersStore.length,
        slides: sliderStore.length,
        testimonials: testimonialsStore.length,
        coupons: couponsStore.length
      },
      message: "Cache serveur vidé et données rechargées depuis Firebase Firestore."
    });
  } catch (err) {
    console.error('Error clearing cache:', err);
    return res.status(500).json({ error: "Erreur lors du vidage du cache serveur." });
  }
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

// Get products (Always synced with Firebase Firestore, newest products first; costPrice stripped for non-admin callers)
app.get('/api/products', async (req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
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
  const isAdminCaller = verifyAdmin(req);
  return res.json(productsStore.map(p => sanitizeProductForClient(p, isAdminCaller)));
});

// Get single product by id (costPrice stripped for non-admin callers)
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
  const isAdminCaller = verifyAdmin(req);
  return res.json(sanitizeProductForClient(product, isAdminCaller));
});

// Reorder products (Admin — Persisted to Firebase Firestore: 1st, 2nd, 3rd, ..., 12th, etc.)
app.put('/api/products/reorder', async (req: Request, res: Response) => {
  if (!verifyAdmin(req)) {
    return res.status(401).json({ error: "Non autorisé" });
  }
  const { orderedIds } = req.body || {};
  if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
    return res.status(400).json({ error: "Liste d'identifiants produits invalide" });
  }

  const idOrderMap = new Map<number, number>();
  orderedIds.forEach((rawId: any, index: number) => {
    const numId = Number(rawId);
    if (!isNaN(numId) && !idOrderMap.has(numId)) {
      idOrderMap.set(numId, index);
    }
  });

  const reordered = [...productsStore].sort((a: any, b: any) => {
    const rankA = idOrderMap.has(Number(a.id)) ? idOrderMap.get(Number(a.id))! : 999999;
    const rankB = idOrderMap.has(Number(b.id)) ? idOrderMap.get(Number(b.id))! : 999999;
    return rankA - rankB;
  });

  productsStore = reordered.map((p: any, i: number) => ({
    ...p,
    position: i + 1
  }));
  savePersistedStore();

  try {
    const { saveFirestoreProductsOrder, markCatalogInitialized } = await import('./src/firebase.ts');
    await saveFirestoreProductsOrder(productsStore);
    await markCatalogInitialized();
  } catch (err) {
    console.error('Error saving product order to Firestore:', err);
  }

  return res.json({ ok: true, products: productsStore });
});

// Helper: Color readable name in French for error/order messages
function formatColorLabelFr(rawColor: string): string {
  const c = String(rawColor || '').trim();
  if (!c || c.toLowerCase() === 'default') return 'Standard';
  if (c.includes(':')) {
    return c.split(':')[0].trim() || c;
  }
  const upper = c.toUpperCase();
  const hexMap: Record<string, string> = {
    '#171717': 'Noir',
    '#000000': 'Noir',
    '#121212': 'Noir',
    '#1C1C1C': 'Noir',
    '#3D2B1F': 'Marron Foncé',
    '#4A3525': 'Marron',
    '#5C4033': 'Marron',
    '#8B4513': 'Marron Cognac',
    '#C28B53': 'Camel / Caramel',
    '#D2B48C': 'Beige / Sable',
    '#9E8C7A': 'Taupe / Beige',
    '#F5F5DC': 'Beige',
    '#FAF9F6': 'Blanc Cassé',
    '#FFFFFF': 'Blanc',
    '#F3F1EC': 'Ivoire / Crème',
    '#1E293B': 'Bleu Marine',
    '#1E3A8A': 'Bleu Marine',
    '#0F172A': 'Bleu Nuit',
    '#4B5563': 'Gris Anthracite',
    '#6B7280': 'Gris',
    '#9CA3AF': 'Gris Clair',
    '#065F46': 'Vert Émeraude',
    '#14532D': 'Vert Kaki / Olive',
    '#7F1D1D': 'Bordeaux',
    '#991B1B': 'Rouge Bordeaux',
    '#D4AF37': 'Or / Doré',
    '#E6C687': 'Or Champagne',
    '#C0C0C0': 'Argent',
    '#38BDF8': 'Bleu Ciel',
    '#1D4ED8': 'Bleu Roi',
    '#556B2F': 'Kaki',
    '#84A98C': 'Vert Sauge',
    '#DC2626': 'Rouge',
    '#F472B6': 'Rose Poudré',
    '#C2410C': 'Terracotta',
    '#CA8A04': 'Moutarde',
    '#6D28D9': 'Violet'
  };
  return hexMap[upper] || c;
}

function makeVariantKey(size: string, color: string): string {
  const s = String(size || 'Unique').trim();
  const c = String(color || 'Default').trim();
  return `${s}__${c}`;
}

function getVariantStockValue(prod: any, size: string, color: string): number {
  const vs = prod?.variantStock;
  if (vs && typeof vs === 'object' && Object.keys(vs).length > 0) {
    const exactKey = makeVariantKey(size, color);
    if (vs[exactKey] !== undefined) {
      return Math.max(0, Number(vs[exactKey]) || 0);
    }
    // Case-insensitive or trimmed fallback lookup
    const targetLower = exactKey.toLowerCase();
    for (const [k, v] of Object.entries(vs)) {
      if (String(k).trim().toLowerCase() === targetLower) {
        return Math.max(0, Number(v) || 0);
      }
    }
    // If product only has sizes or only has colors in variantStock
    const sTrim = String(size || '').trim();
    const cTrim = String(color || '').trim();
    for (const [k, v] of Object.entries(vs)) {
      const [ks, kc] = String(k).split('__');
      if (ks && kc && ks.trim().toLowerCase() === sTrim.toLowerCase() && (kc.trim().toLowerCase() === cTrim.toLowerCase() || formatColorLabelFr(kc).toLowerCase() === formatColorLabelFr(cTrim).toLowerCase())) {
        return Math.max(0, Number(v) || 0);
      }
    }
    return 0;
  }
  return Math.max(0, Number(prod?.stock) || 0);
}

// Upsert product (Admin — Persisted to Firebase Firestore, new products placed 1st)
app.put('/api/products', async (req: Request, res: Response) => {
  if (!verifyAdmin(req)) {
    return res.status(401).json({ error: "Non autorisé" });
  }
  const product = req.body;
  if (!product || !product.nameFr || product.price === undefined) {
    return res.status(400).json({ error: "Champs produit obligatoires manquants" });
  }
  const isNewProduct = !product.id;
  const id = product.id ? Number(product.id) : Date.now();
  const idx = productsStore.findIndex((p: any) => Number(p.id) === id);
  const nowIso = new Date().toISOString();
  const existingCreatedAt = idx >= 0 ? productsStore[idx].createdAt : undefined;
  const existingPosition = idx >= 0 ? productsStore[idx].position : undefined;

  // Sanitize variantStock if provided
  let sanitizedVariantStock: Record<string, number> | undefined = undefined;
  if (product.variantStock && typeof product.variantStock === 'object') {
    sanitizedVariantStock = {};
    for (const [k, v] of Object.entries(product.variantStock)) {
      if (k && String(k).trim()) {
        sanitizedVariantStock[String(k).trim()] = Math.max(0, Math.floor(Number(v) || 0));
      }
    }
  }

  let computedTotalStock = Math.max(0, Math.floor(Number(product.stock) || 0));
  if (sanitizedVariantStock && Object.keys(sanitizedVariantStock).length > 0) {
    computedTotalStock = Object.values(sanitizedVariantStock).reduce((acc, q) => acc + q, 0);
  }

  const showOnHome = product.showOnHome !== undefined
    ? Boolean(product.showOnHome)
    : (idx >= 0 && productsStore[idx].showOnHome !== undefined ? Boolean(productsStore[idx].showOnHome) : true);

  const videoUrl = product.videoUrl !== undefined
    ? String(product.videoUrl || '').trim()
    : (idx >= 0 ? String(productsStore[idx].videoUrl || '').trim() : '');

  const costPrice = product.costPrice !== undefined && product.costPrice !== null && product.costPrice !== ''
    ? Math.max(0, Number(product.costPrice) || 0)
    : (idx >= 0 && productsStore[idx].costPrice !== undefined ? Math.max(0, Number(productsStore[idx].costPrice) || 0) : 0);

  const payload: Record<string, any> = {
    id,
    nameFr: String(product.nameFr || '').trim().slice(0, 300),
    nameAr: String(product.nameAr || '').trim().slice(0, 300),
    price: Math.max(0, Number(product.price) || 0),
    oldPrice: product.oldPrice !== undefined && product.oldPrice !== null && product.oldPrice !== ''
      ? Math.max(0, Number(product.oldPrice) || 0)
      : null,
    costPrice,
    category: String(product.category || (idx >= 0 ? productsStore[idx].category : 'chaussures')).trim().slice(0, 100) || 'chaussures',
    inStock: computedTotalStock > 0,
    stock: computedTotalStock,
    variantStock: sanitizedVariantStock || (idx >= 0 ? productsStore[idx].variantStock : undefined) || {},
    badge: ['new', 'exclusive', 'luxury', 'out', ''].includes(String(product.badge ?? ''))
      ? String(product.badge ?? '')
      : (idx >= 0 ? String(productsStore[idx].badge || '') : ''),
    isNew: product.isNew !== undefined ? Boolean(product.isNew) : (idx >= 0 ? Boolean(productsStore[idx].isNew) : false),
    rating: Math.min(5, Math.max(0, Number(product.rating ?? (idx >= 0 ? productsStore[idx].rating : 4.8)) || 4.8)),
    images: Array.isArray(product.images) ? product.images.slice(0, 30).map((u: any) => String(u || '')) : (idx >= 0 && Array.isArray(productsStore[idx].images) ? productsStore[idx].images.slice(0, 30) : []),
    descFr: String(product.descFr ?? (idx >= 0 ? productsStore[idx].descFr : '') ?? '').slice(0, 3000),
    descAr: String(product.descAr ?? (idx >= 0 ? productsStore[idx].descAr : '') ?? '').slice(0, 3000),
    sizes: Array.isArray(product.sizes) ? product.sizes.slice(0, 30).map((s: any) => String(s || '')) : (idx >= 0 && Array.isArray(productsStore[idx].sizes) ? productsStore[idx].sizes.slice(0, 30) : []),
    colors: Array.isArray(product.colors) ? product.colors.slice(0, 30).map((c: any) => String(c || '')) : (idx >= 0 && Array.isArray(productsStore[idx].colors) ? productsStore[idx].colors.slice(0, 30) : []),
    position: isNewProduct ? 1 : (typeof product.position === 'number' ? Math.max(1, Math.min(10000, product.position)) : (existingPosition ?? idx + 1)),
    showOnHome,
    videoUrl: videoUrl.slice(0, 500),
    createdAt: isNewProduct ? nowIso : (existingCreatedAt || product.createdAt || nowIso),
    updatedAt: nowIso
  };

  if (idx >= 0) {
    productsStore[idx] = payload;
  } else {
    // New product always goes to the 1st position in the list; shift existing products' positions
    productsStore = [
      payload,
      ...productsStore.map((p: any, i: number) => ({
        ...p,
        position: i + 2
      }))
    ];
  }
  savePersistedStore();

  try {
    const { saveFirestoreProduct, saveFirestoreProductsOrder, markCatalogInitialized } = await import('./src/firebase.ts');
    if (isNewProduct) {
      await saveFirestoreProductsOrder(productsStore);
    } else {
      await saveFirestoreProduct(payload);
    }
    await markCatalogInitialized();
  } catch (err) {
    console.error('Error saving product to Firestore:', err);
  }

  return res.json({ ok: true, product: payload, products: productsStore });
});

// Quick Toggle Product Visibility on Home Page / Index (Admin — Persisted to Firebase Firestore)
app.patch('/api/products/:id/home-visibility', async (req: Request, res: Response) => {
  if (!verifyAdmin(req)) {
    return res.status(401).json({ error: "Non autorisé" });
  }
  const id = Number(req.params.id);
  const idx = productsStore.findIndex((p: any) => Number(p.id) === id);
  if (idx < 0) {
    return res.status(404).json({ error: "Produit introuvable" });
  }
  const currentVal = productsStore[idx].showOnHome !== false;
  const nextVal = req.body && req.body.showOnHome !== undefined ? Boolean(req.body.showOnHome) : !currentVal;

  const updatedProduct = {
    ...productsStore[idx],
    showOnHome: nextVal,
    updatedAt: new Date().toISOString()
  };
  productsStore[idx] = updatedProduct;
  savePersistedStore();

  try {
    const { saveFirestoreProduct, markCatalogInitialized } = await import('./src/firebase.ts');
    await saveFirestoreProduct(updatedProduct);
    await markCatalogInitialized();
  } catch (err) {
    console.error('Error updating product home visibility in Firestore:', err);
  }

  return res.json({ ok: true, product: updatedProduct, products: productsStore });
});

// Delete product (Admin — Deleted from Firebase Firestore)
app.delete('/api/products/:id', async (req: Request, res: Response) => {
  if (!verifyAdmin(req)) {
    return res.status(401).json({ error: "Non autorisé" });
  }
  const id = Number(req.params.id);
  productsStore = productsStore
    .filter((p: any) => p.id !== id)
    .map((p: any, i: number) => ({ ...p, position: i + 1 }));
  savePersistedStore();

  try {
    const { deleteFirestoreProduct, saveFirestoreProductsOrder, markCatalogInitialized } = await import('./src/firebase.ts');
    await deleteFirestoreProduct(id);
    if (productsStore.length > 0) {
      await saveFirestoreProductsOrder(productsStore);
    }
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
  const incomingWa = data.whatsappNumber || data.supportPhone;
  let phoneSynced = false;
  if (incomingWa && String(incomingWa).replace(/\D/g, '')) {
    const { e164, display } = normalizePhoneParts(String(incomingWa));
    cmsStore.whatsappNumber = e164;
    cmsStore.supportPhone = display;
    adminConfigStore = { ...adminConfigStore, adminWhatsappPhone: e164 };
    phoneSynced = true;
  }
  savePersistedStore();
  try {
    const { saveCmsSettings, saveAdminConfig } = await import('./src/firebase.ts');
    await saveCmsSettings(cmsStore);
    if (phoneSynced) {
      await saveAdminConfig(adminConfigStore);
    }
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
// COUPONS / DISCOUNT ROUTES (Admin CRUD + Public Validation)
// ==========================================
app.post('/api/coupons/validate', async (req: Request, res: Response) => {
  try {
    const { fetchCouponsSettings } = await import('./src/firebase.ts');
    const remoteCoupons = await fetchCouponsSettings();
    if (remoteCoupons && Array.isArray(remoteCoupons)) {
      couponsStore = remoteCoupons;
    }
  } catch {}

  const { code, subtotal = 0 } = req.body || {};
  const result = validateAndComputeCoupon(String(code || ''), Math.max(0, Number(subtotal) || 0));
  if (!result.valid) {
    return res.status(400).json(result);
  }
  return res.json({
    valid: true,
    code: result.code,
    type: result.type,
    value: result.value,
    minOrder: result.minOrder,
    discount: result.discount,
    labelFr: result.labelFr,
    labelAr: result.labelAr
  });
});

app.get('/api/coupons', async (req: Request, res: Response) => {
  if (!verifyAdmin(req)) {
    return res.status(401).json({ error: "Non autorisé" });
  }
  try {
    const { fetchCouponsSettings } = await import('./src/firebase.ts');
    const remoteCoupons = await fetchCouponsSettings();
    if (remoteCoupons && Array.isArray(remoteCoupons)) {
      couponsStore = remoteCoupons;
      savePersistedStore();
    }
  } catch (err) {
    console.warn('Note: Using cached couponsStore:', err);
  }
  return res.json(couponsStore);
});

app.post('/api/coupons', async (req: Request, res: Response) => {
  if (!verifyAdmin(req)) {
    return res.status(401).json({ error: "Non autorisé" });
  }
  const {
    code,
    type = 'percent',
    value,
    minOrder = 0,
    maxUses = null,
    expiresAt = '',
    active = true,
    description = ''
  } = req.body || {};

  const cleanCode = String(code || '').trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');
  if (!cleanCode || cleanCode.length < 2 || cleanCode.length > 40) {
    return res.status(400).json({ error: "Le code coupon doit contenir entre 2 et 40 caractères (lettres/chiffres)." });
  }
  if (couponsStore.some((c: any) => String(c.code || '').toUpperCase() === cleanCode)) {
    return res.status(409).json({ error: `Le code "${cleanCode}" existe déjà.` });
  }
  const couponType = type === 'fixed' ? 'fixed' : 'percent';
  const numValue = Number(value);
  if (!Number.isFinite(numValue) || numValue <= 0 || (couponType === 'percent' && numValue > 100)) {
    return res.status(400).json({
      error: couponType === 'percent'
        ? "Le pourcentage de remise doit être compris entre 1 et 100%."
        : "Le montant de remise doit être supérieur à 0 MAD."
    });
  }

  const newCoupon = {
    id: Date.now(),
    code: cleanCode,
    type: couponType,
    value: Math.round(numValue),
    minOrder: Math.max(0, Number(minOrder) || 0),
    maxUses: maxUses !== null && maxUses !== undefined && maxUses !== '' && Number(maxUses) > 0 ? Math.floor(Number(maxUses)) : null,
    usedCount: 0,
    expiresAt: String(expiresAt || '').trim(),
    active: Boolean(active),
    description: String(description || '').trim().slice(0, 200),
    createdAt: new Date().toISOString()
  };

  couponsStore.unshift(newCoupon);
  savePersistedStore();
  try {
    const { saveCouponsSettings } = await import('./src/firebase.ts');
    await saveCouponsSettings(couponsStore);
  } catch (err) {
    console.warn('Note: Coupons sync error:', err);
  }
  return res.status(201).json({ ok: true, coupon: newCoupon, coupons: couponsStore });
});

app.put('/api/coupons/:id', async (req: Request, res: Response) => {
  if (!verifyAdmin(req)) {
    return res.status(401).json({ error: "Non autorisé" });
  }
  const id = Number(req.params.id);
  const idx = couponsStore.findIndex((c: any) => Number(c.id) === id);
  if (idx === -1) {
    return res.status(404).json({ error: "Coupon introuvable" });
  }

  const body = req.body || {};
  const existing = couponsStore[idx];
  const nextCode = body.code !== undefined
    ? String(body.code).trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '')
    : existing.code;

  if (!nextCode || nextCode.length < 2 || nextCode.length > 40) {
    return res.status(400).json({ error: "Code coupon invalide (2 à 40 caractères)." });
  }
  if (couponsStore.some((c: any) => Number(c.id) !== id && String(c.code || '').toUpperCase() === nextCode)) {
    return res.status(409).json({ error: `Le code "${nextCode}" est déjà utilisé par un autre coupon.` });
  }

  const nextType = body.type !== undefined ? (body.type === 'fixed' ? 'fixed' : 'percent') : existing.type;
  const nextValue = body.value !== undefined ? Number(body.value) : Number(existing.value);
  if (!Number.isFinite(nextValue) || nextValue <= 0 || (nextType === 'percent' && nextValue > 100)) {
    return res.status(400).json({ error: "Valeur de remise invalide." });
  }

  couponsStore[idx] = {
    ...existing,
    code: nextCode,
    type: nextType,
    value: Math.round(nextValue),
    minOrder: body.minOrder !== undefined ? Math.max(0, Number(body.minOrder) || 0) : (existing.minOrder || 0),
    maxUses: body.maxUses !== undefined
      ? (body.maxUses !== null && body.maxUses !== '' && Number(body.maxUses) > 0 ? Math.floor(Number(body.maxUses)) : null)
      : (existing.maxUses ?? null),
    expiresAt: body.expiresAt !== undefined ? String(body.expiresAt || '').trim() : (existing.expiresAt || ''),
    active: body.active !== undefined ? Boolean(body.active) : Boolean(existing.active),
    description: body.description !== undefined ? String(body.description || '').trim().slice(0, 200) : (existing.description || '')
  };

  savePersistedStore();
  try {
    const { saveCouponsSettings } = await import('./src/firebase.ts');
    await saveCouponsSettings(couponsStore);
  } catch (err) {
    console.warn('Note: Coupons sync error:', err);
  }
  return res.json({ ok: true, coupon: couponsStore[idx], coupons: couponsStore });
});

app.delete('/api/coupons/:id', async (req: Request, res: Response) => {
  if (!verifyAdmin(req)) {
    return res.status(401).json({ error: "Non autorisé" });
  }
  const id = Number(req.params.id);
  couponsStore = couponsStore.filter((c: any) => Number(c.id) !== id);
  savePersistedStore();
  try {
    const { saveCouponsSettings } = await import('./src/firebase.ts');
    await saveCouponsSettings(couponsStore);
  } catch (err) {
    console.warn('Note: Coupons sync error:', err);
  }
  return res.json({ ok: true, id, coupons: couponsStore });
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
  const stockChanges: { prod: any; qty: number; size: string; color: string }[] = [];

  for (const item of items) {
    const prod = productsStore.find((p: any) => p.id === Number(item.productId || item.id));
    if (!prod) {
      return res.status(400).json({ error: `Produit introuvable : ${item.nameFr || item.name || 'ID ' + item.productId}` });
    }

    const qty = Math.max(1, parseInt(item.quantity || item.qty, 10) || 1);
    const chosenSize = String(item.size || (prod.sizes && prod.sizes[0]) || "Unique").trim();
    const chosenColor = String(item.color || (prod.colors && prod.colors[0]) || "Default").trim();
    const colorLabel = formatColorLabelFr(chosenColor);

    const hasVariants = prod.variantStock && typeof prod.variantStock === 'object' && Object.keys(prod.variantStock).length > 0;
    const availableStock = hasVariants
      ? getVariantStockValue(prod, chosenSize, chosenColor)
      : Math.max(0, Number(prod.stock) || 0);

    if (availableStock <= 0) {
      return res.status(409).json({
        error: `Désolé, la taille "${chosenSize}" en couleur "${colorLabel}" pour "${prod.nameFr}" n'est plus en stock (épuisée).`
      });
    }

    if (availableStock < qty) {
      return res.status(409).json({
        error: `Stock insuffisant pour "${prod.nameFr}" (Taille : ${chosenSize}, Couleur : ${colorLabel}). Disponible en stock : ${availableStock}.`
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
      size: chosenSize,
      color: chosenColor,
      colorLabel,
      image: (prod.images && prod.images[0]) || ""
    });

    stockChanges.push({ prod, qty, size: chosenSize, color: chosenColor });
  }

  // Apply stock decrement atomically per variant (size × color) and total product stock
  for (const { prod, qty, size, color } of stockChanges) {
    if (prod.variantStock && typeof prod.variantStock === 'object' && Object.keys(prod.variantStock).length > 0) {
      const exactKey = makeVariantKey(size, color);
      let matchedKey = exactKey;
      if (prod.variantStock[matchedKey] === undefined) {
        const sLower = size.toLowerCase();
        const cLower = color.toLowerCase();
        for (const k of Object.keys(prod.variantStock)) {
          const [ks, kc] = String(k).split('__');
          if (ks && kc && ks.trim().toLowerCase() === sLower && (kc.trim().toLowerCase() === cLower || formatColorLabelFr(kc).toLowerCase() === formatColorLabelFr(color).toLowerCase())) {
            matchedKey = k;
            break;
          }
        }
      }
      const curVal = Math.max(0, Number(prod.variantStock[matchedKey]) || 0);
      prod.variantStock[matchedKey] = Math.max(0, curVal - qty);
      prod.stock = Object.values(prod.variantStock).reduce((sum: number, v: any) => sum + Math.max(0, Number(v) || 0), 0);
      prod.inStock = prod.stock > 0;
    } else {
      prod.stock = Math.max(0, (Number(prod.stock) || 0) - qty);
      prod.inStock = prod.stock > 0;
    }
  }

  let discount = 0;
  let appliedPromoCode: string | null = null;
  const cleanPromo = String(promoCode || "").trim().toUpperCase();
  if (cleanPromo) {
    const couponCheck = validateAndComputeCoupon(cleanPromo, subtotal);
    if (couponCheck.valid && couponCheck.coupon) {
      discount = couponCheck.discount;
      appliedPromoCode = couponCheck.code || cleanPromo;
      couponCheck.coupon.usedCount = Number(couponCheck.coupon.usedCount || 0) + 1;
    }
  }

  const total = Math.max(0, subtotal - discount);
  const orderId = generateOrderId();
  const orderDate = new Date().toISOString();

  const realShippingCost = getCityRealShippingCost(String(city));

  const newOrder: any = {
    id: orderId,
    date: orderDate,
    updatedAt: orderDate,
    status: "En attente",
    customerName: String(customerName).trim(),
    customerPhone: cleanPhone,
    city: String(city).trim(),
    address: String(address).trim(),
    notes: String(notes || "").trim(),
    items: verifiedItems,
    subtotal,
    discount,
    promoCode: appliedPromoCode,
    shippingFee: 0,
    realShippingCost,
    shipment: null,
    exchangeInfo: null,
    source: "Web",
    total,
    paymentMethod: "COD (Paiement à la livraison)"
  };

  ordersStore.unshift(newOrder);

  // If this checkout came from a captured abandoned draft, remove it automatically so it isn't double-counted
  const reqDraftId = String(req.body?.draftId || '').trim().toUpperCase();
  const matchedDraftIds = draftOrdersStore
    .filter((d: any) =>
      (reqDraftId && String(d?.id || '').trim().toUpperCase() === reqDraftId) ||
      (String(d?.customerPhone || '').trim() === cleanPhone)
    )
    .map((d: any) => String(d.id).trim().toUpperCase());
  if (matchedDraftIds.length > 0) {
    draftOrdersStore = draftOrdersStore.filter((d: any) => !matchedDraftIds.includes(String(d?.id || '').trim().toUpperCase()));
  }
  savePersistedStore();

  // Sync Order, Coupon usage count, updated Product Stock, and cleanup converted Drafts in Firestore
  try {
    const { createFirestoreOrder, saveFirestoreProduct, saveCouponsSettings, deleteFirestoreDraftOrder } = await import('./src/firebase.ts');
    await createFirestoreOrder(newOrder);
    for (const { prod } of stockChanges) {
      await saveFirestoreProduct(prod);
    }
    if (appliedPromoCode) {
      await saveCouponsSettings(couponsStore);
    }
    for (const did of matchedDraftIds) {
      await deleteFirestoreDraftOrder(did).catch(() => {});
    }
  } catch (err) {
    console.warn('Firestore order sync note:', err);
  }

  // Auto-sync immediately with Ozon Express if configured & autoSyncOnOrder is enabled
  if (
    adminConfigStore.carriersConfig?.autoSyncOnOrder &&
    adminConfigStore.carriersConfig?.ozon?.enabled !== false &&
    adminConfigStore.carriersConfig?.ozon?.customerId &&
    adminConfigStore.carriersConfig?.ozon?.apiKey
  ) {
    try {
      const autoRes = await dispatchOrderToCarrier(newOrder, 'ozon', { allowLocalFallback: false });
      if (autoRes.ok && autoRes.order) {
        newOrder.shipment = autoRes.order.shipment;
        newOrder.status = autoRes.order.status;
        newOrder.updatedAt = autoRes.order.updatedAt;
      }
    } catch (autoErr) {
      console.warn('Ozon autoSyncOnOrder notice:', autoErr);
    }
  }

  // Trigger Automatic WhatsApp Notification to Admin
  let adminWhatsappUrl = "";
  let sentViaApi = false;
  try {
    const notifyResult = await sendAdminWhatsAppOrderAlert(newOrder);
    adminWhatsappUrl = notifyResult.whatsappUrl;
    sentViaApi = notifyResult.sentViaApi;
  } catch (err) {
    console.warn('WhatsApp notification note:', err);
  }

  return res.status(201).json({
    ok: true,
    order: newOrder,
    adminWhatsappUrl,
    sentViaApi,
    autoRedirectCustomerToWhatsapp: adminConfigStore.autoRedirectCustomerToWhatsapp !== false
  });
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

  // Auto-sync to Ozon Express when order transitions to "Confirmée" and hasn't been synced via API yet
  if (
    status === 'Confirmée' &&
    (!order.shipment || order.shipment.mode !== 'api') &&
    adminConfigStore.carriersConfig?.autoSyncOnConfirm &&
    adminConfigStore.carriersConfig?.ozon?.enabled !== false &&
    adminConfigStore.carriersConfig?.ozon?.customerId &&
    adminConfigStore.carriersConfig?.ozon?.apiKey
  ) {
    try {
      const autoRes = await dispatchOrderToCarrier(order, 'ozon', { allowLocalFallback: false });
      if (autoRes.ok && autoRes.order) {
        order = autoRes.order;
      }
    } catch (autoErr) {
      console.warn('Ozon autoSyncOnConfirm notice:', autoErr);
    }
  }

  return res.json({ ok: true, order });
});

// Edit full order details (Admin — Persisted in Firebase Firestore)
app.put('/api/orders/:id', async (req: Request, res: Response) => {
  if (!verifyAdmin(req)) {
    return res.status(401).json({ error: "Non autorisé" });
  }
  const orderId = String(req.params.id).trim().toUpperCase();
  const idx = ordersStore.findIndex(o => String(o.id || '').trim().toUpperCase() === orderId);
  let existingOrder = idx >= 0 ? ordersStore[idx] : null;
  if (!existingOrder) {
    try {
      const { getFirestoreOrder } = await import('./src/firebase.ts');
      existingOrder = await getFirestoreOrder(orderId);
      if (existingOrder) {
        ordersStore.unshift(existingOrder);
      }
    } catch {}
  }
  if (!existingOrder) {
    return res.status(404).json({ error: "Commande introuvable" });
  }

  const body = req.body || {};
  const customerName = String(body.customerName ?? existingOrder.customerName ?? '').trim().slice(0, 200);
  const cleanPhone = String(body.customerPhone ?? existingOrder.customerPhone ?? '').trim().replace(/\s+/g, '');
  const city = String(body.city ?? existingOrder.city ?? '').trim().slice(0, 100);
  const address = String(body.address ?? existingOrder.address ?? '').trim().slice(0, 500);
  const notes = String(body.notes ?? existingOrder.notes ?? '').trim().slice(0, 500);
  const status = String(body.status ?? existingOrder.status ?? 'En attente').trim();
  const paymentMethod = String(body.paymentMethod ?? existingOrder.paymentMethod ?? 'COD (Paiement à la livraison)').trim().slice(0, 100);

  if (customerName.length < 1) {
    return res.status(400).json({ error: "Le nom du client est obligatoire." });
  }
  if (!/^(06|07)\d{8}$/.test(cleanPhone)) {
    return res.status(400).json({ error: "Le numéro de téléphone doit comporter 10 chiffres et commencer par 06 ou 07." });
  }
  if (city.length < 1 || address.length < 1) {
    return res.status(400).json({ error: "La ville et l'adresse sont obligatoires." });
  }
  if (!ALLOWED_STATUSES.includes(status)) {
    return res.status(400).json({ error: "Statut de commande invalide." });
  }

  const rawItems = Array.isArray(body.items) ? body.items : existingOrder.items;
  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    return res.status(400).json({ error: "La commande doit contenir au moins un article." });
  }

  const cleanItems = rawItems.slice(0, 100).map((it: any) => {
    const qty = Math.max(1, Math.floor(Number(it.quantity || it.qty || 1) || 1));
    const unitPrice = Math.max(0, Number(it.price || 0) || 0);
    const chosenSize = String(it.size || 'Unique').trim() || 'Unique';
    const chosenColor = String(it.color || 'Standard').trim() || 'Standard';
    const computedColorLabel = it.colorLabel
      ? String(it.colorLabel).trim()
      : formatColorLabelFr(chosenColor);
    return {
      productId: it.productId !== undefined ? Number(it.productId) : (it.id !== undefined ? Number(it.id) : 0),
      nameFr: String(it.nameFr || it.name || 'Article').trim(),
      nameAr: String(it.nameAr || it.nameFr || it.name || 'منتج').trim(),
      price: unitPrice,
      quantity: qty,
      size: chosenSize,
      color: chosenColor,
      colorLabel: computedColorLabel,
      image: String(it.image || '')
    };
  });

  const subtotal = cleanItems.reduce((sum: number, it: any) => sum + Number(it.price) * Number(it.quantity), 0);
  const discount = Math.max(0, Number(body.discount ?? existingOrder.discount ?? 0) || 0);
  const shippingFee = Math.max(0, Number(body.shippingFee ?? existingOrder.shippingFee ?? 0) || 0);
  const promoCodeRaw = body.promoCode !== undefined ? body.promoCode : existingOrder.promoCode;
  const promoCode = promoCodeRaw && String(promoCodeRaw).trim()
    ? String(promoCodeRaw).trim().toUpperCase().slice(0, 40)
    : null;
  const total = Math.max(0, subtotal - discount + shippingFee);

  const realShippingCost = body.realShippingCost !== undefined && body.realShippingCost !== null && body.realShippingCost !== ''
    ? Math.max(0, Number(body.realShippingCost) || 0)
    : (existingOrder.realShippingCost !== undefined && existingOrder.realShippingCost !== null && String(existingOrder.city || '').trim() === city
      ? Math.max(0, Number(existingOrder.realShippingCost) || 0)
      : getCityRealShippingCost(city));

  const updatedOrder = {
    id: orderId,
    date: String(existingOrder.date || new Date().toISOString()),
    status,
    customerName,
    customerPhone: cleanPhone,
    city,
    address,
    notes,
    items: cleanItems,
    subtotal,
    discount,
    promoCode,
    shippingFee,
    realShippingCost,
    shipment: existingOrder.shipment || null,
    exchangeInfo: existingOrder.exchangeInfo || null,
    source: String(body.source ?? existingOrder.source ?? 'Web').trim().slice(0, 40),
    total,
    paymentMethod,
    updatedAt: new Date().toISOString()
  };

  const targetIdx = ordersStore.findIndex(o => String(o.id || '').trim().toUpperCase() === orderId);
  if (targetIdx >= 0) {
    ordersStore[targetIdx] = updatedOrder;
  } else {
    ordersStore.unshift(updatedOrder);
  }
  savePersistedStore();

  try {
    const { updateFirestoreOrder } = await import('./src/firebase.ts');
    await updateFirestoreOrder(orderId, updatedOrder);
  } catch (err) {
    console.error('Error updating order in Firestore:', err);
  }

  let finalOrder = updatedOrder;
  if (
    status === 'Confirmée' &&
    (!finalOrder.shipment || finalOrder.shipment.mode !== 'api') &&
    adminConfigStore.carriersConfig?.autoSyncOnConfirm &&
    adminConfigStore.carriersConfig?.ozon?.enabled !== false &&
    adminConfigStore.carriersConfig?.ozon?.customerId &&
    adminConfigStore.carriersConfig?.ozon?.apiKey
  ) {
    try {
      const autoRes = await dispatchOrderToCarrier(finalOrder, 'ozon', { allowLocalFallback: false });
      if (autoRes.ok && autoRes.order) {
        finalOrder = autoRes.order;
      }
    } catch {}
  }

  return res.json({ ok: true, order: finalOrder });
});

// Bulk Order Status Update (Admin — Update multiple orders in one batch & sync Firestore)
app.post('/api/orders/bulk-status', async (req: Request, res: Response) => {
  if (!verifyAdmin(req)) {
    return res.status(401).json({ error: "Non autorisé" });
  }
  const { orderIds, status } = req.body || {};
  if (!Array.isArray(orderIds) || orderIds.length === 0) {
    return res.status(400).json({ error: "Veuillez sélectionner au moins une commande." });
  }
  if (!ALLOWED_STATUSES.includes(status)) {
    return res.status(400).json({ error: "Statut invalide." });
  }

  const normalizedIds = Array.from(new Set(orderIds.map((id: any) => String(id || '').trim().toUpperCase()).filter(Boolean)));
  const nowIso = new Date().toISOString();
  let updatedCount = 0;

  ordersStore = ordersStore.map((o: any) => {
    const oid = String(o?.id || '').trim().toUpperCase();
    if (normalizedIds.includes(oid)) {
      updatedCount += 1;
      return { ...o, status, updatedAt: nowIso };
    }
    return o;
  });
  savePersistedStore();

  try {
    const { updateFirestoreBulkOrderStatuses } = await import('./src/firebase.ts');
    await updateFirestoreBulkOrderStatuses(normalizedIds, status);
  } catch (err) {
    console.error('Error in bulk status update Firestore:', err);
  }

  let autoSyncedCount = 0;
  if (
    status === 'Confirmée' &&
    adminConfigStore.carriersConfig?.autoSyncOnConfirm &&
    adminConfigStore.carriersConfig?.ozon?.enabled !== false &&
    adminConfigStore.carriersConfig?.ozon?.customerId &&
    adminConfigStore.carriersConfig?.ozon?.apiKey
  ) {
    for (const oid of normalizedIds) {
      const target = ordersStore.find(o => String(o?.id || '').trim().toUpperCase() === oid);
      if (target && (!target.shipment || target.shipment.mode !== 'api')) {
        try {
          const autoRes = await dispatchOrderToCarrier(target, 'ozon', { allowLocalFallback: false });
          if (autoRes.ok && autoRes.shipment?.mode === 'api') autoSyncedCount += 1;
        } catch {}
      }
    }
  }

  return res.json({ ok: true, updatedCount, autoSyncedCount, status, orderIds: normalizedIds });
});

// ==========================================
// CARRIER API INTEGRATION (Ozon Express, Cathedis, Amana)
// ==========================================
const CARRIER_META: Record<string, { label: string; prefix: string }> = {
  ozon: { label: 'Ozon Express', prefix: 'OZ' },
  cathedis: { label: 'Cathedis', prefix: 'CT' },
  amana: { label: 'Amana Express', prefix: 'AM' }
};

const CARRIER_STATUS_LABELS: Record<string, string> = {
  PICKUP_PENDING: 'En attente de ramassage',
  IN_TRANSIT: 'En transit / Acheminement',
  OUT_FOR_DELIVERY: 'En cours de livraison',
  DELIVERED: 'Livré au client',
  RETURNED: 'Retour expéditeur'
};

interface OzonCityEntry {
  ID: number;
  REF: string;
  NAME: string;
  'DELIVERED-PRICE'?: number;
}
let ozonCitiesCache: OzonCityEntry[] = [];
let ozonCitiesCacheTime = 0;

function normalizeMoroccoCityStr(raw: string): string {
  return String(raw || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/['’\-_]/g, ' ')
    .replace(/\s+/g, ' ');
}

async function fetchOzonCities(forceRefresh = false): Promise<OzonCityEntry[]> {
  if (!forceRefresh && ozonCitiesCache.length > 0 && (Date.now() - ozonCitiesCacheTime) < 6 * 3600 * 1000) {
    return ozonCitiesCache;
  }
  try {
    const resp = await fetch('https://api.ozonexpress.ma/cities', { signal: AbortSignal.timeout(7000) });
    if (resp.ok) {
      const json: any = await resp.json().catch(() => null);
      const citiesObj = json?.CITIES || json?.cities || json;
      if (citiesObj && typeof citiesObj === 'object') {
        const list = Object.values(citiesObj).filter((c: any) => c && c.ID !== undefined && c.NAME) as OzonCityEntry[];
        if (list.length > 0) {
          ozonCitiesCache = list;
          ozonCitiesCacheTime = Date.now();
        }
      }
    }
  } catch (err) {
    console.warn('Ozon Express cities fetch note:', err);
  }
  return ozonCitiesCache;
}

async function resolveOzonCityId(cityName: string): Promise<OzonCityEntry | null> {
  const clean = normalizeMoroccoCityStr(cityName);
  if (!clean) return null;
  const cities = await fetchOzonCities();
  if (!cities.length) return null;

  // Common bilingual/spelling aliases
  const aliases: Record<string, string[]> = {
    'casablanca': ['casablanca', 'casa', 'dar el beida'],
    'rabat': ['rabat'],
    'sale': ['sale', 'salé'],
    'kenitra': ['kenitra', 'kénitra'],
    'temara': ['temara', 'témara'],
    'mohammedia': ['mohammedia', 'mohammédia'],
    'tanger': ['tanger', 'tangier'],
    'marrakech': ['marrakech', 'marrakesh'],
    'fes': ['fes', 'fès'],
    'meknes': ['meknes', 'meknès'],
    'tetouan': ['tetouan', 'tétouan'],
    'agadir': ['agadir'],
    'oujda': ['oujda'],
    'laayoune': ['laayoune', 'laâyoune'],
    'beni mellal': ['beni mellal', 'béni mellal']
  };

  // 1. Exact normalized match
  const exact = cities.find(c => normalizeMoroccoCityStr(c.NAME) === clean);
  if (exact) return exact;

  // 2. Alias group match
  for (const [, variants] of Object.entries(aliases)) {
    if (variants.some(v => normalizeMoroccoCityStr(v) === clean)) {
      const match = cities.find(c => variants.some(v => normalizeMoroccoCityStr(c.NAME) === normalizeMoroccoCityStr(v)));
      if (match) return match;
    }
  }

  // 3. Substring/startsWith match (e.g. "Casablanca - Maarif" -> "Casablanca")
  const partial = cities.find(c => {
    const cn = normalizeMoroccoCityStr(c.NAME);
    return clean.includes(cn) || cn.includes(clean);
  });
  return partial || null;
}

function mapCarrierStatusToOrderStatus(carrierStatus: string, currentOrderStatus: string): string {
  if (carrierStatus === 'DELIVERED') return 'Livrée';
  if (carrierStatus === 'IN_TRANSIT' || carrierStatus === 'OUT_FOR_DELIVERY') return 'En cours';
  if (carrierStatus === 'RETURNED') return 'Annulée';
  if (currentOrderStatus === 'En attente') return 'Confirmée';
  return currentOrderStatus || 'Confirmée';
}

function mapOzonRawStatus(rawStatusText: string): string {
  const rawSt = String(rawStatusText || '').toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (rawSt.includes('LIVR') || rawSt.includes('DELIVER')) return 'DELIVERED';
  if (rawSt.includes('DIST') || rawSt.includes('OUT FOR') || rawSt.includes('COURS DE LIV')) return 'OUT_FOR_DELIVERY';
  if (rawSt.includes('EXP') || rawSt.includes('TRANS') || rawSt.includes('RAMASS') || rawSt.includes('REC') || rawSt.includes('HUB') || rawSt.includes('SHIP')) return 'IN_TRANSIT';
  if (rawSt.includes('RET') || rawSt.includes('ANNUL') || rawSt.includes('REFUS')) return 'RETURNED';
  return 'PICKUP_PENDING';
}

async function dispatchOrderToCarrier(
  order: any,
  carrierKey: 'ozon' | 'cathedis' | 'amana',
  options: { allowLocalFallback?: boolean } = { allowLocalFallback: true }
): Promise<{ ok: boolean; order?: any; shipment?: any; error?: string }> {
  const orderId = String(order?.id || '').trim().toUpperCase();
  const meta = CARRIER_META[carrierKey];
  const cfg = adminConfigStore.carriersConfig?.[carrierKey] || { enabled: true, apiKey: '', apiUrl: '' };

  const parcelSuffix = orderId.replace(/^CMD-/, '');
  let trackingNumber = `${meta.prefix}-${parcelSuffix}-${String(Date.now()).slice(-4)}`;
  let externalId = '';
  let mode: 'api' | 'bordereau' = 'bordereau';
  let lastError = '';

  const itemsSummary = (Array.isArray(order.items) ? order.items : [])
    .map((it: any) => `${it.nameFr}${it.size ? ' (' + it.size + ')' : ''} x${it.quantity || 1}`)
    .join(', ');
  const apiKey = String(cfg.apiKey || '').trim();
  const apiUrl = String(cfg.apiUrl || '').trim();

  if (apiKey && apiUrl) {
    try {
      if (carrierKey === 'ozon') {
        const customerId = String(cfg.customerId || '').trim();
        if (!customerId) {
          lastError = "ID Client Ozon Express manquant dans Paramètres -> Livraison & Tél.";
        } else {
          const cleanBase = apiUrl.replace(/\/+$/, '');
          const targetEndpoint = cleanBase.endsWith('/add-parcel')
            ? cleanBase
            : (cleanBase.includes(`/${customerId}/${apiKey}`)
              ? `${cleanBase}/add-parcel`
              : `${cleanBase}/${encodeURIComponent(customerId)}/${encodeURIComponent(apiKey)}/add-parcel`);

          const matchedCity = await resolveOzonCityId(order.city || '');
          const ozonCityParam = matchedCity ? String(matchedCity.ID) : String(order.city || '');
          const isExchange = order.status === 'Échange en cours' || Boolean(order.exchangeInfo?.active);

          const formParams = new URLSearchParams({
            'tracking-number': '',
            'parcel-receiver': String(order.customerName || '').trim(),
            'parcel-phone': String(order.customerPhone || '').trim(),
            'parcel-city': ozonCityParam,
            'parcel-address': String(order.address || '').trim(),
            'parcel-note': order.notes ? `${orderId} - ${order.notes}` : `${orderId} - ${itemsSummary}`.slice(0, 250),
            'parcel-price': String(Math.max(0, Math.round(Number(order.total || 0)))),
            'parcel-nature': (itemsSummary || 'Essentiels MODANOVA').slice(0, 150),
            'parcel-stock': cfg.stockMode ? '1' : '0',
            'parcel-open': cfg.openPackage === false ? '0' : '1',
            'parcel-fragile': cfg.fragile ? '1' : '0',
            'parcel-replace': isExchange ? '1' : '0'
          });

          const apiResp = await fetch(targetEndpoint, {
            method: 'POST',
            body: formParams,
            signal: AbortSignal.timeout(9000)
          });
          const rawText = await apiResp.text();
          let json: any = null;
          try { json = JSON.parse(rawText); } catch {}

          if (json?.CHECK_API?.RESULT === 'ERROR') {
            lastError = `Ozon Express : ${json.CHECK_API.MESSAGE || 'ID Client ou Clé API invalide'}`;
          } else if (json?.['ADD-PARCEL']?.RESULT === 'ERROR') {
            lastError = `Ozon Express : ${json['ADD-PARCEL'].MESSAGE || 'Paramètres colis refusés (vérifiez la ville)'}`;
          } else {
            const remoteTrack =
              json?.['ADD-PARCEL']?.['NEW-PARCEL']?.['TRACKING-NUMBER'] ||
              json?.['ADD-PARCEL']?.['TRACKING-NUMBER'] ||
              json?.['NEW-PARCEL']?.['TRACKING-NUMBER'] ||
              json?.['TRACKING-NUMBER'] ||
              json?.trackingNumber ||
              json?.tracking_number ||
              json?.data?.tracking;

            if (remoteTrack) {
              trackingNumber = String(remoteTrack).trim();
              externalId = String(json?.['ADD-PARCEL']?.['NEW-PARCEL']?.ID || json?.id || remoteTrack);
              mode = 'api';
              lastError = '';
            } else {
              lastError = json?.MESSAGE || json?.message || `Réponse Ozon Express inattendue (${apiResp.status}) : ${rawText.slice(0, 120)}`;
            }
          }
        }
      } else {
        let targetEndpoint = apiUrl;
        const fetchHeaders: Record<string, string> = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        };
        const payloadBody: any = {
          receiver: order.customerName,
          phone: order.customerPhone,
          city: order.city,
          address: order.address,
          price: Number(order.total || 0),
          nature: itemsSummary || 'Vêtements & Essentiels',
          reference: order.id,
          note: order.notes || ''
        };
        if (carrierKey === 'cathedis') {
          targetEndpoint = apiUrl.endsWith('/deliveries') ? apiUrl : `${apiUrl.replace(/\/+$/, '')}/v1/deliveries`;
          if (cfg.secretKey) fetchHeaders['X-Secret-Key'] = cfg.secretKey;
        } else if (carrierKey === 'amana') {
          if (cfg.clientCode) payloadBody.clientCode = cfg.clientCode;
        }

        const apiResp = await fetch(targetEndpoint, {
          method: 'POST',
          headers: fetchHeaders,
          body: JSON.stringify(payloadBody),
          signal: AbortSignal.timeout(7000)
        });
        const json: any = await apiResp.json().catch(() => null);
        if (apiResp.ok && json) {
          const remoteTrack = json['TRACKING-NUMBER'] || json.trackingNumber || json.tracking_number || json.code || json.data?.tracking;
          if (remoteTrack) {
            trackingNumber = String(remoteTrack).trim();
            externalId = String(json.id || json.parcel_id || remoteTrack);
            mode = 'api';
          } else {
            lastError = json.message || json.error || 'Réponse API sans code de suivi — bordereau local généré.';
          }
        } else {
          lastError = `API ${meta.label} (${apiResp.status}) — bordereau local généré.`;
        }
      }
    } catch (apiErr: any) {
      lastError = `Connexion ${meta.label} indisponible (${apiErr?.message || 'timeout'}) — bordereau local généré.`;
    }
  }

  // If called in strict auto-sync mode and live API failed, do NOT attach fake local bordereau
  if (options.allowLocalFallback === false && mode !== 'api') {
    return { ok: false, error: lastError || 'Synchronisation API non aboutie' };
  }

  const nowIso = new Date().toISOString();
  const shipment = {
    carrier: carrierKey,
    carrierLabel: meta.label,
    trackingNumber,
    barcodeValue: trackingNumber,
    status: 'PICKUP_PENDING',
    statusLabel: CARRIER_STATUS_LABELS['PICKUP_PENDING'],
    mode,
    pickupCity: adminConfigStore.carriersConfig?.pickupCity || 'Kénitra',
    externalId,
    lastError: lastError.slice(0, 480),
    createdAt: order.shipment?.createdAt || nowIso,
    updatedAt: nowIso
  };

  const nextStatus = order.status === 'En attente' ? 'Confirmée' : order.status;
  const updatedOrder = {
    ...order,
    status: nextStatus,
    realShippingCost: order.realShippingCost ?? getCityRealShippingCost(order.city),
    shipment,
    updatedAt: nowIso
  };

  const targetIdx = ordersStore.findIndex(o => String(o.id || '').trim().toUpperCase() === orderId);
  if (targetIdx >= 0) ordersStore[targetIdx] = updatedOrder;
  savePersistedStore();

  try {
    const { updateFirestoreOrder } = await import('./src/firebase.ts');
    await updateFirestoreOrder(orderId, updatedOrder);
  } catch (err) {
    console.error('Error saving shipment to Firestore:', err);
  }

  return { ok: true, order: updatedOrder, shipment };
}

// Generate Shipping Dispatch / Bon d'expédition & Barcode
app.post('/api/orders/:id/shipment', async (req: Request, res: Response) => {
  if (!verifyAdmin(req)) {
    return res.status(401).json({ error: "Non autorisé" });
  }
  const orderId = String(req.params.id).trim().toUpperCase();
  const idx = ordersStore.findIndex(o => String(o.id || '').trim().toUpperCase() === orderId);
  let order = idx >= 0 ? ordersStore[idx] : null;
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

  const rawCarrier = String(req.body?.carrier || adminConfigStore.carriersConfig?.defaultCarrier || 'ozon').toLowerCase();
  const carrierKey: 'ozon' | 'cathedis' | 'amana' = ['ozon', 'cathedis', 'amana'].includes(rawCarrier) ? (rawCarrier as any) : 'ozon';

  const result = await dispatchOrderToCarrier(order, carrierKey, { allowLocalFallback: true });
  return res.json({ ok: true, order: result.order, shipment: result.shipment });
});

// Bulk Dispatch Selected Orders to Carrier (Ozon Express / Cathedis / Amana)
app.post('/api/orders/bulk-shipment', async (req: Request, res: Response) => {
  if (!verifyAdmin(req)) {
    return res.status(401).json({ error: "Non autorisé" });
  }
  const { orderIds, carrier } = req.body || {};
  if (!Array.isArray(orderIds) || orderIds.length === 0) {
    return res.status(400).json({ error: "Veuillez sélectionner au moins une commande." });
  }
  const rawCarrier = String(carrier || adminConfigStore.carriersConfig?.defaultCarrier || 'ozon').toLowerCase();
  const carrierKey: 'ozon' | 'cathedis' | 'amana' = ['ozon', 'cathedis', 'amana'].includes(rawCarrier) ? (rawCarrier as any) : 'ozon';

  const normalizedIds = Array.from(new Set(orderIds.map((id: any) => String(id || '').trim().toUpperCase()).filter(Boolean)));
  let apiSuccessCount = 0;
  let fallbackCount = 0;
  const results: any[] = [];

  for (const oid of normalizedIds) {
    const order = ordersStore.find(o => String(o?.id || '').trim().toUpperCase() === oid);
    if (!order) continue;
    if (order.shipment && order.shipment.mode === 'api') {
      results.push({ id: oid, skipped: true, trackingNumber: order.shipment.trackingNumber });
      apiSuccessCount += 1;
      continue;
    }
    const resDispatch = await dispatchOrderToCarrier(order, carrierKey, { allowLocalFallback: true });
    if (resDispatch.shipment?.mode === 'api') apiSuccessCount += 1;
    else fallbackCount += 1;
    results.push({
      id: oid,
      mode: resDispatch.shipment?.mode,
      trackingNumber: resDispatch.shipment?.trackingNumber,
      lastError: resDispatch.shipment?.lastError || ''
    });
  }

  return res.json({
    ok: true,
    processed: results.length,
    apiSuccessCount,
    fallbackCount,
    results
  });
});

// Refresh / Update Real-Time Carrier Tracking Status
app.post('/api/orders/:id/shipment/refresh', async (req: Request, res: Response) => {
  if (!verifyAdmin(req)) {
    return res.status(401).json({ error: "Non autorisé" });
  }
  const orderId = String(req.params.id).trim().toUpperCase();
  const idx = ordersStore.findIndex(o => String(o.id || '').trim().toUpperCase() === orderId);
  let order = idx >= 0 ? ordersStore[idx] : null;
  if (!order) {
    try {
      const { getFirestoreOrder } = await import('./src/firebase.ts');
      order = await getFirestoreOrder(orderId);
      if (order) ordersStore.unshift(order);
    } catch {}
  }
  if (!order || !order.shipment) {
    return res.status(404).json({ error: "Aucun bon d'expédition généré pour cette commande." });
  }

  const prevShipment = order.shipment;
  const carrierKey = prevShipment.carrier || 'ozon';
  const cfg = adminConfigStore.carriersConfig?.[carrierKey as 'ozon' | 'cathedis' | 'amana'];
  let nextCarrierStatus = String(req.body?.nextStatus || '').trim();
  let lastError = '';

  // If mode === 'api' and no explicit override passed, poll live tracking endpoint
  if (!nextCarrierStatus && prevShipment.mode === 'api' && cfg?.apiKey && cfg?.apiUrl) {
    try {
      let trResp: globalThis.Response;
      if (carrierKey === 'ozon' && cfg.customerId) {
        const cleanBase = cfg.apiUrl.replace(/\/+$/, '').replace(/\/add-parcel$/i, '');
        const trackUrl = cleanBase.includes(`/${cfg.customerId}/${cfg.apiKey}`)
          ? `${cleanBase.replace(/\/tracking$/i, '')}/tracking`
          : `${cleanBase}/${encodeURIComponent(cfg.customerId)}/${encodeURIComponent(cfg.apiKey)}/tracking`;
        trResp = await fetch(trackUrl, {
          method: 'POST',
          body: new URLSearchParams({ 'tracking-number': prevShipment.trackingNumber }),
          signal: AbortSignal.timeout(8000)
        });
      } else {
        const trackUrl = `${cfg.apiUrl.replace(/\/+$/, '')}/tracking/${encodeURIComponent(prevShipment.trackingNumber)}`;
        trResp = await fetch(trackUrl, {
          headers: { Authorization: `Bearer ${cfg.apiKey}` },
          signal: AbortSignal.timeout(7000)
        });
      }
      const trJson: any = await trResp.json().catch(() => null);
      if (trResp.ok && trJson) {
        if (trJson?.CHECK_API?.RESULT === 'ERROR') {
          lastError = `Ozon Express : ${trJson.CHECK_API.MESSAGE || 'Erreur suivi'}`;
        } else {
          const rawSt = String(
            trJson?.TRACKING?.STATUT ||
            trJson?.['PARCEL-INFO']?.STATUT ||
            trJson?.STATUT ||
            trJson?.status ||
            trJson?.state ||
            ''
          );
          if (rawSt) {
            nextCarrierStatus = mapOzonRawStatus(rawSt);
          }
        }
      }
    } catch (err: any) {
      lastError = `Suivi API temporairement indisponible (${err?.message || 'timeout'})`;
    }
  }

  // If no explicit nextStatus from API/request, advance local tracking pipeline smoothly or allow reset
  if (!nextCarrierStatus) {
    const pipeline = ['PICKUP_PENDING', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED'];
    const curPos = pipeline.indexOf(prevShipment.status);
    nextCarrierStatus = curPos >= 0 && curPos < pipeline.length - 1 ? pipeline[curPos + 1] : prevShipment.status;
  }

  const validCarrierStatus = CARRIER_STATUS_LABELS[nextCarrierStatus] ? nextCarrierStatus : prevShipment.status;
  const nowIso = new Date().toISOString();
  const updatedShipment = {
    ...prevShipment,
    status: validCarrierStatus,
    statusLabel: CARRIER_STATUS_LABELS[validCarrierStatus] || prevShipment.statusLabel,
    lastError: lastError.slice(0, 480),
    updatedAt: nowIso
  };
  const syncedOrderStatus = mapCarrierStatusToOrderStatus(validCarrierStatus, order.status);
  const updatedOrder = {
    ...order,
    status: syncedOrderStatus,
    shipment: updatedShipment,
    updatedAt: nowIso
  };

  const targetIdx = ordersStore.findIndex(o => String(o.id || '').trim().toUpperCase() === orderId);
  if (targetIdx >= 0) ordersStore[targetIdx] = updatedOrder;
  savePersistedStore();

  try {
    const { updateFirestoreOrder } = await import('./src/firebase.ts');
    await updateFirestoreOrder(orderId, updatedOrder);
  } catch (err) {
    console.error('Error refreshing shipment in Firestore:', err);
  }

  return res.json({ ok: true, order: updatedOrder, shipment: updatedShipment });
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

// ==========================================
// ABANDONED CART RECOVERY (DRAFT ORDERS)
// ==========================================
const draftCaptureAttempts = new Map<string, { count: number; resetTime: number }>();

app.post('/api/draft-orders', async (req: Request, res: Response) => {
  const ip = getClientIp(req);
  if (!checkRateLimit(draftCaptureAttempts, ip, 120, 10 * 60 * 1000)) {
    return res.status(429).json({ error: "Trop de requêtes." });
  }

  const body = req.body || {};
  const customerName = String(body.customerName || '').trim().slice(0, 200);
  const cleanPhone = String(body.customerPhone || '').trim().replace(/\s+/g, '');
  if (customerName.length < 2 || !/^(06|07)\d{8}$/.test(cleanPhone)) {
    return res.status(400).json({ error: "Nom ou téléphone (06/07) incomplet pour brouillon." });
  }

  const rawItems = Array.isArray(body.items) ? body.items : [];
  if (rawItems.length === 0) {
    return res.status(400).json({ error: "Panier vide." });
  }

  const verifiedItems: any[] = [];
  let subtotal = 0;
  for (const it of rawItems.slice(0, 100)) {
    const prod = productsStore.find((p: any) => Number(p.id) === Number(it.productId || it.id));
    const unitPrice = prod ? Number(prod.price) : Math.max(0, Number(it.price || 0) || 0);
    const qty = Math.max(1, parseInt(it.quantity || it.qty, 10) || 1);
    const chosenSize = String(it.size || (prod?.sizes?.[0]) || 'Unique').trim();
    const chosenColor = String(it.color || (prod?.colors?.[0]) || 'Standard').trim();
    subtotal += unitPrice * qty;
    verifiedItems.push({
      productId: prod ? Number(prod.id) : Number(it.productId || 0),
      nameFr: prod ? prod.nameFr : String(it.nameFr || it.name || 'Article').trim(),
      price: unitPrice,
      quantity: qty,
      size: chosenSize,
      color: chosenColor,
      colorLabel: formatColorLabelFr(chosenColor),
      image: prod?.images?.[0] || String(it.image || '')
    });
  }

  let draftId = String(body.draftId || body.id || '').trim().toUpperCase();
  if (!/^DRF-[A-Z0-9]{4,12}$/.test(draftId)) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let suffix = '';
    for (let i = 0; i < 6; i++) suffix += chars[Math.floor(Math.random() * chars.length)];
    draftId = `DRF-${suffix}`;
  }

  const existingIdx = draftOrdersStore.findIndex((d: any) => String(d?.id || '').trim().toUpperCase() === draftId);
  const existingDraft = existingIdx >= 0 ? draftOrdersStore[existingIdx] : null;
  const nowIso = new Date().toISOString();

  let discount = 0;
  const cleanPromo = String(body.promoCode || '').trim().toUpperCase();
  if (cleanPromo) {
    const cCheck = validateAndComputeCoupon(cleanPromo, subtotal);
    if (cCheck.valid) discount = cCheck.discount;
  }

  const draftObj = {
    id: draftId,
    customerName,
    customerPhone: cleanPhone,
    city: String(body.city || '').trim().slice(0, 100),
    address: String(body.address || '').trim().slice(0, 500),
    notes: String(body.notes || '').trim().slice(0, 500),
    items: verifiedItems,
    subtotal,
    discount,
    promoCode: cleanPromo || null,
    total: Math.max(0, subtotal - discount),
    status: existingDraft?.status === 'Relancé' ? 'Relancé' : 'Abandonné',
    source: 'checkout_modal',
    createdAt: existingDraft?.createdAt || nowIso,
    updatedAt: nowIso
  };

  if (existingIdx >= 0) {
    draftOrdersStore[existingIdx] = draftObj;
  } else {
    draftOrdersStore.unshift(draftObj);
  }
  savePersistedStore();

  try {
    const { saveFirestoreDraftOrder } = await import('./src/firebase.ts');
    await saveFirestoreDraftOrder(draftObj);
  } catch (err) {
    console.warn('Firestore draft save notice:', err);
  }

  return res.json({ ok: true, draft: draftObj });
});

app.get('/api/admin/draft-orders', async (req: Request, res: Response) => {
  if (!verifyAdmin(req)) {
    return res.status(401).json({ error: "Non autorisé" });
  }
  try {
    const { fetchFirestoreDraftOrders } = await import('./src/firebase.ts');
    const remoteDrafts = await fetchFirestoreDraftOrders();
    if (Array.isArray(remoteDrafts)) {
      draftOrdersStore = remoteDrafts.sort((a: any, b: any) =>
        String(b.updatedAt || b.createdAt || '').localeCompare(String(a.updatedAt || a.createdAt || ''))
      );
      savePersistedStore();
    }
  } catch (err) {
    console.warn('Error loading drafts from Firestore:', err);
  }
  return res.json(draftOrdersStore);
});

app.patch('/api/admin/draft-orders/:id', async (req: Request, res: Response) => {
  if (!verifyAdmin(req)) {
    return res.status(401).json({ error: "Non autorisé" });
  }
  const draftId = String(req.params.id).trim().toUpperCase();
  const status = String(req.body?.status || '').trim();
  if (!['Abandonné', 'Relancé', 'Converti'].includes(status)) {
    return res.status(400).json({ error: "Statut de brouillon invalide." });
  }
  const idx = draftOrdersStore.findIndex((d: any) => String(d?.id || '').trim().toUpperCase() === draftId);
  if (idx < 0) {
    return res.status(404).json({ error: "Panier abandonné introuvable." });
  }
  draftOrdersStore[idx] = {
    ...draftOrdersStore[idx],
    status,
    updatedAt: new Date().toISOString()
  };
  savePersistedStore();
  try {
    const { saveFirestoreDraftOrder } = await import('./src/firebase.ts');
    await saveFirestoreDraftOrder(draftOrdersStore[idx]);
  } catch {}
  return res.json({ ok: true, draft: draftOrdersStore[idx] });
});

app.delete('/api/admin/draft-orders/:id', async (req: Request, res: Response) => {
  if (!verifyAdmin(req)) {
    return res.status(401).json({ error: "Non autorisé" });
  }
  const draftId = String(req.params.id).trim().toUpperCase();
  draftOrdersStore = draftOrdersStore.filter((d: any) => String(d?.id || '').trim().toUpperCase() !== draftId);
  savePersistedStore();
  try {
    const { deleteFirestoreDraftOrder } = await import('./src/firebase.ts');
    await deleteFirestoreDraftOrder(draftId);
  } catch {}
  return res.json({ ok: true, id: draftId });
});

// ==========================================
// MANUAL POS ORDER CREATION (WhatsApp / IG / Phone)
// ==========================================
app.post('/api/admin/orders/manual', async (req: Request, res: Response) => {
  if (!verifyAdmin(req)) {
    return res.status(401).json({ error: "Non autorisé" });
  }
  const body = req.body || {};
  const customerName = String(body.customerName || '').trim().slice(0, 200);
  const cleanPhone = String(body.customerPhone || '').trim().replace(/\s+/g, '');
  const city = String(body.city || 'Casablanca').trim().slice(0, 100);
  const address = String(body.address || 'Adresse confirmée par téléphone').trim().slice(0, 500);
  const notes = String(body.notes || '').trim().slice(0, 500);
  const source = String(body.source || 'WhatsApp').trim().slice(0, 40);
  const requestedStatus = ['En attente', 'Confirmée'].includes(String(body.status)) ? String(body.status) : 'Confirmée';
  const rawItems = Array.isArray(body.items) ? body.items : [];

  if (!customerName) {
    return res.status(400).json({ error: "Veuillez saisir le nom du client." });
  }
  if (!/^(06|07)\d{8}$/.test(cleanPhone)) {
    return res.status(400).json({ error: "Le numéro de téléphone doit comporter 10 chiffres et commencer par 06 ou 07." });
  }
  if (rawItems.length === 0) {
    return res.status(400).json({ error: "Ajoutez au moins un article à la commande." });
  }

  let subtotal = 0;
  const verifiedItems: any[] = [];
  const stockChanges: { prod: any; qty: number; size: string; color: string }[] = [];

  for (const item of rawItems) {
    const prod = productsStore.find((p: any) => Number(p.id) === Number(item.productId || item.id));
    if (!prod) {
      return res.status(400).json({ error: `Produit introuvable : ${item.nameFr || 'ID ' + item.productId}` });
    }
    const qty = Math.max(1, parseInt(item.quantity || item.qty, 10) || 1);
    const chosenSize = String(item.size || (prod.sizes && prod.sizes[0]) || 'Unique').trim();
    const chosenColor = String(item.color || (prod.colors && prod.colors[0]) || 'Default').trim();
    const colorLabel = formatColorLabelFr(chosenColor);

    const hasVariants = prod.variantStock && typeof prod.variantStock === 'object' && Object.keys(prod.variantStock).length > 0;
    const availableStock = hasVariants
      ? getVariantStockValue(prod, chosenSize, chosenColor)
      : Math.max(0, Number(prod.stock) || 0);

    if (availableStock < qty) {
      return res.status(409).json({
        error: `Stock insuffisant pour "${prod.nameFr}" (${chosenSize} / ${colorLabel}). Disponible : ${availableStock}.`
      });
    }

    const linePrice = item.price !== undefined && item.price !== '' ? Math.max(0, Number(item.price) || 0) : Number(prod.price);
    subtotal += linePrice * qty;
    verifiedItems.push({
      productId: prod.id,
      nameFr: prod.nameFr,
      nameAr: prod.nameAr || prod.nameFr,
      price: linePrice,
      quantity: qty,
      size: chosenSize,
      color: chosenColor,
      colorLabel,
      image: (prod.images && prod.images[0]) || ''
    });
    stockChanges.push({ prod, qty, size: chosenSize, color: chosenColor });
  }

  for (const { prod, qty, size, color } of stockChanges) {
    if (prod.variantStock && typeof prod.variantStock === 'object' && Object.keys(prod.variantStock).length > 0) {
      const exactKey = makeVariantKey(size, color);
      let matchedKey = exactKey;
      if (prod.variantStock[matchedKey] === undefined) {
        const sLower = size.toLowerCase();
        const cLower = color.toLowerCase();
        for (const k of Object.keys(prod.variantStock)) {
          const [ks, kc] = String(k).split('__');
          if (ks && kc && ks.trim().toLowerCase() === sLower && (kc.trim().toLowerCase() === cLower || formatColorLabelFr(kc).toLowerCase() === formatColorLabelFr(color).toLowerCase())) {
            matchedKey = k;
            break;
          }
        }
      }
      const curVal = Math.max(0, Number(prod.variantStock[matchedKey]) || 0);
      prod.variantStock[matchedKey] = Math.max(0, curVal - qty);
      prod.stock = Object.values(prod.variantStock).reduce((sum: number, v: any) => sum + Math.max(0, Number(v) || 0), 0);
      prod.inStock = prod.stock > 0;
    } else {
      prod.stock = Math.max(0, (Number(prod.stock) || 0) - qty);
      prod.inStock = prod.stock > 0;
    }
  }

  const discount = Math.max(0, Number(body.discount || 0) || 0);
  const shippingFee = Math.max(0, Number(body.shippingFee || 0) || 0);
  const total = Math.max(0, subtotal - discount + shippingFee);
  const orderId = generateOrderId();
  const nowIso = new Date().toISOString();

  const newOrder = {
    id: orderId,
    date: nowIso,
    status: requestedStatus,
    customerName,
    customerPhone: cleanPhone,
    city,
    address,
    notes: notes || `Commande directe (${source})`,
    items: verifiedItems,
    subtotal,
    discount,
    promoCode: body.promoCode ? String(body.promoCode).trim().toUpperCase().slice(0, 40) : null,
    shippingFee,
    realShippingCost: getCityRealShippingCost(city),
    shipment: null,
    exchangeInfo: null,
    source,
    total,
    paymentMethod: String(body.paymentMethod || 'COD (Paiement à la livraison)').trim().slice(0, 100)
  };

  ordersStore.unshift(newOrder);

  // If converted from an abandoned draft order, remove that draft
  const fromDraftId = String(body.fromDraftId || '').trim().toUpperCase();
  if (fromDraftId) {
    draftOrdersStore = draftOrdersStore.filter((d: any) => String(d?.id || '').trim().toUpperCase() !== fromDraftId);
  }
  savePersistedStore();

  try {
    const { createFirestoreOrder, saveFirestoreProduct, deleteFirestoreDraftOrder } = await import('./src/firebase.ts');
    await createFirestoreOrder(newOrder);
    for (const { prod } of stockChanges) {
      await saveFirestoreProduct(prod);
    }
    if (fromDraftId) {
      await deleteFirestoreDraftOrder(fromDraftId).catch(() => {});
    }
  } catch (err) {
    console.warn('Firestore manual POS order sync note:', err);
  }

  // Auto-sync to Ozon Express if POS order is saved as Confirmée & autoSyncOnConfirm is enabled
  let finalManualOrder = newOrder;
  if (
    requestedStatus === 'Confirmée' &&
    adminConfigStore.carriersConfig?.autoSyncOnConfirm &&
    adminConfigStore.carriersConfig?.ozon?.enabled !== false &&
    adminConfigStore.carriersConfig?.ozon?.customerId &&
    adminConfigStore.carriersConfig?.ozon?.apiKey
  ) {
    try {
      const autoRes = await dispatchOrderToCarrier(finalManualOrder, 'ozon', { allowLocalFallback: false });
      if (autoRes.ok && autoRes.order) finalManualOrder = autoRes.order;
    } catch {}
  }

  return res.status(201).json({ ok: true, order: finalManualOrder, products: productsStore });
});

// ==========================================
// SAV EXCHANGE / RETURN HANDLER (Échange en cours)
// Restores old variant stock (+qty) & reserves new variant stock (-qty)
// without distorting order revenue (total stays intact).
// ==========================================
app.post('/api/orders/:id/exchange', async (req: Request, res: Response) => {
  if (!verifyAdmin(req)) {
    return res.status(401).json({ error: "Non autorisé" });
  }
  const orderId = String(req.params.id).trim().toUpperCase();
  const idx = ordersStore.findIndex(o => String(o.id || '').trim().toUpperCase() === orderId);
  let order = idx >= 0 ? ordersStore[idx] : null;
  if (!order) {
    try {
      const { getFirestoreOrder } = await import('./src/firebase.ts');
      order = await getFirestoreOrder(orderId);
      if (order) ordersStore.unshift(order);
    } catch {}
  }
  if (!order) {
    return res.status(404).json({ error: "Commande introuvable." });
  }

  const body = req.body || {};
  const itemIndex = Math.max(0, Math.floor(Number(body.itemIndex ?? 0) || 0));
  const items = Array.isArray(order.items) ? [...order.items] : [];
  if (itemIndex >= items.length) {
    return res.status(400).json({ error: "Article cible introuvable dans la commande." });
  }

  const targetItem = { ...items[itemIndex] };
  const qty = Math.max(1, Number(targetItem.quantity || targetItem.qty || 1) || 1);
  const oldSize = String(targetItem.size || 'Unique').trim();
  const oldColor = String(targetItem.color || 'Default').trim();
  const newSize = String(body.newSize ?? oldSize).trim() || oldSize;
  const newColor = String(body.newColor ?? oldColor).trim() || oldColor;
  const reason = String(body.reason || '').trim().slice(0, 200);

  if (oldSize === newSize && oldColor === newColor) {
    return res.status(400).json({ error: "Veuillez sélectionner une nouvelle taille ou une nouvelle couleur pour effectuer l'échange." });
  }

  const prod = productsStore.find((p: any) => Number(p.id) === Number(targetItem.productId || targetItem.id));
  if (prod) {
    const hasVariants = prod.variantStock && typeof prod.variantStock === 'object' && Object.keys(prod.variantStock).length > 0;
    const findKey = (sz: string, col: string): string => {
      const exact = makeVariantKey(sz, col);
      if (!hasVariants || prod.variantStock[exact] !== undefined) return exact;
      const sL = sz.toLowerCase();
      const cL = col.toLowerCase();
      for (const k of Object.keys(prod.variantStock)) {
        const [ks, kc] = String(k).split('__');
        if (ks && kc && ks.trim().toLowerCase() === sL && (kc.trim().toLowerCase() === cL || formatColorLabelFr(kc).toLowerCase() === formatColorLabelFr(col).toLowerCase())) {
          return k;
        }
      }
      return exact;
    };

    if (hasVariants) {
      const oldKey = findKey(oldSize, oldColor);
      const newKey = findKey(newSize, newColor);
      const availNew = Math.max(0, Number(prod.variantStock[newKey] ?? 0) || 0);
      if (availNew < qty) {
        return res.status(409).json({
          error: `Stock insuffisant pour la nouvelle variante (${newSize} / ${formatColorLabelFr(newColor)}) : ${availNew} disponible(s).`
        });
      }
      // Reintegrate old size/color & reserve new size/color
      prod.variantStock[oldKey] = Math.max(0, Number(prod.variantStock[oldKey] || 0) + qty);
      prod.variantStock[newKey] = Math.max(0, availNew - qty);
      prod.stock = Object.values(prod.variantStock).reduce((sum: number, v: any) => sum + Math.max(0, Number(v) || 0), 0);
      prod.inStock = prod.stock > 0;
    } else {
      // Flat stock: +qty (returned) and -qty (reserved) keeps total balanced, ensure >= 0
      prod.stock = Math.max(0, Number(prod.stock || 0));
      prod.inStock = prod.stock > 0;
    }
  }

  targetItem.size = newSize;
  targetItem.color = newColor;
  targetItem.colorLabel = formatColorLabelFr(newColor);
  items[itemIndex] = targetItem;

  const nowIso = new Date().toISOString();
  const updatedOrder = {
    ...order,
    status: 'Échange en cours',
    items,
    exchangeInfo: {
      active: true,
      itemIndex,
      productId: Number(prod?.id || targetItem.productId || 0),
      productName: String(targetItem.nameFr || 'Article').slice(0, 150),
      originalSize: oldSize,
      originalColor: formatColorLabelFr(oldColor),
      newSize,
      newColor: formatColorLabelFr(newColor),
      quantity: qty,
      reason,
      requestedAt: nowIso,
      resolvedAt: null
    },
    updatedAt: nowIso
  };

  const targetIdx = ordersStore.findIndex(o => String(o.id || '').trim().toUpperCase() === orderId);
  if (targetIdx >= 0) ordersStore[targetIdx] = updatedOrder;
  savePersistedStore();

  try {
    const { updateFirestoreOrder, saveFirestoreProduct } = await import('./src/firebase.ts');
    await updateFirestoreOrder(orderId, updatedOrder);
    if (prod) {
      await saveFirestoreProduct(prod);
    }
  } catch (err) {
    console.error('Error persisting SAV exchange to Firestore:', err);
  }

  return res.json({ ok: true, order: updatedOrder, products: productsStore });
});

// Helper to inject absolute OpenGraph image & URL tags for WhatsApp / Messenger / Facebook link previews
function injectSocialMetaTags(html: string, req: Request): string {
  const forwardedProto = req.headers['x-forwarded-proto'];
  const proto = typeof forwardedProto === 'string' ? forwardedProto.split(',')[0].trim() : (req.protocol || 'https');
  const host = req.headers['x-forwarded-host'] || req.headers.host || 'modanova.ma';
  const origin = `${proto === 'http' && !String(host).includes('localhost') ? 'https' : proto}://${host}`;
  const fullUrl = `${origin}${req.originalUrl || '/'}`;

  const rawCustomOg = String(adminConfigStore.ogImageUrl || '').trim();
  const escapeAttr = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  let dynamicOgTags = '';
  if (rawCustomOg) {
    const resolvedOg = /^https?:\/\//i.test(rawCustomOg)
      ? rawCustomOg
      : `${origin}${rawCustomOg.startsWith('/') ? '' : '/'}${rawCustomOg}`;
    const safeOg = escapeAttr(resolvedOg);
    const mimeGuess = /\.png(\?|$)/i.test(resolvedOg)
      ? 'image/png'
      : /\.webp(\?|$)/i.test(resolvedOg)
        ? 'image/webp'
        : 'image/jpeg';

    dynamicOgTags = `
    <meta property="og:url" content="${escapeAttr(fullUrl)}" />
    <meta property="og:site_name" content="MODANOVA — Men's Essentials" />
    <meta property="og:image" content="${safeOg}" />
    <meta property="og:image:secure_url" content="${safeOg}" />
    <meta property="og:image:type" content="${mimeGuess}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="MODANOVA — Fashion & Men's Essentials" />
    <meta name="twitter:image" content="${safeOg}" />
    <link rel="image_src" href="${safeOg}" />
    <meta itemprop="image" content="${safeOg}" />`;
  } else {
    const ogLogoLandscape = `${origin}/og-logo.jpg`;
    const ogLogoSquare = `${origin}/og-logo-square.jpg`;

    dynamicOgTags = `
    <meta property="og:url" content="${escapeAttr(fullUrl)}" />
    <meta property="og:site_name" content="MODANOVA — Men's Essentials" />
    <meta property="og:image" content="${ogLogoLandscape}" />
    <meta property="og:image:secure_url" content="${ogLogoLandscape}" />
    <meta property="og:image:type" content="image/jpeg" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="MODANOVA — Fashion & Men's Essentials" />
    <meta property="og:image" content="${ogLogoSquare}" />
    <meta property="og:image:secure_url" content="${ogLogoSquare}" />
    <meta property="og:image:type" content="image/jpeg" />
    <meta property="og:image:width" content="600" />
    <meta property="og:image:height" content="600" />
    <meta name="twitter:image" content="${ogLogoLandscape}" />
    <link rel="image_src" href="${ogLogoLandscape}" />
    <meta itemprop="image" content="${ogLogoLandscape}" />`;
  }

  return html.replace('<!-- DYNAMIC_OG_META -->', dynamicOgTags);
}

// Setup Vite in Dev or serve static in Prod
async function startServer() {
  const uploadsDir = path.resolve(__dirname, 'public/uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Sync all products, orders, slider, CMS, testimonials, and adminConfig with Firebase Firestore in background
  // so the HTTP server binds to port 3000 immediately without readiness timeouts
  firestoreSyncPromise = syncWithFirestoreOnBoot().catch((err) => {
    console.warn('[Firestore] Background sync notice:', err);
  });

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

  // Serve brand OpenGraph logos with Firestore fallback so WhatsApp/Messenger always get the logo
  app.get(['/og-logo.jpg', '/og-logo-square.jpg', '/logo.png'], async (req: Request, res: Response) => {
    const fileName = path.basename(req.path);
    const localPath = path.resolve(__dirname, 'public', fileName);
    if (fs.existsSync(localPath)) {
      res.setHeader('Cache-Control', 'public, max-age=86400');
      return res.sendFile(localPath);
    }
    try {
      const { getFirestoreMedia } = await import('./src/firebase.ts');
      const mediaDoc = await getFirestoreMedia(fileName);
      if (mediaDoc && typeof mediaDoc.dataUrl === 'string') {
        const matches = mediaDoc.dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (matches && matches[2]) {
          const buffer = Buffer.from(matches[2], 'base64');
          try { fs.writeFileSync(localPath, buffer); } catch {}
          res.setHeader('Content-Type', matches[1] || 'image/jpeg');
          res.setHeader('Cache-Control', 'public, max-age=86400');
          return res.send(buffer);
        }
      }
    } catch {}
    return res.status(404).end();
  });

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
  app.use(express.static(path.resolve(__dirname, 'public'), { maxAge: '1d', index: false }));

  // Serve index.html with dynamic absolute OpenGraph image tags for WhatsApp, Messenger & social crawlers
  app.get(['/', '/admin', '/produit/*', '/produits', '/catalogue', '/products'], (req: Request, res: Response, next) => {
    try {
      const htmlPath = isProduction && fs.existsSync(path.resolve(__dirname, 'dist', 'index.html'))
        ? path.resolve(__dirname, 'dist', 'index.html')
        : path.resolve(__dirname, 'index.html');
      if (fs.existsSync(htmlPath)) {
        const rawHtml = fs.readFileSync(htmlPath, 'utf8');
        const enrichedHtml = injectSocialMetaTags(rawHtml, req);
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.send(enrichedHtml);
      }
    } catch (err) {
      console.warn('HTML OpenGraph injection fallback:', err);
    }
    return next();
  });

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist'), { index: false }));
    app.get('*', (req: Request, res: Response) => {
      const distHtmlPath = path.resolve(__dirname, 'dist', 'index.html');
      const fallbackHtmlPath = fs.existsSync(distHtmlPath) ? distHtmlPath : path.resolve(__dirname, 'index.html');
      const rawHtml = fs.readFileSync(fallbackHtmlPath, 'utf8');
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.send(injectSocialMetaTags(rawHtml, req));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

startServer();
