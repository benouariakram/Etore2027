const { useState, useEffect, useMemo, useRef, useCallback } = React;
function compressImageFile(file, maxDim = 1100, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const dataUrl = reader.result;
      if (typeof dataUrl !== "string" || file.type === "image/svg+xml") {
        return resolve(dataUrl);
      }
      const img = new Image();
      img.onerror = () => resolve(dataUrl);
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width >= height) {
            height = Math.round(height * maxDim / width);
            width = maxDim;
          } else {
            width = Math.round(width * maxDim / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return resolve(dataUrl);
        ctx.drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL("image/jpeg", quality);
        resolve(compressed.length < dataUrl.length ? compressed : dataUrl);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  });
}
function WhatsAppIcon({ className = "w-5 h-5", fill = "currentColor" }) {
  return /* @__PURE__ */ React.createElement("svg", { viewBox: "0 0 24 24", className, fill, xmlns: "http://www.w3.org/2000/svg" }, /* @__PURE__ */ React.createElement("path", { fillRule: "evenodd", clipRule: "evenodd", d: "M20.52 3.48A11.93 11.93 0 0012.04 0C5.43 0 .07 5.36.07 11.97c0 2.11.55 4.17 1.6 6l-1.7 6.2 6.35-1.66a11.9 11.9 0 005.72 1.45h.01c6.61 0 11.97-5.36 11.97-11.97 0-3.2-1.25-6.21-3.5-8.51zM12.05 21.92h-.01a9.92 9.92 0 01-5.06-1.39l-.36-.21-3.77.99 1-3.67-.23-.38a9.9 9.9 0 01-1.52-5.29c0-5.48 4.46-9.94 9.95-9.94 2.66 0 5.16 1.03 7.03 2.91a9.88 9.88 0 012.91 7.03c0 5.49-4.46 9.95-9.96 9.95zm5.45-7.46c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.95 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.14-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.22 3.08c.15.2 2.1 3.2 5.09 4.49.71.31 1.27.49 1.7.63.72.23 1.37.2 1.88.12.58-.09 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35z" }));
}
function escapeHTML(str) {
  if (!str) return "";
  return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
const MOROCCAN_CITIES = [
  // --- Grandes Villes Prioritaires ---
  { id: "Casablanca", nameFr: "Casablanca", nameAr: "\u0627\u0644\u062F\u0627\u0631 \u0627\u0644\u0628\u064A\u0636\u0627\u0621", delay: "24h", isMajor: true },
  { id: "Rabat", nameFr: "Rabat", nameAr: "\u0627\u0644\u0631\u0628\u0627\u0637", delay: "24h", isMajor: true },
  { id: "Kenitra", nameFr: "K\xE9nitra", nameAr: "\u0627\u0644\u0642\u0646\u064A\u0637\u0631\u0629", delay: "24h", isMajor: true },
  { id: "Marrakech", nameFr: "Marrakech", nameAr: "\u0645\u0631\u0627\u0643\u0634", delay: "48h", isMajor: true },
  { id: "Tanger", nameFr: "Tanger", nameAr: "\u0637\u0646\u062C\u0629", delay: "48h", isMajor: true },
  { id: "Fes", nameFr: "F\xE8s", nameAr: "\u0641\u0627\u0633", delay: "48h", isMajor: true },
  { id: "Agadir", nameFr: "Agadir", nameAr: "\u0623\u0643\u0627\u062F\u064A\u0631", delay: "48h", isMajor: true },
  { id: "Meknes", nameFr: "Mekn\xE8s", nameAr: "\u0645\u0643\u0646\u0627\u0633", delay: "48h", isMajor: true },
  { id: "Oujda", nameFr: "Oujda", nameAr: "\u0648\u062C\u062F\u0629", delay: "48h", isMajor: true },
  { id: "Tetouan", nameFr: "T\xE9touan", nameAr: "\u062A\u0637\u0648\u0627\u0646", delay: "48h", isMajor: true },
  { id: "Sale", nameFr: "Sal\xE9", nameAr: "\u0633\u0644\u0627", delay: "24h", isMajor: true },
  { id: "Mohammedia", nameFr: "Mohammedia", nameAr: "\u0627\u0644\u0645\u062D\u0645\u062F\u064A\u0629", delay: "24h", isMajor: true },
  { id: "Temara", nameFr: "T\xE9mara", nameAr: "\u062A\u0645\u0627\u0631\u0629", delay: "24h", isMajor: true },
  // --- Reste des Villes du Maroc (Ordre Alphabétique) ---
  { id: "Al_Hoceima", nameFr: "Al Hoce\xEFma", nameAr: "\u0627\u0644\u062D\u0633\u064A\u0645\u0629", delay: "48-72h" },
  { id: "Assilah", nameFr: "Assilah", nameAr: "\u0623\u0635\u064A\u0644\u0629", delay: "48h" },
  { id: "Azemmour", nameFr: "Azemmour", nameAr: "\u0623\u0632\u0645\u0648\u0631", delay: "48h" },
  { id: "Azrou", nameFr: "Azrou", nameAr: "\u0623\u0632\u0631\u0648", delay: "48h" },
  { id: "Ben_Guerir", nameFr: "Ben Guerir", nameAr: "\u0627\u0628\u0646 \u062C\u0631\u064A\u0631", delay: "48h" },
  { id: "Beni_Mellal", nameFr: "B\xE9ni Mellal", nameAr: "\u0628\u0646\u064A \u0645\u0644\u0627\u0644", delay: "48h" },
  { id: "Berkane", nameFr: "Berkane", nameAr: "\u0628\u0631\u0643\u0627\u0646", delay: "48-72h" },
  { id: "Berrechid", nameFr: "Berrechid", nameAr: "\u0628\u0631\u0634\u064A\u062F", delay: "24-48h" },
  { id: "Bouskoura", nameFr: "Bouskoura", nameAr: "\u0628\u0648\u0633\u0643\u0648\u0631\u0629", delay: "24h" },
  { id: "Bouznika", nameFr: "Bouznika", nameAr: "\u0628\u0648\u0632\u0646\u064A\u0642\u0629", delay: "24h" },
  { id: "Chefchaouen", nameFr: "Chefchaouen", nameAr: "\u0634\u0641\u0634\u0627\u0648\u0646", delay: "48h" },
  { id: "Dakhla", nameFr: "Dakhla", nameAr: "\u0627\u0644\u062F\u0627\u062E\u0644\u0629", delay: "72h" },
  { id: "Dar_Bouazza", nameFr: "Dar Bouazza", nameAr: "\u062F\u0627\u0631 \u0628\u0648\u0639\u0632\u0629", delay: "24h" },
  { id: "El_Jadida", nameFr: "El Jadida", nameAr: "\u0627\u0644\u062C\u062F\u064A\u062F\u0629", delay: "48h" },
  { id: "El_Kelaa_des_Sraghna", nameFr: "El Kela\xE2 des Sraghna", nameAr: "\u0642\u0644\u0639\u0629 \u0627\u0644\u0633\u0631\u0627\u063A\u0646\u0629", delay: "48h" },
  { id: "Errachidia", nameFr: "Errachidia", nameAr: "\u0627\u0644\u0631\u0634\u064A\u062F\u064A\u0629", delay: "72h" },
  { id: "Essaouira", nameFr: "Essaouira", nameAr: "\u0627\u0644\u0635\u0648\u064A\u0631\u0629", delay: "48h" },
  { id: "Fnideq", nameFr: "Fnideq", nameAr: "\u0627\u0644\u0641\u0646\u064A\u062F\u0642", delay: "48h" },
  { id: "Fquih_Ben_Salah", nameFr: "Fquih Ben Salah", nameAr: "\u0627\u0644\u0641\u0642\u064A\u0647 \u0628\u0646 \u0635\u0627\u0644\u062D", delay: "48h" },
  { id: "Guelmim", nameFr: "Guelmim", nameAr: "\u0643\u0644\u0645\u064A\u0645", delay: "72h" },
  { id: "Guercif", nameFr: "Guercif", nameAr: "\u062C\u0631\u0633\u064A\u0641", delay: "48-72h" },
  { id: "Ifrane", nameFr: "Ifrane", nameAr: "\u0625\u0641\u0631\u0627\u0646", delay: "48h" },
  { id: "Karia_Ba_Mohamed", nameFr: "Karia Ba Mohamed", nameAr: "\u0642\u0631\u064A\u0629 \u0628\u0627 \u0645\u062D\u0645\u062F", delay: "48h" },
  { id: "Khemisset", nameFr: "Kh\xE9misset", nameAr: "\u0627\u0644\u062E\u0645\u064A\u0633\u0627\u062A", delay: "48h" },
  { id: "Khenifra", nameFr: "Kh\xE9nifra", nameAr: "\u062E\u0646\u064A\u0641\u0631\u0629", delay: "48h" },
  { id: "Khouribga", nameFr: "Khouribga", nameAr: "\u062E\u0631\u064A\u0628\u0643\u0629", delay: "48h" },
  { id: "Ksar_El_Kebir", nameFr: "Ksar El K\xE9bir", nameAr: "\u0627\u0644\u0642\u0635\u0631 \u0627\u0644\u0643\u0628\u064A\u0631", delay: "48h" },
  { id: "Laayoune", nameFr: "La\xE2youne", nameAr: "\u0627\u0644\u0639\u064A\u0648\u0646", delay: "72h" },
  { id: "Larache", nameFr: "Larache", nameAr: "\u0627\u0644\u0639\u0631\u0627\u0626\u0634", delay: "48h" },
  { id: "Mdiq", nameFr: "M'diq", nameAr: "\u0627\u0644\u0645\u0636\u064A\u0642", delay: "48h" },
  { id: "Martil", nameFr: "Martil", nameAr: "\u0645\u0631\u062A\u064A\u0644", delay: "48h" },
  { id: "Mediouna", nameFr: "M\xE9diouna", nameAr: "\u0645\u062F\u064A\u0648\u0646\u0629", delay: "24h" },
  { id: "Mehdya", nameFr: "Mehdya", nameAr: "\u0627\u0644\u0645\u0647\u062F\u064A\u0629", delay: "24h" },
  { id: "Midelt", nameFr: "Midelt", nameAr: "\u0645\u064A\u062F\u0644\u062A", delay: "48-72h" },
  { id: "Nador", nameFr: "Nador", nameAr: "\u0627\u0644\u0646\u0627\u0638\u0648\u0631", delay: "48-72h" },
  { id: "Ouarzazate", nameFr: "Ouarzazate", nameAr: "\u0648\u0631\u0632\u0627\u0632\u0627\u062A", delay: "72h" },
  { id: "Oued_Zem", nameFr: "Oued Zem", nameAr: "\u0648\u0627\u062F \u0632\u0645", delay: "48h" },
  { id: "Oulad_Teima", nameFr: "Oulad Te\xEFma", nameAr: "\u0623\u0648\u0644\u0627\u062F \u062A\u0627\u064A\u0645\u0629", delay: "48-72h" },
  { id: "Safi", nameFr: "Safi", nameAr: "\u0622\u0633\u0641\u064A", delay: "48h" },
  { id: "Sefrou", nameFr: "S\xE9frou", nameAr: "\u0635\u0641\u0631\u0648", delay: "48h" },
  { id: "Settat", nameFr: "Settat", nameAr: "\u0633\u0637\u0627\u062A", delay: "48h" },
  { id: "Sidi_Bennour", nameFr: "Sidi Bennour", nameAr: "\u0633\u064A\u062F\u064A \u0628\u0646\u0648\u0631", delay: "48h" },
  { id: "Sidi_Kacem", nameFr: "Sidi Kacem", nameAr: "\u0633\u064A\u062F\u064A \u0642\u0627\u0633\u0645", delay: "48h" },
  { id: "Sidi_Slimane", nameFr: "Sidi Slimane", nameAr: "\u0633\u064A\u062F\u064A \u0633\u0644\u064A\u0645\u0627\u0646", delay: "48h" },
  { id: "Sidi_Yahya", nameFr: "Sidi Yahya El Gharb", nameAr: "\u0633\u064A\u062F\u064A \u064A\u062D\u064A\u0649 \u0627\u0644\u063A\u0631\u0628", delay: "24-48h" },
  { id: "Skhirat", nameFr: "Skhirat", nameAr: "\u0627\u0644\u0635\u062E\u064A\u0631\u0627\u062A", delay: "24h" },
  { id: "Souk_El_Arbaa", nameFr: "Souk El Arbaa", nameAr: "\u0633\u0648\u0642 \u0627\u0644\u0623\u0631\u0628\u0639\u0627\u0621", delay: "48h" },
  { id: "Tan_Tan", nameFr: "Tan-Tan", nameAr: "\u0637\u0627\u0646\u0637\u0627\u0646", delay: "72h" },
  { id: "Taounate", nameFr: "Taounate", nameAr: "\u062A\u0627\u0648\u0646\u0627\u062A", delay: "48-72h" },
  { id: "Taroudant", nameFr: "Taroudant", nameAr: "\u062A\u0627\u0631\u0648\u062F\u0627\u0646\u062A", delay: "48-72h" },
  { id: "Tata", nameFr: "Tata", nameAr: "\u0637\u0627\u0637\u0627", delay: "72h" },
  { id: "Taza", nameFr: "Taza", nameAr: "\u062A\u0627\u0632\u0629", delay: "48h" },
  { id: "Tiflet", nameFr: "Tiflet", nameAr: "\u062A\u064A\u0641\u0644\u062A", delay: "48h" },
  { id: "Tinghir", nameFr: "Tinghir", nameAr: "\u062A\u0646\u063A\u064A\u0631", delay: "72h" },
  { id: "Tiznit", nameFr: "Tiznit", nameAr: "\u062A\u064A\u0632\u0646\u064A\u062A", delay: "48-72h" },
  { id: "Youssoufia", nameFr: "Youssoufia", nameAr: "\u0627\u0644\u064A\u0648\u0633\u0641\u064A\u0629", delay: "48h" },
  { id: "Zagora", nameFr: "Zagora", nameAr: "\u0632\u0627\u0643\u0648\u0631\u0629", delay: "72h" }
];
const PRODUCT_CATEGORIES = [
  "Chaussures",
  "Jackets",
  "Outerwear",
  "Bagagerie et Maroquinerie",
  "Casquettes",
  "Accessoires",
  "V\xEAtements",
  "Pantalons",
  "Bag Small",
  "Vestes Hardshell"
];
const INITIAL_PRODUCTS = [
  {
    id: 1,
    nameFr: "Mules Cuir Artisanales",
    nameAr: "\u0646\u0639\u0627\u0644 \u062C\u0644\u062F\u064A\u0629 \u062A\u0642\u0644\u064A\u062F\u064A\u0629 \u0641\u0627\u062E\u0631\u0629",
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
    descFr: "Fa\xE7onn\xE9es \xE0 la main par nos ma\xEEtres maroquiniers \xE0 F\xE8s. Cuir de veau pleine fleur au tannage v\xE9g\xE9tal, doublure respirante et semelle anatomique souple pour une \xE9l\xE9gance d\xE9contract\xE9e sans compromis.",
    descAr: "\u0645\u0635\u0646\u0648\u0639\u0629 \u064A\u062F\u0648\u064A\u0627\u064B \u0639\u0644\u0649 \u0623\u064A\u062F\u064A \u0623\u0645\u0647\u0631 \u0627\u0644\u062D\u0631\u0641\u064A\u064A\u0646 \u0641\u064A \u0641\u0627\u0633. \u062C\u0644\u062F \u0639\u062C\u0644 \u0637\u0628\u064A\u0639\u064A \u0645\u062F\u0628\u0648\u063A \u0646\u0628\u0627\u062A\u064A\u0627\u064B\u060C \u0628\u0637\u0627\u0646\u0629 \u0645\u0631\u064A\u062D\u0629 \u0648\u0646\u0639\u0644 \u062A\u0634\u0631\u064A\u062D\u064A \u0645\u0631\u0646 \u064A\u062C\u0645\u0639 \u0628\u064A\u0646 \u0627\u0644\u0623\u0635\u0627\u0644\u0629 \u0648\u0627\u0644\u0623\u0646\u0627\u0642\u0629 \u0627\u0644\u0639\u0635\u0631\u064A\u0629.",
    sizes: ["40", "41", "42", "43", "44", "45"],
    colors: ["#3D2B1F", "#171717", "#8B5A2B"]
  },
  {
    id: 2,
    nameFr: "S\xE9rum Botanique Visage & Barbe",
    nameAr: "\u0633\u064A\u0631\u0648\u0645 \u0646\u0628\u0627\u062A\u064A \u0645\u0631\u0643\u0632 \u0644\u0644\u0648\u062C\u0647 \u0648\u0627\u0644\u0644\u062D\u064A\u0629",
    price: 680,
    oldPrice: 820,
    category: "soins",
    inStock: true,
    stock: 4,
    badge: "luxury",
    isNew: true,
    rating: 5,
    images: [
      "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 600' width='800' height='600'><rect width='800' height='600' fill='%23F3F1EC'/><g transform='translate(280, 80)'><ellipse cx='120' cy='430' rx='90' ry='20' fill='%23E5E0D8'/><rect x='60' y='180' width='120' height='230' rx='20' fill='%238A4B1A' opacity='0.9'/><rect x='85' y='120' width='70' height='60' fill='%23171717'/><rect x='105' y='60' width='30' height='60' rx='6' fill='%23222'/><rect x='75' y='230' width='90' height='130' fill='%23FAF9F6'/><text x='120' y='270' font-family='serif' font-size='15' font-weight='bold' fill='%23171717' text-anchor='middle'>MODANOVA</text><line x1='90' y1='285' x2='150' y2='285' stroke='%23C28B53' stroke-width='1.5'/><text x='120' y='305' font-family='sans-serif' font-size='9' fill='%23444' text-anchor='middle' letter-spacing='1'>S\xC9RUM PUR</text><text x='120' y='325' font-family='sans-serif' font-size='8' fill='%239E8C7A' text-anchor='middle'>50 ML / 1.7 FL.OZ</text></g></svg>",
      "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 600' width='800' height='600'><rect width='800' height='600' fill='%23ECE8E1'/><g transform='translate(300, 100)'><rect x='50' y='160' width='100' height='200' rx='16' fill='%236B3912'/><circle cx='100' cy='260' r='35' fill='%23FAF9F6' opacity='0.9'/><text x='100' y='265' font-family='serif' font-size='12' fill='%23171717' text-anchor='middle'>100% BIO</text></g></svg>"
    ],
    descFr: "\xC9lixir concentr\xE9 d'huile de figue de barbarie du Souss, nigelle d'\xC9gypte et c\xE8dre de l'Atlas. Apaise le feu du rasage, hydrate en profondeur et discipline la barbe sans film gras.",
    descAr: "\u0645\u0633\u062A\u062E\u0644\u0635 \u0645\u0631\u0643\u0632 \u0645\u0646 \u0632\u064A\u062A \u0628\u0630\u0648\u0631 \u0627\u0644\u062A\u064A\u0646 \u0627\u0644\u0634\u0648\u0643\u064A \u0648\u0632\u064A\u062A \u0627\u0644\u062D\u0628\u0629 \u0627\u0644\u0633\u0648\u062F\u0627\u0621 \u0648\u062E\u0634\u0628 \u0627\u0644\u0623\u0631\u0632 \u0627\u0644\u0623\u0637\u0644\u0633\u064A. \u064A\u0647\u062F\u0626 \u0627\u0644\u0628\u0634\u0631\u0629 \u0628\u0639\u062F \u0627\u0644\u062D\u0644\u0627\u0642\u0629\u060C \u064A\u0631\u0637\u0628 \u0628\u0639\u0645\u0642 \u0648\u064A\u063A\u0630\u064A \u0627\u0644\u0644\u062D\u064A\u0629 \u062F\u0648\u0646 \u0623\u064A \u0645\u0644\u0645\u0633 \u062F\u0647\u0646\u064A.",
    sizes: ["50ml", "100ml"],
    colors: ["#8A4B1A"]
  },
  {
    id: 3,
    nameFr: "Huile S\xE8che Pr\xE9cieuse Atlas",
    nameAr: "\u0632\u064A\u062A \u062C\u0627\u0641 \u0641\u0627\u062E\u0631 \u0628\u062E\u0644\u0627\u0635\u0629 \u0627\u0644\u0623\u0637\u0644\u0633",
    price: 590,
    oldPrice: null,
    category: "soins",
    inStock: true,
    stock: 8,
    badge: "new",
    isNew: true,
    rating: 5,
    images: [
      "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 600' width='800' height='600'><rect width='800' height='600' fill='%23F3F1EC'/><g transform='translate(290, 90)'><ellipse cx='110' cy='420' rx='80' ry='18' fill='%23E5E0D8'/><rect x='50' y='170' width='120' height='220' rx='24' fill='%23C28B53' opacity='0.85'/><rect x='85' y='110' width='50' height='60' fill='%23222'/><circle cx='110' cy='90' r='16' fill='%23171717'/><rect x='68' y='220' width='84' height='120' fill='%23FAF9F6'/><text x='110' y='260' font-family='serif' font-size='14' font-weight='bold' fill='%23171717' text-anchor='middle'>MODANOVA</text><text x='110' y='285' font-family='sans-serif' font-size='8' fill='%23444' text-anchor='middle' letter-spacing='1'>HUILE S\xC8CHE</text><text x='110' y='305' font-family='sans-serif' font-size='7' fill='%239E8C7A' text-anchor='middle'>ARGAN & N\xC9ROLI</text></g></svg>"
    ],
    descFr: "Texture satin\xE9e non com\xE9dog\xE8ne infus\xE9e \xE0 l'argan biologique et n\xE9roli de Khemisset. P\xE9n\xE9tration instantan\xE9e, parfum subtil bois\xE9 et ambr\xE9.",
    descAr: "\u0642\u0648\u0627\u0645 \u062D\u0631\u064A\u0631\u064A \u0633\u0631\u064A\u0639 \u0627\u0644\u0627\u0645\u062A\u0635\u0627\u0635 \u063A\u0646\u064A \u0628\u0632\u064A\u062A \u0627\u0644\u0623\u0631\u0643\u0627\u0646 \u0627\u0644\u0639\u0636\u0648\u064A \u0648\u0632\u0647\u0631 \u0627\u0644\u0628\u0631\u062A\u0642\u0627\u0644. \u064A\u0645\u0646\u062D \u0627\u0644\u0628\u0634\u0631\u0629 \u0625\u0634\u0631\u0627\u0642\u0629 \u0637\u0628\u064A\u0639\u064A\u0629 \u0648\u0631\u0627\u0626\u062D\u0629 \u062E\u0634\u0628\u064A\u0629 \u0639\u0646\u0628\u0631\u064A\u0629 \u0631\u0627\u0642\u064A\u0629.",
    sizes: ["100ml"],
    colors: ["#C28B53"]
  },
  {
    id: 4,
    nameFr: "Peignoir en Lin et Coton Lav\xE9",
    nameAr: "\u0631\u062F\u0627\u0621 \u062D\u0645\u0627\u0645 \u0641\u0627\u062E\u0631 \u0645\u0646 \u0627\u0644\u0643\u062A\u0627\u0646 \u0648\u0627\u0644\u0642\u0637\u0646 \u0627\u0644\u0645\u063A\u0633\u0648\u0644",
    price: 2200,
    oldPrice: 2600,
    category: "maison",
    inStock: true,
    stock: 3,
    badge: "exclusive",
    isNew: false,
    rating: 5,
    images: [
      "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 600' width='800' height='600'><rect width='800' height='600' fill='%23F3F1EC'/><g transform='translate(220, 70)'><path d='M100,80 L260,80 L320,160 L280,440 L80,440 L40,160 Z' fill='%23DCD6CD'/><path d='M180,80 L120,240 L180,440 L180,80 Z' fill='%23CBC3B7'/><path d='M80,260 L280,260' stroke='%239E8C7A' stroke-width='14'/><circle cx='180' cy='260' r='12' fill='%236B5E51'/><text x='180' y='490' font-family='serif' font-size='18' fill='%239E8C7A' text-anchor='middle' letter-spacing='2'>LIN PR\xC9-LAV\xC9 380G/M\xB2</text></g></svg>"
    ],
    descFr: "Tiss\xE9 selon un grammage g\xE9n\xE9reux de 380g/m\xB2. Col ch\xE2le \xE9l\xE9gant, poches plaqu\xE9es profondes et ceinture renforc\xE9e. Douceur a\xE9rienne et absorption optimale apr\xE8s le bain.",
    descAr: "\u0645\u0646\u0633\u0648\u062C \u0628\u0643\u062B\u0627\u0641\u0629 \u0641\u0627\u062E\u0631\u0629 380 \u063A\u0631\u0627\u0645/\u0645\xB2. \u064A\u0627\u0642\u0629 \u0634\u0627\u0644 \u0623\u0646\u064A\u0642\u0629 \u0645\u0639 \u062C\u064A\u0648\u0628 \u0639\u0645\u064A\u0642\u0629 \u0648\u062D\u0632\u0627\u0645 \u0645\u062A\u064A\u0646. \u064A\u0648\u0641\u0631 \u0631\u0627\u062D\u0629 \u0641\u0627\u0626\u0642\u0629 \u0648\u0627\u0645\u062A\u0635\u0627\u0635\u0627\u064B \u0645\u062B\u0627\u0644\u064A\u0627\u064B \u0628\u0639\u062F \u0627\u0644\u0627\u0633\u062A\u062D\u0645\u0627\u0645.",
    sizes: ["M", "L", "XL"],
    colors: ["#DCD6CD", "#2C302E", "#171717"]
  },
  {
    id: 5,
    nameFr: "Tasse C\xE9ramique Artisanale",
    nameAr: "\u0643\u0648\u0628 \u0642\u0647\u0648\u0629 \u062E\u0632\u0641\u064A \u0645\u0635\u0646\u0648\u0639 \u064A\u062F\u0648\u064A\u0627\u064B",
    price: 320,
    oldPrice: null,
    category: "maison",
    inStock: false,
    stock: 0,
    badge: "out",
    isNew: false,
    rating: 4,
    images: [
      "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 600' width='800' height='600'><rect width='800' height='600' fill='%23F3F1EC'/><g transform='translate(280, 150)'><ellipse cx='120' cy='320' rx='90' ry='20' fill='%23E5E0D8'/><path d='M60,110 L180,110 L165,280 C165,300 75,300 75,280 Z' fill='%23DDD6CD' stroke='%239E8C7A' stroke-width='3'/><path d='M175,150 C210,150 210,230 170,240' stroke='%239E8C7A' stroke-width='8' fill='none'/><rect x='70' y='265' width='100' height='20' fill='%239E8C7A'/><text x='120' y='360' font-family='serif' font-size='16' fill='%239E8C7A' text-anchor='middle'>\xC9DITION LIMIT\xC9E SAFI</text></g></svg>"
    ],
    descFr: "Gr\xE8s chamott\xE9 tourn\xE9 \xE0 la main dans les ateliers historiques de Safi. \xC9mail mat min\xE9ral coquille d'\u0153uf et base brute textur\xE9e. Chaque pi\xE8ce est unique.",
    descAr: "\u0645\u0635\u0646\u0648\u0639 \u064A\u062F\u0648\u064A\u0627\u064B \u0645\u0646 \u0627\u0644\u0637\u064A\u0646 \u0627\u0644\u0646\u0642\u064A \u0641\u064A \u0648\u0631\u0634\u0627\u062A \u0622\u0633\u0641\u064A \u0627\u0644\u062A\u0627\u0631\u064A\u062E\u064A\u0629. \u0637\u0644\u0627\u0621 \u062E\u0632\u0641\u064A \u0645\u0639\u062F\u0646\u064A \u063A\u064A\u0631 \u0644\u0627\u0645\u0639 \u0648\u0642\u0627\u0639\u062F\u0629 \u0631\u0645\u0644\u064A\u0629 \u062E\u0634\u0646\u0629. \u0643\u0644 \u0642\u0637\u0639\u0629 \u0641\u0631\u064A\u062F\u0629 \u0645\u0646 \u0646\u0648\u0639\u0647\u0627.",
    sizes: ["250ml"],
    colors: ["#DDD6CD", "#171717"]
  },
  {
    id: 6,
    nameFr: "Plaid Laine M\xE9rinos Peign\xE9e",
    nameAr: "\u063A\u0637\u0627\u0621 \u0641\u0627\u062E\u0631 \u0645\u0646 \u0635\u0648\u0641 \u0627\u0644\u0645\u064A\u0631\u064A\u0646\u0648 \u0627\u0644\u0645\u0645\u0634\u0637",
    price: 1650,
    oldPrice: 1950,
    category: "maison",
    inStock: true,
    stock: 5,
    badge: "luxury",
    isNew: false,
    rating: 5,
    images: [
      "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 600' width='800' height='600'><rect width='800' height='600' fill='%23F3F1EC'/><g transform='translate(220, 120)'><rect x='40' y='80' width='280' height='180' rx='12' fill='%239E8C7A'/><rect x='60' y='110' width='240' height='160' rx='8' fill='%23857565'/><rect x='80' y='140' width='200' height='140' rx='6' fill='%23FAF9F6'/><path d='M80,280 L280,280' stroke='%23C28B53' stroke-width='4' stroke-dasharray='6,6'/><text x='180' y='330' font-family='serif' font-size='16' fill='%23171717' text-anchor='middle'>M\xC9RINOS EXTRA-FIN 140x200 CM</text></g></svg>"
    ],
    descFr: "Tissage chevrons d'une finesse incomparable. Chaleur thermor\xE9gulatrice naturelle, franges torsad\xE9es nou\xE9es \xE0 la main. Id\xE9al pour votre salon ou chambre de ma\xEEtre.",
    descAr: "\u0646\u0633\u064A\u062C \u0643\u0644\u0627\u0633\u064A\u0643\u064A \u0628\u0646\u0642\u0634\u0629 \u0645\u062A\u0639\u0631\u062C\u0629 \u0641\u0627\u0626\u0642\u0629 \u0627\u0644\u0646\u0639\u0648\u0645\u0629. \u0635\u0648\u0641 \u0645\u064A\u0631\u064A\u0646\u0648 \u0637\u0628\u064A\u0639\u064A \u0639\u0627\u0632\u0644 \u0644\u0644\u062D\u0631\u0627\u0631\u0629 \u0645\u0639 \u0623\u0637\u0631\u0627\u0641 \u0645\u062C\u062F\u0648\u0644\u0629 \u064A\u062F\u0648\u064A\u0627\u064B \u062A\u0636\u0641\u064A \u0644\u0645\u0633\u0629 \u0641\u062E\u0627\u0645\u0629 \u0639\u0644\u0649 \u0645\u062C\u0644\u0633\u0643.",
    sizes: ["140x200cm"],
    colors: ["#9E8C7A", "#2C302E", "#FAF9F6"]
  }
];
const I18N = {
  fr: {
    brand: "MODANOVA",
    tagline: "Men's Essentials",
    nav_collection: "Collection",
    nav_craft: "Savoir-Faire",
    nav_testimonials: "T\xE9moignages",
    nav_tracking: "Suivi",
    nav_admin: "Admin",
    nav_cart: "Panier",
    hero_badge: "Maison de maroquinerie & soins d'exception",
    hero_title: "L'Essence du Luxe Brut & Minimaliste",
    hero_subtitle: "Pens\xE9 pour l'homme contemporain au Maroc. Mati\xE8res nobles, savoir-faire s\xE9culaire et livraison express avec paiement s\xE9curis\xE9 \xE0 la livraison.",
    hero_cta: "Explorer la Collection",
    hero_story_btn: "Notre Savoir-Faire",
    hero_slide2_badge: "Rituels Botaniques & Soins d'Origine",
    hero_slide2_title: "\xC9lixirs de l'Atlas & C\xE8dre Mill\xE9naire",
    hero_slide2_subtitle: "Formules pures infus\xE9es \xE0 l'huile de p\xE9pins de figue de barbarie et d'argan bio pour r\xE9g\xE9n\xE9rer la peau et magnifier la barbe.",
    hero_slide2_cta1: "D\xE9couvrir les Soins",
    hero_slide2_cta2: "Ingr\xE9dients d'Origine",
    hero_slide3_badge: "Ligne Maison, Bain & Mati\xE8res Nobles",
    hero_slide3_title: "L'Art de Vivre au Naturel",
    hero_slide3_subtitle: "Peignoirs en lin pr\xE9-lav\xE9 380g/m\xB2 et plaids en m\xE9rinos extra-fin fa\xE7onn\xE9s pour des moments de calme souverain.",
    hero_slide3_cta1: "Voir la Ligne Maison",
    hero_slide3_cta2: "H\xE9ritage Artisanal",
    hero_tab_1: "01 - Jackets",
    hero_tab_2: "02 - Accessoires",
    hero_tab_3: "03 - Chaussures",
    trust_delivery: "Livraison Partout au Maroc (24-72h)",
    trust_cod: "Paiement \xE0 la Livraison (COD)",
    trust_exchange: "\xC9change garanti sous 7 jours",
    search_placeholder: "Rechercher une pi\xE8ce...",
    filter_all: "Toutes les cr\xE9ations",
    filter_shoes: "Chaussures",
    filter_care: "Soins & Barbe",
    filter_home: "Maison & Bain",
    in_stock_only: "En stock uniquement",
    sort_default: "Tri par d\xE9faut",
    sort_asc: "Prix : Croissant",
    sort_desc: "Prix : D\xE9croissant",
    quick_view: "Aper\xE7u",
    add_to_cart: "Ajouter au panier",
    out_of_stock: "Rupture de stock",
    low_stock_alert: "\u{1F525} Plus que {n} en stock",
    photos_count: "+{n} photos",
    badge_new: "NOUVEAU",
    badge_exclusive: "EXCLUSIF",
    badge_luxury: "\xC9DITION LIMIT\xC9E",
    badge_out: "RUPTURE",
    cart_title: "Votre Panier",
    cart_empty: "Votre panier est actuellement vide.",
    cart_free_shipping: "Livraison express offerte sur toutes vos commandes",
    promo_label: "Code promotionnel",
    promo_placeholder: "Ex: RAWCRAFT10",
    promo_apply: "Appliquer",
    promo_applied: "Code RAWCRAFT10 appliqu\xE9 (-10%)",
    subtotal: "Sous-total",
    discount: "Remise exclusive",
    shipping: "Livraison express",
    free: "Gratuite",
    total: "Total \xE0 payer",
    clear_cart: "Vider le panier",
    checkout_btn: "Passer commande (COD)",
    checkout_title: "Finaliser votre commande",
    checkout_subtitle: "Paiement \xE0 la livraison en esp\xE8ces \xE0 la r\xE9ception de votre colis.",
    name_label: "Nom complet *",
    name_placeholder: "ex. Youssef El Amrani",
    phone_label: "T\xE9l\xE9phone portable marocain *",
    phone_placeholder: "06XXXXXXXX ou 07XXXXXXXX",
    phone_invalid: "Num\xE9ro invalide (doit contenir 10 chiffres et commencer par 06 ou 07)",
    phone_valid: "Num\xE9ro de t\xE9l\xE9phone v\xE9rifi\xE9 \u2713",
    city_label: "Ville de destination *",
    address_label: "Adresse de livraison exacte *",
    address_placeholder: "Quartier, rue, n\xB0 immeuble, \xE9tage...",
    notes_label: "Instructions sp\xE9cifiques (optionnel)",
    notes_placeholder: "Heure de passage pr\xE9f\xE9r\xE9e, sonnette...",
    order_confirm_btn: "Confirmer la commande (Paiement \xE0 la livraison)",
    invoice_modal_title: "Facture & Re\xE7u de Commande",
    print_invoice_btn: "\u{1F5A8}\uFE0F Imprimer la facture A4",
    whatsapp_confirm_btn: "Confirmer via WhatsApp",
    tracking_title: "Suivre votre commande",
    tracking_input_label: "Num\xE9ro de commande",
    tracking_input_placeholder: "ex. CMD-A8F2K9",
    tracking_btn: "Rechercher",
    tracking_status: "Statut",
    tracking_date: "Date",
    tracking_client: "Destinataire",
    tracking_city: "Ville",
    tracking_view_invoice: "Afficher la facture",
    admin_login_title: "Espace d'Administration S\xE9curis\xE9",
    admin_user_label: "Identifiant",
    admin_pass_label: "Mot de passe",
    admin_login_btn: "Connexion",
    admin_logout: "D\xE9connexion",
    admin_kpi_sales: "Ventes Totales",
    admin_kpi_orders: "Commandes Valid\xE9es",
    admin_kpi_avg: "Panier Moyen",
    admin_kpi_out: "Ruptures de Stock",
    admin_tab_products: "Catalogue Produits",
    admin_tab_orders: "Gestion Commandes",
    admin_add_product: "+ Ajouter un produit",
    status_pending: "En attente",
    status_confirmed: "Confirm\xE9e",
    status_shipping: "En cours",
    status_delivered: "Livr\xE9e",
    status_cancelled: "Annul\xE9e",
    craft_title: "L'Excellence du Fait-Main Marocain",
    craft_desc_1: "Chaque pi\xE8ce MODANOVA est le fruit d'une rencontre entre l'\xE9pure contemporaine et le savoir-faire de nos ateliers d'excellence au Maroc.",
    craft_desc_2: "Nos cr\xE9ations sont con\xE7ues exclusivement avec des mati\xE8res d'exception s\xE9lectionn\xE9es avec soin, garantissant une tenue parfaite qui s'embellit d'ann\xE9e en ann\xE9e.",
    craft_stat_1_val: "100%",
    craft_stat_1_lbl: "Mati\xE8res s\xE9lectionn\xE9es",
    craft_stat_2_val: "0 MAD",
    craft_stat_2_lbl: "Frais de livraison",
    craft_stat_3_val: "48h",
    craft_stat_3_lbl: "D\xE9lai moyen d'exp\xE9dition",
    testim_title: "Ce Que Disent Nos Clients",
    testim_subtitle: "Des hommes exigeants \xE0 travers tout le Royaume partagent leur exp\xE9rience.",
    footer_desc: "Maison de maroquinerie, soins et essentiels masculins intemporels au Maroc.",
    footer_nav: "Navigation",
    footer_contact: "Contact & Support",
    footer_terms: "Paiement \xE0 la livraison en esp\xE8ces partout au Maroc. \xC9change sous 7 jours.",
    footer_rights: "Tous droits r\xE9serv\xE9s.",
    toast_added: "Ajout\xE9 \xE0 votre panier",
    toast_removed: "Article retir\xE9",
    toast_empty: "Panier vid\xE9",
    toast_order_success: "Commande confirm\xE9e avec succ\xE8s !",
    toast_order_error: "Erreur lors de la commande",
    toast_status_updated: "Statut mis \xE0 jour",
    toast_product_saved: "Produit enregistr\xE9",
    toast_product_deleted: "Produit supprim\xE9",
    options_size: "Taille / Format",
    options_color: "Teinte",
    product_back_to_collection: "\u2190 Retour \xE0 la collection",
    product_share_link: "Copier le lien produit",
    product_share_whatsapp: "Envoyer par WhatsApp",
    product_link_copied: "Lien copi\xE9 dans le presse-papier ! Vous pouvez l'envoyer \xE0 vos clients.",
    product_buy_now_cod: "Commander directement (COD)",
    product_add_to_cart_success: "Article ajout\xE9 au panier avec succ\xE8s !",
    product_in_stock_msg: "En stock \u2014 Exp\xE9dition express sous 24h",
    product_delivery_guarantee: "Livraison express \xE0 domicile (24-72h partout au Maroc)",
    product_cod_guarantee: "Paiement en esp\xE8ces \xE0 la livraison (COD) apr\xE8s v\xE9rification",
    product_exchange_guarantee: "\xC9change garanti sous 7 jours",
    product_related_title: "Cr\xE9ations Recommand\xE9es de la Maison",
    admin_view_product: "Voir la page",
    admin_copy_link: "Copier lien"
  },
  ar: {
    brand: "\u0645\u0648\u062F\u0627\u0646\u0648\u0641\u0627",
    tagline: "\u0623\u0633\u0627\u0633\u064A\u0627\u062A \u0627\u0644\u0631\u062C\u0644 \u0627\u0644\u0631\u0627\u0642\u064A",
    nav_collection: "\u0627\u0644\u0645\u062C\u0645\u0648\u0639\u0629",
    nav_craft: "\u0627\u0644\u062D\u0631\u0641\u064A\u0629",
    nav_testimonials: "\u0622\u0631\u0627\u0621 \u0627\u0644\u0639\u0645\u0644\u0627\u0621",
    nav_tracking: "\u062A\u062A\u0628\u0639 \u0627\u0644\u0637\u0644\u0628",
    nav_admin: "\u0627\u0644\u0625\u062F\u0627\u0631\u0629",
    nav_cart: "\u0627\u0644\u0633\u0644\u0629",
    hero_badge: "\u062F\u0627\u0631 \u0627\u0644\u062C\u0644\u0648\u062F \u0627\u0644\u0637\u0628\u064A\u0639\u064A\u0629 \u0648\u0627\u0644\u0639\u0646\u0627\u064A\u0629 \u0627\u0644\u0627\u0633\u062A\u062B\u0646\u0627\u0626\u064A\u0629 \u0644\u0644\u0631\u062C\u0644",
    hero_title: "\u062C\u0648\u0647\u0631 \u0627\u0644\u0641\u062E\u0627\u0645\u0629 \u0627\u0644\u0647\u0627\u062F\u0626\u0629 \u0648\u0627\u0644\u0623\u0646\u0627\u0642\u0629 \u0627\u0644\u062E\u0627\u0644\u062F\u0629",
    hero_subtitle: "\u0645\u064F\u0635\u0645\u0645 \u0644\u0644\u0631\u062C\u0644 \u0627\u0644\u0639\u0635\u0631\u064A \u0628\u0627\u0644\u0645\u063A\u0631\u0628. \u0645\u0648\u0627\u062F \u0646\u0628\u0627\u062A\u064A\u0629 \u0623\u0635\u064A\u0644\u0629\u060C \u062F\u0628\u0627\u063A\u0629 \u0637\u0628\u064A\u0639\u064A\u0629 \u0628\u0641\u0627\u0633\u060C \u0648\u0639\u0646\u0627\u064A\u0629 \u0646\u0642\u064A\u0629 \u0645\u0639 \u0627\u0644\u062A\u0648\u0635\u064A\u0644 \u0627\u0644\u0633\u0631\u064A\u0639 \u0648\u0627\u0644\u062F\u0641\u0639 \u0646\u0642\u062F\u0627\u064B \u0639\u0646\u062F \u0627\u0644\u0627\u0633\u062A\u0644\u0627\u0645.",
    hero_cta: "\u0627\u0633\u062A\u0643\u0634\u0641 \u0627\u0644\u0645\u062C\u0645\u0648\u0639\u0629",
    hero_story_btn: "\u0642\u0635\u0629 \u0627\u0644\u062D\u0631\u0641\u064A\u0629",
    hero_slide2_badge: "\u0637\u0642\u0648\u0633 \u0646\u0628\u0627\u062A\u064A\u0629 \u0648\u0639\u0646\u0627\u064A\u0629 \u0623\u0635\u064A\u0644\u0629 \u0644\u0644\u0631\u062C\u0644",
    hero_slide2_title: "\u0625\u0643\u0633\u064A\u0631 \u0627\u0644\u0623\u0637\u0644\u0633 \u0627\u0644\u0646\u0627\u062F\u0631 \u0648\u062E\u0634\u0628 \u0627\u0644\u0623\u0631\u0632 \u0627\u0644\u0639\u062A\u064A\u0642",
    hero_slide2_subtitle: "\u062A\u0631\u0643\u064A\u0628\u0627\u062A \u0641\u0627\u0626\u0642\u0629 \u0627\u0644\u0646\u0642\u0627\u0621 \u063A\u0646\u064A\u0629 \u0628\u0632\u064A\u062A \u0628\u0630\u0648\u0631 \u0627\u0644\u062A\u064A\u0646 \u0627\u0644\u0634\u0648\u0643\u064A \u0648\u0627\u0644\u0623\u0631\u0643\u0627\u0646 \u0627\u0644\u0639\u0636\u0648\u064A \u0644\u062A\u062C\u062F\u064A\u062F \u062E\u0644\u0627\u064A\u0627 \u0627\u0644\u0628\u0634\u0631\u0629 \u0648\u062A\u0647\u0630\u064A\u0628 \u0627\u0644\u0644\u062D\u064A\u0629 \u0628\u0646\u0639\u0648\u0645\u0629.",
    hero_slide2_cta1: "\u0627\u0643\u062A\u0634\u0641 \u062A\u0634\u0643\u064A\u0644\u0629 \u0627\u0644\u0639\u0646\u0627\u064A\u0629",
    hero_slide2_cta2: "\u0627\u0644\u0645\u0643\u0648\u0646\u0627\u062A \u0627\u0644\u0639\u0636\u0648\u064A\u0629",
    hero_slide3_badge: "\u0627\u0644\u0645\u0646\u0632\u0644 \u0648\u0627\u0644\u0627\u0633\u062A\u0631\u062E\u0627\u0621 \u0648\u0645\u0648\u0627\u062F \u0641\u0627\u062E\u0631\u0629",
    hero_slide3_title: "\u0641\u0646 \u0627\u0644\u0639\u064A\u0634 \u0648\u0627\u0644\u0647\u062F\u0648\u0621 \u0627\u0644\u0645\u0644\u0643\u064A",
    hero_slide3_subtitle: "\u0623\u0631\u062F\u064A\u0629 \u062D\u0645\u0627\u0645 \u0645\u0646 \u0627\u0644\u0643\u062A\u0627\u0646 \u0627\u0644\u0637\u0628\u064A\u0639\u064A \u0627\u0644\u0645\u063A\u0633\u0648\u0644 \u0628\u0643\u062B\u0627\u0641\u0629 380\u063A/\u0645\xB2 \u0648\u0623\u063A\u0637\u064A\u0629 \u0645\u0646 \u0635\u0648\u0641 \u0627\u0644\u0645\u064A\u0631\u064A\u0646\u0648 \u0627\u0644\u0645\u0645\u0634\u0637 \u0644\u0631\u0627\u062D\u0629 \u0644\u0627 \u062A\u0636\u0627\u0647\u0649.",
    hero_slide3_cta1: "\u0627\u0643\u062A\u0634\u0641 \u062A\u0634\u0643\u064A\u0644\u0629 \u0627\u0644\u0645\u0646\u0632\u0644",
    hero_slide3_cta2: "\u0627\u0644\u062A\u0631\u0627\u062B \u0627\u0644\u062D\u0631\u0641\u064A",
    hero_tab_1: "\u0660\u0661 - \u062C\u0627\u0643\u064A\u062A\u0627\u062A",
    hero_tab_2: "\u0660\u0662 - \u0625\u0643\u0633\u0633\u0648\u0627\u0631\u0627\u062A",
    hero_tab_3: "\u0660\u0663 - \u0623\u062D\u0630\u064A\u0629",
    trust_delivery: "\u062A\u0648\u0635\u064A\u0644 \u0633\u0631\u064A\u0639 \u0644\u062C\u0645\u064A\u0639 \u0645\u062F\u0646 \u0627\u0644\u0645\u063A\u0631\u0628 (24-72 \u0633\u0627\u0639\u0629)",
    trust_cod: "\u0627\u0644\u062F\u0641\u0639 \u0646\u0642\u062F\u0627\u064B \u0639\u0646\u062F \u0627\u0644\u0627\u0633\u062A\u0644\u0627\u0645 (COD)",
    trust_exchange: "\u0636\u0645\u0627\u0646 \u0627\u0644\u0627\u0633\u062A\u0628\u062F\u0627\u0644 \u062E\u0644\u0627\u0644 7 \u0623\u064A\u0627\u0645",
    search_placeholder: "\u0627\u0628\u062D\u062B \u0639\u0646 \u0642\u0637\u0639\u0629 \u0623\u0633\u0627\u0633\u064A\u0629...",
    filter_all: "\u062C\u0645\u064A\u0639 \u0627\u0644\u0625\u0628\u062F\u0627\u0639\u0627\u062A",
    filter_shoes: "\u0623\u062D\u0630\u064A\u0629 \u0648\u0646\u0639\u0627\u0644",
    filter_care: "\u0639\u0646\u0627\u064A\u0629 \u0648\u0644\u062D\u064A\u0629",
    filter_home: "\u0627\u0644\u0645\u0646\u0632\u0644 \u0648\u0627\u0644\u0627\u0633\u062A\u0631\u062E\u0627\u0621",
    in_stock_only: "\u0627\u0644\u0645\u062A\u0648\u0641\u0631 \u0641\u0642\u0637 \u0641\u064A \u0627\u0644\u0645\u062E\u0632\u0646",
    sort_default: "\u0627\u0644\u062A\u0631\u062A\u064A\u0628 \u0627\u0644\u062A\u0644\u0642\u0627\u0626\u064A",
    sort_asc: "\u0627\u0644\u0633\u0639\u0631: \u0645\u0646 \u0627\u0644\u0623\u0642\u0644 \u0644\u0644\u0623\u0639\u0644\u0649",
    sort_desc: "\u0627\u0644\u0633\u0639\u0631: \u0645\u0646 \u0627\u0644\u0623\u0639\u0644\u0649 \u0644\u0644\u0623\u0642\u0644",
    quick_view: "\u0645\u0639\u0627\u064A\u0646\u0629 \u0633\u0631\u064A\u0639\u0629",
    add_to_cart: "\u0625\u0636\u0627\u0641\u0629 \u0625\u0644\u0649 \u0627\u0644\u0633\u0644\u0629",
    out_of_stock: "\u0646\u0641\u062F \u0645\u0646 \u0627\u0644\u0645\u062E\u0632\u0648\u0646",
    low_stock_alert: "\u{1F525} \u0628\u0642\u064A {n} \u0642\u0637\u0639 \u0641\u0642\u0637",
    photos_count: "+{n} \u0635\u0648\u0631",
    badge_new: "\u062C\u062F\u064A\u062F",
    badge_exclusive: "\u062D\u0635\u0631\u064A",
    badge_luxury: "\u0625\u0635\u062F\u0627\u0631 \u0645\u062D\u062F\u0648\u062F",
    badge_out: "\u0646\u0641\u062F",
    cart_title: "\u0633\u0644\u0629 \u0627\u0644\u062A\u0633\u0648\u0642",
    cart_empty: "\u0633\u0644\u062A\u0643 \u0641\u0627\u0631\u063A\u0629 \u062D\u0627\u0644\u064A\u0627\u064B.",
    cart_free_shipping: "\u062A\u0648\u0635\u064A\u0644 \u0645\u062C\u0627\u0646\u064A \u0648\u0633\u0631\u064A\u0639 \u0644\u062C\u0645\u064A\u0639 \u0627\u0644\u0637\u0644\u0628\u064A\u0627\u062A \u0641\u064A \u0627\u0644\u0645\u063A\u0631\u0628",
    promo_label: "\u0631\u0645\u0632 \u0627\u0644\u062E\u0635\u0645",
    promo_placeholder: "\u0645\u062B\u0627\u0644: RAWCRAFT10",
    promo_apply: "\u062A\u0637\u0628\u064A\u0642",
    promo_applied: "\u062A\u0645 \u062A\u0637\u0628\u064A\u0642 \u062E\u0635\u0645 10% (RAWCRAFT10)",
    subtotal: "\u0627\u0644\u0645\u062C\u0645\u0648\u0639 \u0627\u0644\u0641\u0631\u0639\u064A",
    discount: "\u0627\u0644\u062E\u0635\u0645 \u0627\u0644\u062D\u0635\u0631\u064A",
    shipping: "\u0627\u0644\u062A\u0648\u0635\u064A\u0644 \u0627\u0644\u0633\u0631\u064A\u0639",
    free: "\u0645\u062C\u0627\u0646\u0627\u064B",
    total: "\u0627\u0644\u0645\u062C\u0645\u0648\u0639 \u0627\u0644\u0635\u0627\u0641\u064A",
    clear_cart: "\u0625\u0641\u0631\u0627\u063A \u0627\u0644\u0633\u0644\u0629",
    checkout_btn: "\u0645\u062A\u0627\u0628\u0639\u0629 \u0627\u0644\u0637\u0644\u0628 (\u0627\u0644\u062F\u0641\u0639 \u0639\u0646\u062F \u0627\u0644\u0627\u0633\u062A\u0644\u0627\u0645)",
    checkout_title: "\u0625\u062A\u0645\u0627\u0645 \u0627\u0644\u0637\u0644\u0628 \u0648\u0627\u0644\u062F\u0641\u0639 \u0639\u0646\u062F \u0627\u0644\u0627\u0633\u062A\u0644\u0627\u0645",
    checkout_subtitle: "\u0627\u0644\u062F\u0641\u0639 \u0646\u0642\u062F\u0627\u064B \u0628\u0639\u062F \u0627\u0633\u062A\u0644\u0627\u0645 \u0637\u0631\u062F\u0643 \u0648\u0645\u0639\u0627\u064A\u0646\u062A\u0647 \u0641\u064A \u0639\u0646\u0648\u0627\u0646\u0643.",
    name_label: "\u0627\u0644\u0627\u0633\u0645 \u0627\u0644\u0643\u0627\u0645\u0644 *",
    name_placeholder: "\u0645\u062B\u0627\u0644: \u064A\u0648\u0633\u0641 \u0627\u0644\u0639\u0645\u0631\u0627\u0646\u064A",
    phone_label: "\u0631\u0642\u0645 \u0627\u0644\u0647\u0627\u062A\u0641 \u0627\u0644\u0645\u062D\u0645\u0648\u0644 \u0627\u0644\u0645\u063A\u0631\u0628\u064A *",
    phone_placeholder: "06XXXXXXXX \u0623\u0648 07XXXXXXXX",
    phone_invalid: "\u0631\u0642\u0645 \u063A\u064A\u0631 \u0635\u062D\u064A\u062D (\u064A\u062C\u0628 \u0623\u0646 \u064A\u0628\u062F\u0623 \u0628\u0640 06 \u0623\u0648 07 \u0648\u064A\u062A\u0643\u0648\u0646 \u0645\u0646 10 \u0623\u0631\u0642\u0627\u0645)",
    phone_valid: "\u0631\u0642\u0645 \u0627\u0644\u0647\u0627\u062A\u0641 \u0635\u062D\u064A\u062D \u2713",
    city_label: "\u0645\u062F\u064A\u0646\u0629 \u0627\u0644\u062A\u0648\u0635\u064A\u0644 *",
    address_label: "\u0627\u0644\u0639\u0646\u0648\u0627\u0646 \u0628\u0627\u0644\u062A\u0641\u0635\u064A\u0644 *",
    address_placeholder: "\u0627\u0644\u062D\u064A\u060C \u0627\u0644\u0634\u0627\u0631\u0639\u060C \u0631\u0642\u0645 \u0627\u0644\u0639\u0645\u0627\u0631\u0629\u060C \u0627\u0644\u0634\u0642\u0629...",
    notes_label: "\u0645\u0644\u0627\u062D\u0638\u0627\u062A \u0644\u0644\u062A\u0648\u0635\u064A\u0644 (\u0627\u062E\u062A\u064A\u0627\u0631\u064A)",
    notes_placeholder: "\u0648\u0642\u062A \u0627\u0644\u062A\u0648\u0635\u064A\u0644 \u0627\u0644\u0645\u0641\u0636\u0644...",
    order_confirm_btn: "\u062A\u0623\u0643\u064A\u062F \u0627\u0644\u0637\u0644\u0628 \u0627\u0644\u0622\u0646 (\u0627\u0644\u062F\u0641\u0639 \u0639\u0646\u062F \u0627\u0644\u0627\u0633\u062A\u0644\u0627\u0645)",
    invoice_modal_title: "\u0641\u0627\u062A\u0648\u0631\u0629 \u0648\u0648\u0635\u0644 \u0627\u0644\u0634\u0631\u0627\u0621",
    print_invoice_btn: "\u{1F5A8}\uFE0F \u0637\u0628\u0627\u0639\u0629 \u0627\u0644\u0641\u0627\u062A\u0648\u0631\u0629 A4",
    whatsapp_confirm_btn: "\u062A\u0623\u0643\u064A\u062F \u0627\u0644\u0637\u0644\u0628 \u0639\u0628\u0631 \u0648\u0627\u062A\u0633\u0627\u0628",
    tracking_title: "\u062A\u062A\u0628\u0639 \u062D\u0627\u0644\u0629 \u0637\u0644\u0628\u0643",
    tracking_input_label: "\u0631\u0642\u0645 \u0627\u0644\u0637\u0644\u0628",
    tracking_input_placeholder: "\u0645\u062B\u0627\u0644: CMD-A8F2K9",
    tracking_btn: "\u0628\u062D\u062B",
    tracking_status: "\u0627\u0644\u062D\u0627\u0644\u0629",
    tracking_date: "\u0627\u0644\u062A\u0627\u0631\u064A\u062E",
    tracking_client: "\u0627\u0633\u0645 \u0627\u0644\u0639\u0645\u064A\u0644",
    tracking_city: "\u0627\u0644\u0645\u062F\u064A\u0646\u0629",
    tracking_view_invoice: "\u0639\u0631\u0636 \u0627\u0644\u0641\u0627\u062A\u0648\u0631\u0629",
    admin_login_title: "\u0644\u0648\u062D\u0629 \u0627\u0644\u062A\u062D\u0643\u0645 \u0627\u0644\u0625\u062F\u0627\u0631\u064A\u0629",
    admin_user_label: "\u0627\u0633\u0645 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645",
    admin_pass_label: "\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631",
    admin_login_btn: "\u062F\u062E\u0648\u0644",
    admin_logout: "\u062E\u0631\u0648\u062C",
    admin_kpi_sales: "\u0625\u062C\u0645\u0627\u0644\u064A \u0627\u0644\u0645\u0628\u064A\u0639\u0627\u062A",
    admin_kpi_orders: "\u0627\u0644\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u0645\u0624\u0643\u062F\u0629",
    admin_kpi_avg: "\u0645\u062A\u0648\u0633\u0637 \u0627\u0644\u0633\u0644\u0629",
    admin_kpi_out: "\u0645\u0646\u062A\u062C\u0627\u062A \u0646\u0641\u062F\u062A",
    admin_tab_products: "\u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0645\u0646\u062A\u062C\u0627\u062A",
    admin_tab_orders: "\u0633\u062C\u0644 \u0627\u0644\u0637\u0644\u0628\u0627\u062A",
    admin_add_product: "+ \u0625\u0636\u0627\u0641\u0629 \u0645\u0646\u062A\u062C \u062C\u062F\u064A\u062F",
    status_pending: "\u0642\u064A\u062F \u0627\u0644\u0627\u0646\u062A\u0638\u0627\u0631",
    status_confirmed: "\u0645\u0624\u0643\u062F\u0629",
    status_shipping: "\u0642\u064A\u062F \u0627\u0644\u0634\u062D\u0646",
    status_delivered: "\u062A\u0645 \u0627\u0644\u062A\u0648\u0635\u064A\u0644",
    status_cancelled: "\u0645\u0644\u063A\u0627\u0629",
    craft_title: "\u0623\u0635\u0627\u0644\u0629 \u0648\u0625\u062A\u0642\u0627\u0646 \u0627\u0644\u0635\u0646\u0627\u0639\u0629 \u0627\u0644\u0645\u063A\u0631\u0628\u064A\u0629 \u0627\u0644\u0641\u0627\u062E\u0631\u0629",
    craft_desc_1: "\u0643\u0644 \u0642\u0637\u0639\u0629 \u0645\u0646 \u0645\u0648\u062F\u0627\u0646\u0648\u0641\u0627 \u0647\u064A \u0644\u0642\u0627\u0621 \u0645\u062A\u0646\u0627\u063A\u0645 \u0628\u064A\u0646 \u0627\u0644\u0628\u0633\u0627\u0637\u0629 \u0627\u0644\u0647\u0627\u062F\u0626\u0629 \u0648\u0627\u0644\u0645\u0647\u0627\u0631\u0629 \u0627\u0644\u0627\u0633\u062A\u062B\u0646\u0627\u0626\u064A\u0629 \u0644\u0644\u062D\u0631\u0641\u064A\u064A\u0646 \u0628\u0627\u0644\u0645\u063A\u0631\u0628.",
    craft_desc_2: "\u0645\u062C\u0645\u0648\u0639\u0627\u062A\u0646\u0627 \u0645\u0635\u0645\u0645\u0629 \u062E\u0635\u064A\u0635\u0627\u064B \u0628\u0645\u0648\u0627\u062F \u0631\u0641\u064A\u0639\u0629 \u0627\u0644\u0645\u0633\u062A\u0648\u0649 \u062A\u062F\u0648\u0645 \u0637\u0648\u064A\u0644\u0627\u064B \u0648\u062A\u0645\u0646\u062D\u0643 \u062D\u0636\u0648\u0631\u0627\u064B \u0648\u0627\u062B\u0642\u0627\u064B \u0641\u064A \u0643\u0644 \u0644\u062D\u0638\u0629.",
    craft_stat_1_val: "100%",
    craft_stat_1_lbl: "\u0645\u0648\u0627\u062F \u0645\u062E\u062A\u0627\u0631\u0629 \u0628\u0639\u0646\u0627\u064A\u0629",
    craft_stat_2_val: "0 \u062F\u0631\u0647\u0645",
    craft_stat_2_lbl: "\u062A\u0648\u0635\u064A\u0644 \u0645\u062C\u0627\u0646\u064A \u0644\u0644\u062C\u0645\u064A\u0639",
    craft_stat_3_val: "48 \u0633\u0627\u0639\u0629",
    craft_stat_3_lbl: "\u0645\u062A\u0648\u0633\u0637 \u0645\u062F\u0629 \u0627\u0644\u062A\u0648\u0635\u064A\u0644",
    testim_title: "\u0645\u0627 \u064A\u0642\u0648\u0644\u0647 \u0639\u0645\u0644\u0627\u0624\u0646\u0627",
    testim_subtitle: "\u062A\u062C\u0627\u0631\u0628 \u062D\u0642\u064A\u0642\u064A\u0629 \u0644\u0631\u062C\u0627\u0644 \u064A\u0641\u0636\u0644\u0648\u0646 \u0627\u0644\u062C\u0648\u062F\u0629 \u0627\u0644\u0647\u0627\u062F\u0626\u0629 \u0641\u064A \u0643\u0644 \u0645\u062F\u0646 \u0627\u0644\u0645\u0645\u0644\u0643\u0629.",
    footer_desc: "\u062F\u0627\u0631 \u0627\u0644\u062C\u0644\u0648\u062F \u0627\u0644\u0637\u0628\u064A\u0639\u064A\u0629\u060C \u0645\u0646\u062A\u062C\u0627\u062A \u0627\u0644\u0639\u0646\u0627\u064A\u0629 \u0648\u0623\u0633\u0627\u0633\u064A\u0627\u062A \u0627\u0644\u0631\u062C\u0644 \u0627\u0644\u062E\u0627\u0644\u062F\u0629 \u0628\u0627\u0644\u0645\u063A\u0631\u0628.",
    footer_nav: "\u0631\u0648\u0627\u0628\u0637 \u0633\u0631\u064A\u0639\u0629",
    footer_contact: "\u0627\u0644\u062A\u0648\u0627\u0635\u0644 \u0648\u062E\u062F\u0645\u0629 \u0627\u0644\u0639\u0645\u0644\u0627\u0621",
    footer_terms: "\u0627\u0644\u062F\u0641\u0639 \u0639\u0646\u062F \u0627\u0644\u0627\u0633\u062A\u0644\u0627\u0645 \u0646\u0642\u062F\u0627\u064B \u0641\u064A \u0643\u0627\u0641\u0629 \u0623\u0646\u062D\u0627\u0621 \u0627\u0644\u0645\u063A\u0631\u0628. \u0625\u0645\u0643\u0627\u0646\u064A\u0629 \u0627\u0644\u0627\u0633\u062A\u0628\u062F\u0627\u0644 \u062E\u0644\u0627\u0644 7 \u0623\u064A\u0627\u0645.",
    footer_rights: "\u062C\u0645\u064A\u0639 \u0627\u0644\u062D\u0642\u0648\u0642 \u0645\u062D\u0641\u0648\u0638\u0629.",
    toast_added: "\u062A\u0645\u062A \u0627\u0644\u0625\u0636\u0627\u0641\u0629 \u0625\u0644\u0649 \u0627\u0644\u0633\u0644\u0629",
    toast_removed: "\u062A\u0645 \u062D\u0630\u0641 \u0627\u0644\u0642\u0637\u0639\u0629",
    toast_empty: "\u062A\u0645 \u0625\u0641\u0631\u0627\u063A \u0627\u0644\u0633\u0644\u0629",
    toast_order_success: "\u062A\u0645 \u062A\u0623\u0643\u064A\u062F \u0637\u0644\u0628\u0643 \u0628\u0646\u062C\u0627\u062D !",
    toast_order_error: "\u062D\u062F\u062B \u062E\u0637\u0623 \u0623\u062B\u0646\u0627\u0621 \u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u0637\u0644\u0628",
    toast_status_updated: "\u062A\u0645 \u062A\u062D\u062F\u064A\u062B \u062D\u0627\u0644\u0629 \u0627\u0644\u0637\u0644\u0628",
    toast_product_saved: "\u062A\u0645 \u062D\u0641\u0638 \u0627\u0644\u0645\u0646\u062A\u062C \u0628\u0646\u062C\u0627\u062D",
    toast_product_deleted: "\u062A\u0645 \u062D\u0630\u0641 \u0627\u0644\u0645\u0646\u062A\u062C",
    options_size: "\u0627\u0644\u0645\u0642\u0627\u0633 / \u0627\u0644\u0633\u0639\u0629",
    options_color: "\u0627\u0644\u0644\u0648\u0646",
    product_back_to_collection: "\u2190 \u0627\u0644\u0639\u0648\u062F\u0629 \u0625\u0644\u0649 \u0627\u0644\u0645\u062C\u0645\u0648\u0639\u0629 \u0627\u0644\u0643\u0627\u0645\u0644\u0629",
    product_share_link: "\u0646\u0633\u062E \u0631\u0627\u0628\u0637 \u0627\u0644\u0645\u0646\u062A\u062C \u0644\u0644\u0632\u0628\u0648\u0646",
    product_share_whatsapp: "\u0625\u0631\u0633\u0627\u0644 \u0639\u0628\u0631 \u0648\u0627\u062A\u0633\u0627\u0628",
    product_link_copied: "\u062A\u0645 \u0646\u0633\u062E \u0631\u0627\u0628\u0637 \u0627\u0644\u0645\u0646\u062A\u062C \u0628\u0646\u062C\u0627\u062D! \u064A\u0645\u0643\u0646\u0643 \u0625\u0631\u0633\u0627\u0644\u0647 \u0644\u0644\u0632\u0628\u0627\u0626\u0646 \u0645\u0628\u0627\u0634\u0631\u0629.",
    product_buy_now_cod: "\u0637\u0644\u0628 \u0645\u0628\u0627\u0634\u0631 (\u0627\u0644\u062F\u0641\u0639 \u0639\u0646\u062F \u0627\u0644\u0627\u0633\u062A\u0644\u0627\u0645)",
    product_add_to_cart_success: "\u062A\u0645\u062A \u0625\u0636\u0627\u0641\u0629 \u0627\u0644\u0645\u0646\u062A\u062C \u0625\u0644\u0649 \u0627\u0644\u0633\u0644\u0629 \u0628\u0646\u062C\u0627\u062D!",
    product_in_stock_msg: "\u0645\u062A\u0648\u0641\u0631 \u0628\u0627\u0644\u0645\u062E\u0632\u0646 \u2014 \u0634\u062D\u0646 \u0633\u0631\u064A\u0639 \u062E\u0644\u0627\u0644 24 \u0633\u0627\u0639\u0629",
    product_delivery_guarantee: "\u062A\u0648\u0635\u064A\u0644 \u0633\u0631\u064A\u0639 \u0644\u0628\u0627\u0628 \u0645\u0646\u0632\u0644\u0643 \u0641\u064A \u062C\u0645\u064A\u0639 \u0645\u062F\u0646 \u0627\u0644\u0645\u063A\u0631\u0628 (24-72 \u0633\u0627\u0639\u0629)",
    product_cod_guarantee: "\u0627\u0644\u062F\u0641\u0639 \u0646\u0642\u062F\u0627\u064B \u0628\u0639\u062F \u0641\u062D\u0635 \u0627\u0644\u0645\u0646\u062A\u062C \u0639\u0646\u062F \u0627\u0644\u0627\u0633\u062A\u0644\u0627\u0645 (COD)",
    product_exchange_guarantee: "\u0625\u0645\u0643\u0627\u0646\u064A\u0629 \u0627\u0644\u0627\u0633\u062A\u0628\u062F\u0627\u0644 \u062E\u0644\u0627\u0644 7 \u0623\u064A\u0627\u0645",
    product_related_title: "\u0625\u0628\u062F\u0627\u0639\u0627\u062A \u0645\u062E\u062A\u0627\u0631\u0629 \u0642\u062F \u062A\u0646\u0627\u0644 \u0625\u0639\u062C\u0627\u0628\u0643",
    admin_view_product: "\u0639\u0631\u0636 \u0627\u0644\u0635\u0641\u062D\u0629",
    admin_copy_link: "\u0646\u0633\u062E \u0627\u0644\u0631\u0627\u0628\u0637"
  }
};
function buildInvoiceHTML(order, lang = "fr") {
  const isAr = lang === "ar";
  const dir = isAr ? "rtl" : "ltr";
  const font = isAr ? "'Cairo', sans-serif" : "'Plus Jakarta Sans', sans-serif";
  const orderId = escapeHTML(order.id || "");
  const dateStr = order.date ? new Date(order.date).toLocaleDateString(isAr ? "ar-MA" : "fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }) : "";
  const clientName = escapeHTML(order.customerName || "");
  const clientPhone = escapeHTML(order.customerPhone || "");
  const city = escapeHTML(order.city || "");
  const address = escapeHTML(order.address || "");
  const notes = escapeHTML(order.notes || "");
  const subtotal = Number(order.subtotal || order.total || 0).toLocaleString(isAr ? "ar-MA" : "fr-FR");
  const discount = Number(order.discount || 0);
  const total = Number(order.total || 0).toLocaleString(isAr ? "ar-MA" : "fr-FR");
  let parsedItems = [];
  if (Array.isArray(order.items)) {
    parsedItems = order.items;
  } else if (typeof order.items === "string") {
    try {
      parsedItems = JSON.parse(order.items);
    } catch {
      parsedItems = [];
    }
  }
  const itemsRows = (parsedItems || []).map((item, idx) => {
    const name = escapeHTML(isAr ? item.nameAr || item.nameFr || item.name || "Article" : item.nameFr || item.name || "Article");
    const size = escapeHTML(item.size || "-");
    const color = escapeHTML(item.color || "");
    const qty = Number(item.quantity || item.qty || 1);
    const price = Number(item.price || 0).toLocaleString(isAr ? "ar-MA" : "fr-FR");
    const lineTotal = (Number(item.price || 0) * qty).toLocaleString(isAr ? "ar-MA" : "fr-FR");
    return `
            <tr style="border-bottom: 1px solid #ECE7E1;">
              <td style="padding: 10px 12px; text-align: ${isAr ? "right" : "left"}; font-weight: 600; color: #171717;">
                ${name}
                <div style="font-size: 11px; color: #7A6C5D; font-weight: normal; margin-top: 2px;">
                  ${isAr ? "\u0627\u0644\u0645\u0642\u0627\u0633/\u0627\u0644\u062E\u064A\u0627\u0631:" : "Option:"} ${size} ${color ? `| ${color}` : ""}
                </div>
              </td>
              <td style="padding: 10px 12px; text-align: center; color: #555; font-size: 13px;">${qty}</td>
              <td style="padding: 10px 12px; text-align: ${isAr ? "left" : "right"}; color: #555; font-size: 13px;">${price} MAD</td>
              <td style="padding: 10px 12px; text-align: ${isAr ? "left" : "right"}; font-weight: 600; color: #171717; font-size: 13px;">${lineTotal} MAD</td>
            </tr>
          `;
  }).join("");
  return `
          <div dir="${dir}" style="font-family: ${font}; color: #171717; background: #ffffff; padding: 24px; max-width: 780px; margin: 0 auto; box-sizing: border-box; font-size: 13px; line-height: 1.5;">
            <!-- Header -->
            <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #171717; padding-bottom: 18px; margin-bottom: 20px;">
              <div>
                <h1 style="font-family: 'Cormorant Garamond', Georgia, serif; font-size: 28px; letter-spacing: 4px; margin: 0; color: #171717; font-weight: 700;">MODANOVA</h1>
                <div style="font-size: 10px; letter-spacing: 2px; color: #9E8C7A; text-transform: uppercase; margin-top: 2px;">
                  MEN'S ESSENTIALS \u2014 MAROC
                </div>
              </div>
              <div style="text-align: ${isAr ? "left" : "right"};">
                <span style="display: inline-block; background: #F3F1EC; border: 1px solid #9E8C7A; color: #4A3525; padding: 4px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; border-radius: 2px;">
                  ${isAr ? "\u0627\u0644\u062F\u0641\u0639 \u0639\u0646\u062F \u0627\u0644\u0627\u0633\u062A\u0644\u0627\u0645 (COD)" : "Paiement \xE0 la livraison (COD)"}
                </span>
                <div style="font-size: 14px; font-weight: 700; color: #171717; margin-top: 6px;">
                  ${isAr ? "\u0637\u0644\u0628 \u0631\u0642\u0645" : "Commande"} : <span style="color: #C28B53;">${orderId}</span>
                </div>
                <div style="font-size: 11px; color: #777;">${dateStr}</div>
              </div>
            </div>

            <!-- Client & Delivery Blocks -->
            <div style="display: flex; justify-content: space-between; gap: 20px; margin-bottom: 24px; background: #FAF9F6; padding: 14px 18px; border: 1px solid #ECE7E1;">
              <div style="flex: 1;">
                <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: #9E8C7A; letter-spacing: 1px; margin-bottom: 4px;">
                  ${isAr ? "\u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0639\u0645\u064A\u0644" : "Client & Coordonn\xE9es"}
                </div>
                <div style="font-size: 14px; font-weight: 700; color: #171717;">${clientName}</div>
                <div style="font-size: 13px; color: #444; direction: ltr; text-align: ${isAr ? "right" : "left"};">\u{1F4DE} ${clientPhone}</div>
              </div>
              <div style="flex: 1; text-align: ${isAr ? "left" : "right"};">
                <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: #9E8C7A; letter-spacing: 1px; margin-bottom: 4px;">
                  ${isAr ? "\u0639\u0646\u0648\u0627\u0646 \u0627\u0644\u062A\u0648\u0635\u064A\u0644" : "Adresse de Livraison"}
                </div>
                <div style="font-size: 13px; font-weight: 600; color: #171717;">\u{1F4CD} ${city}, Maroc</div>
                <div style="font-size: 12px; color: #555;">${address}</div>
                ${notes ? `<div style="font-size: 11px; color: #888; margin-top: 4px; font-style: italic;">Note: ${notes}</div>` : ""}
              </div>
            </div>

            <!-- Items Table -->
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              <thead>
                <tr style="background: #171717; color: #FAF9F6;">
                  <th style="padding: 8px 12px; text-align: ${isAr ? "right" : "left"}; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">
                    ${isAr ? "\u0627\u0644\u0645\u0646\u062A\u062C" : "Article"}
                  </th>
                  <th style="padding: 8px 12px; text-align: center; font-size: 11px; text-transform: uppercase; width: 60px;">
                    ${isAr ? "\u0627\u0644\u0643\u0645\u064A\u0629" : "Qt\xE9"}
                  </th>
                  <th style="padding: 8px 12px; text-align: ${isAr ? "left" : "right"}; font-size: 11px; text-transform: uppercase; width: 110px;">
                    ${isAr ? "\u0627\u0644\u0633\u0639\u0631" : "Prix Unitaire"}
                  </th>
                  <th style="padding: 8px 12px; text-align: ${isAr ? "left" : "right"}; font-size: 11px; text-transform: uppercase; width: 110px;">
                    ${isAr ? "\u0627\u0644\u0645\u062C\u0645\u0648\u0639" : "Total"}
                  </th>
                </tr>
              </thead>
              <tbody>
                ${itemsRows}
              </tbody>
            </table>

            <!-- Totals -->
            <div style="display: flex; justify-content: flex-end; margin-bottom: 24px;">
              <div style="width: 280px; background: #FAF9F6; border: 1px solid #ECE7E1; padding: 12px 16px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 6px; color: #555; font-size: 12px;">
                  <span>${isAr ? "\u0627\u0644\u0645\u062C\u0645\u0648\u0639 \u0627\u0644\u0641\u0631\u0639\u064A:" : "Sous-total:"}</span>
                  <span>${subtotal} MAD</span>
                </div>
                ${discount > 0 ? `
                  <div style="display: flex; justify-content: space-between; margin-bottom: 6px; color: #10B981; font-weight: 600; font-size: 12px;">
                    <span>${isAr ? "\u062E\u0635\u0645 (RAWCRAFT10):" : "Remise (RAWCRAFT10):"}</span>
                    <span>-${discount.toLocaleString(isAr ? "ar-MA" : "fr-FR")} MAD</span>
                  </div>
                ` : ""}
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px; color: #555; font-size: 12px;">
                  <span>${isAr ? "\u0627\u0644\u062A\u0648\u0635\u064A\u0644 \u0627\u0644\u0633\u0631\u064A\u0639:" : "Livraison express:"}</span>
                  <span style="color: #10B981; font-weight: 600;">${isAr ? "\u0645\u062C\u0627\u0646\u0627\u064B" : "Gratuite"}</span>
                </div>
                <div style="border-top: 2px solid #171717; padding-top: 8px; display: flex; justify-content: space-between; font-size: 16px; font-weight: 700; color: #171717;">
                  <span>${isAr ? "\u0627\u0644\u0645\u062C\u0645\u0648\u0639 \u0644\u0644\u062F\u0641\u0639 \u0639\u0646\u062F \u0627\u0644\u0627\u0633\u062A\u0644\u0627\u0645:" : "TOTAL \xC0 PAYER (COD):"}</span>
                  <span style="color: #C28B53;">${total} MAD</span>
                </div>
              </div>
            </div>

            <!-- Footer & Signature -->
            <div style="border-top: 1px solid #ECE7E1; padding-top: 14px; text-align: center; color: #7A6C5D; font-size: 11px;">
              <div style="font-weight: 600; color: #171717; margin-bottom: 4px;">
                ${isAr ? "\u0634\u0643\u0631\u0627\u064B \u0644\u062B\u0642\u062A\u0643\u0645 \u0641\u064A \u0645\u0648\u062F\u0627\u0646\u0648\u0641\u0627 \u2014 \u062F\u0627\u0631 \u0627\u0644\u0623\u0646\u0627\u0642\u0629 \u0627\u0644\u0631\u062C\u0627\u0644\u064A\u0629 \u0628\u0627\u0644\u0645\u063A\u0631\u0628" : "Merci pour votre confiance en MODANOVA \u2014 Maison Marocaine des Essentiels"}
              </div>
              <div>Atelier & Support : Kenitra, Maroc | WhatsApp : +212 600-773716</div>
              <div style="font-size: 10px; color: #999; margin-top: 2px;">
                ${isAr ? "\u064A\u0631\u062C\u0649 \u062A\u062D\u0636\u064A\u0631 \u0627\u0644\u0645\u0628\u0644\u063A \u0646\u0642\u062F\u0627\u064B \u0639\u0646\u062F \u0642\u062F\u0648\u0645 \u0645\u0646\u062F\u0648\u0628 \u0627\u0644\u062A\u0648\u0635\u064A\u0644." : "Veuillez pr\xE9parer le montant exact en esp\xE8ces \xE0 la livraison."}
              </div>
            </div>
          </div>
        `;
}
function printInvoice(order, lang) {
  if (!order) return;
  const printArea = document.getElementById("print-area");
  if (printArea) {
    printArea.innerHTML = buildInvoiceHTML(order, lang);
    const handleAfterPrint = () => {
      printArea.innerHTML = "";
      window.removeEventListener("afterprint", handleAfterPrint);
    };
    window.addEventListener("afterprint", handleAfterPrint);
    setTimeout(() => {
      window.print();
    }, 150);
  } else {
    window.print();
  }
}
function downloadInvoice(order, lang = "fr") {
  if (!order) return;
  const invoiceBody = buildInvoiceHTML(order, lang);
  const fullHtml = `<!doctype html>
<html lang="${lang}" dir="${lang === "ar" ? "rtl" : "ltr"}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Facture MODANOVA \u2014 ${order.id || "Commande"}</title>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&family=Cormorant+Garamond:wght@600;700&family=Plus+Jakarta+Sans:wght@400;600;700&display=swap" rel="stylesheet" />
  <style>
    body { margin: 0; padding: 24px; background: #FAF9F6; font-family: 'Plus Jakarta Sans', sans-serif; }
    .toolbar { max-width: 780px; margin: 0 auto 16px auto; display: flex; justify-content: flex-end; gap: 10px; }
    .btn { background: #171717; color: #fff; border: none; padding: 10px 18px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; cursor: pointer; }
    .btn:hover { background: #C28B53; }
    @media print { .toolbar { display: none !important; } body { background: #fff; padding: 0; } }
  </style>
</head>
<body>
  <div class="toolbar">
    <button class="btn" onclick="window.print()">\u{1F5A8}\uFE0F Imprimer / Enregistrer en PDF</button>
  </div>
  ${invoiceBody}
</body>
</html>`;
  const blob = new Blob([fullHtml], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Facture-MODANOVA-${order.id || "CMD"}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2e3);
}
function formatMoroccanPhone(phoneStr) {
  if (!phoneStr) return "";
  const digits = String(phoneStr).replace(/\D/g, "");
  if (digits.startsWith("0")) {
    return "212" + digits.substring(1);
  }
  if (digits.startsWith("212")) {
    return digits;
  }
  return "212" + digits;
}
function buildWhatsAppLink(order, lang = "fr") {
  const isAr = lang === "ar";
  const phone = "212600773716";
  const itemsSummary = (order.items || []).map((i) => `\u2022 ${isAr ? i.nameAr || i.nameFr : i.nameFr} (x${i.quantity || 1}) - ${i.price} MAD`).join("\n");
  const message = isAr ? `\u0645\u0631\u062D\u0628\u0627\u064B \u0645\u0648\u062F\u0627\u0646\u0648\u0641\u0627 \u{1F44B}
\u0623\u0648\u062F \u062A\u0623\u0643\u064A\u062F \u0637\u0644\u0628\u064A \u0639\u0628\u0631 \u0648\u0627\u062A\u0633\u0627\u0628:

*\u0631\u0642\u0645 \u0627\u0644\u0637\u0644\u0628:* ${order.id}
*\u0627\u0644\u0627\u0633\u0645:* ${order.customerName}
*\u0627\u0644\u0647\u0627\u062A\u0641:* ${order.customerPhone}
*\u0627\u0644\u0645\u062F\u064A\u0646\u0629:* ${order.city}
*\u0627\u0644\u0639\u0646\u0648\u0627\u0646:* ${order.address}

*\u0627\u0644\u0645\u0646\u062A\u062C\u0627\u062A:*
${itemsSummary}

*\u0627\u0644\u0645\u062C\u0645\u0648\u0639 \u0627\u0644\u0635\u0627\u0641\u064A:* ${order.total} \u062F\u0631\u0647\u0645 (\u0627\u0644\u062F\u0641\u0639 \u0639\u0646\u062F \u0627\u0644\u0627\u0633\u062A\u0644\u0627\u0645)

\u0634\u0643\u0631\u0627\u064B \u0644\u0643\u0645!` : `Bonjour MODANOVA \u{1F44B}
Je souhaite confirmer ma commande COD :

*Commande N\xB0 :* ${order.id}
*Client :* ${order.customerName}
*T\xE9l\xE9phone :* ${order.customerPhone}
*Ville :* ${order.city}
*Adresse :* ${order.address}

*Articles :*
${itemsSummary}

*Total \xE0 payer :* ${order.total} MAD (Paiement \xE0 la livraison)

Merci !`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
function buildAdminCustomerWhatsAppLink(order, lang = "fr") {
  const isAr = lang === "ar";
  const clientPhone = formatMoroccanPhone(order.customerPhone);
  const itemsSummary = (order.items || []).map((i) => `\u2022 ${isAr ? i.nameAr || i.nameFr : i.nameFr} (x${i.quantity || 1}) - ${i.price} MAD`).join("\n");
  const message = isAr ? `\u0645\u0631\u062D\u0628\u0627\u064B ${order.customerName} \u{1F44B}
\u0645\u0639\u0643 \u062E\u062F\u0645\u0629 \u0639\u0645\u0644\u0627\u0621 \u0645\u0648\u062F\u0627\u0646\u0648\u0641\u0627 (MODANOVA).
\u0646\u0634\u0643\u0631\u0643\u0645 \u0639\u0644\u0649 \u0627\u062E\u062A\u064A\u0627\u0631\u0643\u0645 \u0645\u062A\u062C\u0631\u0646\u0627! \u0646\u0648\u062F \u062A\u0623\u0643\u064A\u062F \u0637\u0644\u0628\u0643\u0645 \u0631\u0642\u0645 *${order.id}* :

\u{1F4E6} *\u0627\u0644\u0645\u0646\u062A\u062C\u0627\u062A :*
${itemsSummary}

\u{1F4B0} *\u0627\u0644\u0645\u0628\u0644\u063A \u0627\u0644\u0625\u062C\u0645\u0627\u0644\u064A :* ${order.total} \u062F\u0631\u0647\u0645 (\u0627\u0644\u062F\u0641\u0639 \u0646\u0642\u062F\u0627\u064B \u0639\u0646\u062F \u0627\u0644\u0627\u0633\u062A\u0644\u0627\u0645)
\u{1F4CD} *\u0639\u0646\u0648\u0627\u0646 \u0627\u0644\u062A\u0648\u0635\u064A\u0644 :* ${order.address}\u060C ${order.city}

\u064A\u0631\u062C\u0649 \u0627\u0644\u0631\u062F \u0644\u062A\u0623\u0643\u064A\u062F \u0647\u0630\u0627 \u0627\u0644\u0637\u0644\u0628 \u0644\u0646\u0628\u0627\u0634\u0631 \u0627\u0644\u0634\u062D\u0646 \u0627\u0644\u0641\u0648\u0631\u064A \u0625\u0644\u064A\u0643\u0645. \u0634\u0643\u0631\u0627\u064B \u062C\u0632\u064A\u0644\u0627\u064B!` : `Bonjour ${order.customerName} \u{1F44B}
C'est le support MODANOVA.
Nous vous remercions pour votre confiance ! Nous souhaitons confirmer avec vous votre commande N\xB0 *${order.id}* :

\u{1F4E6} *Articles command\xE9s :*
${itemsSummary}

\u{1F4B0} *Total \xE0 r\xE9gler :* ${order.total} MAD (Paiement \xE0 la livraison)
\u{1F4CD} *Adresse de livraison :* ${order.address}, ${order.city}

Pourriez-vous s'il vous pla\xEEt nous confirmer cette commande afin que nous puissions lancer l'exp\xE9dition express imm\xE9diatement ? Merci !`;
  return `https://wa.me/${clientPhone}?text=${encodeURIComponent(message)}`;
}
function slugify(text) {
  return String(text || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "") || "produit";
}
function getProductSlug(product) {
  if (!product) return "";
  const base = slugify(product.nameFr || product.nameAr || "produit");
  return `${base}-${product.id}`;
}
const PRESET_COLOR_PALETTE = [
  { labelFr: "Noir", labelAr: "\u0623\u0633\u0648\u062F", hex: "#171717" },
  { labelFr: "Blanc", labelAr: "\u0623\u0628\u064A\u0636", hex: "#FFFFFF" },
  { labelFr: "Marron", labelAr: "\u0628\u0646\u064A", hex: "#3D2B1F" },
  { labelFr: "Camel", labelAr: "\u062C\u0645\u0644\u064A", hex: "#C28B53" },
  { labelFr: "Beige", labelAr: "\u0628\u064A\u062C", hex: "#D2B48C" },
  { labelFr: "Bleu Marine", labelAr: "\u0623\u0632\u0631\u0642 \u062F\u0627\u0643\u0646", hex: "#1E293B" },
  { labelFr: "Gris", labelAr: "\u0631\u0645\u0627\u062F\u064A", hex: "#4B5563" },
  { labelFr: "Vert", labelAr: "\u0623\u062E\u0636\u0631", hex: "#14532D" },
  { labelFr: "Bordeaux", labelAr: "\u062E\u0645\u0631\u064A", hex: "#7F1D1D" }
];
function getColorLabel(rawColor, lang = "fr") {
  const c = String(rawColor || "").trim();
  if (!c) return lang === "ar" ? "\u0642\u064A\u0627\u0633\u064A" : "Standard";
  if (c.includes(":")) {
    return c.split(":")[0].trim() || c;
  }
  const upper = c.toUpperCase();
  const mapFr = {
    "#171717": "Noir",
    "#000000": "Noir",
    "#121212": "Noir",
    "#1C1C1C": "Noir",
    "#3D2B1F": "Marron",
    "#4A3525": "Marron",
    "#5C4033": "Marron",
    "#8B4513": "Cognac",
    "#C28B53": "Camel",
    "#D2B48C": "Beige",
    "#9E8C7A": "Taupe / Beige",
    "#F5F5DC": "Beige",
    "#FAF9F6": "Blanc Cass\xE9",
    "#FFFFFF": "Blanc",
    "#F3F1EC": "Ivoire",
    "#1E293B": "Bleu Marine",
    "#1E3A8A": "Bleu Marine",
    "#0F172A": "Bleu Nuit",
    "#4B5563": "Gris",
    "#6B7280": "Gris",
    "#9CA3AF": "Gris Clair",
    "#065F46": "Vert \xC9meraude",
    "#14532D": "Vert",
    "#7F1D1D": "Bordeaux",
    "#991B1B": "Bordeaux",
    "#D4AF37": "Or",
    "#E6C687": "Or",
    "#C0C0C0": "Argent"
  };
  const mapAr = {
    "#171717": "\u0623\u0633\u0648\u062F",
    "#000000": "\u0623\u0633\u0648\u062F",
    "#121212": "\u0623\u0633\u0648\u062F",
    "#1C1C1C": "\u0623\u0633\u0648\u062F",
    "#3D2B1F": "\u0628\u0646\u064A",
    "#4A3525": "\u0628\u0646\u064A",
    "#5C4033": "\u0628\u0646\u064A",
    "#8B4513": "\u0628\u0646\u064A \u0641\u0627\u062A\u062D",
    "#C28B53": "\u062C\u0645\u0644\u064A",
    "#D2B48C": "\u0628\u064A\u062C",
    "#9E8C7A": "\u0628\u064A\u062C",
    "#FAF9F6": "\u0623\u0628\u064A\u0636",
    "#FFFFFF": "\u0623\u0628\u064A\u0636",
    "#F3F1EC": "\u0639\u0627\u062C\u064A",
    "#1E293B": "\u0623\u0632\u0631\u0642 \u062F\u0627\u0643\u0646",
    "#1E3A8A": "\u0623\u0632\u0631\u0642 \u062F\u0627\u0643\u0646",
    "#4B5563": "\u0631\u0645\u0627\u062F\u064A",
    "#6B7280": "\u0631\u0645\u0627\u062F\u064A",
    "#065F46": "\u0623\u062E\u0636\u0631",
    "#14532D": "\u0623\u062E\u0636\u0631",
    "#7F1D1D": "\u062E\u0645\u0631\u064A",
    "#991B1B": "\u0623\u062D\u0645\u0631 \u062F\u0627\u0643\u0646"
  };
  if (lang === "ar" && mapAr[upper]) return mapAr[upper];
  if (mapFr[upper]) return mapFr[upper];
  return c;
}
function getColorCss(rawColor) {
  const c = String(rawColor || "").trim();
  if (!c) return "#171717";
  if (c.includes(":")) {
    const hexPart = c.split(":")[1]?.trim();
    if (hexPart) return hexPart;
  }
  if (c.startsWith("#") || c.startsWith("rgb")) return c;
  const lower = c.toLowerCase();
  const nameToHex = {
    "noir": "#171717",
    "black": "#171717",
    "blanc": "#FFFFFF",
    "white": "#FFFFFF",
    "marron": "#3D2B1F",
    "marron fonc\xE9": "#3D2B1F",
    "cognac": "#8B4513",
    "camel": "#C28B53",
    "caramel": "#C28B53",
    "beige": "#D2B48C",
    "taupe": "#9E8C7A",
    "bleu": "#1E3A8A",
    "bleu marine": "#1E293B",
    "bleu nuit": "#0F172A",
    "gris": "#4B5563",
    "gris clair": "#9CA3AF",
    "vert": "#14532D",
    "kaki": "#14532D",
    "bordeaux": "#7F1D1D",
    "rouge": "#991B1B",
    "or": "#D4AF37",
    "argent": "#C0C0C0"
  };
  return nameToHex[lower] || "#171717";
}
function makeVariantKey(size, color) {
  const s = String(size || "Unique").trim();
  const c = String(color || "Default").trim();
  return `${s}__${c}`;
}
function hasVariantStockMatrix(product) {
  return Boolean(
    product && product.variantStock && typeof product.variantStock === "object" && Object.keys(product.variantStock).length > 0
  );
}
function getProductVariantStock(product, size, color) {
  if (!product) return 0;
  const effSize = String(size || product.sizes && product.sizes[0] || "Unique").trim();
  const effColor = String(color || product.colors && product.colors[0] || "Default").trim();
  if (hasVariantStockMatrix(product)) {
    const vs = product.variantStock;
    const exactKey = makeVariantKey(effSize, effColor);
    if (vs[exactKey] !== void 0) {
      return Math.max(0, Number(vs[exactKey]) || 0);
    }
    const targetLower = exactKey.toLowerCase();
    for (const [k, v] of Object.entries(vs)) {
      if (String(k).trim().toLowerCase() === targetLower) {
        return Math.max(0, Number(v) || 0);
      }
    }
    const cLabelLower = getColorLabel(effColor, "fr").toLowerCase();
    for (const [k, v] of Object.entries(vs)) {
      const [ks, kc] = String(k).split("__");
      if (ks && kc && ks.trim().toLowerCase() === effSize.toLowerCase() && (kc.trim().toLowerCase() === effColor.toLowerCase() || getColorLabel(kc, "fr").toLowerCase() === cLabelLower)) {
        return Math.max(0, Number(v) || 0);
      }
    }
    return 0;
  }
  return Math.max(0, Number(product.stock) || 0);
}
function getTotalStockForSize(product, size) {
  if (!product) return 0;
  if (!hasVariantStockMatrix(product)) return Math.max(0, Number(product.stock) || 0);
  const colors = Array.isArray(product.colors) && product.colors.length > 0 ? product.colors : ["Default"];
  return colors.reduce((sum, col) => sum + getProductVariantStock(product, size, col), 0);
}
function parseVideoEmbedInfo(rawUrl) {
  const url = String(rawUrl || "").trim();
  if (!url) return null;
  const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?.*v=|embed\/|shorts\/|live\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i);
  if (ytMatch && ytMatch[1]) {
    return {
      type: "iframe",
      provider: "YouTube",
      embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}?rel=0&modestbranding=1`,
      originalUrl: url
    };
  }
  const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/i);
  if (vimeoMatch && vimeoMatch[1]) {
    return {
      type: "iframe",
      provider: "Vimeo",
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}`,
      originalUrl: url
    };
  }
  const tiktokMatch = url.match(/tiktok\.com\/.*\/video\/(\d+)/i);
  if (tiktokMatch && tiktokMatch[1]) {
    return {
      type: "iframe",
      provider: "TikTok",
      embedUrl: `https://www.tiktok.com/embed/v2/${tiktokMatch[1]}`,
      originalUrl: url
    };
  }
  if (/\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url) || url.startsWith("data:video/")) {
    return {
      type: "video",
      provider: "Vid\xE9o HD",
      embedUrl: url,
      originalUrl: url
    };
  }
  const driveMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/i);
  if (driveMatch && driveMatch[1]) {
    return {
      type: "iframe",
      provider: "Google Drive",
      embedUrl: `https://drive.google.com/file/d/${driveMatch[1]}/preview`,
      originalUrl: url
    };
  }
  if (url.includes("/embed") || url.includes("player.")) {
    return {
      type: "iframe",
      provider: "Vid\xE9o",
      embedUrl: url,
      originalUrl: url
    };
  }
  return {
    type: "external",
    provider: "Vid\xE9o",
    embedUrl: url,
    originalUrl: url
  };
}
function ProductVideoPlayer({ videoUrl, title, lang }) {
  const info = parseVideoEmbedInfo(videoUrl);
  if (!info) return null;
  if (info.type === "video") {
    return /* @__PURE__ */ React.createElement("div", { className: "w-full space-y-2" }, /* @__PURE__ */ React.createElement("div", { className: "relative w-full aspect-video bg-black rounded-xs overflow-hidden border border-taupe/25 shadow-sm" }, /* @__PURE__ */ React.createElement(
      "video",
      {
        src: info.embedUrl,
        controls: true,
        playsInline: true,
        preload: "metadata",
        className: "w-full h-full object-contain bg-black"
      }
    )), /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between text-[11px] text-taupe-dark" }, /* @__PURE__ */ React.createElement("span", null, "\u{1F3AC} ", lang === "ar" ? "\u0641\u064A\u062F\u064A\u0648 \u0627\u0644\u0645\u0646\u062A\u062C \u0639\u0627\u0644\u064A \u0627\u0644\u062C\u0648\u062F\u0629" : "Vid\xE9o de pr\xE9sentation du produit"), /* @__PURE__ */ React.createElement(
      "a",
      {
        href: info.originalUrl,
        target: "_blank",
        rel: "noopener noreferrer",
        className: "text-caramel hover:underline font-semibold"
      },
      lang === "ar" ? "\u0641\u062A\u062D \u0641\u064A \u0646\u0627\u0641\u0630\u0629 \u062C\u062F\u064A\u062F\u0629 \u2197" : "Ouvrir en plein \xE9cran \u2197"
    )));
  }
  if (info.type === "iframe") {
    return /* @__PURE__ */ React.createElement("div", { className: "w-full space-y-2" }, /* @__PURE__ */ React.createElement("div", { className: "relative w-full aspect-video bg-black rounded-xs overflow-hidden border border-taupe/25 shadow-sm" }, /* @__PURE__ */ React.createElement(
      "iframe",
      {
        src: info.embedUrl,
        title: title || "Vid\xE9o du produit",
        className: "w-full h-full border-0",
        allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",
        allowFullScreen: true
      }
    )), /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between text-[11px] text-taupe-dark" }, /* @__PURE__ */ React.createElement("span", null, "\u{1F3AC} ", info.provider, " \u2014 ", lang === "ar" ? "\u0639\u0631\u0636 \u0641\u064A\u062F\u064A\u0648 \u0627\u0644\u0645\u0646\u062A\u062C" : "Pr\xE9sentation vid\xE9o"), /* @__PURE__ */ React.createElement(
      "a",
      {
        href: info.originalUrl,
        target: "_blank",
        rel: "noopener noreferrer",
        className: "text-caramel hover:underline font-semibold"
      },
      lang === "ar" ? "\u0645\u0634\u0627\u0647\u062F\u0629 \u0627\u0644\u0631\u0627\u0628\u0637 \u0627\u0644\u0623\u0635\u0644\u064A \u2197" : "Ouvrir le lien vid\xE9o direct \u2197"
    )));
  }
  return /* @__PURE__ */ React.createElement("div", { className: "w-full p-5 bg-[#141210] text-white rounded-xs border border-caramel/40 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3" }, /* @__PURE__ */ React.createElement("span", { className: "w-11 h-11 rounded-full bg-caramel text-white flex items-center justify-center text-lg font-bold shrink-0 shadow-xs" }, "\u25B6"), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "text-xs font-bold uppercase tracking-wider text-[#E6C687]" }, lang === "ar" ? "\u0641\u064A\u062F\u064A\u0648 \u0639\u0631\u0636 \u0627\u0644\u0645\u0646\u062A\u062C" : "Vid\xE9o de Pr\xE9sentation du Produit"), /* @__PURE__ */ React.createElement("div", { className: "text-xs text-white/80 mt-0.5 break-all line-clamp-1" }, title))), /* @__PURE__ */ React.createElement(
    "a",
    {
      href: info.originalUrl,
      target: "_blank",
      rel: "noopener noreferrer",
      className: "px-5 py-2.5 bg-caramel hover:bg-white text-white hover:text-noir text-xs font-bold uppercase tracking-wider rounded-xs transition-colors shrink-0 flex items-center gap-2 shadow-xs"
    },
    /* @__PURE__ */ React.createElement("span", null, "\u25B6"),
    /* @__PURE__ */ React.createElement("span", null, lang === "ar" ? "\u0645\u0634\u0627\u0647\u062F\u0629 \u0627\u0644\u0641\u064A\u062F\u064A\u0648 \u0627\u0644\u0622\u0646" : "Regarder la Vid\xE9o \u2197")
  ));
}
function ProductDetailPage({
  product,
  allProducts,
  lang,
  t,
  wishlist,
  toggleWishlist,
  onBack,
  onAddToCart,
  onDirectCheckout,
  onSelectProduct,
  showToast
}) {
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [mediaMode, setMediaMode] = useState("photos");
  const [selectedSize, setSelectedSize] = useState(() => {
    const sizes = product.sizes && product.sizes.length > 0 ? product.sizes : ["Unique"];
    const colors = product.colors && product.colors.length > 0 ? product.colors : ["Default"];
    for (const s of sizes) {
      for (const c of colors) {
        if (getProductVariantStock(product, s, c) > 0) return s;
      }
    }
    return sizes[0] || "";
  });
  const [selectedColor, setSelectedColor] = useState(() => {
    const sizes = product.sizes && product.sizes.length > 0 ? product.sizes : ["Unique"];
    const colors = product.colors && product.colors.length > 0 ? product.colors : ["Default"];
    for (const s of sizes) {
      for (const c of colors) {
        if (getProductVariantStock(product, s, c) > 0) return c;
      }
    }
    return colors[0] || "";
  });
  const [qty, setQty] = useState(1);
  const [copied, setCopied] = useState(false);
  const [imageFit, setImageFit] = useState("contain");
  const [zoomModalOpen, setZoomModalOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1.5);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const prodTouchStartX = useRef(null);
  const imgList = Array.isArray(product.images) && product.images.length > 0 ? product.images : [""];
  const imgCount = imgList.length;
  const hasVideo = Boolean(product.videoUrl && String(product.videoUrl).trim());
  const prevProdImage = useCallback((e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    setMediaMode("photos");
    if (imgCount <= 1) return;
    setActiveImageIdx((prev) => (prev - 1 + imgCount) % imgCount);
  }, [imgCount]);
  const nextProdImage = useCallback((e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    setMediaMode("photos");
    if (imgCount <= 1) return;
    setActiveImageIdx((prev) => (prev + 1) % imgCount);
  }, [imgCount]);
  useEffect(() => {
    if (imgCount <= 1) return;
    const handleKey = (e) => {
      if (e.key === "ArrowLeft") prevProdImage();
      if (e.key === "ArrowRight") nextProdImage();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [imgCount, prevProdImage, nextProdImage]);
  const [countdown, setCountdown] = useState(() => {
    const now = /* @__PURE__ */ new Date();
    const cutoff = /* @__PURE__ */ new Date();
    cutoff.setHours(17, 0, 0, 0);
    if (now > cutoff) cutoff.setDate(cutoff.getDate() + 1);
    const diff = Math.max(0, cutoff - now);
    const hours = Math.floor(diff / (1e3 * 60 * 60));
    const mins = Math.floor(diff % (1e3 * 60 * 60) / (1e3 * 60));
    return { hours, mins };
  });
  useEffect(() => {
    const timer = setInterval(() => {
      const now = /* @__PURE__ */ new Date();
      const cutoff = /* @__PURE__ */ new Date();
      cutoff.setHours(17, 0, 0, 0);
      if (now > cutoff) cutoff.setDate(cutoff.getDate() + 1);
      const diff = Math.max(0, cutoff - now);
      const hours = Math.floor(diff / (1e3 * 60 * 60));
      const mins = Math.floor(diff % (1e3 * 60 * 60) / (1e3 * 60));
      setCountdown({ hours, mins });
    }, 6e4);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    setActiveImageIdx(0);
    setMediaMode("photos");
    const sizes = product.sizes && product.sizes.length > 0 ? product.sizes : ["Unique"];
    const colors = product.colors && product.colors.length > 0 ? product.colors : ["Default"];
    let initSize = sizes[0] || "";
    let initColor = colors[0] || "";
    outer: for (const s of sizes) {
      for (const c of colors) {
        if (getProductVariantStock(product, s, c) > 0) {
          initSize = s;
          initColor = c;
          break outer;
        }
      }
    }
    setSelectedSize(initSize);
    setSelectedColor(initColor);
    setQty(1);
    setCopied(false);
    setImageFit("contain");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [product.id]);
  const selectedVariantStock = getProductVariantStock(product, selectedSize, selectedColor);
  const selectedColorName = getColorLabel(selectedColor, lang);
  useEffect(() => {
    if (selectedVariantStock > 0 && qty > selectedVariantStock) {
      setQty(selectedVariantStock);
    } else if (selectedVariantStock <= 0) {
      setQty(1);
    }
  }, [selectedSize, selectedColor, selectedVariantStock]);
  const title = lang === "ar" ? product.nameAr || product.nameFr : product.nameFr;
  const desc = lang === "ar" ? product.descAr || product.descFr : product.descFr;
  const isWish = wishlist.includes(product.id);
  const isProductCompletelyOut = !product.inStock || product.stock <= 0;
  const isOut = isProductCompletelyOut || selectedVariantStock <= 0;
  const isLow = !isOut && selectedVariantStock > 0 && selectedVariantStock <= 5;
  const productSlug = getProductSlug(product);
  const currentUrl = `${window.location.origin}/produit/${productSlug}`;
  const copyLink = () => {
    try {
      navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      showToast(t.product_link_copied, "success");
      setTimeout(() => setCopied(false), 3e3);
    } catch {
      showToast(currentUrl, "info");
    }
  };
  const shareWhatsApp = () => {
    const text = lang === "ar" ? `\u0645\u0631\u062D\u0628\u0627\u064B \u{1F44B} \u0627\u0643\u062A\u0634\u0641 \u0647\u0630\u0647 \u0627\u0644\u0642\u0637\u0639\u0629 \u0627\u0644\u0631\u0627\u0642\u064A\u0629 \u0645\u0646 \u062F\u0627\u0631 \u0645\u0648\u062F\u0627\u0646\u0648\u0641\u0627 (MODANOVA):

*${title}*
\u0627\u0644\u0633\u0639\u0631: ${product.price} \u062F\u0631\u0647\u0645 \u0645\u063A\u0631\u0628\u064A (\u0627\u0644\u062F\u0641\u0639 \u0639\u0646\u062F \u0627\u0644\u0627\u0633\u062A\u0644\u0627\u0645)

\u0631\u0627\u0628\u0637 \u0627\u0644\u0645\u0646\u062A\u062C \u0627\u0644\u0645\u0628\u0627\u0634\u0631:
${currentUrl}` : `Bonjour \u{1F44B} D\xE9couvrez cette cr\xE9ation de la Maison MODANOVA :

*${title}*
Prix : ${product.price} MAD (Paiement \xE0 la livraison)

Lien direct vers la pi\xE8ce :
${currentUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };
  const handleDirectOrder = () => {
    if (isOut) {
      showToast(
        lang === "ar" ? `\u0627\u0644\u0645\u0642\u0627\u0633 "${selectedSize}" \u0628\u0627\u0644\u0644\u0648\u0646 "${selectedColorName}" \u063A\u064A\u0631 \u0645\u062A\u0648\u0641\u0631 \u0641\u064A \u0627\u0644\u0645\u062E\u0632\u0648\u0646.` : `La taille "${selectedSize}" en couleur "${selectedColorName}" n'est pas en stock.`,
        "error"
      );
      return;
    }
    const checkoutItem = {
      productId: product.id,
      nameFr: product.nameFr,
      nameAr: product.nameAr,
      price: Number(product.price),
      quantity: Math.min(qty, selectedVariantStock),
      stock: selectedVariantStock,
      size: selectedSize,
      color: selectedColor,
      image: product.images && product.images[0] || "",
      lineKey: `${product.id}_${selectedSize}_${selectedColor}`
    };
    onDirectCheckout(checkoutItem);
  };
  const orderViaWhatsApp = () => {
    if (isOut) {
      showToast(
        lang === "ar" ? `\u0627\u0644\u0645\u0642\u0627\u0633 "${selectedSize}" \u0628\u0627\u0644\u0644\u0648\u0646 "${selectedColorName}" \u063A\u064A\u0631 \u0645\u062A\u0648\u0641\u0631 \u0641\u064A \u0627\u0644\u0645\u062E\u0632\u0648\u0646.` : `La taille "${selectedSize}" en couleur "${selectedColorName}" n'est pas en stock.`,
        "error"
      );
      return;
    }
    const text = lang === "ar" ? `\u0627\u0644\u0633\u0644\u0627\u0645 \u0639\u0644\u064A\u0643\u0645 \u062F\u0627\u0631 \u0645\u0648\u062F\u0627\u0646\u0648\u0641\u0627 \u{1F44B}
\u0623\u0631\u063A\u0628 \u0641\u064A \u062A\u0623\u0643\u064A\u062F \u0637\u0644\u0628 \u0647\u0630\u0647 \u0627\u0644\u0642\u0637\u0639\u0629 \u0627\u0644\u0641\u0627\u062E\u0631\u0629 (\u0627\u0644\u062F\u0641\u0639 \u0639\u0646\u062F \u0627\u0644\u0627\u0633\u062A\u0644\u0627\u0645):

*${title}*
- \u0627\u0644\u0633\u0639\u0631: ${product.price} \u062F\u0631\u0647\u0645 \u0645\u063A\u0631\u0628\u064A
- \u0627\u0644\u0645\u0642\u0627\u0633 / \u0627\u0644\u062E\u064A\u0627\u0631: ${selectedSize || "\u0642\u064A\u0627\u0633\u064A"}
- \u0627\u0644\u0644\u0648\u0646: ${selectedColorName}
- \u0627\u0644\u0643\u0645\u064A\u0629: ${qty}

\u0627\u0644\u0631\u0627\u0628\u0637: ${currentUrl}

\u064A\u0631\u062C\u0649 \u0627\u0644\u062A\u0648\u0627\u0635\u0644 \u0645\u0639\u064A \u0644\u062A\u0623\u0643\u064A\u062F \u0645\u0648\u0639\u062F \u0627\u0644\u062A\u0648\u0635\u064A\u0644 \u0648\u0627\u0644\u0639\u0646\u0648\u0627\u0646.` : `Bonjour Maison MODANOVA \u{1F44B}
Je souhaite commander cette pi\xE8ce en paiement \xE0 la livraison (COD) :

*${title}*
- Prix : ${product.price} MAD
- Taille / Pointure / Format : ${selectedSize || "Standard"}
- Couleur : ${selectedColorName}
- Quantit\xE9 : ${qty}

Lien : ${currentUrl}

Merci de confirmer la disponibilit\xE9 et le cr\xE9neau de livraison.`;
    window.open(`https://wa.me/212600773716?text=${encodeURIComponent(text)}`, "_blank");
  };
  const related = useMemo(() => {
    const others = allProducts.filter((p) => p.id !== product.id);
    const sameCat = others.filter((p) => p.category === product.category);
    return (sameCat.length >= 3 ? sameCat : others).slice(0, 3);
  }, [allProducts, product.id, product.category]);
  return /* @__PURE__ */ React.createElement("div", { className: "w-full bg-canvas text-noir animate-fade-up" }, /* @__PURE__ */ React.createElement("div", { className: "border-b border-taupe/20 bg-card/60 backdrop-blur-xs overflow-hidden w-full" }, /* @__PURE__ */ React.createElement("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs w-full min-w-0" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2 text-taupe-dark min-w-0 max-w-full overflow-hidden flex-wrap" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: onBack,
      className: "flex items-center gap-1.5 font-semibold text-noir hover:text-caramel transition-colors shrink-0"
    },
    /* @__PURE__ */ React.createElement("span", null, t.product_back_to_collection)
  ), /* @__PURE__ */ React.createElement("span", { className: "shrink-0 text-taupe/40" }, "/"), /* @__PURE__ */ React.createElement("span", { className: "uppercase tracking-wider font-mono text-[11px] text-taupe-dark shrink-0" }, product.category), /* @__PURE__ */ React.createElement("span", { className: "shrink-0 text-taupe/40" }, "/"), /* @__PURE__ */ React.createElement("span", { className: "text-noir font-medium truncate min-w-0 max-w-[140px] sm:max-w-xs" }, title)), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2 shrink-0 self-start sm:self-auto" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: copyLink,
      className: `px-3 py-1.5 border rounded-xs flex items-center gap-1.5 font-semibold tracking-wider transition-all duration-200 shadow-xs ${copied ? "border-[#25D366] bg-[#ECFDF5] text-[#065F46]" : "border-taupe/30 hover:border-noir bg-canvas text-noir hover:bg-card"}`,
      title: "Copier le lien direct pour vos clients"
    },
    /* @__PURE__ */ React.createElement("svg", { className: "w-3.5 h-3.5 text-current", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" }, /* @__PURE__ */ React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" })),
    /* @__PURE__ */ React.createElement("span", null, copied ? "\u2713 Lien copi\xE9 !" : t.product_share_link)
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: shareWhatsApp,
      className: "px-3 py-1.5 bg-[#25D366] hover:bg-[#20ba59] text-white rounded-xs flex items-center gap-1.5 font-semibold tracking-wider transition-colors shadow-xs",
      title: "Envoyer le produit directement au client via WhatsApp"
    },
    /* @__PURE__ */ React.createElement(WhatsAppIcon, { className: "w-3.5 h-3.5 fill-white shrink-0" }),
    /* @__PURE__ */ React.createElement("span", { className: "hidden sm:inline" }, t.product_share_whatsapp),
    /* @__PURE__ */ React.createElement("span", { className: "sm:hidden" }, "WhatsApp")
  )))), /* @__PURE__ */ React.createElement("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16" }, /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start" }, /* @__PURE__ */ React.createElement("div", { className: "lg:col-span-7 flex flex-col gap-4" }, hasVideo && /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2 bg-card p-1.5 border border-taupe/25 rounded-xs" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: () => setMediaMode("photos"),
      className: `flex-1 py-2 px-3 text-xs font-bold uppercase tracking-wider rounded-2xs transition-colors flex items-center justify-center gap-2 ${mediaMode === "photos" ? "bg-noir text-white shadow-2xs" : "text-noir hover:bg-canvas"}`
    },
    /* @__PURE__ */ React.createElement("span", null, "\u{1F4F8}"),
    /* @__PURE__ */ React.createElement("span", null, lang === "ar" ? `\u0627\u0644\u0635\u0648\u0631 (${imgCount})` : `Photos (${imgCount})`)
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: () => setMediaMode("video"),
      className: `flex-1 py-2 px-3 text-xs font-bold uppercase tracking-wider rounded-2xs transition-colors flex items-center justify-center gap-2 ${mediaMode === "video" ? "bg-caramel text-white shadow-2xs" : "bg-caramel/10 text-noir hover:bg-caramel/20"}`
    },
    /* @__PURE__ */ React.createElement("span", null, "\u{1F3AC}"),
    /* @__PURE__ */ React.createElement("span", null, lang === "ar" ? "\u0645\u0634\u0627\u0647\u062F\u0629 \u0641\u064A\u062F\u064A\u0648 \u0627\u0644\u0645\u0646\u062A\u062C \u25B6" : "Vid\xE9o du Produit \u25B6")
  )), mediaMode === "video" && hasVideo ? /* @__PURE__ */ React.createElement("div", { className: "bg-[#F7F5F0] border border-taupe/20 p-3 sm:p-5 rounded-xs shadow-sm" }, /* @__PURE__ */ React.createElement(ProductVideoPlayer, { videoUrl: product.videoUrl, title, lang })) : (
    /* Hero Showcase Frame — Left/Right Slider + Touch Swipe */
    /* @__PURE__ */ React.createElement(
      "div",
      {
        className: "relative aspect-[3/4] w-full max-h-[580px] bg-[#F7F5F0] border border-taupe/20 overflow-hidden shadow-sm flex items-center justify-center p-4 sm:p-6 group select-none rounded-xs",
        onTouchStart: (e) => {
          if (e.touches && e.touches[0]) {
            prodTouchStartX.current = e.touches[0].clientX;
          }
        },
        onTouchEnd: (e) => {
          if (prodTouchStartX.current == null || !e.changedTouches || !e.changedTouches[0]) return;
          const deltaX = e.changedTouches[0].clientX - prodTouchStartX.current;
          prodTouchStartX.current = null;
          if (Math.abs(deltaX) > 35) {
            if (deltaX > 0) prevProdImage();
            else nextProdImage();
          }
        }
      },
      /* @__PURE__ */ React.createElement(
        "img",
        {
          src: imgList[activeImageIdx] || imgList[0],
          alt: title,
          className: "w-full h-full transition-all duration-300 object-contain"
        }
      ),
      imgCount > 1 && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(
        "button",
        {
          type: "button",
          onClick: prevProdImage,
          className: "absolute start-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/90 hover:bg-noir text-noir hover:text-white border border-taupe/30 shadow-md flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95",
          title: "Photo pr\xE9c\xE9dente (Glisser \xE0 gauche)",
          "aria-label": "Photo pr\xE9c\xE9dente"
        },
        /* @__PURE__ */ React.createElement("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" }, /* @__PURE__ */ React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2.2", d: "M15 19l-7-7 7-7" }))
      ), /* @__PURE__ */ React.createElement(
        "button",
        {
          type: "button",
          onClick: nextProdImage,
          className: "absolute end-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/90 hover:bg-noir text-noir hover:text-white border border-taupe/30 shadow-md flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95",
          title: "Photo suivante (Glisser \xE0 droite)",
          "aria-label": "Photo suivante"
        },
        /* @__PURE__ */ React.createElement("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" }, /* @__PURE__ */ React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2.2", d: "M9 5l7 7-7 7" }))
      ), /* @__PURE__ */ React.createElement("div", { className: "absolute bottom-3 start-3 z-20 flex items-center gap-2 bg-noir/75 backdrop-blur-xs text-white px-2.5 py-1 rounded-xs" }, /* @__PURE__ */ React.createElement("span", { className: "font-mono text-[11px] font-bold tabular-nums" }, activeImageIdx + 1, " / ", imgCount), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-1" }, imgList.map((_, dotIdx) => /* @__PURE__ */ React.createElement(
        "button",
        {
          key: dotIdx,
          type: "button",
          onClick: (e) => {
            e.stopPropagation();
            setActiveImageIdx(dotIdx);
          },
          className: `h-1.5 rounded-full transition-all ${activeImageIdx === dotIdx ? "w-4 bg-caramel" : "w-1.5 bg-white/50 hover:bg-white"}`,
          "aria-label": `Aller \xE0 la photo ${dotIdx + 1}`
        }
      ))))),
      hasVideo && /* @__PURE__ */ React.createElement(
        "button",
        {
          type: "button",
          onClick: () => setMediaMode("video"),
          className: "absolute bottom-3 end-3 z-20 px-3 py-1.5 bg-caramel hover:bg-noir text-white text-xs font-bold uppercase tracking-wider rounded-xs shadow-md flex items-center gap-1.5 transition-all"
        },
        /* @__PURE__ */ React.createElement("span", null, "\u25B6"),
        /* @__PURE__ */ React.createElement("span", null, lang === "ar" ? "\u0641\u064A\u062F\u064A\u0648 \u0627\u0644\u0645\u0646\u062A\u062C" : "Voir la Vid\xE9o")
      ),
      /* @__PURE__ */ React.createElement("div", { className: "absolute top-4 start-4 flex flex-col gap-1 z-10" }, isOut ? /* @__PURE__ */ React.createElement("span", { className: "bg-noir/90 text-white text-[11px] font-bold px-2.5 py-1 uppercase tracking-wider" }, t.badge_out) : product.badge === "exclusive" ? /* @__PURE__ */ React.createElement("span", { className: "bg-caramel text-white text-[11px] font-bold px-2.5 py-1 uppercase tracking-wider" }, t.badge_exclusive) : product.badge === "luxury" ? /* @__PURE__ */ React.createElement("span", { className: "bg-[#4A3525] text-white text-[11px] font-bold px-2.5 py-1 uppercase tracking-wider" }, t.badge_luxury) : product.isNew ? /* @__PURE__ */ React.createElement("span", { className: "bg-noir text-white text-[11px] font-bold px-2.5 py-1 uppercase tracking-wider" }, t.badge_new) : null),
      /* @__PURE__ */ React.createElement(
        "button",
        {
          type: "button",
          onClick: () => toggleWishlist(product.id),
          className: "absolute top-4 end-4 w-9 h-9 rounded-full bg-white/85 hover:bg-white flex items-center justify-center transition-all duration-200 shadow-sm hover:scale-110 active:scale-95",
          "aria-label": "Wishlist"
        },
        /* @__PURE__ */ React.createElement(
          "svg",
          {
            className: `w-4 h-4 transition-colors ${isWish ? "fill-caramel text-caramel animate-heart-pop" : "text-noir/60 hover:text-noir"}`,
            viewBox: "0 0 24 24",
            stroke: "currentColor",
            strokeWidth: "1.75"
          },
          /* @__PURE__ */ React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" })
        )
      )
    )
  ), (imgCount > 1 || hasVideo) && /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, imgCount > 1 && /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: prevProdImage,
      className: "w-8 h-24 shrink-0 bg-card hover:bg-noir text-noir hover:text-white border border-taupe/25 rounded-xs flex items-center justify-center transition-colors shadow-2xs",
      title: "Photo pr\xE9c\xE9dente",
      "aria-label": "Photo pr\xE9c\xE9dente"
    },
    "\u2039"
  ), /* @__PURE__ */ React.createElement("div", { className: "flex gap-3 overflow-x-auto pb-1 flex-1" }, imgList.map((img, i) => /* @__PURE__ */ React.createElement(
    "button",
    {
      key: i,
      type: "button",
      onClick: () => {
        setMediaMode("photos");
        setActiveImageIdx(i);
      },
      className: `w-20 h-24 sm:w-24 sm:h-28 shrink-0 border-2 overflow-hidden bg-[#F7F5F0] p-1.5 transition-all duration-200 relative rounded-xs flex items-center justify-center ${mediaMode === "photos" && activeImageIdx === i ? "border-caramel scale-102 shadow-sm ring-1 ring-caramel/30" : "border-taupe/20 opacity-70 hover:opacity-100 hover:border-noir/40"}`
    },
    /* @__PURE__ */ React.createElement("img", { src: img, alt: "", className: "w-full h-full object-contain block" })
  )), hasVideo && /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: () => setMediaMode("video"),
      className: `w-20 h-24 sm:w-24 sm:h-28 shrink-0 border-2 overflow-hidden bg-[#141210] text-white p-2 transition-all duration-200 relative rounded-xs flex flex-col items-center justify-center gap-1 ${mediaMode === "video" ? "border-caramel scale-102 shadow-sm ring-1 ring-caramel/40" : "border-taupe/30 opacity-85 hover:opacity-100 hover:border-caramel"}`,
      title: "Regarder la vid\xE9o du produit"
    },
    /* @__PURE__ */ React.createElement("span", { className: "w-8 h-8 rounded-full bg-caramel text-white flex items-center justify-center text-xs font-bold" }, "\u25B6"),
    /* @__PURE__ */ React.createElement("span", { className: "text-[10px] font-bold uppercase tracking-wider text-[#E6C687]" }, "Vid\xE9o")
  )), imgCount > 1 && /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: nextProdImage,
      className: "w-8 h-24 shrink-0 bg-card hover:bg-noir text-noir hover:text-white border border-taupe/25 rounded-xs flex items-center justify-center transition-colors shadow-2xs",
      title: "Photo suivante",
      "aria-label": "Photo suivante"
    },
    "\u203A"
  )), hasVideo && mediaMode !== "video" && /* @__PURE__ */ React.createElement("div", { className: "bg-card border border-taupe/25 p-4 rounded-xs space-y-3" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ React.createElement("span", { className: "text-xs font-bold uppercase tracking-wider text-noir flex items-center gap-1.5" }, /* @__PURE__ */ React.createElement("span", null, "\u{1F3AC}"), /* @__PURE__ */ React.createElement("span", null, lang === "ar" ? "\u0641\u064A\u062F\u064A\u0648 \u0627\u0644\u0645\u0646\u062A\u062C" : "Vid\xE9o de Pr\xE9sentation")), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: () => setMediaMode("video"),
      className: "text-[11px] font-semibold text-caramel hover:underline"
    },
    lang === "ar" ? "\u062A\u0643\u0628\u064A\u0631 \u0627\u0644\u0641\u064A\u062F\u064A\u0648 \u2191" : "Afficher en grand \u2191"
  )), /* @__PURE__ */ React.createElement(ProductVideoPlayer, { videoUrl: product.videoUrl, title, lang })), /* @__PURE__ */ React.createElement("div", { className: "mt-2 p-3 bg-card border border-taupe/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs max-w-full overflow-hidden" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2 min-w-0 max-w-full overflow-hidden" }, /* @__PURE__ */ React.createElement("span", { className: "font-semibold text-noir shrink-0" }, "\u{1F517} Lien direct :"), /* @__PURE__ */ React.createElement("span", { className: "font-mono text-[11px] truncate min-w-0 select-all text-taupe-dark block" }, currentUrl)), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: copyLink,
      className: "shrink-0 self-start sm:self-auto px-3 py-1 bg-noir text-white hover:bg-caramel text-[11px] font-semibold uppercase tracking-wider transition-colors"
    },
    copied ? "\u2713 Copi\xE9" : "Copier"
  ))), /* @__PURE__ */ React.createElement("div", { className: "lg:col-span-5 flex flex-col" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between text-xs text-taupe-dark uppercase tracking-widest mb-3" }, /* @__PURE__ */ React.createElement("span", { className: "font-semibold text-caramel uppercase" }, product.category), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-1 text-caramel font-semibold" }, /* @__PURE__ */ React.createElement("span", null, "\u2605 ", product.rating || 5, ".0"), /* @__PURE__ */ React.createElement("span", { className: "text-taupe text-[10px] lowercase font-normal" }, "(avis v\xE9rifi\xE9s)"))), /* @__PURE__ */ React.createElement("h1", { className: "font-serif italic text-3xl sm:text-4xl lg:text-5xl font-normal text-noir mb-4 leading-tight" }, title), /* @__PURE__ */ React.createElement("div", { className: "flex items-baseline gap-3 mb-6 pb-4 border-b border-taupe/20" }, /* @__PURE__ */ React.createElement("span", { className: "text-2xl sm:text-3xl font-bold text-noir tabular-nums" }, Number(product.price).toLocaleString(), " MAD"), product.oldPrice && /* @__PURE__ */ React.createElement("span", { className: "text-sm sm:text-base text-taupe line-through tabular-nums" }, Number(product.oldPrice).toLocaleString(), " MAD"), product.oldPrice && /* @__PURE__ */ React.createElement("span", { className: "text-[11px] font-bold text-white bg-caramel px-2 py-0.5 rounded-xs" }, "-", Math.round((product.oldPrice - product.price) / product.oldPrice * 100), "%")), /* @__PURE__ */ React.createElement("div", { className: "p-3.5 bg-[#FAF7F2] border border-[#C28B53]/30 rounded-xs mb-6" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2 text-xs font-semibold text-noir mb-1" }, /* @__PURE__ */ React.createElement("span", { className: "text-[#C28B53] animate-pulse" }, "\u26A1"), /* @__PURE__ */ React.createElement("span", null, "Commandez dans les prochaines ", /* @__PURE__ */ React.createElement("strong", { className: "text-[#C28B53] font-mono" }, String(countdown.hours).padStart(2, "0"), "h ", String(countdown.mins).padStart(2, "0"), "m"), " pour une exp\xE9dition le jour m\xEAme !")), /* @__PURE__ */ React.createElement("div", { className: "text-[11px] text-taupe-dark flex items-center gap-1.5" }, /* @__PURE__ */ React.createElement("span", null, "\u{1F69A}"), /* @__PURE__ */ React.createElement("span", null, "Livraison express \xE0 domicile partout au Maroc \xB7 Paiement apr\xE8s ouverture & v\xE9rification (COD)."))), /* @__PURE__ */ React.createElement("div", { className: "mb-6" }, isProductCompletelyOut ? /* @__PURE__ */ React.createElement("div", { className: "p-3 bg-red-50 border border-red-300 rounded-xs flex items-center gap-2 text-xs font-bold text-[#B91C1C]" }, /* @__PURE__ */ React.createElement("span", { className: "w-2.5 h-2.5 rounded-full bg-[#B91C1C] shrink-0" }), /* @__PURE__ */ React.createElement("span", null, t.out_of_stock)) : isOut ? /* @__PURE__ */ React.createElement("div", { className: "p-3.5 bg-red-50 border border-red-300 rounded-xs text-xs font-semibold text-[#991B1B] space-y-1" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2 font-bold" }, /* @__PURE__ */ React.createElement("span", null, "\u26A0\uFE0F"), /* @__PURE__ */ React.createElement("span", null, lang === "ar" ? `\u0627\u0644\u0645\u0642\u0627\u0633 "${selectedSize || "\u0642\u064A\u0627\u0633\u064A"}" \u0628\u0627\u0644\u0644\u0648\u0646 "${selectedColorName}" \u063A\u064A\u0631 \u0645\u062A\u0648\u0641\u0631 \u0641\u064A \u0627\u0644\u0645\u062E\u0632\u0648\u0646 \u062D\u0627\u0644\u064A\u0627\u064B.` : `Cette taille (${selectedSize || "Unique"}) en couleur ${selectedColorName} n'est pas en stock (\xE9puis\xE9e).`)), /* @__PURE__ */ React.createElement("p", { className: "text-[11px] text-[#B91C1C] font-normal" }, lang === "ar" ? "\u064A\u0631\u062C\u0649 \u0627\u062E\u062A\u064A\u0627\u0631 \u0645\u0642\u0627\u0633 \u0622\u062E\u0631 \u0623\u0648 \u0644\u0648\u0646 \u0622\u062E\u0631 \u0645\u062A\u0648\u0641\u0631 \u0644\u0625\u062A\u0645\u0627\u0645 \u0627\u0644\u0637\u0644\u0628." : "Veuillez s\xE9lectionner une autre taille/pointure ou une autre couleur disponible ci-dessous.")) : isLow ? /* @__PURE__ */ React.createElement("div", { className: "p-3 bg-[#FFFBEB] border border-[#F59E0B]/40 rounded-xs inline-flex items-center gap-2 text-xs font-semibold text-[#B91C1C] animate-flame" }, /* @__PURE__ */ React.createElement("span", null, "\u{1F525}"), /* @__PURE__ */ React.createElement("span", null, lang === "ar" ? `\u0628\u0642\u064A \u0641\u0642\u0637 ${selectedVariantStock} \u0641\u064A \u0627\u0644\u0645\u062E\u0632\u0648\u0646 \u0644\u0644\u0645\u0642\u0627\u0633 ${selectedSize || "\u0642\u064A\u0627\u0633\u064A"} \u2014 \u0627\u0644\u0644\u0648\u0646 ${selectedColorName}!` : `Plus que ${selectedVariantStock} en stock pour la taille ${selectedSize || "Unique"} (Couleur : ${selectedColorName}) !`)) : /* @__PURE__ */ React.createElement("div", { className: "inline-flex items-center gap-2 text-xs font-semibold text-[#065F46] bg-[#ECFDF5] border border-[#A7F3D0] px-3 py-1.5 rounded-xs" }, /* @__PURE__ */ React.createElement("span", { className: "w-2 h-2 rounded-full bg-[#25D366]" }), /* @__PURE__ */ React.createElement("span", null, lang === "ar" ? `\u0645\u062A\u0648\u0641\u0631 \u0641\u064A \u0627\u0644\u0645\u062E\u0632\u0648\u0646 (${selectedVariantStock} \u0642\u0637\u0639 \u2014 \u0645\u0642\u0627\u0633 ${selectedSize || "\u0642\u064A\u0627\u0633\u064A"} / \u0644\u0648\u0646 ${selectedColorName})` : `En stock (${selectedVariantStock} disponible${selectedVariantStock > 1 ? "s" : ""} \u2014 Taille ${selectedSize || "Unique"} \xB7 Couleur ${selectedColorName})`))), /* @__PURE__ */ React.createElement("p", { className: "text-xs sm:text-sm text-taupe-dark leading-relaxed mb-6 font-light" }, desc), product.sizes && product.sizes.length > 0 && /* @__PURE__ */ React.createElement("div", { className: "mb-5" }, /* @__PURE__ */ React.createElement("div", { className: "flex justify-between items-center mb-2" }, /* @__PURE__ */ React.createElement("label", { className: "text-xs font-bold uppercase tracking-wider text-noir" }, t.options_size, " : ", /* @__PURE__ */ React.createElement("span", { className: "text-caramel font-mono" }, selectedSize)), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: () => setSizeGuideOpen(true),
      className: "text-[11px] text-caramel hover:underline font-semibold flex items-center gap-1"
    },
    /* @__PURE__ */ React.createElement("span", null, "\u{1F4CF} Guide des Tailles")
  ))), /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap gap-2" }, product.sizes.map((size) => {
    const stockForThisSizeAndColor = getProductVariantStock(product, size, selectedColor);
    const isThisSizeOutForColor = stockForThisSizeAndColor <= 0;
    const isSelected = selectedSize === size;
    return /* @__PURE__ */ React.createElement(
      "button",
      {
        key: size,
        type: "button",
        onClick: () => setSelectedSize(size),
        className: `min-w-12 px-3.5 py-2 text-xs font-semibold border transition-all duration-200 flex items-center gap-1.5 ${isSelected ? isThisSizeOutForColor ? "border-[#B91C1C] bg-[#FEE2E2] text-[#991B1B] shadow-xs" : "border-noir bg-noir text-white shadow-xs" : isThisSizeOutForColor ? "border-taupe/25 bg-card/50 text-taupe line-through opacity-75 hover:border-[#B91C1C]" : "border-taupe/30 hover:border-noir text-noir bg-canvas"}`,
        title: isThisSizeOutForColor ? `${size} (${selectedColorName}) : \xC9puis\xE9 (0 en stock)` : `${size} (${selectedColorName}) : ${stockForThisSizeAndColor} en stock`
      },
      /* @__PURE__ */ React.createElement("span", null, size),
      hasVariantStockMatrix(product) && /* @__PURE__ */ React.createElement("span", { className: `text-[10px] font-mono px-1 rounded-2xs ${isThisSizeOutForColor ? "bg-red-100 text-red-700 no-underline" : isSelected ? "bg-white/20 text-white" : "bg-card text-taupe-dark"}` }, isThisSizeOutForColor ? lang === "ar" ? "\u0646\u0641\u0630" : "\xC9puis\xE9" : stockForThisSizeAndColor)
    );
  }))), product.colors && product.colors.length > 0 && /* @__PURE__ */ React.createElement("div", { className: "mb-6" }, /* @__PURE__ */ React.createElement("div", { className: "flex justify-between items-center mb-2" }, /* @__PURE__ */ React.createElement("label", { className: "text-xs font-bold uppercase tracking-wider text-noir" }, t.options_color, " : ", /* @__PURE__ */ React.createElement("span", { className: "text-caramel" }, selectedColorName))), /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap gap-2.5" }, product.colors.map((color) => {
    const cLabel = getColorLabel(color, lang);
    const cHex = getColorCss(color);
    const stockForColorAndSelectedSize = getProductVariantStock(product, selectedSize, color);
    const isColorOutForSize = stockForColorAndSelectedSize <= 0;
    const isSelected = selectedColor === color;
    return /* @__PURE__ */ React.createElement(
      "button",
      {
        key: color,
        type: "button",
        onClick: () => setSelectedColor(color),
        className: `px-3 py-1.5 rounded-xs border text-xs font-semibold flex items-center gap-2 transition-all duration-200 ${isSelected ? isColorOutForSize ? "border-2 border-[#B91C1C] bg-[#FEE2E2]/60 text-[#991B1B] shadow-xs" : "border-2 border-caramel bg-white text-noir shadow-sm ring-2 ring-caramel/20" : isColorOutForSize ? "border-taupe/25 bg-card/50 text-taupe opacity-70 hover:border-[#B91C1C]" : "border-taupe/30 bg-white hover:border-noir text-noir"}`,
        title: isColorOutForSize ? `${cLabel} (Taille ${selectedSize}) : \xC9puis\xE9 (0 en stock)` : `${cLabel} (Taille ${selectedSize}) : ${stockForColorAndSelectedSize} en stock`
      },
      /* @__PURE__ */ React.createElement(
        "span",
        {
          className: "w-4 h-4 rounded-full border border-black/25 shrink-0 relative inline-block",
          style: { backgroundColor: cHex }
        }
      ),
      /* @__PURE__ */ React.createElement("span", { className: isColorOutForSize ? "line-through" : "" }, cLabel),
      hasVariantStockMatrix(product) && /* @__PURE__ */ React.createElement("span", { className: `text-[10px] font-mono ${isColorOutForSize ? "text-red-600 font-bold" : "text-taupe-dark"}` }, "(", isColorOutForSize ? "0" : stockForColorAndSelectedSize, ")")
    );
  }))), /* @__PURE__ */ React.createElement("div", { className: "space-y-3 pt-4 border-t border-taupe/20" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center border border-taupe/30 bg-card" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: () => setQty((q) => Math.max(1, q - 1)),
      className: "px-3.5 py-3 text-xs hover:bg-taupe/20 transition-colors",
      disabled: isOut || qty <= 1
    },
    "-"
  ), /* @__PURE__ */ React.createElement("span", { className: "px-4 py-3 text-xs font-semibold tabular-nums min-w-10 text-center" }, isOut ? 0 : qty), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: () => {
        if (qty >= selectedVariantStock) {
          showToast(
            lang === "ar" ? `\u0627\u0644\u062D\u062F \u0627\u0644\u0623\u0642\u0635\u0649 \u0627\u0644\u0645\u062A\u0648\u0641\u0631 \u0644\u0644\u0645\u0642\u0627\u0633 ${selectedSize} (${selectedColorName}) \u0647\u0648 ${selectedVariantStock}.` : `Stock maximum atteint : seulement ${selectedVariantStock} disponible(s) pour la taille ${selectedSize} en couleur ${selectedColorName}.`,
            "warning"
          );
          return;
        }
        setQty((q) => Math.min(selectedVariantStock, q + 1));
      },
      className: "px-3.5 py-3 text-xs hover:bg-taupe/20 transition-colors",
      disabled: isOut || qty >= selectedVariantStock
    },
    "+"
  )), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      disabled: isOut,
      onClick: () => onAddToCart(product, selectedSize, selectedColor, qty),
      className: `flex-1 py-3.5 px-4 text-xs font-semibold uppercase tracking-[0.15em] transition-all duration-200 shadow-sm ${isOut ? "bg-red-100 text-[#991B1B] border border-red-300 cursor-not-allowed" : "bg-noir text-white hover:bg-caramel active:scale-98"}`
    },
    isOut ? lang === "ar" ? `\u063A\u064A\u0631 \u0645\u062A\u0648\u0641\u0631 (${selectedSize} - ${selectedColorName})` : `Rupture (${selectedSize} \xB7 ${selectedColorName})` : t.add_to_cart
  )), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      disabled: isOut,
      onClick: handleDirectOrder,
      className: `w-full py-3.5 px-4 text-xs font-semibold uppercase tracking-[0.18em] transition-all duration-200 shadow-md ${isOut ? "bg-taupe/20 text-taupe-dark cursor-not-allowed" : "bg-caramel text-white hover:bg-noir active:scale-98"}`
    },
    isOut ? lang === "ar" ? `\u0646\u0641\u0630\u062A \u0627\u0644\u0643\u0645\u064A\u0629 \u0644\u0647\u0630\u0647 Taille \u0648\u0627\u0644\u0644\u0648\u0646` : `Cette taille (${selectedSize}) en couleur ${selectedColorName} n'est pas en stock` : t.product_buy_now_cod
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      disabled: isOut,
      onClick: orderViaWhatsApp,
      className: `w-full py-3.5 px-4 text-xs font-bold uppercase tracking-[0.14em] transition-all duration-200 shadow-md flex items-center justify-center gap-2 rounded-xs ${isOut ? "bg-taupe/25 text-taupe-dark cursor-not-allowed" : "bg-[#25D366] hover:bg-[#20ba59] text-white active:scale-98"}`
    },
    /* @__PURE__ */ React.createElement(WhatsAppIcon, { className: "w-5 h-5 fill-current shrink-0" }),
    /* @__PURE__ */ React.createElement("span", null, "Commander directement par WhatsApp")
  )), /* @__PURE__ */ React.createElement("div", { className: "mt-8 pt-6 border-t border-taupe/20 space-y-3 text-xs text-taupe-dark" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3" }, /* @__PURE__ */ React.createElement("span", { className: "text-base" }, "\u{1F69A}"), /* @__PURE__ */ React.createElement("span", null, t.product_delivery_guarantee)), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3" }, /* @__PURE__ */ React.createElement("span", { className: "text-base" }, "\u{1F4B5}"), /* @__PURE__ */ React.createElement("span", null, t.product_cod_guarantee)), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3" }, /* @__PURE__ */ React.createElement("span", { className: "text-base" }, "\u{1F504}"), /* @__PURE__ */ React.createElement("span", null, t.product_exchange_guarantee)))))), /* @__PURE__ */ React.createElement("div", { className: "lg:hidden fixed bottom-0 start-0 end-0 z-30 bg-white/95 backdrop-blur-md border-t border-taupe/25 px-4 py-2.5 shadow-2xl flex items-center justify-between gap-3 animate-slide-up" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2.5 min-w-0" }, /* @__PURE__ */ React.createElement("div", { className: "w-11 h-11 shrink-0 bg-[#F7F5F0] border border-taupe/20 rounded-xs overflow-hidden flex items-center justify-center p-1" }, /* @__PURE__ */ React.createElement("img", { src: product.images && product.images[0] || "", alt: "", className: "w-full h-full object-contain" })), /* @__PURE__ */ React.createElement("div", { className: "min-w-0" }, /* @__PURE__ */ React.createElement("div", { className: "text-xs font-bold text-noir truncate" }, title), /* @__PURE__ */ React.createElement("div", { className: "text-xs font-bold text-caramel" }, Number(product.price).toLocaleString(), " MAD"))), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2 shrink-0" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: orderViaWhatsApp,
      className: "p-2.5 bg-[#25D366] text-white rounded-xs flex items-center justify-center shadow-xs",
      "aria-label": "Commander via WhatsApp"
    },
    /* @__PURE__ */ React.createElement(WhatsAppIcon, { className: "w-4 h-4 fill-white" })
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      disabled: isOut,
      onClick: handleDirectOrder,
      className: "px-4 py-2.5 bg-noir hover:bg-caramel text-white text-xs font-bold uppercase tracking-wider rounded-xs transition-colors shadow-xs"
    },
    isOut ? t.out_of_stock : "Commander"
  ))), sizeGuideOpen && /* @__PURE__ */ React.createElement("div", { className: "fixed inset-0 z-[140] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-modal-pop" }, /* @__PURE__ */ React.createElement("div", { className: "bg-canvas border border-taupe/30 max-w-lg w-full p-6 shadow-2xl relative rounded-xs" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between pb-3 border-b border-taupe/20 mb-4" }, /* @__PURE__ */ React.createElement("h3", { className: "font-serif text-xl font-bold text-noir" }, "Guide des Tailles \u2014 MODANOVA"), /* @__PURE__ */ React.createElement("button", { type: "button", onClick: () => setSizeGuideOpen(false), className: "text-noir/60 hover:text-noir text-lg" }, "\u2715")), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-taupe-dark mb-4" }, "Toutes nos cr\xE9ations sont taill\xE9es selon les normes europ\xE9ennes et marocaines artisanales avec une coupe pr\xE9cise et confortable."), /* @__PURE__ */ React.createElement("table", { className: "w-full text-xs text-left border-collapse border border-taupe/25 mb-4" }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", { className: "bg-card font-bold text-noir" }, /* @__PURE__ */ React.createElement("th", { className: "p-2.5 border border-taupe/20" }, "Pointure / Taille"), /* @__PURE__ */ React.createElement("th", { className: "p-2.5 border border-taupe/20" }, "Maroc / UE"), /* @__PURE__ */ React.createElement("th", { className: "p-2.5 border border-taupe/20" }, "Longueur (cm)"))), /* @__PURE__ */ React.createElement("tbody", { className: "divide-y divide-taupe/15 text-taupe-dark" }, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("td", { className: "p-2 border border-taupe/20 font-semibold text-noir" }, "40"), /* @__PURE__ */ React.createElement("td", { className: "p-2 border border-taupe/20" }, "40"), /* @__PURE__ */ React.createElement("td", { className: "p-2 border border-taupe/20" }, "25.5 cm")), /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("td", { className: "p-2 border border-taupe/20 font-semibold text-noir" }, "41"), /* @__PURE__ */ React.createElement("td", { className: "p-2 border border-taupe/20" }, "41"), /* @__PURE__ */ React.createElement("td", { className: "p-2 border border-taupe/20" }, "26.2 cm")), /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("td", { className: "p-2 border border-taupe/20 font-semibold text-noir" }, "42"), /* @__PURE__ */ React.createElement("td", { className: "p-2 border border-taupe/20" }, "42"), /* @__PURE__ */ React.createElement("td", { className: "p-2 border border-taupe/20" }, "27.0 cm")), /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("td", { className: "p-2 border border-taupe/20 font-semibold text-noir" }, "43"), /* @__PURE__ */ React.createElement("td", { className: "p-2 border border-taupe/20" }, "43"), /* @__PURE__ */ React.createElement("td", { className: "p-2 border border-taupe/20" }, "27.7 cm")), /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("td", { className: "p-2 border border-taupe/20 font-semibold text-noir" }, "44"), /* @__PURE__ */ React.createElement("td", { className: "p-2 border border-taupe/20" }, "44"), /* @__PURE__ */ React.createElement("td", { className: "p-2 border border-taupe/20" }, "28.5 cm")), /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("td", { className: "p-2 border border-taupe/20 font-semibold text-noir" }, "45"), /* @__PURE__ */ React.createElement("td", { className: "p-2 border border-taupe/20" }, "45"), /* @__PURE__ */ React.createElement("td", { className: "p-2 border border-taupe/20" }, "29.2 cm")))), /* @__PURE__ */ React.createElement("div", { className: "p-3 bg-card/60 text-[11px] text-taupe-dark border border-taupe/20 rounded-xs flex items-center justify-between" }, /* @__PURE__ */ React.createElement("span", null, "\u{1F4A1} En cas de doute entre deux pointures, nous vous conseillons de choisir la pointure au-dessus. \xC9change gratuit sous 7 jours partout au Maroc.")))), related.length > 0 && /* @__PURE__ */ React.createElement("section", { className: "border-t border-taupe/20 bg-card/40 py-12 sm:py-16" }, /* @__PURE__ */ React.createElement("div", { className: "max-w-7xl mx-auto px-3 sm:px-6 lg:px-8" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between mb-6 sm:mb-8" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { className: "text-xs font-bold tracking-[0.2em] uppercase text-caramel block mb-1" }, "MODANOVA MEN'S ESSENTIALS"), /* @__PURE__ */ React.createElement("h2", { className: "font-serif italic text-2xl sm:text-3xl text-noir font-normal" }, t.product_related_title)), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: onBack,
      className: "text-xs font-semibold text-caramel hover:underline uppercase tracking-wider"
    },
    "Voir toute la collection \u2192"
  )), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6" }, related.map((p) => {
    const relTitle = lang === "ar" ? p.nameAr || p.nameFr : p.nameFr;
    return /* @__PURE__ */ React.createElement(
      "div",
      {
        key: p.id,
        onClick: () => onSelectProduct(p.id),
        className: "group cursor-pointer bg-card border border-taupe/20 p-2.5 sm:p-4 transition-all duration-300 hover:border-taupe/50 hover:shadow-md hover:-translate-y-1 flex flex-col"
      },
      /* @__PURE__ */ React.createElement("div", { className: "relative aspect-[3/4] w-full bg-[#F7F5F0] overflow-hidden mb-2.5 sm:mb-3 rounded-xs p-2 sm:p-3 flex items-center justify-center" }, /* @__PURE__ */ React.createElement(
        "img",
        {
          src: p.images && p.images[0],
          alt: relTitle,
          className: "w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
        }
      ), p.videoUrl && /* @__PURE__ */ React.createElement("span", { className: "absolute bottom-2 start-2 bg-noir/85 text-[#E6C687] text-[9px] font-bold px-1.5 py-0.5 rounded-2xs flex items-center gap-1" }, /* @__PURE__ */ React.createElement("span", null, "\u25B6"), /* @__PURE__ */ React.createElement("span", null, "Vid\xE9o"))),
      /* @__PURE__ */ React.createElement("div", { className: "text-[9px] sm:text-[10px] text-taupe-dark uppercase tracking-wider mb-1 truncate" }, p.category),
      /* @__PURE__ */ React.createElement("h3", { className: "font-serif text-sm sm:text-lg font-semibold text-noir mb-2 group-hover:text-caramel transition-colors line-clamp-1" }, relTitle),
      /* @__PURE__ */ React.createElement("div", { className: "flex items-baseline justify-between pt-2 border-t border-taupe/15 mt-auto" }, /* @__PURE__ */ React.createElement("span", { className: "font-semibold text-xs sm:text-sm text-noir tabular-nums" }, Number(p.price).toLocaleString(), " MAD"), /* @__PURE__ */ React.createElement("span", { className: "text-[10px] sm:text-xs text-caramel font-semibold" }, "Voir \u2192"))
    );
  })))));
}
function App() {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem("modanova_lang") || localStorage.getItem("ettore_lang") || "fr";
  });
  useEffect(() => {
    localStorage.setItem("modanova_lang", lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);
  const t = I18N[lang] || I18N.fr;
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [orders, setOrders] = useState([]);
  const [cms, setCms] = useState({
    topBanner: "Livraison express offerte sur toutes vos commandes au Maroc \xB7 Paiement \xE0 la livraison (COD)",
    brandName: "MODANOVA",
    brandTagline: "MEN'S ESSENTIALS \xB7 MAROC",
    storyBadge: "Atelier & Savoir-Faire d'Exception",
    storyTitle: "L'Alliance de la Tradition et du Luxe Contemporain",
    storyText1: "Pens\xE9e pour l'homme contemporain au Maroc qui exige l'excellence, MODANOVA allie noblesse des coupes, mati\xE8res d'\xE9lite et confection soign\xE9e. Chaque pi\xE8ce incarne un \xE9quilibre rare entre force architecturale et confort supr\xEAme.",
    storyText2: "De nos ateliers partenaires jusqu'\xE0 votre vestiaire, nous c\xE9l\xE9brons le raffinement absolu et l'art de vivre sans compromis.",
    storyImage: "/images/hero-1-leather.jpg",
    conciergeCity: "Kenitra, Maroc",
    conciergeAddress: "Atelier & Support : Kenitra, Maroc",
    supportPhone: "+212 6 00 00 00 00",
    whatsappNumber: "+212 6 00 00 00 00",
    guaranteeShipping: "Livraison Express 24/48h partout au Maroc avec suivi personnalis\xE9.",
    guaranteeCod: "Paiement \xE0 la livraison apr\xE8s v\xE9rification de votre commande.",
    guaranteeQuality: "Garantie satisfaction et confection d'exception."
  });
  const [testimonials, setTestimonials] = useState([
    {
      id: 1,
      name: "Karim Bennani",
      city: "Casablanca",
      rating: 5,
      text: "Qualit\xE9 exceptionnelle ! La veste est impeccable, finitions tr\xE8s soign\xE9es et livraison re\xE7ue le lendemain \xE0 Casablanca. Paiement \xE0 la livraison tr\xE8s pratique.",
      verified: true,
      date: "2025-01-14"
    },
    {
      id: 2,
      name: "Mehdi Tazi",
      city: "Rabat",
      rating: 5,
      text: "MODANOVA est devenue ma marque de r\xE9f\xE9rence. Coupe moderne, tissus r\xE9sistants et service client via WhatsApp ultra r\xE9actif. Je recommande \xE0 100%.",
      verified: true,
      date: "2025-01-18"
    },
    {
      id: 3,
      name: "Yassine El Amrani",
      city: "Marrakech",
      rating: 5,
      text: "Tr\xE8s satisfait de ma commande. Les chaussures sont super confortables et la confection est de haut standing. Bravo pour ce niveau de qualit\xE9 au Maroc.",
      verified: true,
      date: "2025-01-22"
    }
  ]);
  const fetchCms = useCallback(async () => {
    try {
      const res = await fetch("/api/cms");
      if (res.ok) {
        const data = await res.json();
        if (data && typeof data === "object") {
          setCms((prev) => ({ ...prev, ...data }));
        }
      }
    } catch {
    }
  }, []);
  const fetchTestimonials = useCallback(async () => {
    try {
      const res = await fetch("/api/testimonials");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setTestimonials(data);
        }
      }
    } catch {
    }
  }, []);
  useEffect(() => {
    fetchCms();
    fetchTestimonials();
  }, [fetchCms, fetchTestimonials]);
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem("modanova_cart") || localStorage.getItem("ettore_cart");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn("Erreur lecture panier localStorage:", e);
    }
    return [];
  });
  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem("modanova_wishlist") || localStorage.getItem("ettore_wishlist");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      return [];
    }
    return [];
  });
  const [appliedPromo, setAppliedPromo] = useState(() => {
    return localStorage.getItem("modanova_promo") || localStorage.getItem("ettore_promo") || "";
  });
  useEffect(() => {
    try {
      localStorage.setItem("modanova_cart", JSON.stringify(cart));
      localStorage.setItem("modanova_cart_saved_at", (/* @__PURE__ */ new Date()).toISOString());
    } catch (e) {
      console.warn("Erreur sauvegarde panier localStorage:", e);
    }
  }, [cart]);
  useEffect(() => {
    const handleStorageSync = (e) => {
      if (e.key === "modanova_cart" || e.key === "ettore_cart") {
        try {
          const updated = JSON.parse(e.newValue || "[]");
          if (Array.isArray(updated)) {
            setCart(updated);
          }
        } catch {
        }
      }
    };
    window.addEventListener("storage", handleStorageSync);
    return () => window.removeEventListener("storage", handleStorageSync);
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem("modanova_wishlist", JSON.stringify(wishlist));
    } catch {
    }
  }, [wishlist]);
  useEffect(() => {
    if (appliedPromo) {
      localStorage.setItem("modanova_promo", appliedPromo);
    } else {
      localStorage.removeItem("modanova_promo");
    }
  }, [appliedPromo]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSizeFilter, setSelectedSizeFilter] = useState("all");
  const [selectedColorFilter, setSelectedColorFilter] = useState("all");
  const [priceRangeFilter, setPriceRangeFilter] = useState("all");
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [onlyWithVideo, setOnlyWithVideo] = useState(false);
  const [sortOrder, setSortOrder] = useState("default");
  const [gridCols, setGridCols] = useState(3);
  const [catalogPage, setCatalogPage] = useState(1);
  const CATALOG_PER_PAGE = 10;
  const [cardImageIdxMap, setCardImageIdxMap] = useState({});
  const cardTouchStartX = useRef({});
  const quickViewTouchStartX = useRef(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [badgePulsing, setBadgePulsing] = useState(false);
  const [lastAddedLineKey, setLastAddedLineKey] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [quickViewImageIdx, setQuickViewImageIdx] = useState(0);
  const [quickViewSize, setQuickViewSize] = useState("");
  const [quickViewColor, setQuickViewColor] = useState("");
  const getProductIdentifierFromURL = () => {
    try {
      const pathMatch = window.location.pathname.match(/\/(?:produit|product)\/([^/?#]+)/i);
      if (pathMatch && pathMatch[1]) {
        const slugStr = decodeURIComponent(pathMatch[1]);
        const idMatch = slugStr.match(/-(\d+)$/);
        if (idMatch) return parseInt(idMatch[1], 10);
        if (/^\d+$/.test(slugStr)) return parseInt(slugStr, 10);
        return slugStr;
      }
      const params = new URLSearchParams(window.location.search);
      const p = params.get("produit") || params.get("product");
      if (p) {
        const idMatch = p.match(/-(\d+)$/);
        if (idMatch) return parseInt(idMatch[1], 10);
        if (/^\d+$/.test(p)) return parseInt(p, 10);
        return p;
      }
      const hashMatch = window.location.hash.match(/(?:produit|product)[-=/]([^/?#]+)/i);
      if (hashMatch && hashMatch[1]) {
        const idMatch = hashMatch[1].match(/-(\d+)$/);
        if (idMatch) return parseInt(idMatch[1], 10);
        if (/^\d+$/.test(hashMatch[1])) return parseInt(hashMatch[1], 10);
        return hashMatch[1];
      }
    } catch (e) {
    }
    return null;
  };
  const checkIsProductsPageURL = () => {
    try {
      const p = (window.location.pathname || "").toLowerCase().replace(/\/+$/, "");
      const h = (window.location.hash || "").toLowerCase();
      const params = new URLSearchParams(window.location.search);
      const pageParam = (params.get("page") || "").toLowerCase();
      if (p === "/produits" || p === "/catalogue" || p === "/products") return true;
      if (pageParam === "produits" || pageParam === "catalogue" || pageParam === "products") return true;
      if (h === "#produits" || h === "#catalogue" || h === "#/produits") return true;
      return false;
    } catch (e) {
      return false;
    }
  };
  const checkIsAdminURL = () => {
    try {
      const p = (window.location.pathname || "").toLowerCase();
      const h = (window.location.hash || "").toLowerCase();
      const s = (window.location.search || "").toLowerCase();
      return p.startsWith("/admin") || p === "/admin" || h.includes("admin") || s.includes("admin");
    } catch (e) {
      return false;
    }
  };
  const [selectedProductIdentifier, setSelectedProductIdentifier] = useState(() => getProductIdentifierFromURL());
  const [isProductsPage, setIsProductsPage] = useState(() => checkIsProductsPageURL());
  const [directCheckoutItem, setDirectCheckoutItem] = useState(null);
  const navigateToProduct = useCallback((target) => {
    if (!target) return;
    const prod = typeof target === "object" ? target : products.find((p) => p.id === Number(target));
    const prodId = prod ? prod.id : Number(target);
    setSelectedProductIdentifier(prodId);
    const slug = prod ? getProductSlug(prod) : `produit-${prodId}`;
    const targetUrl = `/produit/${slug}`;
    try {
      window.history.pushState({ productId: prodId, slug }, "", targetUrl);
    } catch (e) {
      window.history.pushState({ productId: prodId }, "", `?produit=${slug}`);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [products]);
  const navigateToProductsPage = useCallback((initialCategory = null) => {
    setSelectedProductIdentifier(null);
    setIsProductsPage(true);
    setCatalogPage(1);
    if (initialCategory && typeof initialCategory === "string") {
      setSelectedCategory(initialCategory);
    }
    try {
      window.history.pushState({ page: "produits" }, "", "/produits");
    } catch (e) {
      window.history.pushState({ page: "produits" }, "", "?page=produits");
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);
  const backToHome = useCallback(() => {
    setSelectedProductIdentifier(null);
    setIsProductsPage(false);
    setCatalogPage(1);
    try {
      window.history.pushState({}, "", "/");
    } catch (e) {
      window.history.pushState({}, "", window.location.pathname || "/");
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);
  useEffect(() => {
    const handleUrlChange = () => {
      const id = getProductIdentifierFromURL();
      setSelectedProductIdentifier(id);
      setIsProductsPage(checkIsProductsPageURL());
      if (checkIsAdminURL()) {
        setAdminOpen(true);
      }
    };
    window.addEventListener("popstate", handleUrlChange);
    window.addEventListener("hashchange", handleUrlChange);
    return () => {
      window.removeEventListener("popstate", handleUrlChange);
      window.removeEventListener("hashchange", handleUrlChange);
    };
  }, []);
  const selectedProduct = useMemo(() => {
    if (!selectedProductIdentifier) return null;
    if (typeof selectedProductIdentifier === "number") {
      return products.find((p) => p.id === selectedProductIdentifier) || null;
    }
    const raw = String(selectedProductIdentifier).toLowerCase();
    return products.find((p) => {
      if (String(p.id) === raw) return true;
      if (getProductSlug(p).toLowerCase() === raw) return true;
      if (slugify(p.nameFr).toLowerCase() === raw) return true;
      return false;
    }) || null;
  }, [selectedProductIdentifier, products]);
  const selectedProductId = selectedProduct ? selectedProduct.id : null;
  useEffect(() => {
    if (selectedProduct) {
      const prodName = lang === "ar" ? selectedProduct.nameAr || selectedProduct.nameFr : selectedProduct.nameFr;
      document.title = `${prodName} | ${t.brand} \u2014 Men's Essentials`;
    } else if (isProductsPage) {
      document.title = `${lang === "ar" ? "\u062C\u0645\u064A\u0639 \u0627\u0644\u0645\u0646\u062A\u062C\u0627\u062A \u0648\u0627\u0644\u0641\u0644\u062A\u0631\u0629" : "Tous les Produits & Filtres"} | ${t.brand} \u2014 Men's Essentials`;
    } else {
      document.title = `${t.brand} \u2014 Men's Essentials | Luxe Minimaliste Maroc`;
    }
  }, [selectedProduct, isProductsPage, lang, t]);
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  const [heroSlide, setHeroSlide] = useState(0);
  const [isHeroPaused, setIsHeroPaused] = useState(false);
  const [customHeroSlides, setCustomHeroSlides] = useState(null);
  const touchStartX = useRef(null);
  useEffect(() => {
    fetch("/api/slider").then((res) => res.json()).then((data) => {
      if (Array.isArray(data) && data.length > 0) {
        setCustomHeroSlides(data);
      }
    }).catch(() => {
    });
  }, []);
  const nextHeroSlide = useCallback(() => {
    setHeroSlide((prev) => (prev + 1) % 3);
  }, []);
  const prevHeroSlide = useCallback(() => {
    setHeroSlide((prev) => (prev - 1 + 3) % 3);
  }, []);
  useEffect(() => {
    if (isHeroPaused) return;
    const timer = setInterval(() => {
      setHeroSlide((prev) => (prev + 1) % 3);
    }, 6500);
    return () => clearInterval(timer);
  }, [isHeroPaused, heroSlide]);
  const heroSlides = useMemo(() => {
    if (customHeroSlides && customHeroSlides.length > 0) {
      return customHeroSlides;
    }
    return [
      {
        id: 0,
        wallpaper: "/images/hero-1-leather.jpg",
        badge: t.hero_badge || "Maison de maroquinerie & soins d'exception",
        title: t.hero_title || "L'Essence du Luxe Brut & Minimaliste",
        subtitle: t.hero_subtitle || "Pens\xE9 pour l'homme contemporain au Maroc. Mati\xE8res nobles, savoir-faire s\xE9culaire et livraison express avec paiement s\xE9curis\xE9 \xE0 la livraison.",
        categoryFilter: "Jackets",
        cta1: t.hero_cta || "Explorer la Collection",
        cta1Href: "#collection",
        cta2: t.hero_story_btn || "Notre Savoir-Faire",
        cta2Href: "#savoir-faire",
        tag: t.hero_tab_1 || "01 - Jackets"
      },
      {
        id: 1,
        wallpaper: "/images/hero-2-botanical.jpg",
        badge: t.hero_slide2_badge || "Accessoires & Maroquinerie d'Exception",
        title: t.hero_slide2_title || "L'Art du D\xE9tail & des Mati\xE8res Nobles",
        subtitle: t.hero_slide2_subtitle || "S\xE9lection rigoureuse d'accessoires, casquettes et maroquinerie fa\xE7onn\xE9s pour parfaire votre vestiaire.",
        categoryFilter: "Accessoires",
        cta1: t.hero_slide2_cta1 || "D\xE9couvrir la S\xE9lection",
        cta1Href: "#collection",
        cta2: t.hero_slide2_cta2 || "Savoir-Faire Artisanal",
        cta2Href: "#savoir-faire",
        tag: t.hero_tab_2 || "02 - Accessoires"
      },
      {
        id: 2,
        wallpaper: "/images/hero-3-linen.jpg",
        badge: t.hero_slide3_badge || "Soulier & Chaussures Sartoriales",
        title: t.hero_slide3_title || "\xC9l\xE9gance \xC9ternelle & Confort Supr\xEAme",
        subtitle: t.hero_slide3_subtitle || "Mules, souliers et cuirs pleine fleur assembl\xE9s \xE0 la main au Maroc pour une d\xE9marche affirm\xE9e et un confort absolu.",
        categoryFilter: "Chaussures",
        cta1: t.hero_slide3_cta1 || "Voir les Chaussures",
        cta1Href: "#collection",
        cta2: t.hero_slide3_cta2 || "Cuirs S\xE9lectionn\xE9s",
        cta2Href: "#savoir-faire",
        tag: t.hero_tab_3 || "03 - Chaussures"
      }
    ];
  }, [customHeroSlides, t]);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [currentInvoiceOrder, setCurrentInvoiceOrder] = useState(null);
  const [trackingOpen, setTrackingOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(() => checkIsAdminURL());
  const openAdminPanel = useCallback(() => {
    setAdminOpen(true);
    try {
      window.history.pushState({ admin: true }, "", "/admin");
    } catch (e) {
    }
  }, []);
  const handleCloseAdmin = useCallback(() => {
    setAdminOpen(false);
    try {
      if (checkIsAdminURL()) {
        window.history.pushState({}, "", "/");
      }
    } catch (e) {
    }
  }, []);
  const [productFormModal, setProductFormModal] = useState(null);
  const [toasts, setToasts] = useState([]);
  const showToast = useCallback((msg, type = "info") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, msg, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t2) => t2.id !== id));
    }, 3200);
  }, []);
  const [adminToken, setAdminToken] = useState(() => {
    return sessionStorage.getItem("modanova_admin_token") || sessionStorage.getItem("ettore_admin_token") || "";
  });
  const [adminUser, setAdminUser] = useState("");
  const [adminPass, setAdminPass] = useState("");
  const [adminLoginError, setAdminLoginError] = useState("");
  const [adminActiveTab, setAdminActiveTab] = useState("products");
  const fetchProducts = useCallback(async () => {
    setLoadingProducts(true);
    try {
      const res = await fetch(`/api/products?_t=${Date.now()}`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setProducts(data);
        } else {
          await fetch("/api/seed", { method: "POST" });
          const seedRes = await fetch(`/api/products?_t=${Date.now()}`, { cache: "no-store" });
          if (seedRes.ok) {
            const seedData = await seedRes.json();
            if (Array.isArray(seedData) && seedData.length > 0) {
              setProducts(seedData);
            }
          }
        }
      }
    } catch (err) {
      console.warn("API local/cloudflare non disponible, utilisation du catalogue local :", err);
    } finally {
      setLoadingProducts(false);
    }
  }, []);
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);
  const fetchAdminOrders = useCallback(async () => {
    if (!adminToken) return;
    try {
      const res = await fetch(`/api/orders?_t=${Date.now()}`, {
        cache: "no-store",
        headers: {
          Authorization: `Bearer ${adminToken}`,
          "Cache-Control": "no-cache"
        }
      });
      if (res.ok) {
        const list = await res.json();
        setOrders(Array.isArray(list) ? list : []);
      }
    } catch (err) {
      console.error("Erreur chargement commandes admin:", err);
    }
  }, [adminToken]);
  useEffect(() => {
    if (adminToken && adminOpen) {
      fetchAdminOrders();
    }
  }, [adminToken, adminOpen, fetchAdminOrders]);
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setMobileDrawerOpen(false);
        setCartOpen(false);
        setQuickViewProduct(null);
        setCheckoutOpen(false);
        setCurrentInvoiceOrder(null);
        setTrackingOpen(false);
        setAdminOpen(false);
        setProductFormModal(null);
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "A" || e.key === "a")) {
        e.preventDefault();
        setAdminOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);
  const cartTotals = useMemo(() => {
    let subtotal = 0;
    cart.forEach((item) => {
      subtotal += Number(item.price) * Number(item.quantity);
    });
    const discount = appliedPromo.toUpperCase() === "RAWCRAFT10" ? Math.round(subtotal * 0.1) : 0;
    const shipping = 0;
    const total = Math.max(0, subtotal - discount + shipping);
    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    return { subtotal, discount, shipping, total, itemCount };
  }, [cart, appliedPromo]);
  useEffect(() => {
    if (cartTotals.itemCount > 0) {
      setBadgePulsing(true);
      const timer = setTimeout(() => setBadgePulsing(false), 700);
      return () => clearTimeout(timer);
    }
  }, [cartTotals.itemCount]);
  const addToCart = (product, sizeChoice, colorChoice, qty = 1) => {
    const size = sizeChoice || product.sizes && product.sizes[0] || "Unique";
    const color = colorChoice || product.colors && product.colors[0] || "Default";
    const colorLabel = getColorLabel(color, lang);
    const variantStock = getProductVariantStock(product, size, color);
    if (!product.inStock || product.stock <= 0 || variantStock <= 0) {
      showToast(
        lang === "ar" ? `\u0639\u0630\u0631\u0627\u064B\u060C \u0627\u0644\u0645\u0642\u0627\u0633 "${size}" \u0628\u0627\u0644\u0644\u0648\u0646 "${colorLabel}" \u063A\u064A\u0631 \u0645\u062A\u0648\u0641\u0631 \u0641\u064A \u0627\u0644\u0645\u062E\u0632\u0648\u0646 \u062D\u0627\u0644\u064A\u0627\u064B.` : `D\xE9sol\xE9, la taille "${size}" en couleur "${colorLabel}" n'est pas en stock (\xE9puis\xE9e).`,
        "error"
      );
      return;
    }
    const lineKey = `${product.id}_${size}_${color}`;
    const existingInCart = cart.find((item) => item.lineKey === lineKey);
    const currentInCartQty = existingInCart ? Number(existingInCart.quantity || 0) : 0;
    if (currentInCartQty >= variantStock) {
      showToast(
        lang === "ar" ? `\u0644\u0642\u062F \u0648\u0635\u0644\u062A \u0625\u0644\u0649 \u0627\u0644\u062D\u062F \u0627\u0644\u0623\u0642\u0635\u0649 \u0627\u0644\u0645\u062A\u0648\u0641\u0631 (${variantStock}) \u0644\u0644\u0645\u0642\u0627\u0633 "${size}" \u0628\u0627\u0644\u0644\u0648\u0646 "${colorLabel}".` : `Quantit\xE9 maximale atteinte : il n'y a que ${variantStock} exemplaire(s) en stock pour la taille "${size}" en couleur "${colorLabel}".`,
        "warning"
      );
      setCartOpen(true);
      return;
    }
    const allowedNewQty = Math.min(variantStock, currentInCartQty + qty);
    if (currentInCartQty + qty > variantStock) {
      showToast(
        lang === "ar" ? `\u062A\u0645\u062A \u0625\u0636\u0627\u0641\u0629 \u0627\u0644\u0643\u0645\u064A\u0629 \u0627\u0644\u0645\u062A\u0648\u0641\u0631\u0629 \u0641\u0642\u0637 (${variantStock}) \u0644\u0644\u0645\u0642\u0627\u0633 "${size}" \u0628\u0627\u0644\u0644\u0648\u0646 "${colorLabel}".` : `Stock limit\xE9 : quantit\xE9 ajust\xE9e \xE0 ${variantStock} (maximum disponible pour la taille "${size}" en couleur "${colorLabel}").`,
        "warning"
      );
    } else {
      showToast(t.toast_added, "success");
    }
    setLastAddedLineKey(lineKey);
    setBadgePulsing(true);
    setTimeout(() => setBadgePulsing(false), 700);
    setCart((prev) => {
      const existing = prev.find((item) => item.lineKey === lineKey);
      if (existing) {
        return prev.map(
          (item) => item.lineKey === lineKey ? { ...item, quantity: allowedNewQty, stock: variantStock } : item
        );
      } else {
        return [
          ...prev,
          {
            lineKey,
            productId: product.id,
            nameFr: product.nameFr,
            nameAr: product.nameAr,
            price: product.price,
            stock: variantStock,
            size,
            color,
            quantity: allowedNewQty,
            image: product.images && product.images[0] || ""
          }
        ];
      }
    });
    setCartOpen(true);
  };
  const updateCartQty = (lineKey, newQty) => {
    setCart((prev) => {
      return prev.map((item) => {
        if (item.lineKey === lineKey) {
          const liveProd = products.find((p) => Number(p.id) === Number(item.productId));
          const maxAvail = liveProd ? getProductVariantStock(liveProd, item.size, item.color) : item.stock || 1;
          if (newQty > maxAvail) {
            showToast(
              lang === "ar" ? `\u0627\u0644\u0643\u0645\u064A\u0629 \u0627\u0644\u0642\u0635\u0648\u0649 \u0627\u0644\u0645\u062A\u0648\u0641\u0631\u0629 \u0644\u0644\u0645\u0642\u0627\u0633 "${item.size}" (${getColorLabel(item.color, lang)}) \u0647\u064A ${maxAvail}.` : `Seulement ${maxAvail} disponible(s) en stock pour la taille "${item.size}" en couleur "${getColorLabel(item.color, lang)}".`,
              "warning"
            );
          }
          const clamped = Math.max(1, Math.min(Math.max(1, maxAvail), newQty));
          return { ...item, quantity: clamped, stock: maxAvail };
        }
        return item;
      });
    });
  };
  const removeFromCart = (lineKey) => {
    setCart((prev) => prev.filter((item) => item.lineKey !== lineKey));
    showToast(t.toast_removed, "info");
  };
  const clearCart = () => {
    setCart([]);
    showToast(t.toast_empty, "info");
  };
  const toggleWishlist = (productId) => {
    setWishlist((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };
  const openQuickView = (product) => {
    setQuickViewProduct(product);
    setQuickViewImageIdx(0);
    setQuickViewSize(product.sizes && product.sizes[0] || "");
    setQuickViewColor(product.colors && product.colors[0] || "");
  };
  const availableFilterSizes = useMemo(() => {
    const set = /* @__PURE__ */ new Set();
    (products || []).forEach((p) => {
      if (Array.isArray(p?.sizes)) {
        p.sizes.forEach((sz) => {
          const clean = String(sz || "").trim();
          if (clean) set.add(clean);
        });
      }
    });
    return Array.from(set);
  }, [products]);
  const availableFilterColors = useMemo(() => {
    const map = /* @__PURE__ */ new Map();
    (products || []).forEach((p) => {
      if (Array.isArray(p?.colors)) {
        p.colors.forEach((col) => {
          const labelFr = getColorLabel(col, "fr");
          const key = labelFr.toLowerCase();
          if (key && !map.has(key)) {
            map.set(key, {
              key,
              raw: col,
              labelFr,
              labelAr: getColorLabel(col, "ar"),
              hex: getColorCss(col)
            });
          }
        });
      }
    });
    return Array.from(map.values());
  }, [products]);
  const resetAllCatalogFilters = useCallback(() => {
    setSelectedCategory("all");
    setSelectedSizeFilter("all");
    setSelectedColorFilter("all");
    setPriceRangeFilter("all");
    setOnlyInStock(false);
    setOnlyWithVideo(false);
    setSearchQuery("");
    setSortOrder("default");
    setCatalogPage(1);
  }, []);
  const filteredProducts = useMemo(() => {
    const list = products.filter((p) => {
      if (!p) return false;
      if (!isProductsPage && p.showOnHome === false) return false;
      if (selectedCategory !== "all" && String(p.category || "").trim().toLowerCase() !== String(selectedCategory).trim().toLowerCase()) return false;
      if (selectedSizeFilter !== "all") {
        const pSizes = Array.isArray(p.sizes) ? p.sizes.map((s) => String(s || "").trim().toLowerCase()) : [];
        if (!pSizes.includes(String(selectedSizeFilter).trim().toLowerCase())) return false;
        if (onlyInStock && !isSizeAvailableInAnyColor(p, selectedSizeFilter)) return false;
      }
      if (selectedColorFilter !== "all") {
        const pColors = Array.isArray(p.colors) ? p.colors.map((c) => getColorLabel(c, "fr").toLowerCase()) : [];
        if (!pColors.includes(String(selectedColorFilter).trim().toLowerCase())) return false;
      }
      const priceNum = Number(p.price || 0);
      if (priceRangeFilter === "under300" && priceNum >= 300) return false;
      if (priceRangeFilter === "300to500" && (priceNum < 300 || priceNum > 500)) return false;
      if (priceRangeFilter === "over500" && priceNum <= 500) return false;
      if (onlyInStock && (!p.inStock || p.stock <= 0)) return false;
      if (onlyWithVideo && !String(p.videoUrl || "").trim()) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchFr = (p.nameFr || "").toLowerCase().includes(q) || (p.descFr || "").toLowerCase().includes(q) || (p.category || "").toLowerCase().includes(q);
        const matchAr = (p.nameAr || "").toLowerCase().includes(q) || (p.descAr || "").toLowerCase().includes(q);
        if (!matchFr && !matchAr) return false;
      }
      return true;
    });
    if (sortOrder === "asc") return [...list].sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
    if (sortOrder === "desc") return [...list].sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
    return list;
  }, [products, isProductsPage, selectedCategory, selectedSizeFilter, selectedColorFilter, priceRangeFilter, onlyInStock, onlyWithVideo, searchQuery, sortOrder]);
  const totalCatalogPages = Math.max(1, Math.ceil(filteredProducts.length / CATALOG_PER_PAGE));
  const safeCatalogPage = Math.min(Math.max(1, catalogPage), totalCatalogPages);
  const startCatalogIdx = (safeCatalogPage - 1) * CATALOG_PER_PAGE;
  const paginatedCatalogProducts = filteredProducts.slice(startCatalogIdx, startCatalogIdx + CATALOG_PER_PAGE);
  const adminKPIs = useMemo(() => {
    const safeOrders = Array.isArray(orders) ? orders : [];
    const safeProducts = Array.isArray(products) ? products : [];
    const validOrders = safeOrders.filter((o) => o && o.status !== "Annul\xE9e");
    const revenue = validOrders.reduce((sum, o) => sum + Number(o?.total || 0), 0);
    const totalOrders = safeOrders.length;
    const avgOrderValue = totalOrders > 0 ? Math.round(revenue / totalOrders) : 0;
    const activeProducts = safeProducts.filter((p) => p && (p.stock || 0) > 0).length;
    const outOfStockCount = safeProducts.filter((p) => !p || !p.inStock || p.stock === 0).length;
    return {
      revenue,
      totalSales: revenue,
      totalOrders,
      orderCount: totalOrders,
      avgOrderValue,
      avgBasket: avgOrderValue,
      activeProducts,
      outOfStockCount
    };
  }, [orders, products]);
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setAdminLoginError("");
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: adminUser, pass: adminPass })
      });
      const data = await res.json();
      if (res.ok && data.token) {
        setAdminToken(data.token);
        sessionStorage.setItem("modanova_admin_token", data.token);
        showToast("Connexion r\xE9ussie", "success");
        fetchAdminOrders();
      } else {
        setAdminLoginError(data.error || "Identifiants invalides");
      }
    } catch {
      setAdminLoginError("Erreur de connexion au serveur");
    }
  };
  const handleAdminLogout = () => {
    setAdminToken("");
    sessionStorage.removeItem("modanova_admin_token");
    sessionStorage.removeItem("ettore_admin_token");
    setAdminUser("");
    setAdminPass("");
    showToast("D\xE9connexion effectu\xE9e", "info");
  };
  return /* @__PURE__ */ React.createElement("div", { className: "min-h-screen flex flex-col bg-canvas text-noir w-full max-w-full overflow-x-hidden relative" }, /* @__PURE__ */ React.createElement("div", { className: "bg-[#141210] text-[#EFECE6] py-1.5 border-b border-caramel/30 overflow-hidden text-[11px] tracking-wider font-medium select-none shadow-xs" }, /* @__PURE__ */ React.createElement("div", { className: "animate-marquee whitespace-nowrap flex items-center gap-8" }, /* @__PURE__ */ React.createElement("span", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement("span", { className: "text-caramel" }, "\u2726"), " ", /* @__PURE__ */ React.createElement("span", null, "LIVRAISON GRATUITE SUR TOUT LE MAROC")), /* @__PURE__ */ React.createElement("span", { className: "text-caramel/60" }, "\u2022"), /* @__PURE__ */ React.createElement("span", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement("span", { className: "text-caramel" }, "\u2726"), " ", /* @__PURE__ */ React.createElement("span", null, "PAIEMENT \xC0 LA LIVRAISON (COD)")), /* @__PURE__ */ React.createElement("span", { className: "text-caramel/60" }, "\u2022"), /* @__PURE__ */ React.createElement("span", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement("span", { className: "text-caramel" }, "\u2726"), " ", /* @__PURE__ */ React.createElement("span", null, "ESSAYEZ AVANT D'ACHETER")), /* @__PURE__ */ React.createElement("span", { className: "text-caramel/60" }, "\u2022"), /* @__PURE__ */ React.createElement("span", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement(WhatsAppIcon, { className: "w-3.5 h-3.5 fill-[#25D366] shrink-0" }), " ", /* @__PURE__ */ React.createElement("span", { className: "text-white font-semibold" }, "SUPPORT WHATSAPP : +212 600-773716")), /* @__PURE__ */ React.createElement("span", { className: "text-caramel/60" }, "\u2022"), /* @__PURE__ */ React.createElement("span", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement("span", { className: "text-caramel" }, "\u2726"), " ", /* @__PURE__ */ React.createElement("span", null, "NOUVELLE COLLECTION HOMME 2026")), /* @__PURE__ */ React.createElement("span", { className: "text-caramel/60" }, "\u2022"), /* @__PURE__ */ React.createElement("span", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement("span", { className: "text-caramel" }, "\u2726"), " ", /* @__PURE__ */ React.createElement("span", null, "LIVRAISON GRATUITE SUR TOUT LE MAROC")), /* @__PURE__ */ React.createElement("span", { className: "text-caramel/60" }, "\u2022"), /* @__PURE__ */ React.createElement("span", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement("span", { className: "text-caramel" }, "\u2726"), " ", /* @__PURE__ */ React.createElement("span", null, "PAIEMENT \xC0 LA LIVRAISON (COD)")), /* @__PURE__ */ React.createElement("span", { className: "text-caramel/60" }, "\u2022"), /* @__PURE__ */ React.createElement("span", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement("span", { className: "text-caramel" }, "\u2726"), " ", /* @__PURE__ */ React.createElement("span", null, "ESSAYEZ AVANT D'ACHETER")), /* @__PURE__ */ React.createElement("span", { className: "text-caramel/60" }, "\u2022"), /* @__PURE__ */ React.createElement("span", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement(WhatsAppIcon, { className: "w-3.5 h-3.5 fill-[#25D366] shrink-0" }), " ", /* @__PURE__ */ React.createElement("span", { className: "text-white font-semibold" }, "SUPPORT WHATSAPP : +212 600-773716")), /* @__PURE__ */ React.createElement("span", { className: "text-caramel/60" }, "\u2022"), /* @__PURE__ */ React.createElement("span", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement("span", { className: "text-caramel" }, "\u2726"), " ", /* @__PURE__ */ React.createElement("span", null, "NOUVELLE COLLECTION HOMME 2026")), /* @__PURE__ */ React.createElement("span", { className: "text-caramel/60" }, "\u2022"))), /* @__PURE__ */ React.createElement("header", { className: `sticky top-0 z-40 header-luxury-bg header-gold-line overflow-hidden w-full max-w-full transition-all duration-300 ${scrolled ? "shadow-lg shadow-noir/5" : ""}` }, /* @__PURE__ */ React.createElement("div", { className: "header-shimmer-beam" }), /* @__PURE__ */ React.createElement("div", { className: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 transition-all duration-300 ${scrolled ? "h-16" : "h-20"}` }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-6" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: () => setMobileDrawerOpen(true),
      className: "md:hidden p-2 text-noir hover:text-caramel transition-colors",
      "aria-label": "Menu"
    },
    /* @__PURE__ */ React.createElement("svg", { className: "w-6 h-6", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" }, /* @__PURE__ */ React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "1.75", d: "M4 6h16M4 12h16M4 18h16" }))
  ), /* @__PURE__ */ React.createElement("nav", { className: "hidden md:flex items-center gap-6 text-sm font-medium tracking-wide" }, /* @__PURE__ */ React.createElement(
    "a",
    {
      href: "/",
      onClick: (e) => {
        e.preventDefault();
        backToHome();
      },
      className: `nav-link-indicator py-1 transition-colors whitespace-nowrap ${!selectedProductId && !isProductsPage ? "text-caramel font-semibold" : "text-noir hover:text-caramel"}`
    },
    lang === "ar" ? "\u0627\u0644\u0631\u0626\u064A\u0633\u064A\u0629" : "Accueil"
  ), /* @__PURE__ */ React.createElement(
    "a",
    {
      href: "/produits",
      onClick: (e) => {
        e.preventDefault();
        navigateToProductsPage();
      },
      className: `nav-link-indicator py-1 transition-colors whitespace-nowrap flex items-center gap-1.5 ${!selectedProductId && isProductsPage ? "text-caramel font-semibold" : "text-noir hover:text-caramel"}`
    },
    /* @__PURE__ */ React.createElement("span", null, lang === "ar" ? "\u062C\u0645\u064A\u0639 \u0627\u0644\u0645\u0646\u062A\u062C\u0627\u062A" : "Tous les Produits"),
    /* @__PURE__ */ React.createElement("span", { className: "text-[10px] font-mono text-taupe-dark" }, "(", products.length, ")")
  ), /* @__PURE__ */ React.createElement(
    "a",
    {
      href: "#savoir-faire",
      onClick: (e) => {
        if (selectedProductId || isProductsPage) {
          e.preventDefault();
          backToHome();
          setTimeout(() => {
            const el = document.getElementById("savoir-faire");
            if (el) el.scrollIntoView({ behavior: "smooth" });
          }, 60);
        }
      },
      className: "nav-link-indicator py-1 text-noir hover:text-caramel transition-colors whitespace-nowrap"
    },
    t.nav_craft
  ), /* @__PURE__ */ React.createElement(
    "a",
    {
      href: "#temoignages",
      onClick: (e) => {
        if (selectedProductId || isProductsPage) {
          e.preventDefault();
          backToHome();
          setTimeout(() => {
            const el = document.getElementById("temoignages");
            if (el) el.scrollIntoView({ behavior: "smooth" });
          }, 60);
        }
      },
      className: "nav-link-indicator py-1 text-noir hover:text-caramel transition-colors whitespace-nowrap"
    },
    t.nav_testimonials
  ))), /* @__PURE__ */ React.createElement("div", { className: "text-center" }, /* @__PURE__ */ React.createElement(
    "a",
    {
      href: "#",
      onClick: (e) => {
        e.preventDefault();
        backToHome();
      },
      className: "inline-block group focus:outline-none cursor-pointer"
    },
    /* @__PURE__ */ React.createElement("span", { className: "font-serif text-2xl sm:text-3xl font-bold tracking-[0.25em] text-noir uppercase group-hover:text-caramel group-hover:tracking-[0.3em] transition-all duration-300" }, t.brand),
    /* @__PURE__ */ React.createElement("span", { className: "block text-[9px] tracking-[0.3em] uppercase text-taupe-dark -mt-1 font-sans group-hover:text-noir transition-colors" }, t.tagline)
  )), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3 sm:gap-5" }, /* @__PURE__ */ React.createElement("div", { className: "hidden sm:flex items-center text-xs font-semibold tracking-wider p-1 bg-card rounded border border-taupe/20" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setLang("fr"),
      className: `px-2 py-1 rounded transition-colors ${lang === "fr" ? "bg-noir text-canvas shadow-xs" : "text-taupe-dark hover:text-noir"}`
    },
    "FR"
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setLang("ar"),
      className: `px-2 py-1 rounded transition-colors ${lang === "ar" ? "bg-noir text-canvas shadow-xs" : "text-taupe-dark hover:text-noir"}`
    },
    "\u0627\u0644\u0639\u0631\u0628\u064A\u0629"
  )), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setTrackingOpen(true),
      className: "hidden lg:flex items-center gap-1.5 text-xs font-semibold text-noir hover:text-caramel tracking-wider uppercase transition-colors"
    },
    /* @__PURE__ */ React.createElement("svg", { className: "w-4 h-4 text-taupe", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" }, /* @__PURE__ */ React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "1.75", d: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" })),
    /* @__PURE__ */ React.createElement("span", null, t.nav_tracking)
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: openAdminPanel,
      title: "Administration (Ctrl+Shift+A)",
      className: "hidden sm:inline-flex p-2 text-taupe-dark hover:text-noir transition-colors rounded hover:bg-card",
      "aria-label": "Admin"
    },
    /* @__PURE__ */ React.createElement("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" }, /* @__PURE__ */ React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "1.75", d: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" }), /* @__PURE__ */ React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "1.75", d: "M15 12a3 3 0 11-6 0 3 3 0 016 0z" }))
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setCartOpen(true),
      className: `relative p-2.5 text-noir hover:text-caramel transition-all duration-200 rounded-full hover:bg-card ${badgePulsing ? "animate-cart-wiggle text-caramel" : ""}`,
      "aria-label": t.nav_cart
    },
    /* @__PURE__ */ React.createElement("svg", { className: "w-6 h-6", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" }, /* @__PURE__ */ React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "1.75", d: "M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" })),
    cartTotals.itemCount > 0 && /* @__PURE__ */ React.createElement(
      "span",
      {
        key: cartTotals.itemCount,
        className: `absolute -top-1 -end-1 bg-caramel text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center tabular-nums shadow-sm transition-transform duration-200 ${badgePulsing ? "animate-badge-pulse scale-110" : ""}`
      },
      cartTotals.itemCount
    )
  )))), selectedProductIdentifier ? selectedProduct ? /* @__PURE__ */ React.createElement(
    ProductDetailPage,
    {
      product: selectedProduct,
      allProducts: products,
      lang,
      t,
      wishlist,
      toggleWishlist,
      onBack: backToHome,
      onAddToCart: (prod, sz, col, qty) => {
        addToCart(prod, sz, col, qty);
      },
      onDirectCheckout: (checkoutItem) => {
        setDirectCheckoutItem(checkoutItem);
        setCheckoutOpen(true);
      },
      onSelectProduct: (id) => {
        navigateToProduct(id);
      },
      showToast
    }
  ) : loadingProducts ? /* @__PURE__ */ React.createElement("div", { className: "py-32 max-w-3xl mx-auto px-4 text-center" }, /* @__PURE__ */ React.createElement("div", { className: "animate-spin w-10 h-10 border-2 border-caramel border-t-transparent rounded-full mx-auto mb-4" }), /* @__PURE__ */ React.createElement("p", { className: "font-serif italic text-xl text-noir" }, "Chargement de la cr\xE9ation MODANOVA...")) : /* @__PURE__ */ React.createElement("div", { className: "py-28 max-w-xl mx-auto px-4 text-center" }, /* @__PURE__ */ React.createElement("div", { className: "text-4xl mb-4" }, "\u2728"), /* @__PURE__ */ React.createElement("h2", { className: "font-serif italic text-3xl text-noir mb-3" }, "Cr\xE9ation introuvable"), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-taupe-dark mb-6 leading-relaxed" }, "Cette pi\xE8ce n'est plus disponible ou a \xE9t\xE9 retir\xE9e de la collection."), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: backToHome,
      className: "px-6 py-3 bg-noir text-white text-xs font-semibold uppercase tracking-wider hover:bg-caramel transition-colors"
    },
    t.product_back_to_collection
  )) : /* @__PURE__ */ React.createElement(React.Fragment, null, !isProductsPage && /* @__PURE__ */ React.createElement(
    "section",
    {
      className: "relative overflow-hidden bg-noir select-none border-b border-taupe/20",
      role: "region",
      "aria-roledescription": "carousel",
      "aria-label": "Collection Pr\xE9sentation ETTORE",
      onMouseEnter: () => setIsHeroPaused(true),
      onMouseLeave: () => setIsHeroPaused(false),
      onTouchStart: (e) => {
        touchStartX.current = e.touches[0].clientX;
      },
      onTouchEnd: (e) => {
        if (touchStartX.current !== null) {
          const deltaX = e.changedTouches[0].clientX - touchStartX.current;
          if (deltaX > 40) {
            lang === "ar" ? nextHeroSlide() : prevHeroSlide();
          } else if (deltaX < -40) {
            lang === "ar" ? prevHeroSlide() : nextHeroSlide();
          }
          touchStartX.current = null;
        }
      }
    },
    /* @__PURE__ */ React.createElement("div", { className: "absolute inset-0 z-0 overflow-hidden" }, heroSlides.map((slide, idx) => {
      const isActive = heroSlide === idx;
      return /* @__PURE__ */ React.createElement(
        "div",
        {
          key: slide.id,
          className: `absolute inset-0 transition-opacity duration-1000 ease-in-out ${isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"}`,
          "aria-hidden": !isActive
        },
        /* @__PURE__ */ React.createElement(
          "img",
          {
            src: slide.wallpaper,
            alt: "",
            className: `w-full h-full object-cover object-center ${isActive ? "scale-105 transition-transform duration-7000 ease-out" : "scale-100"}`
          }
        )
      );
    }), /* @__PURE__ */ React.createElement("div", { className: "absolute inset-0 z-10 bg-gradient-to-t from-[#141210]/95 via-[#141210]/65 to-[#141210]/50" }), /* @__PURE__ */ React.createElement("div", { className: "absolute inset-0 z-10 bg-[radial-gradient(ellipse_at_center,rgba(194,139,83,0.18)_0%,rgba(14,12,10,0.75)_100%)] mix-blend-multiply" }), /* @__PURE__ */ React.createElement("div", { className: "absolute inset-0 z-10 border-b border-white/10" })),
    /* @__PURE__ */ React.createElement("div", { className: "relative z-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-24 sm:pt-32 sm:pb-32 lg:pt-36 lg:pb-36 flex flex-col items-center justify-center text-center min-h-[580px] sm:min-h-[640px] lg:min-h-[680px]" }, heroSlides.map((slide, idx) => {
      if (heroSlide !== idx) return null;
      return /* @__PURE__ */ React.createElement("div", { key: slide.id, className: "w-full flex flex-col items-center" }, /* @__PURE__ */ React.createElement("div", { className: "inline-flex items-center gap-2 text-xs font-semibold tracking-[0.25em] uppercase text-caramel mb-5 animate-fade-up drop-shadow-sm" }, /* @__PURE__ */ React.createElement("span", { className: "w-1.5 h-1.5 rounded-full bg-caramel inline-block" }), /* @__PURE__ */ React.createElement("span", null, slide.badge), /* @__PURE__ */ React.createElement("span", { className: "w-1.5 h-1.5 rounded-full bg-caramel inline-block" })), /* @__PURE__ */ React.createElement(
        "h1",
        {
          style: { animationDelay: "120ms" },
          className: "font-serif italic text-4xl sm:text-6xl lg:text-7xl font-normal text-white tracking-tight max-w-4xl mx-auto leading-[1.08] mb-6 drop-shadow-md animate-fade-up"
        },
        slide.title
      ), /* @__PURE__ */ React.createElement(
        "p",
        {
          style: { animationDelay: "240ms" },
          className: "text-base sm:text-lg text-white/90 max-w-2xl mx-auto font-light leading-relaxed mb-10 drop-shadow-sm animate-fade-up"
        },
        slide.subtitle
      ), /* @__PURE__ */ React.createElement(
        "div",
        {
          style: { animationDelay: "360ms" },
          className: "flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto animate-fade-up"
        },
        /* @__PURE__ */ React.createElement(
          "a",
          {
            href: slide.cta1Href,
            onClick: () => {
              if (slide.categoryFilter) {
                setSelectedCategory(slide.categoryFilter);
              }
            },
            className: "w-full sm:w-auto px-8 py-3.5 bg-caramel text-white text-xs font-semibold uppercase tracking-[0.18em] hover:bg-white hover:text-noir transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
          },
          slide.cta1
        ),
        /* @__PURE__ */ React.createElement(
          "a",
          {
            href: slide.cta2Href,
            className: "w-full sm:w-auto px-8 py-3.5 border border-white/40 text-white text-xs font-semibold uppercase tracking-[0.18em] hover:border-white hover:bg-white/10 backdrop-blur-xs transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0"
          },
          slide.cta2
        )
      ));
    }), /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        onClick: lang === "ar" ? nextHeroSlide : prevHeroSlide,
        className: "absolute start-4 sm:start-8 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-black/35 hover:bg-black/70 border border-white/20 text-white flex items-center justify-center backdrop-blur-md transition-all duration-200 hover:scale-110 active:scale-95 z-30 focus:outline-hidden shadow-lg",
        "aria-label": "Slide pr\xE9c\xE9dent"
      },
      /* @__PURE__ */ React.createElement("svg", { className: "w-5 h-5 rtl:rotate-180", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" }, /* @__PURE__ */ React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M15 19l-7-7 7-7" }))
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        onClick: lang === "ar" ? prevHeroSlide : nextHeroSlide,
        className: "absolute end-4 sm:end-8 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-black/35 hover:bg-black/70 border border-white/20 text-white flex items-center justify-center backdrop-blur-md transition-all duration-200 hover:scale-110 active:scale-95 z-30 focus:outline-hidden shadow-lg",
        "aria-label": "Slide suivant"
      },
      /* @__PURE__ */ React.createElement("svg", { className: "w-5 h-5 rtl:rotate-180", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" }, /* @__PURE__ */ React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M9 5l7 7-7 7" }))
    ), /* @__PURE__ */ React.createElement("div", { className: "absolute bottom-8 left-0 right-0 z-30 flex items-center justify-center gap-3 sm:gap-6 px-4" }, heroSlides.map((slide, idx) => {
      const isActive = heroSlide === idx;
      return /* @__PURE__ */ React.createElement(
        "button",
        {
          key: slide.id,
          type: "button",
          onClick: () => setHeroSlide(idx),
          className: `text-start group transition-all duration-300 focus:outline-hidden ${isActive ? "opacity-100" : "opacity-55 hover:opacity-85"}`
        },
        /* @__PURE__ */ React.createElement("span", { className: "block text-[10px] sm:text-xs font-semibold tracking-wider text-white/95 uppercase font-mono" }, slide.tag),
        /* @__PURE__ */ React.createElement("div", { className: "w-20 sm:w-28 md:w-36 h-1 bg-white/25 rounded-full overflow-hidden mt-1.5 relative" }, isActive && /* @__PURE__ */ React.createElement(
          "div",
          {
            key: `${heroSlide}-${isHeroPaused}`,
            className: `h-full bg-caramel rounded-full ${isHeroPaused ? "w-full" : "animate-slide-progress"}`
          }
        ))
      );
    }))),
    /* @__PURE__ */ React.createElement("div", { className: "relative z-20 bg-black/55 backdrop-blur-md border-t border-white/10 py-4 px-4" }, /* @__PURE__ */ React.createElement("div", { className: "max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4 text-center text-xs text-white/90" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-center gap-2.5" }, /* @__PURE__ */ React.createElement("span", { className: "text-base" }, "\u{1F1F2}\u{1F1E6}"), /* @__PURE__ */ React.createElement("span", { className: "font-medium tracking-wide" }, t.trust_delivery)), /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-center gap-2.5" }, /* @__PURE__ */ React.createElement("span", { className: "text-base" }, "\u{1F4B5}"), /* @__PURE__ */ React.createElement("span", { className: "font-medium tracking-wide" }, t.trust_cod)), /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-center gap-2.5" }, /* @__PURE__ */ React.createElement("span", { className: "text-base" }, "\u2728"), /* @__PURE__ */ React.createElement("span", { className: "font-medium tracking-wide" }, t.trust_exchange))))
  ), /* @__PURE__ */ React.createElement("section", { id: "collection", className: `${isProductsPage ? "py-8 sm:py-14" : "py-14 sm:py-24"} max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 w-full` }, isProductsPage && /* @__PURE__ */ React.createElement("div", { className: "mb-6 pb-4 border-b border-taupe/20 flex flex-wrap items-center justify-between gap-3" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2 text-xs text-taupe-dark" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: backToHome,
      className: "hover:text-noir font-medium transition-colors flex items-center gap-1"
    },
    /* @__PURE__ */ React.createElement("span", null, "\u2190"),
    /* @__PURE__ */ React.createElement("span", null, lang === "ar" ? "\u0627\u0644\u0631\u0626\u064A\u0633\u064A\u0629" : "Accueil")
  ), /* @__PURE__ */ React.createElement("span", null, "/"), /* @__PURE__ */ React.createElement("span", { className: "text-noir font-semibold" }, lang === "ar" ? "\u062C\u0645\u064A\u0639 \u0627\u0644\u0645\u0646\u062A\u062C\u0627\u062A \u0648\u0627\u0644\u0641\u0644\u062A\u0631\u0629" : "Tous les Produits & Filtres")), /* @__PURE__ */ React.createElement("span", { className: "text-xs font-mono text-taupe-dark" }, filteredProducts.length, " / ", products.length, " ", lang === "ar" ? "\u0645\u0646\u062A\u062C" : "produits affich\xE9s")), /* @__PURE__ */ React.createElement("div", { className: "flex flex-col md:flex-row md:items-end justify-between gap-5 mb-8 border-b border-taupe/15 pb-6" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { className: "text-xs font-bold tracking-[0.2em] uppercase text-caramel block mb-2" }, isProductsPage ? lang === "ar" ? "\u0627\u0644\u0643\u062A\u0627\u0644\u0648\u062C \u0627\u0644\u0643\u0627\u0645\u0644 \u0648\u0627\u0644\u0641\u0644\u062A\u0631\u0629 \u0627\u0644\u0645\u062A\u0642\u062F\u0645\u0629" : "CATALOGUE COMPLET & RECHERCHE AVANC\xC9E" : `${t.brand} ATELIER \u2014 S\xC9LECTION ACCUEIL`), /* @__PURE__ */ React.createElement("h2", { className: "font-serif text-2xl sm:text-4xl text-noir font-normal" }, isProductsPage ? lang === "ar" ? "\u062C\u0645\u064A\u0639 \u0627\u0644\u0645\u0646\u062A\u062C\u0627\u062A" : "Tous nos Produits" : t.nav_collection)), /* @__PURE__ */ React.createElement("div", { className: "flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto" }, /* @__PURE__ */ React.createElement("div", { className: "relative w-full sm:w-72" }, /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      value: searchQuery,
      onChange: (e) => {
        setSearchQuery(e.target.value);
        setCatalogPage(1);
      },
      placeholder: t.search_placeholder,
      className: "w-full bg-card border border-taupe/30 px-4 py-2.5 ps-10 text-xs text-noir rounded-none focus:border-caramel focus:bg-white transition-colors"
    }
  ), /* @__PURE__ */ React.createElement("svg", { className: "w-4 h-4 text-taupe absolute start-3 top-3", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" }, /* @__PURE__ */ React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" })), searchQuery && /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => {
        setSearchQuery("");
        setCatalogPage(1);
      },
      className: "absolute end-3 top-2.5 text-taupe hover:text-noir text-xs"
    },
    "\u2715"
  )), !isProductsPage && /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: () => navigateToProductsPage(),
      className: "px-4 py-2.5 bg-noir hover:bg-caramel text-white text-xs font-semibold uppercase tracking-wider transition-colors whitespace-nowrap flex items-center justify-center gap-2 shadow-xs"
    },
    /* @__PURE__ */ React.createElement("span", null, lang === "ar" ? "\u062C\u0645\u064A\u0639 \u0627\u0644\u0645\u0646\u062A\u062C\u0627\u062A \u0648\u0627\u0644\u0641\u0644\u062A\u0631\u0629" : "Tous les Produits & Filtres"),
    /* @__PURE__ */ React.createElement("span", { className: "font-mono text-[11px] opacity-80" }, "(", products.length, ") \u2192")
  ))), /* @__PURE__ */ React.createElement("div", { className: "mb-8 bg-card/60 p-3.5 sm:p-5 border border-taupe/15 space-y-4" }, /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap items-center justify-between gap-3" }, /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap items-center gap-1.5 max-w-full overflow-x-auto pb-1" }, [
    { id: "all", label: t.filter_all },
    ...PRODUCT_CATEGORIES.map((cat) => ({ id: cat, label: cat }))
  ].map((cat) => {
    const isSelected = selectedCategory === cat.id || selectedCategory.toLowerCase() === cat.id.toLowerCase();
    return /* @__PURE__ */ React.createElement(
      "button",
      {
        key: cat.id,
        onClick: () => {
          setSelectedCategory(cat.id);
          setCatalogPage(1);
        },
        className: `px-3 py-1.5 text-xs font-medium tracking-wide transition-colors whitespace-nowrap rounded-xs ${isSelected ? "bg-noir text-white shadow-xs font-semibold" : "bg-card text-taupe-dark hover:text-noir border border-taupe/20"}`
      },
      cat.label
    );
  })), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3 sm:gap-4 flex-wrap" }, /* @__PURE__ */ React.createElement("label", { className: "flex items-center gap-1.5 text-xs text-noir cursor-pointer select-none" }, /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "checkbox",
      checked: onlyInStock,
      onChange: (e) => {
        setOnlyInStock(e.target.checked);
        setCatalogPage(1);
      },
      className: "accent-caramel w-4 h-4 rounded-xs border-taupe/40"
    }
  ), /* @__PURE__ */ React.createElement("span", null, t.in_stock_only)), /* @__PURE__ */ React.createElement("label", { className: "flex items-center gap-1.5 text-xs text-noir cursor-pointer select-none" }, /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "checkbox",
      checked: onlyWithVideo,
      onChange: (e) => {
        setOnlyWithVideo(e.target.checked);
        setCatalogPage(1);
      },
      className: "accent-caramel w-4 h-4 rounded-xs border-taupe/40"
    }
  ), /* @__PURE__ */ React.createElement("span", null, lang === "ar" ? "\u0645\u0639 \u0641\u064A\u062F\u064A\u0648 \u{1F3AC}" : "Avec vid\xE9o \u{1F3AC}")), /* @__PURE__ */ React.createElement(
    "select",
    {
      value: sortOrder,
      onChange: (e) => {
        setSortOrder(e.target.value);
        setCatalogPage(1);
      },
      className: "bg-canvas border border-taupe/30 px-3 py-1.5 text-xs text-noir focus:border-caramel"
    },
    /* @__PURE__ */ React.createElement("option", { value: "default" }, t.sort_default),
    /* @__PURE__ */ React.createElement("option", { value: "asc" }, t.sort_asc),
    /* @__PURE__ */ React.createElement("option", { value: "desc" }, t.sort_desc)
  ), /* @__PURE__ */ React.createElement("div", { className: "hidden lg:flex items-center gap-1 border-s border-taupe/20 ps-3" }, [2, 3].map((cols) => /* @__PURE__ */ React.createElement(
    "button",
    {
      key: cols,
      onClick: () => setGridCols(cols),
      className: `w-7 h-7 text-xs font-medium border flex items-center justify-center transition-colors ${gridCols === cols ? "border-noir bg-noir text-white" : "border-taupe/30 text-taupe-dark hover:border-noir"}`,
      title: `${cols} colonnes`
    },
    cols
  ))))), (isProductsPage || selectedSizeFilter !== "all" || selectedColorFilter !== "all" || priceRangeFilter !== "all") && /* @__PURE__ */ React.createElement("div", { className: "pt-3 border-t border-taupe/15 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3 items-end" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-[10px] font-bold uppercase tracking-wider text-taupe-dark mb-1" }, lang === "ar" ? "\u0627\u0644\u0645\u0642\u0627\u0633 / \u0627\u0644\u0642\u0627\u0644\u0628" : "Taille / Pointure"), /* @__PURE__ */ React.createElement(
    "select",
    {
      value: selectedSizeFilter,
      onChange: (e) => {
        setSelectedSizeFilter(e.target.value);
        setCatalogPage(1);
      },
      className: "w-full bg-white border border-taupe/30 px-3 py-2 text-xs text-noir focus:border-caramel"
    },
    /* @__PURE__ */ React.createElement("option", { value: "all" }, lang === "ar" ? "\u062C\u0645\u064A\u0639 \u0627\u0644\u0645\u0642\u0627\u0633\u0627\u062A" : "Toutes les tailles / pointures"),
    availableFilterSizes.map((sz) => /* @__PURE__ */ React.createElement("option", { key: sz, value: sz }, sz))
  )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-[10px] font-bold uppercase tracking-wider text-taupe-dark mb-1" }, lang === "ar" ? "\u0627\u0644\u0644\u0648\u0646" : "Couleur"), /* @__PURE__ */ React.createElement(
    "select",
    {
      value: selectedColorFilter,
      onChange: (e) => {
        setSelectedColorFilter(e.target.value);
        setCatalogPage(1);
      },
      className: "w-full bg-white border border-taupe/30 px-3 py-2 text-xs text-noir focus:border-caramel"
    },
    /* @__PURE__ */ React.createElement("option", { value: "all" }, lang === "ar" ? "\u062C\u0645\u064A\u0639 \u0627\u0644\u0623\u0644\u0648\u0627\u0646" : "Toutes les couleurs"),
    availableFilterColors.map((colObj) => /* @__PURE__ */ React.createElement("option", { key: colObj.key, value: colObj.labelFr }, lang === "ar" ? colObj.labelAr : colObj.labelFr))
  )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-[10px] font-bold uppercase tracking-wider text-taupe-dark mb-1" }, lang === "ar" ? "\u0627\u0644\u0645\u064A\u0632\u0627\u0646\u064A\u0629 (\u062F\u0631\u0647\u0645)" : "Budget / Prix (MAD)"), /* @__PURE__ */ React.createElement(
    "select",
    {
      value: priceRangeFilter,
      onChange: (e) => {
        setPriceRangeFilter(e.target.value);
        setCatalogPage(1);
      },
      className: "w-full bg-white border border-taupe/30 px-3 py-2 text-xs text-noir focus:border-caramel"
    },
    /* @__PURE__ */ React.createElement("option", { value: "all" }, lang === "ar" ? "\u062C\u0645\u064A\u0639 \u0627\u0644\u0623\u0633\u0639\u0627\u0631" : "Tous les prix"),
    /* @__PURE__ */ React.createElement("option", { value: "under300" }, lang === "ar" ? "\u0623\u0642\u0644 \u0645\u0646 300 \u062F\u0631\u0647\u0645" : "Moins de 300 MAD"),
    /* @__PURE__ */ React.createElement("option", { value: "300to500" }, lang === "ar" ? "\u0628\u064A\u0646 300 \u0648 500 \u062F\u0631\u0647\u0645" : "300 MAD \xE0 500 MAD"),
    /* @__PURE__ */ React.createElement("option", { value: "over500" }, lang === "ar" ? "\u0623\u0643\u062B\u0631 \u0645\u0646 500 \u062F\u0631\u0647\u0645" : "Plus de 500 MAD")
  )), /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between sm:justify-end gap-2" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: resetAllCatalogFilters,
      className: "w-full sm:w-auto px-3.5 py-2 bg-white hover:bg-noir text-noir hover:text-white border border-taupe/30 text-xs font-semibold uppercase tracking-wider transition-colors"
    },
    lang === "ar" ? "\u0625\u0639\u0627\u062F\u0629 \u0636\u0628\u0637 \u0627\u0644\u0641\u0644\u0627\u062A\u0631 \u21BA" : "R\xE9initialiser les filtres \u21BA"
  )))), loadingProducts ? /* @__PURE__ */ React.createElement("div", { className: "py-24 text-center text-taupe-dark" }, /* @__PURE__ */ React.createElement("div", { className: "animate-spin w-8 h-8 border-2 border-caramel border-t-transparent rounded-full mx-auto mb-4" }), /* @__PURE__ */ React.createElement("p", { className: "text-xs uppercase tracking-widest" }, "Chargement des cr\xE9ations...")) : filteredProducts.length === 0 ? /* @__PURE__ */ React.createElement("div", { className: "py-20 text-center bg-card border border-taupe/15 p-8" }, /* @__PURE__ */ React.createElement("p", { className: "font-serif text-2xl text-taupe-dark mb-2" }, "Aucun essentiel ne correspond \xE0 votre recherche."), /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap items-center justify-center gap-3 mt-4" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: resetAllCatalogFilters,
      className: "px-4 py-2 bg-noir text-white text-xs font-semibold uppercase tracking-wider hover:bg-caramel transition-colors"
    },
    "R\xE9initialiser les filtres"
  ), !isProductsPage && /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => navigateToProductsPage(),
      className: "px-4 py-2 border border-noir text-noir text-xs font-semibold uppercase tracking-wider hover:bg-noir hover:text-white transition-colors"
    },
    "Voir tous les produits du catalogue (",
    products.length,
    ") \u2192"
  ))) : /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(
    "div",
    {
      className: `grid gap-2.5 sm:gap-6 lg:gap-8 ${gridCols === 1 ? "grid-cols-1 max-w-xl mx-auto" : gridCols === 2 ? "grid-cols-2" : "grid-cols-2 md:grid-cols-2 lg:grid-cols-3"}`
    },
    paginatedCatalogProducts.map((product, idx) => {
      const prodNumber = startCatalogIdx + idx + 1;
      const isWish = wishlist.includes(product.id);
      const isOut = !product.inStock || product.stock <= 0;
      const isLow = product.stock > 0 && product.stock < 5;
      const hasVideo = Boolean(product.videoUrl && String(product.videoUrl).trim());
      const title = lang === "ar" ? product.nameAr || product.nameFr : product.nameFr;
      const desc = lang === "ar" ? product.descAr || product.descFr : product.descFr;
      const imagesArr = Array.isArray(product.images) && product.images.length > 0 ? product.images : [""];
      const activeCardImgIdx = (cardImageIdxMap[product.id] || 0) % imagesArr.length;
      const stepCardImage = (e, dir) => {
        if (e && e.stopPropagation) e.stopPropagation();
        if (imagesArr.length <= 1) return;
        setCardImageIdxMap((prev) => {
          const cur = prev[product.id] || 0;
          const next = (cur + dir + imagesArr.length) % imagesArr.length;
          return { ...prev, [product.id]: next };
        });
      };
      return /* @__PURE__ */ React.createElement(
        "div",
        {
          key: product.id,
          className: "group flex flex-col bg-card border border-taupe/20 transition-all duration-300 hover:border-taupe/50 hover:shadow-md hover:-translate-y-1"
        },
        /* @__PURE__ */ React.createElement(
          "div",
          {
            onClick: () => navigateToProduct(product.id),
            onTouchStart: (e) => {
              if (e.touches && e.touches[0]) {
                cardTouchStartX.current[product.id] = e.touches[0].clientX;
              }
            },
            onTouchEnd: (e) => {
              const startX = cardTouchStartX.current[product.id];
              if (startX == null || !e.changedTouches || !e.changedTouches[0]) return;
              const deltaX = e.changedTouches[0].clientX - startX;
              cardTouchStartX.current[product.id] = null;
              if (Math.abs(deltaX) > 35 && imagesArr.length > 1) {
                e.stopPropagation();
                stepCardImage(null, deltaX > 0 ? -1 : 1);
              }
            },
            className: "relative aspect-[3/4] w-full bg-[#F7F5F0] overflow-hidden cursor-pointer rounded-xs p-1.5 sm:p-3 flex items-center justify-center select-none"
          },
          /* @__PURE__ */ React.createElement(
            "img",
            {
              src: imagesArr[activeCardImgIdx] || imagesArr[0],
              alt: title,
              referrerPolicy: "no-referrer",
              className: "w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
            }
          ),
          imagesArr.length > 1 && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(
            "button",
            {
              type: "button",
              onClick: (e) => stepCardImage(e, -1),
              className: "absolute start-1 sm:start-2 top-1/2 -translate-y-1/2 z-20 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white/90 hover:bg-noir text-noir hover:text-white border border-taupe/30 shadow-sm flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95",
              title: "Photo pr\xE9c\xE9dente",
              "aria-label": "Photo pr\xE9c\xE9dente"
            },
            /* @__PURE__ */ React.createElement("svg", { className: "w-3 h-3 sm:w-4 sm:h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" }, /* @__PURE__ */ React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2.2", d: "M15 19l-7-7 7-7" }))
          ), /* @__PURE__ */ React.createElement(
            "button",
            {
              type: "button",
              onClick: (e) => stepCardImage(e, 1),
              className: "absolute end-1 sm:end-2 top-1/2 -translate-y-1/2 z-20 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white/90 hover:bg-noir text-noir hover:text-white border border-taupe/30 shadow-sm flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95",
              title: "Photo suivante",
              "aria-label": "Photo suivante"
            },
            /* @__PURE__ */ React.createElement("svg", { className: "w-3 h-3 sm:w-4 sm:h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" }, /* @__PURE__ */ React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2.2", d: "M9 5l7 7-7 7" }))
          )),
          /* @__PURE__ */ React.createElement("div", { className: "absolute top-1.5 start-1.5 sm:top-3 sm:start-3 flex flex-col gap-1 z-10 pointer-events-none" }, isOut ? /* @__PURE__ */ React.createElement("span", { className: "bg-noir/90 text-white text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 uppercase tracking-wider" }, t.badge_out) : product.badge === "exclusive" ? /* @__PURE__ */ React.createElement("span", { className: "bg-caramel text-white text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 uppercase tracking-wider" }, t.badge_exclusive) : product.badge === "luxury" ? /* @__PURE__ */ React.createElement("span", { className: "bg-[#4A3525] text-white text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 uppercase tracking-wider" }, t.badge_luxury) : product.isNew ? /* @__PURE__ */ React.createElement("span", { className: "bg-noir text-white text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 uppercase tracking-wider" }, t.badge_new) : null, hasVideo && /* @__PURE__ */ React.createElement("span", { className: "bg-noir/85 text-[#E6C687] text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 uppercase tracking-wider flex items-center gap-1" }, /* @__PURE__ */ React.createElement("span", null, "\u25B6"), /* @__PURE__ */ React.createElement("span", null, lang === "ar" ? "\u0641\u064A\u062F\u064A\u0648" : "Vid\xE9o"))),
          imagesArr.length > 1 && /* @__PURE__ */ React.createElement(
            "div",
            {
              onClick: (e) => e.stopPropagation(),
              className: "absolute bottom-1.5 inset-x-1.5 sm:bottom-3 sm:inset-x-3 flex items-center justify-between z-10 pointer-events-auto"
            },
            /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-1 bg-black/55 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-xs backdrop-blur-xs" }, imagesArr.map((_, dIdx) => /* @__PURE__ */ React.createElement(
              "button",
              {
                key: dIdx,
                type: "button",
                onClick: (e) => {
                  e.stopPropagation();
                  setCardImageIdxMap((prev) => ({ ...prev, [product.id]: dIdx }));
                },
                className: `h-1 sm:h-1.5 rounded-full transition-all ${activeCardImgIdx === dIdx ? "w-2.5 sm:w-3.5 bg-caramel" : "w-1 sm:w-1.5 bg-white/60 hover:bg-white"}`,
                "aria-label": `Photo ${dIdx + 1}`
              }
            ))),
            /* @__PURE__ */ React.createElement("span", { className: "bg-black/65 text-white text-[9px] sm:text-[10px] px-1.5 py-0.5 backdrop-blur-xs font-mono tabular-nums rounded-xs" }, activeCardImgIdx + 1, "/", imagesArr.length)
          ),
          /* @__PURE__ */ React.createElement("div", { className: "absolute top-1.5 end-1.5 sm:top-3 sm:end-3 flex items-center gap-1 sm:gap-1.5 z-10" }, /* @__PURE__ */ React.createElement(
            "button",
            {
              type: "button",
              onClick: (e) => {
                e.stopPropagation();
                const url = `${window.location.origin}/produit/${getProductSlug(product)}`;
                try {
                  navigator.clipboard.writeText(url);
                  showToast(t.product_link_copied, "success");
                } catch {
                  showToast(url, "info");
                }
              },
              className: "w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white/85 hover:bg-white flex items-center justify-center transition-all duration-200 shadow-xs hover:scale-110 active:scale-90 text-noir/70 hover:text-caramel",
              title: "Copier le lien direct client",
              "aria-label": "Copier le lien client"
            },
            /* @__PURE__ */ React.createElement("svg", { className: "w-3 h-3 sm:w-3.5 sm:h-3.5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" }, /* @__PURE__ */ React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" }))
          ), /* @__PURE__ */ React.createElement(
            "button",
            {
              type: "button",
              onClick: (e) => {
                e.stopPropagation();
                toggleWishlist(product.id);
              },
              className: "w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white/85 hover:bg-white flex items-center justify-center transition-all duration-200 shadow-xs hover:scale-110 active:scale-90",
              "aria-label": "Wishlist"
            },
            /* @__PURE__ */ React.createElement(
              "svg",
              {
                className: `w-3.5 h-3.5 sm:w-4 sm:h-4 transition-colors ${isWish ? "fill-caramel text-caramel animate-heart-pop" : "text-noir/60 hover:text-noir"}`,
                viewBox: "0 0 24 24",
                stroke: "currentColor",
                strokeWidth: "1.75"
              },
              /* @__PURE__ */ React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" })
            )
          ))
        ),
        /* @__PURE__ */ React.createElement("div", { className: "p-2.5 sm:p-6 flex flex-col flex-1" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between text-[9px] sm:text-[11px] text-taupe-dark uppercase tracking-wider mb-1 sm:mb-2" }, /* @__PURE__ */ React.createElement("span", { className: "truncate" }, product.category), /* @__PURE__ */ React.createElement("span", { className: "text-caramel font-semibold shrink-0" }, "\u2605 ", product.rating || 5, ".0")), /* @__PURE__ */ React.createElement(
          "h3",
          {
            onClick: () => navigateToProduct(product.id),
            className: "font-serif text-sm sm:text-xl font-semibold text-noir mb-1 sm:mb-2 group-hover:text-caramel transition-colors cursor-pointer line-clamp-1 sm:line-clamp-2 leading-snug"
          },
          title
        ), /* @__PURE__ */ React.createElement("p", { className: "hidden sm:block text-xs text-taupe-dark line-clamp-2 leading-relaxed mb-4 flex-1" }, desc), isLow && /* @__PURE__ */ React.createElement("p", { className: "text-[9px] sm:text-[11px] font-semibold text-[#B91C1C] mb-1.5 sm:mb-3 flex items-center" }, /* @__PURE__ */ React.createElement("span", { className: "animate-flame me-1 inline-block" }, "\u{1F525}"), /* @__PURE__ */ React.createElement("span", { className: "truncate" }, t.low_stock_alert.replace("\u{1F525} ", "").replace("{n}", product.stock))), /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap items-baseline gap-1.5 sm:gap-2.5 mb-2.5 sm:mb-5 pt-1.5 sm:pt-2 border-t border-taupe/15 mt-auto" }, /* @__PURE__ */ React.createElement("span", { className: "font-semibold text-xs sm:text-lg text-noir tabular-nums" }, Number(product.price).toLocaleString(), " MAD"), product.oldPrice && /* @__PURE__ */ React.createElement("span", { className: "text-[10px] sm:text-xs text-taupe line-through tabular-nums" }, Number(product.oldPrice).toLocaleString(), " MAD")), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-2 gap-1.5 sm:gap-2" }, /* @__PURE__ */ React.createElement(
          "button",
          {
            type: "button",
            onClick: () => navigateToProduct(product.id),
            className: "px-1.5 py-2 sm:px-3 sm:py-2.5 border border-taupe/30 text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-noir hover:border-noir hover:bg-noir hover:text-white transition-all flex items-center justify-center gap-1 whitespace-nowrap",
            title: "Ouvrir la page d\xE9di\xE9e avec lien direct"
          },
          /* @__PURE__ */ React.createElement("span", null, t.admin_view_product || "Voir"),
          /* @__PURE__ */ React.createElement("span", { className: "hidden sm:inline text-[10px]" }, "\u2192")
        ), /* @__PURE__ */ React.createElement(
          "button",
          {
            type: "button",
            disabled: isOut,
            onClick: () => addToCart(product),
            className: `px-1.5 py-2 sm:px-3 sm:py-2.5 text-[10px] sm:text-xs font-semibold uppercase tracking-wider transition-all duration-150 truncate ${isOut ? "bg-taupe/20 text-taupe-dark cursor-not-allowed" : "bg-noir text-white hover:bg-caramel active:scale-95 shadow-xs"}`
          },
          isOut ? t.out_of_stock : t.add_to_cart
        )))
      );
    })
  ), filteredProducts.length > 0 && /* @__PURE__ */ React.createElement("div", { className: "mt-10 pt-6 border-t border-taupe/20 flex flex-col sm:flex-row items-center justify-between gap-4" }, /* @__PURE__ */ React.createElement("div", { className: "text-xs text-taupe-dark" }, "Affichage des produits ", /* @__PURE__ */ React.createElement("span", { className: "font-bold text-noir" }, startCatalogIdx + 1), " \xE0", " ", /* @__PURE__ */ React.createElement("span", { className: "font-bold text-noir" }, Math.min(startCatalogIdx + CATALOG_PER_PAGE, filteredProducts.length)), " sur", " ", /* @__PURE__ */ React.createElement("span", { className: "font-bold text-noir" }, filteredProducts.length), " (Page ", safeCatalogPage, " sur ", totalCatalogPages, ")"), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-1.5 flex-wrap justify-center" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: () => {
        setCatalogPage(Math.max(1, safeCatalogPage - 1));
        const el = document.getElementById("collection");
        if (el) el.scrollIntoView({ behavior: "smooth" });
      },
      disabled: safeCatalogPage <= 1,
      className: `px-3.5 py-2 text-xs font-semibold rounded-xs border transition-colors ${safeCatalogPage <= 1 ? "bg-canvas text-taupe border-taupe/20 cursor-not-allowed opacity-60" : "bg-card text-noir border-taupe/30 hover:border-noir"}`
    },
    "\u2190 Pr\xE9c\xE9dent"
  ), Array.from({ length: totalCatalogPages }, (_, i) => i + 1).map((pNum) => /* @__PURE__ */ React.createElement(
    "button",
    {
      key: pNum,
      type: "button",
      onClick: () => {
        setCatalogPage(pNum);
        const el = document.getElementById("collection");
        if (el) el.scrollIntoView({ behavior: "smooth" });
      },
      className: `w-9 h-9 text-xs font-bold rounded-xs border transition-colors tabular-nums ${safeCatalogPage === pNum ? "bg-noir text-white border-noir shadow-xs" : "bg-card text-noir border-taupe/30 hover:border-caramel hover:text-caramel"}`
    },
    pNum
  )), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: () => {
        setCatalogPage(Math.min(totalCatalogPages, safeCatalogPage + 1));
        const el = document.getElementById("collection");
        if (el) el.scrollIntoView({ behavior: "smooth" });
      },
      disabled: safeCatalogPage >= totalCatalogPages,
      className: `px-3.5 py-2 text-xs font-semibold rounded-xs border transition-colors ${safeCatalogPage >= totalCatalogPages ? "bg-canvas text-taupe border-taupe/20 cursor-not-allowed opacity-60" : "bg-card text-noir border-taupe/30 hover:border-noir"}`
    },
    "Suivant \u2192"
  ))), !isProductsPage && /* @__PURE__ */ React.createElement("div", { className: "mt-10 text-center" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: () => navigateToProductsPage(),
      className: "inline-flex items-center gap-3 px-7 py-3.5 bg-noir hover:bg-caramel text-white text-xs font-semibold uppercase tracking-[0.18em] transition-colors shadow-sm"
    },
    /* @__PURE__ */ React.createElement("span", null, lang === "ar" ? "\u0627\u0633\u062A\u0643\u0634\u0641 \u062C\u0645\u064A\u0639 \u0627\u0644\u0645\u0646\u062A\u062C\u0627\u062A \u0645\u0639 \u0627\u0644\u0641\u0644\u0627\u062A\u0631" : "Explorer Tous les Produits & Filtres"),
    /* @__PURE__ */ React.createElement("span", null, "\u2192")
  )))), !isProductsPage && /* @__PURE__ */ React.createElement("section", { id: "savoir-faire", className: "py-20 sm:py-28 bg-[#F3EFEA] border-y border-taupe/20" }, /* @__PURE__ */ React.createElement("div", { className: "max-w-6xl mx-auto px-4 sm:px-6 lg:px-8" }, /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { className: "text-xs font-bold tracking-[0.2em] uppercase text-caramel block mb-3" }, cms.storyBadge || "H\xC9RITAGE & MATI\xC8RES"), /* @__PURE__ */ React.createElement("h2", { className: "font-serif italic text-3xl sm:text-5xl text-noir font-normal mb-6 leading-tight" }, cms.storyTitle || t.craft_title), /* @__PURE__ */ React.createElement("p", { className: "text-sm sm:text-base text-taupe-dark leading-relaxed mb-4" }, cms.storyText1 || t.craft_desc_1), /* @__PURE__ */ React.createElement("p", { className: "text-sm sm:text-base text-taupe-dark leading-relaxed mb-8" }, cms.storyText2 || t.craft_desc_2), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-3 gap-4 pt-6 border-t border-taupe/25" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "font-serif text-2xl sm:text-3xl font-bold text-noir" }, t.craft_stat_1_val), /* @__PURE__ */ React.createElement("div", { className: "text-[11px] text-taupe-dark uppercase tracking-wider mt-1" }, t.craft_stat_1_lbl)), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "font-serif text-2xl sm:text-3xl font-bold text-noir" }, t.craft_stat_2_val), /* @__PURE__ */ React.createElement("div", { className: "text-[11px] text-taupe-dark uppercase tracking-wider mt-1" }, t.craft_stat_2_lbl)), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "font-serif text-2xl sm:text-3xl font-bold text-noir" }, t.craft_stat_3_val), /* @__PURE__ */ React.createElement("div", { className: "text-[11px] text-taupe-dark uppercase tracking-wider mt-1" }, t.craft_stat_3_lbl)))), /* @__PURE__ */ React.createElement("div", { className: "relative aspect-4/3 bg-[#EAE4DC] border border-taupe/30 overflow-hidden shadow-sm flex items-center justify-center" }, cms.storyImage && !cms.storyImage.includes("svg") ? /* @__PURE__ */ React.createElement(
    "img",
    {
      src: cms.storyImage,
      alt: "Atelier MODANOVA",
      className: "w-full h-full object-cover transition-transform duration-700 hover:scale-105"
    }
  ) : /* @__PURE__ */ React.createElement("div", { className: "p-8 w-full h-full flex items-center justify-center" }, /* @__PURE__ */ React.createElement("svg", { className: "w-full h-full max-h-80", viewBox: "0 0 600 450", fill: "none", xmlns: "http://www.w3.org/2000/svg" }, /* @__PURE__ */ React.createElement("rect", { width: "600", height: "450", fill: "#EAE4DC" }), /* @__PURE__ */ React.createElement("g", { className: "animate-spin-slow", style: { transformOrigin: "300px 225px" } }, /* @__PURE__ */ React.createElement("circle", { cx: "300", cy: "225", r: "160", stroke: "#9E8C7A", strokeWidth: "1.5", strokeDasharray: "6 6" })), /* @__PURE__ */ React.createElement("circle", { cx: "300", cy: "225", r: "130", fill: "#FAF9F6", stroke: "#9E8C7A", strokeWidth: "2" }), /* @__PURE__ */ React.createElement("path", { d: "M220 180C250 140 350 140 380 180C400 210 390 270 300 290C210 270 200 210 220 180Z", fill: "#3D2B1F" }), /* @__PURE__ */ React.createElement("path", { d: "M250 190C270 165 330 165 350 190C360 210 340 240 300 250C260 240 240 210 250 190Z", fill: "#634731" }), /* @__PURE__ */ React.createElement("text", { x: "300", y: "340", "font-family": "'Cormorant Garamond', serif", "font-size": "22", fill: "#171717", "text-anchor": "middle", "letter-spacing": "4" }, "MODANOVA"), /* @__PURE__ */ React.createElement("text", { x: "300", y: "365", "font-family": "'Plus Jakarta Sans', sans-serif", "font-size": "11", fill: "#9E8C7A", "text-anchor": "middle", "letter-spacing": "3" }, "KENITRA & MAROC"))))))), !isProductsPage && /* @__PURE__ */ React.createElement("section", { id: "temoignages", className: "py-20 sm:py-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full" }, /* @__PURE__ */ React.createElement("div", { className: "text-center max-w-2xl mx-auto mb-16" }, /* @__PURE__ */ React.createElement("span", { className: "text-xs font-bold tracking-[0.2em] uppercase text-caramel block mb-2" }, "CONFIANCE & RETOURS"), /* @__PURE__ */ React.createElement("h2", { className: "font-serif text-3xl sm:text-4xl text-noir font-normal mb-3" }, t.testim_title), /* @__PURE__ */ React.createElement("p", { className: "text-sm text-taupe-dark" }, t.testim_subtitle)), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-8" }, testimonials.map((item, idx) => /* @__PURE__ */ React.createElement("div", { key: item.id || idx, className: "bg-card border border-taupe/20 p-8 flex flex-col justify-between hover:border-caramel/40 transition-colors shadow-xs" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between mb-4" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-1 text-caramel text-sm" }, "\u2605".repeat(item.rating || 5)), item.verified !== false && /* @__PURE__ */ React.createElement("span", { className: "text-[10px] bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0] px-2 py-0.5 rounded-xs font-semibold" }, "\u2713 ", lang === "ar" ? "\u0637\u0644\u0628 \u0645\u0648\u062B\u0642" : "Achat v\xE9rifi\xE9")), /* @__PURE__ */ React.createElement("p", { className: "text-sm text-noir/90 leading-relaxed font-light italic mb-6" }, '"', item.text, '"')), /* @__PURE__ */ React.createElement("div", { className: "pt-4 border-t border-taupe/20 flex items-center justify-between" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "text-sm font-semibold text-noir" }, item.name), /* @__PURE__ */ React.createElement("div", { className: "text-xs text-taupe-dark" }, "\u{1F4CD} ", item.city || "Maroc")), item.date && /* @__PURE__ */ React.createElement("div", { className: "text-[10px] text-taupe-dark font-mono" }, item.date))))))), /* @__PURE__ */ React.createElement("footer", { className: "mt-auto bg-noir text-canvas pt-16 pb-12 border-t border-taupe/20" }, /* @__PURE__ */ React.createElement("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" }, /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-white/10" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { className: "font-serif text-2xl font-bold tracking-[0.2em] text-white uppercase block mb-2" }, t.brand), /* @__PURE__ */ React.createElement("span", { className: "text-[10px] tracking-[0.25em] text-caramel uppercase block mb-4" }, t.tagline), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-white/60 leading-relaxed font-light" }, t.footer_desc)), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h4", { className: "text-xs font-bold uppercase tracking-wider text-caramel mb-4" }, t.footer_nav), /* @__PURE__ */ React.createElement("ul", { className: "space-y-2.5 text-xs text-white/70" }, /* @__PURE__ */ React.createElement("li", null, /* @__PURE__ */ React.createElement("a", { href: "#collection", className: "hover:text-white transition-colors" }, t.nav_collection)), /* @__PURE__ */ React.createElement("li", null, /* @__PURE__ */ React.createElement("a", { href: "#savoir-faire", className: "hover:text-white transition-colors" }, t.nav_craft)), /* @__PURE__ */ React.createElement("li", null, /* @__PURE__ */ React.createElement("a", { href: "#temoignages", className: "hover:text-white transition-colors" }, t.nav_testimonials)), /* @__PURE__ */ React.createElement("li", null, /* @__PURE__ */ React.createElement("button", { onClick: () => setTrackingOpen(true), className: "hover:text-white transition-colors text-start" }, t.nav_tracking)), /* @__PURE__ */ React.createElement("li", null, /* @__PURE__ */ React.createElement("button", { onClick: () => setAdminOpen(true), className: "hover:text-white transition-colors text-start text-white/40" }, t.nav_admin, " (Ctrl+Shift+A)")))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h4", { className: "text-xs font-bold uppercase tracking-wider text-caramel mb-4" }, t.footer_contact), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-white/70 leading-relaxed mb-3" }, "Atelier & Support : Kenitra, Maroc"), /* @__PURE__ */ React.createElement(
    "a",
    {
      href: "https://wa.me/212600773716",
      target: "_blank",
      rel: "noopener noreferrer",
      className: "inline-flex items-center gap-2 text-xs text-white/90 hover:text-whatsapp font-medium transition-colors"
    },
    /* @__PURE__ */ React.createElement(WhatsAppIcon, { className: "w-4 h-4 fill-[#25D366] shrink-0" }),
    /* @__PURE__ */ React.createElement("span", null, "WhatsApp Support : +212 600-773716")
  )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h4", { className: "text-xs font-bold uppercase tracking-wider text-caramel mb-4" }, "PAIEMENT & LIVRAISON"), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-white/70 leading-relaxed mb-3" }, t.footer_terms), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2 text-xs text-white/50" }, /* @__PURE__ */ React.createElement("span", null, "\u2713 Casablanca / Rabat (24h)"), /* @__PURE__ */ React.createElement("span", null, "\u2022"), /* @__PURE__ */ React.createElement("span", null, "Autres villes (48-72h)")))), /* @__PURE__ */ React.createElement("div", { className: "pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-white/40 gap-4" }, /* @__PURE__ */ React.createElement("div", null, "\xA9 ", (/* @__PURE__ */ new Date()).getFullYear(), " MODANOVA Men's Essentials. ", t.footer_rights), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-4" }, /* @__PURE__ */ React.createElement("span", null, "Fait avec exigence au Maroc"))))), /* @__PURE__ */ React.createElement("div", { className: "fixed bottom-6 end-6 z-40 flex items-center gap-2.5" }, /* @__PURE__ */ React.createElement(
    "a",
    {
      href: "https://wa.me/212600773716?text=Bonjour%20MODANOVA,%20j%27aimerais%20avoir%20des%20renseignements",
      target: "_blank",
      rel: "noopener noreferrer",
      className: "hidden sm:inline-flex items-center gap-2 bg-[#141210]/95 backdrop-blur-md text-white text-xs font-medium py-2.5 px-4 rounded-full border border-caramel/30 shadow-xl hover:border-whatsapp/60 transition-all duration-300 hover:scale-105 active:scale-95 group"
    },
    /* @__PURE__ */ React.createElement("span", { className: "w-2 h-2 rounded-full bg-[#25D366] animate-pulse" }),
    /* @__PURE__ */ React.createElement("span", { className: "tracking-wide text-[11px] uppercase text-white/90 group-hover:text-white" }, "Support WhatsApp")
  ), /* @__PURE__ */ React.createElement(
    "a",
    {
      href: "https://wa.me/212600773716?text=Bonjour%20MODANOVA,%20j%27aimerais%20avoir%20des%20renseignements",
      target: "_blank",
      rel: "noopener noreferrer",
      "aria-label": "Discuter directement sur WhatsApp",
      title: "Contacter le support MODANOVA sur WhatsApp",
      className: "bg-[#25D366] hover:bg-[#20ba5a] text-white p-3.5 rounded-full shadow-[0_4px_24px_rgba(37,211,102,0.45)] hover:scale-110 active:scale-95 transition-all duration-200 flex items-center justify-center animate-beacon"
    },
    /* @__PURE__ */ React.createElement(WhatsAppIcon, { className: "w-7 h-7 fill-white shrink-0" })
  )), /* @__PURE__ */ React.createElement("div", { className: "fixed bottom-6 start-6 z-50 flex flex-col gap-2 max-w-sm pointer-events-none" }, toasts.map((toast) => /* @__PURE__ */ React.createElement(
    "div",
    {
      key: toast.id,
      className: "pointer-events-auto bg-noir text-canvas px-4 py-3 text-xs font-medium shadow-md border-s-4 border-caramel flex items-center justify-between gap-3 animate-slide-up"
    },
    /* @__PURE__ */ React.createElement("span", null, toast.msg),
    /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => setToasts((prev) => prev.filter((t2) => t2.id !== toast.id)),
        className: "text-white/60 hover:text-white"
      },
      "\u2715"
    )
  ))), mobileDrawerOpen && /* @__PURE__ */ React.createElement("div", { className: "fixed inset-0 z-50 flex" }, /* @__PURE__ */ React.createElement(
    "div",
    {
      className: "fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity",
      onClick: () => setMobileDrawerOpen(false)
    }
  ), /* @__PURE__ */ React.createElement("div", { className: "relative w-full max-w-[80vw] bg-canvas h-full shadow-2xl flex flex-col p-6 z-10 overflow-y-auto" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between pb-6 border-b border-taupe/20" }, /* @__PURE__ */ React.createElement("span", { className: "font-serif text-2xl font-bold tracking-widest text-noir" }, t.brand), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setMobileDrawerOpen(false),
      className: "p-2 text-taupe-dark hover:text-noir",
      "aria-label": "Fermer"
    },
    "\u2715"
  )), /* @__PURE__ */ React.createElement("div", { className: "py-6 border-b border-taupe/20" }, /* @__PURE__ */ React.createElement("div", { className: "text-[11px] font-bold text-taupe-dark uppercase tracking-wider mb-3" }, "LANGUE / \u0627\u0644\u0644\u063A\u0629"), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-2 gap-2" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => {
        setLang("fr");
        setMobileDrawerOpen(false);
      },
      className: `py-2 text-xs font-semibold rounded border ${lang === "fr" ? "border-noir bg-noir text-white" : "border-taupe/30 text-noir"}`
    },
    "Fran\xE7ais"
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => {
        setLang("ar");
        setMobileDrawerOpen(false);
      },
      className: `py-2 text-xs font-semibold rounded border ${lang === "ar" ? "border-noir bg-noir text-white" : "border-taupe/30 text-noir"}`
    },
    "\u0627\u0644\u0639\u0631\u0628\u064A\u0629"
  ))), /* @__PURE__ */ React.createElement("div", { className: "py-6 border-b border-taupe/20 space-y-4" }, /* @__PURE__ */ React.createElement("div", { className: "text-[11px] font-bold text-taupe-dark uppercase tracking-wider mb-2" }, "NAVIGATION"), /* @__PURE__ */ React.createElement(
    "a",
    {
      href: "/",
      onClick: (e) => {
        e.preventDefault();
        setMobileDrawerOpen(false);
        backToHome();
      },
      className: `block text-base font-medium ${!isProductsPage && !selectedProductId ? "text-caramel font-semibold" : "text-noir hover:text-caramel"}`
    },
    lang === "ar" ? "\u0627\u0644\u0631\u0626\u064A\u0633\u064A\u0629 (Accueil)" : "Accueil (Page Principale)"
  ), /* @__PURE__ */ React.createElement(
    "a",
    {
      href: "/produits",
      onClick: (e) => {
        e.preventDefault();
        setMobileDrawerOpen(false);
        navigateToProductsPage();
      },
      className: `block text-base font-medium ${isProductsPage && !selectedProductId ? "text-caramel font-semibold" : "text-noir hover:text-caramel"}`
    },
    lang === "ar" ? `\u062C\u0645\u064A\u0639 \u0627\u0644\u0645\u0646\u062A\u062C\u0627\u062A \u0648\u0627\u0644\u0641\u0644\u062A\u0631\u0629 (${products.length})` : `Tous les Produits & Filtres (${products.length})`
  ), /* @__PURE__ */ React.createElement(
    "a",
    {
      href: "#savoir-faire",
      onClick: (e) => {
        setMobileDrawerOpen(false);
        if (isProductsPage || selectedProductId) {
          e.preventDefault();
          backToHome();
          setTimeout(() => {
            const el = document.getElementById("savoir-faire");
            if (el) el.scrollIntoView({ behavior: "smooth" });
          }, 60);
        }
      },
      className: "block text-base font-medium text-noir hover:text-caramel"
    },
    t.nav_craft
  ), /* @__PURE__ */ React.createElement(
    "a",
    {
      href: "#temoignages",
      onClick: (e) => {
        setMobileDrawerOpen(false);
        if (isProductsPage || selectedProductId) {
          e.preventDefault();
          backToHome();
          setTimeout(() => {
            const el = document.getElementById("temoignages");
            if (el) el.scrollIntoView({ behavior: "smooth" });
          }, 60);
        }
      },
      className: "block text-base font-medium text-noir hover:text-caramel"
    },
    t.nav_testimonials
  )), /* @__PURE__ */ React.createElement("div", { className: "py-6 space-y-3" }, /* @__PURE__ */ React.createElement("div", { className: "text-[11px] font-bold text-taupe-dark uppercase tracking-wider mb-2" }, "SERVICES"), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => {
        setMobileDrawerOpen(false);
        setTrackingOpen(true);
      },
      className: "w-full text-start text-sm font-medium text-noir hover:text-caramel py-1 flex items-center justify-between"
    },
    /* @__PURE__ */ React.createElement("span", null, t.nav_tracking),
    /* @__PURE__ */ React.createElement("span", null, "\u2192")
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => {
        setMobileDrawerOpen(false);
        setCartOpen(true);
      },
      className: "w-full text-start text-sm font-medium text-noir hover:text-caramel py-1 flex items-center justify-between"
    },
    /* @__PURE__ */ React.createElement("span", null, t.nav_cart, " (", cartTotals.itemCount, ")"),
    /* @__PURE__ */ React.createElement("span", null, "\u2192")
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => {
        setMobileDrawerOpen(false);
        openAdminPanel();
      },
      className: "w-full text-start text-sm font-medium text-taupe-dark hover:text-noir py-1 flex items-center justify-between"
    },
    /* @__PURE__ */ React.createElement("span", null, t.nav_admin),
    /* @__PURE__ */ React.createElement("span", null, "\u{1F512}")
  )), /* @__PURE__ */ React.createElement("div", { className: "mt-auto pt-6 border-t border-taupe/20" }, /* @__PURE__ */ React.createElement(
    "a",
    {
      href: "https://wa.me/212600773716",
      target: "_blank",
      rel: "noopener noreferrer",
      className: "w-full py-3 bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 rounded-xs shadow-xs transition-colors"
    },
    /* @__PURE__ */ React.createElement(WhatsAppIcon, { className: "w-4 h-4 fill-white shrink-0" }),
    /* @__PURE__ */ React.createElement("span", null, "WhatsApp Support")
  )))), cartOpen && /* @__PURE__ */ React.createElement("div", { className: "fixed inset-0 z-50 flex justify-end" }, /* @__PURE__ */ React.createElement(
    "div",
    {
      className: "fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity",
      onClick: () => setCartOpen(false)
    }
  ), /* @__PURE__ */ React.createElement("div", { className: "relative w-full max-w-md bg-canvas h-full shadow-2xl flex flex-col z-10 overflow-hidden" }, /* @__PURE__ */ React.createElement("div", { className: "p-6 border-b border-taupe/20 flex items-center justify-between bg-card" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement("span", { className: "font-serif text-xl font-bold text-noir" }, t.cart_title), /* @__PURE__ */ React.createElement("span", { className: "text-xs text-taupe-dark" }, "(", cartTotals.itemCount, ")")), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setCartOpen(false),
      className: "p-1 text-taupe-dark hover:text-noir text-lg",
      "aria-label": "Fermer"
    },
    "\u2715"
  )), /* @__PURE__ */ React.createElement("div", { className: "bg-[#FAF6F0] px-4 py-2.5 border-b border-taupe/15 text-[11px] text-taupe-dark flex items-center justify-between gap-2" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-1.5 truncate" }, /* @__PURE__ */ React.createElement("span", null, "\u{1F69A}"), /* @__PURE__ */ React.createElement("span", { className: "truncate" }, t.cart_free_shipping)), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-1 text-[#065F46] font-semibold shrink-0 text-[10px]", title: "Votre s\xE9lection est conserv\xE9e sur cet appareil pour votre prochaine visite" }, /* @__PURE__ */ React.createElement("svg", { className: "w-3.5 h-3.5 text-[#10B981]", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" }, /* @__PURE__ */ React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M5 13l4 4L19 7" })), /* @__PURE__ */ React.createElement("span", null, lang === "ar" ? "\u0633\u0644\u0629 \u0645\u062D\u0641\u0648\u0638\u0629" : "Panier sauvegard\xE9"))), /* @__PURE__ */ React.createElement("div", { className: "flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 space-y-4" }, cart.length === 0 ? /* @__PURE__ */ React.createElement("div", { className: "text-center py-16 text-taupe-dark" }, /* @__PURE__ */ React.createElement("svg", { className: "w-12 h-12 mx-auto mb-3 text-taupe/40", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" }, /* @__PURE__ */ React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "1.5", d: "M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" })), /* @__PURE__ */ React.createElement("p", { className: "text-sm" }, t.cart_empty)) : cart.map((item, idx) => {
    const itemTitle = lang === "ar" ? item.nameAr || item.nameFr : item.nameFr;
    const isRecentlyAdded = item.lineKey === lastAddedLineKey;
    return /* @__PURE__ */ React.createElement(
      "div",
      {
        key: item.lineKey,
        style: { animationDelay: `${idx * 45}ms` },
        className: `flex items-start gap-3.5 pb-4 border-b border-taupe/15 animate-item-bounce transition-all duration-300 w-full max-w-full overflow-hidden ${isRecentlyAdded ? "bg-[#FAF6F0] p-2 rounded-xs border border-caramel/40 ring-1 ring-caramel/20" : ""}`
      },
      /* @__PURE__ */ React.createElement(
        "div",
        {
          className: "w-20 h-20 shrink-0 bg-[#F7F5F0] border border-taupe/20 overflow-hidden relative rounded-xs aspect-square p-1 flex items-center justify-center",
          style: { width: "80px", height: "80px", minWidth: "80px", minHeight: "80px", maxWidth: "80px", maxHeight: "80px" }
        },
        /* @__PURE__ */ React.createElement(
          "img",
          {
            src: item.image,
            alt: itemTitle,
            className: "w-full h-full object-contain block",
            loading: "lazy"
          }
        )
      ),
      /* @__PURE__ */ React.createElement("div", { className: "flex-1 min-w-0 flex flex-col justify-between self-stretch" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-start justify-between gap-2" }, /* @__PURE__ */ React.createElement("div", { className: "min-w-0 flex-1" }, /* @__PURE__ */ React.createElement("h4", { className: "text-sm font-semibold text-noir truncate leading-tight", title: itemTitle }, itemTitle), /* @__PURE__ */ React.createElement("div", { className: "text-[11px] text-taupe-dark mt-1 flex items-center gap-1.5 flex-wrap" }, item.size && /* @__PURE__ */ React.createElement("span", { className: "font-mono text-noir font-semibold" }, item.size), item.size && item.color && /* @__PURE__ */ React.createElement("span", { className: "text-taupe/40" }, "\xB7"), item.color && /* @__PURE__ */ React.createElement("span", { className: "inline-flex items-center gap-1" }, /* @__PURE__ */ React.createElement(
        "span",
        {
          className: "inline-block w-3 h-3 rounded-full border border-black/20 align-middle",
          style: { backgroundColor: getColorCss(item.color) },
          title: getColorLabel(item.color, lang)
        }
      ), /* @__PURE__ */ React.createElement("span", { className: "text-noir font-medium" }, getColorLabel(item.color, lang))))), /* @__PURE__ */ React.createElement(
        "button",
        {
          type: "button",
          onClick: () => removeFromCart(item.lineKey),
          className: "text-taupe hover:text-noir text-xs p-1 shrink-0 transition-colors",
          title: "Supprimer cet article",
          "aria-label": "Supprimer cet article"
        },
        "\u2715"
      )), /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between gap-2 mt-3 pt-1" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center border border-taupe/30 bg-card shrink-0" }, /* @__PURE__ */ React.createElement(
        "button",
        {
          type: "button",
          onClick: () => updateCartQty(item.lineKey, item.quantity - 1),
          className: "px-2.5 py-1 text-xs hover:bg-taupe/20 transition-colors",
          "aria-label": "Diminuer la quantit\xE9"
        },
        "-"
      ), /* @__PURE__ */ React.createElement("span", { className: "px-3 py-1 text-xs font-semibold tabular-nums min-w-6 text-center" }, item.quantity), /* @__PURE__ */ React.createElement(
        "button",
        {
          type: "button",
          onClick: () => updateCartQty(item.lineKey, item.quantity + 1),
          className: "px-2.5 py-1 text-xs hover:bg-taupe/20 transition-colors",
          disabled: item.quantity >= (item.stock || 99),
          "aria-label": "Augmenter la quantit\xE9"
        },
        "+"
      )), /* @__PURE__ */ React.createElement("div", { className: "text-sm font-semibold text-noir tabular-nums shrink-0 text-end" }, (Number(item.price) * Number(item.quantity)).toLocaleString(), " MAD")))
    );
  })), cart.length > 0 && /* @__PURE__ */ React.createElement("div", { className: "p-6 border-t border-taupe/20 bg-card space-y-4" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "flex gap-2" }, /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      value: appliedPromo,
      onChange: (e) => setAppliedPromo(e.target.value.toUpperCase()),
      placeholder: t.promo_placeholder,
      className: "flex-1 bg-canvas border border-taupe/30 px-3 py-2 text-xs uppercase focus:border-caramel"
    }
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: () => {
        if (appliedPromo.trim().toUpperCase() === "RAWCRAFT10") {
          showToast(t.promo_applied, "success");
        } else if (appliedPromo.trim()) {
          showToast("Code promo invalide", "error");
        }
      },
      className: "px-4 py-2 bg-noir text-canvas text-xs font-semibold hover:bg-caramel transition-colors"
    },
    t.promo_apply
  )), appliedPromo.toUpperCase() === "RAWCRAFT10" && /* @__PURE__ */ React.createElement("div", { className: "text-[11px] text-[#10B981] font-semibold mt-1" }, "\u2713 ", t.promo_applied)), /* @__PURE__ */ React.createElement("div", { className: "space-y-1.5 text-xs text-taupe-dark pt-2 border-t border-taupe/15" }, /* @__PURE__ */ React.createElement("div", { className: "flex justify-between" }, /* @__PURE__ */ React.createElement("span", null, t.subtotal), /* @__PURE__ */ React.createElement("span", { className: "tabular-nums text-noir" }, cartTotals.subtotal.toLocaleString(), " MAD")), cartTotals.discount > 0 && /* @__PURE__ */ React.createElement("div", { className: "flex justify-between text-[#10B981] font-semibold" }, /* @__PURE__ */ React.createElement("span", null, t.discount), /* @__PURE__ */ React.createElement("span", { className: "tabular-nums" }, "-", cartTotals.discount.toLocaleString(), " MAD")), /* @__PURE__ */ React.createElement("div", { className: "flex justify-between" }, /* @__PURE__ */ React.createElement("span", null, t.shipping), /* @__PURE__ */ React.createElement("span", { className: "text-[#10B981] font-semibold" }, t.free)), /* @__PURE__ */ React.createElement("div", { className: "flex justify-between text-base font-bold text-noir pt-2 border-t border-taupe/25" }, /* @__PURE__ */ React.createElement("span", null, t.total), /* @__PURE__ */ React.createElement("span", { className: "text-caramel tabular-nums" }, cartTotals.total.toLocaleString(), " MAD"))), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-3 gap-2 pt-2" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: clearCart,
      className: "col-span-1 py-3 border border-taupe/30 text-xs font-semibold uppercase text-taupe-dark hover:border-noir hover:text-noir transition-colors"
    },
    t.clear_cart
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: () => {
        setCartOpen(false);
        setCheckoutOpen(true);
      },
      className: "col-span-2 py-3 bg-noir text-canvas text-xs font-semibold uppercase tracking-wider hover:bg-caramel transition-colors shadow-sm"
    },
    t.checkout_btn
  )), /* @__PURE__ */ React.createElement("p", { className: "text-[10px] text-center text-taupe-dark/75 pt-1 flex items-center justify-center gap-1" }, /* @__PURE__ */ React.createElement("span", null, "\u{1F512}"), /* @__PURE__ */ React.createElement("span", null, lang === "ar" ? "\u0633\u0644\u062A\u0643 \u0645\u062D\u0641\u0648\u0638\u0629 \u062A\u0644\u0642\u0627\u0626\u064A\u0627\u064B \u062D\u062A\u0649 \u0639\u0646\u062F \u0625\u063A\u0644\u0627\u0642 \u0627\u0644\u0645\u062A\u0635\u0641\u062D \u0644\u0644\u0639\u0648\u062F\u0629 \u0625\u0644\u064A\u0647\u0627 \u0644\u0627\u062D\u0642\u0627\u064B." : "Votre s\xE9lection reste sauvegard\xE9e m\xEAme si vous quittez ou fermez votre navigateur."))))), quickViewProduct && /* @__PURE__ */ React.createElement("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4" }, /* @__PURE__ */ React.createElement(
    "div",
    {
      className: "fixed inset-0 bg-black/60 backdrop-blur-xs",
      onClick: () => setQuickViewProduct(null)
    }
  ), /* @__PURE__ */ React.createElement("div", { className: "relative bg-canvas w-full max-w-4xl max-h-[90vh] overflow-y-auto z-10 shadow-2xl border border-taupe/30 flex flex-col md:flex-row animate-modal-pop" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setQuickViewProduct(null),
      className: "absolute top-4 end-4 z-20 p-2 text-noir hover:text-caramel bg-canvas/80 rounded-full",
      "aria-label": "Fermer"
    },
    "\u2715"
  ), /* @__PURE__ */ React.createElement("div", { className: "md:w-1/2 p-6 flex flex-col items-center bg-card" }, /* @__PURE__ */ React.createElement(
    "div",
    {
      className: "relative w-full aspect-square bg-[#F7F5F0] border border-taupe/20 overflow-hidden mb-4 p-4 flex items-center justify-center select-none",
      onTouchStart: (e) => {
        if (e.touches && e.touches[0]) {
          quickViewTouchStartX.current = e.touches[0].clientX;
        }
      },
      onTouchEnd: (e) => {
        if (quickViewTouchStartX.current == null || !e.changedTouches || !e.changedTouches[0]) return;
        const deltaX = e.changedTouches[0].clientX - quickViewTouchStartX.current;
        quickViewTouchStartX.current = null;
        const totalImgs = quickViewProduct.images && quickViewProduct.images.length || 0;
        if (Math.abs(deltaX) > 35 && totalImgs > 1) {
          setQuickViewImageIdx((prev) => (prev + (deltaX > 0 ? -1 : 1) + totalImgs) % totalImgs);
        }
      }
    },
    /* @__PURE__ */ React.createElement(
      "img",
      {
        src: quickViewProduct.images && quickViewProduct.images[quickViewImageIdx] || quickViewProduct.images && quickViewProduct.images[0],
        alt: quickViewProduct.nameFr,
        className: "w-full h-full object-contain transition-all duration-300"
      }
    ),
    quickViewProduct.images && quickViewProduct.images.length > 1 && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        onClick: () => setQuickViewImageIdx((prev) => (prev - 1 + quickViewProduct.images.length) % quickViewProduct.images.length),
        className: "absolute start-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-noir text-noir hover:text-white border border-taupe/30 shadow-sm flex items-center justify-center transition-colors",
        "aria-label": "Photo pr\xE9c\xE9dente"
      },
      "\u2039"
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        onClick: () => setQuickViewImageIdx((prev) => (prev + 1) % quickViewProduct.images.length),
        className: "absolute end-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-noir text-noir hover:text-white border border-taupe/30 shadow-sm flex items-center justify-center transition-colors",
        "aria-label": "Photo suivante"
      },
      "\u203A"
    ))
  ), quickViewProduct.images && quickViewProduct.images.length > 1 && /* @__PURE__ */ React.createElement("div", { className: "flex gap-2 w-full justify-center overflow-x-auto pb-1" }, quickViewProduct.images.map((img, i) => /* @__PURE__ */ React.createElement(
    "button",
    {
      key: i,
      onClick: () => setQuickViewImageIdx(i),
      className: `w-14 h-14 shrink-0 border-2 overflow-hidden transition-all p-1 bg-[#F7F5F0] flex items-center justify-center ${quickViewImageIdx === i ? "border-caramel scale-105" : "border-taupe/20 opacity-70 hover:opacity-100"}`
    },
    /* @__PURE__ */ React.createElement("img", { src: img, alt: "miniature", className: "w-full h-full object-contain" })
  )))), /* @__PURE__ */ React.createElement("div", { className: "md:w-1/2 p-6 md:p-8 flex flex-col justify-between" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between text-xs text-taupe-dark uppercase tracking-wider mb-2" }, /* @__PURE__ */ React.createElement("span", null, quickViewProduct.category), /* @__PURE__ */ React.createElement("span", { className: "text-caramel font-semibold" }, "\u2605 ", quickViewProduct.rating || 5, ".0")), /* @__PURE__ */ React.createElement("h2", { className: "font-serif text-2xl sm:text-3xl font-semibold text-noir mb-3" }, lang === "ar" ? quickViewProduct.nameAr || quickViewProduct.nameFr : quickViewProduct.nameFr), /* @__PURE__ */ React.createElement("div", { className: "flex items-baseline gap-3 mb-4" }, /* @__PURE__ */ React.createElement("span", { className: "text-2xl font-bold text-noir tabular-nums" }, Number(quickViewProduct.price).toLocaleString(), " MAD"), quickViewProduct.oldPrice && /* @__PURE__ */ React.createElement("span", { className: "text-sm text-taupe line-through tabular-nums" }, Number(quickViewProduct.oldPrice).toLocaleString(), " MAD")), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-taupe-dark leading-relaxed mb-6" }, lang === "ar" ? quickViewProduct.descAr || quickViewProduct.descFr : quickViewProduct.descFr), quickViewProduct.sizes && quickViewProduct.sizes.length > 0 && /* @__PURE__ */ React.createElement("div", { className: "mb-4" }, /* @__PURE__ */ React.createElement("label", { className: "block text-xs font-bold uppercase tracking-wider text-noir mb-2" }, t.options_size, " : ", /* @__PURE__ */ React.createElement("span", { className: "text-caramel font-mono" }, quickViewSize)), /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap gap-2" }, quickViewProduct.sizes.map((size) => {
    const st = getProductVariantStock(quickViewProduct, size, quickViewColor);
    const isOutVar = st <= 0;
    return /* @__PURE__ */ React.createElement(
      "button",
      {
        key: size,
        onClick: () => setQuickViewSize(size),
        className: `px-3 py-1.5 text-xs font-semibold border transition-colors flex items-center gap-1 ${quickViewSize === size ? isOutVar ? "border-[#B91C1C] bg-[#FEE2E2] text-[#991B1B]" : "border-noir bg-noir text-white" : isOutVar ? "border-taupe/25 text-taupe line-through opacity-70" : "border-taupe/30 hover:border-noir text-noir"}`
      },
      /* @__PURE__ */ React.createElement("span", null, size),
      hasVariantStockMatrix(quickViewProduct) && /* @__PURE__ */ React.createElement("span", { className: "text-[10px] font-mono opacity-85" }, "(", isOutVar ? "0" : st, ")")
    );
  }))), quickViewProduct.colors && quickViewProduct.colors.length > 0 && /* @__PURE__ */ React.createElement("div", { className: "mb-5" }, /* @__PURE__ */ React.createElement("label", { className: "block text-xs font-bold uppercase tracking-wider text-noir mb-2" }, t.options_color, " : ", /* @__PURE__ */ React.createElement("span", { className: "text-caramel" }, getColorLabel(quickViewColor, lang))), /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap gap-2" }, quickViewProduct.colors.map((color) => {
    const cLabel = getColorLabel(color, lang);
    const cHex = getColorCss(color);
    const st = getProductVariantStock(quickViewProduct, quickViewSize, color);
    const isOutVar = st <= 0;
    return /* @__PURE__ */ React.createElement(
      "button",
      {
        key: color,
        onClick: () => setQuickViewColor(color),
        className: `px-2.5 py-1 rounded-xs border text-xs font-semibold flex items-center gap-1.5 transition-all ${quickViewColor === color ? isOutVar ? "border-2 border-[#B91C1C] bg-[#FEE2E2]/60 text-[#991B1B]" : "border-2 border-caramel bg-white text-noir shadow-xs" : isOutVar ? "border-taupe/25 text-taupe opacity-70 line-through" : "border-taupe/30 bg-white text-noir hover:border-noir"}`,
        title: `${cLabel} : ${st} en stock`
      },
      /* @__PURE__ */ React.createElement(
        "span",
        {
          className: "w-3.5 h-3.5 rounded-full border border-black/25 shrink-0",
          style: { backgroundColor: cHex }
        }
      ),
      /* @__PURE__ */ React.createElement("span", null, cLabel)
    );
  }))), (() => {
    const qvStock = getProductVariantStock(quickViewProduct, quickViewSize, quickViewColor);
    const qvColorName = getColorLabel(quickViewColor, lang);
    if (!quickViewProduct.inStock || quickViewProduct.stock <= 0 || qvStock <= 0) {
      return /* @__PURE__ */ React.createElement("div", { className: "p-2.5 bg-red-50 border border-red-300 text-[#991B1B] text-xs font-semibold mb-4 rounded-xs" }, "\u26A0\uFE0F ", lang === "ar" ? `\u0627\u0644\u0645\u0642\u0627\u0633 "${quickViewSize}" \u0628\u0627\u0644\u0644\u0648\u0646 "${qvColorName}" \u063A\u064A\u0631 \u0645\u062A\u0648\u0641\u0631 \u0641\u064A \u0627\u0644\u0645\u062E\u0632\u0648\u0646.` : `La taille "${quickViewSize}" en couleur "${qvColorName}" n'est pas en stock (\xE9puis\xE9e).`);
    }
    if (qvStock <= 5) {
      return /* @__PURE__ */ React.createElement("div", { className: "text-xs font-semibold text-[#B91C1C] mb-4" }, "\u{1F525} ", lang === "ar" ? `\u0628\u0642\u064A \u0641\u0642\u0637 ${qvStock} \u0641\u064A \u0627\u0644\u0645\u062E\u0632\u0648\u0646 \u0644\u0644\u0645\u0642\u0627\u0633 ${quickViewSize} (${qvColorName})!` : `Plus que ${qvStock} en stock pour la taille ${quickViewSize} (${qvColorName}) !`);
    }
    return /* @__PURE__ */ React.createElement("div", { className: "text-xs font-semibold text-[#065F46] mb-4" }, "\u2713 ", lang === "ar" ? `\u0645\u062A\u0648\u0641\u0631 \u0641\u064A \u0627\u0644\u0645\u062E\u0632\u0648\u0646 (${qvStock} \u2014 ${quickViewSize} / ${qvColorName})` : `En stock (${qvStock} disponibles \u2014 ${quickViewSize} \xB7 ${qvColorName})`);
  })()), (() => {
    const qvStock = getProductVariantStock(quickViewProduct, quickViewSize, quickViewColor);
    const isQvOut = !quickViewProduct.inStock || quickViewProduct.stock <= 0 || qvStock <= 0;
    const qvColorName = getColorLabel(quickViewColor, lang);
    return /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        disabled: isQvOut,
        onClick: () => {
          addToCart(quickViewProduct, quickViewSize, quickViewColor);
          setQuickViewProduct(null);
        },
        className: `w-full py-3.5 text-xs font-semibold uppercase tracking-wider transition-all duration-150 ${isQvOut ? "bg-red-100 text-[#991B1B] border border-red-300 cursor-not-allowed" : "bg-noir text-white hover:bg-caramel active:scale-95 shadow-xs"}`
      },
      isQvOut ? lang === "ar" ? `\u063A\u064A\u0631 \u0645\u062A\u0648\u0641\u0631 (${quickViewSize} - ${qvColorName})` : `Cette taille (${quickViewSize}) en ${qvColorName} n'est pas en stock` : t.add_to_cart
    );
  })(), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: () => {
        const pid = quickViewProduct.id;
        setQuickViewProduct(null);
        navigateToProduct(pid);
      },
      className: "w-full mt-2.5 py-2 text-center text-xs text-caramel hover:text-noir font-semibold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
    },
    /* @__PURE__ */ React.createElement("span", null, "\u{1F517} ", lang === "ar" ? "\u0641\u062A\u062D \u0635\u0641\u062D\u0629 \u0627\u0644\u0645\u0646\u062A\u062C \u0627\u0644\u0645\u062E\u0635\u0635\u0629 \u0648\u0631\u0627\u0628\u0637 \u0627\u0644\u0645\u0634\u0627\u0631\u0643\u0629 \u2197" : "Ouvrir la page d\xE9di\xE9e & lien direct \u2197")
  )))), checkoutOpen && /* @__PURE__ */ React.createElement(
    CheckoutModal,
    {
      cart: directCheckoutItem ? [directCheckoutItem] : cart,
      totals: directCheckoutItem ? {
        subtotal: Number(directCheckoutItem.price) * Number(directCheckoutItem.quantity),
        discount: appliedPromo.toUpperCase() === "RAWCRAFT10" ? Math.round(Number(directCheckoutItem.price) * Number(directCheckoutItem.quantity) * 0.1) : 0,
        shipping: 0,
        total: Math.max(0, Number(directCheckoutItem.price) * Number(directCheckoutItem.quantity) - (appliedPromo.toUpperCase() === "RAWCRAFT10" ? Math.round(Number(directCheckoutItem.price) * Number(directCheckoutItem.quantity) * 0.1) : 0)),
        itemCount: directCheckoutItem.quantity
      } : cartTotals,
      promoCode: appliedPromo,
      lang,
      t,
      onClose: () => {
        setCheckoutOpen(false);
        setDirectCheckoutItem(null);
      },
      onSuccess: (createdOrder) => {
        if (directCheckoutItem) {
          setDirectCheckoutItem(null);
        } else {
          setCart([]);
        }
        setCheckoutOpen(false);
        setCurrentInvoiceOrder(createdOrder);
        showToast(t.toast_order_success, "success");
        fetchProducts();
      },
      onError: (msg) => showToast(msg || t.toast_order_error, "error")
    }
  ), trackingOpen && /* @__PURE__ */ React.createElement(
    TrackingModal,
    {
      lang,
      t,
      onClose: () => setTrackingOpen(false),
      onViewInvoice: (order) => {
        setTrackingOpen(false);
        setCurrentInvoiceOrder(order);
      }
    }
  ), adminOpen && /* @__PURE__ */ React.createElement(
    AdminModal,
    {
      token: adminToken,
      adminUser,
      setAdminUser,
      adminPass,
      setAdminPass,
      loginError: adminLoginError,
      onLogin: handleAdminLogin,
      onLogout: handleAdminLogout,
      onUpdateAdminAuth: (newToken, newUser) => {
        if (newToken) {
          setAdminToken(newToken);
          sessionStorage.setItem("modanova_admin_token", newToken);
        }
        if (newUser) {
          setAdminUser(newUser);
        }
      },
      kpis: adminKPIs,
      activeTab: adminActiveTab,
      setActiveTab: setAdminActiveTab,
      products,
      orders,
      lang,
      t,
      onClose: handleCloseAdmin,
      onRefreshOrders: fetchAdminOrders,
      onDeleteOrderLocal: (deletedId) => {
        const cleanId = String(deletedId || "").trim().toUpperCase();
        setOrders((prev) => (prev || []).filter((o) => String(o?.id || "").trim().toUpperCase() !== cleanId));
      },
      onRefreshProducts: fetchProducts,
      onReorderProductsLocal: (reorderedList) => {
        if (Array.isArray(reorderedList)) {
          setProducts(reorderedList);
        }
      },
      onDeleteProductLocal: (deletedId) => {
        const numId = Number(deletedId);
        setProducts((prev) => (prev || []).filter((p) => Number(p?.id) !== numId));
      },
      onEditProduct: (p) => setProductFormModal(p),
      onAddProduct: () => setProductFormModal({
        id: null,
        nameFr: "",
        nameAr: "",
        price: "",
        oldPrice: "",
        category: "Chaussures",
        inStock: true,
        stock: 10,
        badge: "new",
        isNew: true,
        rating: 5,
        images: [],
        descFr: "",
        descAr: "",
        sizes: ["41", "42", "43"],
        colors: ["#171717"]
      }),
      onViewInvoice: (order) => {
        setCurrentInvoiceOrder(order);
      },
      showToast,
      heroSlides,
      onSaveSlider: (updatedSlides) => {
        setCustomHeroSlides(updatedSlides);
      },
      onViewProductPage: (prodId) => {
        setAdminOpen(false);
        navigateToProduct(prodId);
      },
      onCopyProductLink: (prodId) => {
        const prod = products.find((p) => p.id === prodId);
        const slug = prod ? getProductSlug(prod) : `produit-${prodId}`;
        const url = `${window.location.origin}/produit/${slug}`;
        try {
          navigator.clipboard.writeText(url);
          showToast(t.product_link_copied, "success");
        } catch {
          showToast(url, "info");
        }
      },
      cms,
      onSaveCms: (updatedCms) => setCms(updatedCms),
      testimonials,
      onRefreshTestimonials: fetchTestimonials
    }
  ), productFormModal && /* @__PURE__ */ React.createElement(
    ProductFormModal,
    {
      initialData: productFormModal,
      token: adminToken,
      lang,
      t,
      onClose: () => setProductFormModal(null),
      onSaved: (savedProduct) => {
        const wasNew = !productFormModal.id;
        setProductFormModal(null);
        if (savedProduct && savedProduct.id) {
          setProducts((prev) => {
            const existingIdx = (prev || []).findIndex((p) => Number(p.id) === Number(savedProduct.id));
            if (existingIdx >= 0 && !wasNew) {
              const copy = [...prev];
              copy[existingIdx] = savedProduct;
              return copy;
            }
            return [savedProduct, ...(prev || []).filter((p) => Number(p.id) !== Number(savedProduct.id))];
          });
        }
        setCatalogPage(1);
        fetchProducts();
        showToast(t.toast_product_saved, "success");
      },
      onError: (err) => showToast(err || "Erreur enregistrement", "error")
    }
  ), currentInvoiceOrder && /* @__PURE__ */ React.createElement("div", { className: "fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4" }, /* @__PURE__ */ React.createElement(
    "div",
    {
      className: "fixed inset-0 bg-black/75 backdrop-blur-xs",
      onClick: () => setCurrentInvoiceOrder(null)
    }
  ), /* @__PURE__ */ React.createElement("div", { className: "relative bg-white w-full max-w-3xl max-h-[92vh] overflow-hidden z-10 shadow-2xl flex flex-col border border-taupe/30 animate-modal-pop" }, /* @__PURE__ */ React.createElement("div", { className: "p-3 sm:p-4 bg-noir text-white flex flex-wrap items-center justify-between gap-2" }, /* @__PURE__ */ React.createElement("span", { className: "font-serif text-base sm:text-lg font-bold" }, t.invoice_modal_title, " \u2014 ", /* @__PURE__ */ React.createElement("span", { className: "text-[#E6C687]" }, currentInvoiceOrder.id)), /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap items-center gap-2" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: () => printInvoice(currentInvoiceOrder, lang),
      className: "px-3 py-1.5 bg-caramel text-white text-xs font-semibold rounded-xs hover:bg-caramel/90 transition-colors flex items-center gap-1"
    },
    /* @__PURE__ */ React.createElement("span", null, "\u{1F5A8}\uFE0F"),
    /* @__PURE__ */ React.createElement("span", null, t.print_invoice_btn || "Imprimer")
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: () => downloadInvoice(currentInvoiceOrder, lang),
      className: "px-3 py-1.5 bg-white/15 hover:bg-white/25 text-white text-xs font-semibold rounded-xs transition-colors flex items-center gap-1",
      title: "T\xE9l\xE9charger la facture"
    },
    /* @__PURE__ */ React.createElement("span", null, "\u2B07\uFE0F"),
    /* @__PURE__ */ React.createElement("span", null, "T\xE9l\xE9charger")
  ), /* @__PURE__ */ React.createElement(
    "a",
    {
      href: adminOpen ? buildAdminCustomerWhatsAppLink(currentInvoiceOrder, lang) : currentInvoiceOrder._adminWhatsappUrl || buildWhatsAppLink(currentInvoiceOrder, lang),
      target: "_blank",
      rel: "noopener noreferrer",
      className: "px-3 py-1.5 bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-semibold rounded-xs transition-colors flex items-center gap-1.5 shadow-2xs"
    },
    /* @__PURE__ */ React.createElement(WhatsAppIcon, { className: "w-3.5 h-3.5 fill-white shrink-0" }),
    /* @__PURE__ */ React.createElement("span", null, adminOpen ? "WhatsApp Client" : t.whatsapp_confirm_btn)
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: () => setCurrentInvoiceOrder(null),
      className: "text-white/70 hover:text-white text-lg px-2 py-0.5",
      "aria-label": "Fermer"
    },
    "\u2715"
  ))), !adminOpen && /* @__PURE__ */ React.createElement("div", { className: "bg-[#ECFDF5] border-b border-[#A7F3D0] px-4 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[#065F46]" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement(WhatsAppIcon, { className: "w-4 h-4 fill-[#25D366] shrink-0" }), /* @__PURE__ */ React.createElement("span", null, currentInvoiceOrder._sentViaApi ? lang === "ar" ? "\u2705 \u062A\u0645 \u0625\u0631\u0633\u0627\u0644 \u0625\u0634\u0639\u0627\u0631 \u0637\u0644\u0628\u0643\u0645 \u062A\u0644\u0642\u0627\u0626\u064A\u0627\u064B \u0625\u0644\u0649 \u0648\u0627\u062A\u0633\u0627\u0628 \u0625\u062F\u0627\u0631\u0629 \u0645\u0648\u062F\u0627\u0646\u0648\u0641\u0627." : "\u2705 Notification automatique envoy\xE9e sur le WhatsApp de l\u2019administration MODANOVA." : lang === "ar" ? "\u{1F4F2} \u062A\u0645 \u062A\u0633\u062C\u064A\u0644 \u0637\u0644\u0628\u0643\u0645! \u0627\u0636\u063A\u0637 \u0639\u0644\u0649 \u0627\u0644\u0632\u0631 \u0627\u0644\u0623\u062E\u0636\u0631 \u0644\u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u0625\u0634\u0639\u0627\u0631 \u0627\u0644\u0645\u0628\u0627\u0634\u0631 \u0639\u0628\u0631 \u0648\u0627\u062A\u0633\u0627\u0628." : "\u{1F4F2} Commande enregistr\xE9e ! Cliquez sur le bouton vert pour envoyer la notification directe sur WhatsApp.")), /* @__PURE__ */ React.createElement(
    "a",
    {
      href: currentInvoiceOrder._adminWhatsappUrl || buildWhatsAppLink(currentInvoiceOrder, lang),
      target: "_blank",
      rel: "noopener noreferrer",
      className: "px-3 py-1 bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-[11px] rounded-xs flex items-center gap-1.5 self-start sm:self-auto shrink-0 shadow-2xs"
    },
    /* @__PURE__ */ React.createElement(WhatsAppIcon, { className: "w-3.5 h-3.5 fill-white shrink-0" }),
    /* @__PURE__ */ React.createElement("span", null, lang === "ar" ? "\u0625\u0631\u0633\u0627\u0644 \u0639\u0628\u0631 \u0648\u0627\u062A\u0633\u0627\u0628 \u0627\u0644\u0622\u0646" : "Notifier sur WhatsApp")
  )), /* @__PURE__ */ React.createElement(
    "div",
    {
      className: "flex-1 overflow-y-auto p-3 sm:p-6 bg-[#F8F7F4]",
      dangerouslySetInnerHTML: { __html: buildInvoiceHTML(currentInvoiceOrder, lang) }
    }
  ))));
}
function CheckoutModal({ cart, totals, promoCode, lang, t, onClose, onSuccess, onError }) {
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [city, setCity] = useState(MOROCCAN_CITIES[0].id);
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const phoneClean = customerPhone.trim().replace(/\s+/g, "");
  const isPhoneValid = /^(06|07)\d{8}$/.test(phoneClean);
  const isFormValid = customerName.trim().length >= 3 && isPhoneValid && address.trim().length >= 5;
  const selectedCityObj = MOROCCAN_CITIES.find((c) => c.id === city) || MOROCCAN_CITIES[0];
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid || submitting) return;
    setSubmitting(true);
    try {
      const payload = {
        customerName: customerName.trim(),
        customerPhone: phoneClean,
        city: selectedCityObj.nameFr,
        address: address.trim(),
        notes: notes.trim(),
        promoCode: promoCode || null,
        items: cart.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          size: item.size,
          color: item.color
        }))
      };
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.order) {
        const enrichedOrder = {
          ...data.order,
          _adminWhatsappUrl: data.adminWhatsappUrl || buildWhatsAppLink(data.order, lang),
          _sentViaApi: Boolean(data.sentViaApi),
          _autoRedirectCustomerToWhatsapp: data.autoRedirectCustomerToWhatsapp !== false
        };
        if (enrichedOrder._autoRedirectCustomerToWhatsapp && !enrichedOrder._sentViaApi && enrichedOrder._adminWhatsappUrl) {
          try {
            const waAnchor = document.createElement("a");
            waAnchor.href = enrichedOrder._adminWhatsappUrl;
            waAnchor.target = "_blank";
            waAnchor.rel = "noopener noreferrer";
            document.body.appendChild(waAnchor);
            waAnchor.click();
            document.body.removeChild(waAnchor);
          } catch {
          }
        }
        onSuccess(enrichedOrder);
      } else {
        onError(data.error || "Erreur lors de la commande");
      }
    } catch (err) {
      onError("Impossible de contacter le serveur.");
    } finally {
      setSubmitting(false);
    }
  };
  return /* @__PURE__ */ React.createElement("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto overflow-x-hidden" }, /* @__PURE__ */ React.createElement("div", { className: "fixed inset-0 bg-black/60 backdrop-blur-xs", onClick: onClose }), /* @__PURE__ */ React.createElement("div", { className: "relative bg-canvas w-full max-w-xl max-h-[90vh] overflow-y-auto overflow-x-hidden z-10 shadow-2xl border border-taupe/30 p-5 sm:p-8 animate-modal-pop box-border my-auto" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: onClose,
      className: "absolute top-4 end-4 text-taupe-dark hover:text-noir text-lg",
      "aria-label": "Fermer"
    },
    "\u2715"
  ), /* @__PURE__ */ React.createElement("h2", { className: "font-serif text-2xl sm:text-3xl font-semibold text-noir mb-1" }, t.checkout_title), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-taupe-dark mb-6" }, t.checkout_subtitle), /* @__PURE__ */ React.createElement("form", { onSubmit: handleSubmit, className: "space-y-4" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-xs font-bold uppercase tracking-wider text-noir mb-1" }, t.name_label), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      required: true,
      value: customerName,
      onChange: (e) => setCustomerName(e.target.value),
      placeholder: t.name_placeholder,
      className: "w-full bg-card border border-taupe/30 px-3.5 py-2.5 text-xs text-noir focus:border-caramel"
    }
  )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "flex justify-between items-center mb-1" }, /* @__PURE__ */ React.createElement("label", { className: "block text-xs font-bold uppercase tracking-wider text-noir" }, t.phone_label), customerPhone && /* @__PURE__ */ React.createElement("span", { className: `text-[11px] font-semibold ${isPhoneValid ? "text-[#10B981]" : "text-[#B91C1C]"}` }, isPhoneValid ? t.phone_valid : t.phone_invalid)), /* @__PURE__ */ React.createElement("div", { className: "relative" }, /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "tel",
      required: true,
      value: customerPhone,
      onChange: (e) => setCustomerPhone(e.target.value),
      placeholder: t.phone_placeholder,
      className: `w-full bg-card border px-3.5 py-2.5 text-xs text-noir focus:border-caramel ${customerPhone && !isPhoneValid ? "border-[#B91C1C]" : "border-taupe/30"}`
    }
  ), isPhoneValid && /* @__PURE__ */ React.createElement("span", { className: "absolute end-3 top-2.5 text-[#10B981] font-bold" }, "\u2713"))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "flex justify-between items-center mb-1" }, /* @__PURE__ */ React.createElement("label", { className: "block text-xs font-bold uppercase tracking-wider text-noir" }, t.city_label), /* @__PURE__ */ React.createElement("span", { className: "text-[11px] text-caramel font-semibold" }, "D\xE9lai estim\xE9 : ", selectedCityObj.delay)), /* @__PURE__ */ React.createElement(
    "select",
    {
      value: city,
      onChange: (e) => setCity(e.target.value),
      className: "w-full bg-card border border-taupe/30 px-3.5 py-2.5 text-xs text-noir focus:border-caramel font-medium"
    },
    /* @__PURE__ */ React.createElement("optgroup", { label: lang === "ar" ? "\u2B50 \u0627\u0644\u0645\u062F\u0646 \u0627\u0644\u0643\u0628\u0631\u0649 (\u062A\u0648\u0635\u064A\u0644 \u0633\u0631\u064A\u0639)" : "\u2B50 Grandes Villes (Livraison Express 24-48h)" }, MOROCCAN_CITIES.filter((c) => c.isMajor).map((c) => /* @__PURE__ */ React.createElement("option", { key: c.id, value: c.id }, lang === "ar" ? c.nameAr : c.nameFr, " (Livraison ", c.delay, ")"))),
    /* @__PURE__ */ React.createElement("optgroup", { label: lang === "ar" ? "\u{1F4E6} \u0628\u0627\u0642\u064A \u0645\u062F\u0646 \u0627\u0644\u0645\u0645\u0644\u0643\u0629 (\u062A\u0631\u062A\u064A\u0628 \u0623\u0628\u062C\u062F\u064A)" : "\u{1F4E6} Toutes les Villes du Maroc (Ordre Alphab\xE9tique)" }, MOROCCAN_CITIES.filter((c) => !c.isMajor).map((c) => /* @__PURE__ */ React.createElement("option", { key: c.id, value: c.id }, lang === "ar" ? c.nameAr : c.nameFr, " (Livraison ", c.delay, ")")))
  )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-xs font-bold uppercase tracking-wider text-noir mb-1" }, t.address_label), /* @__PURE__ */ React.createElement(
    "textarea",
    {
      required: true,
      rows: "2",
      value: address,
      onChange: (e) => setAddress(e.target.value),
      placeholder: t.address_placeholder,
      className: "w-full bg-card border border-taupe/30 px-3.5 py-2.5 text-xs text-noir focus:border-caramel"
    }
  )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-xs font-bold uppercase tracking-wider text-taupe-dark mb-1" }, t.notes_label), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      value: notes,
      onChange: (e) => setNotes(e.target.value),
      placeholder: t.notes_placeholder,
      className: "w-full bg-card border border-taupe/30 px-3.5 py-2 text-xs text-noir focus:border-caramel"
    }
  )), /* @__PURE__ */ React.createElement("div", { className: "bg-[#F8F5EE] border border-taupe/20 p-4 text-xs space-y-2 mt-4" }, /* @__PURE__ */ React.createElement("div", { className: "flex justify-between text-taupe-dark" }, /* @__PURE__ */ React.createElement("span", null, "Articles (", totals.itemCount, ")"), /* @__PURE__ */ React.createElement("span", null, totals.subtotal.toLocaleString(), " MAD")), totals.discount > 0 && /* @__PURE__ */ React.createElement("div", { className: "flex justify-between text-[#10B981] font-semibold" }, /* @__PURE__ */ React.createElement("span", null, "Remise code"), /* @__PURE__ */ React.createElement("span", null, "-", totals.discount.toLocaleString(), " MAD")), /* @__PURE__ */ React.createElement("div", { className: "flex justify-between text-taupe-dark" }, /* @__PURE__ */ React.createElement("span", null, "Livraison express \xE0 domicile"), /* @__PURE__ */ React.createElement("span", { className: "text-[#10B981] font-semibold" }, "0 MAD (Gratuite)")), /* @__PURE__ */ React.createElement("div", { className: "flex justify-between text-sm font-bold text-noir pt-2 border-t border-taupe/20" }, /* @__PURE__ */ React.createElement("span", null, "Total \xE0 payer \xE0 la livraison"), /* @__PURE__ */ React.createElement("span", { className: "text-caramel" }, totals.total.toLocaleString(), " MAD"))), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "submit",
      disabled: !isFormValid || submitting,
      className: `w-full py-3.5 px-3 text-xs font-semibold uppercase tracking-wider transition-colors shadow-sm whitespace-normal text-center leading-snug box-border ${!isFormValid || submitting ? "bg-taupe/30 text-taupe-dark cursor-not-allowed" : "bg-noir text-white hover:bg-caramel active:scale-98"}`
    },
    submitting ? "Validation en cours..." : t.order_confirm_btn
  ))));
}
function TrackingModal({ lang, t, onClose, onViewInvoice }) {
  const [searchId, setSearchId] = useState("");
  const [loading, setLoading] = useState(false);
  const [orderResult, setOrderResult] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const handleTrack = async (e) => {
    e.preventDefault();
    if (!searchId.trim()) return;
    setLoading(true);
    setNotFound(false);
    setOrderResult(null);
    try {
      const clean = searchId.trim().toUpperCase();
      const res = await fetch(`/api/orders/${clean}`);
      if (res.ok) {
        const data = await res.json();
        setOrderResult(data);
      } else {
        setNotFound(true);
      }
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };
  return /* @__PURE__ */ React.createElement("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto overflow-x-hidden" }, /* @__PURE__ */ React.createElement("div", { className: "fixed inset-0 bg-black/60 backdrop-blur-xs", onClick: onClose }), /* @__PURE__ */ React.createElement("div", { className: "relative bg-canvas w-full max-w-lg p-5 sm:p-8 z-10 shadow-2xl border border-taupe/30 animate-modal-pop box-border my-auto overflow-x-hidden" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: onClose,
      className: "absolute top-4 end-4 text-taupe-dark hover:text-noir text-lg"
    },
    "\u2715"
  ), /* @__PURE__ */ React.createElement("h2", { className: "font-serif text-2xl sm:text-3xl font-semibold text-noir mb-2" }, t.tracking_title), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-taupe-dark mb-6" }, "Entrez votre identifiant de commande (ex: CMD-XXXXXX) pour voir l'\xE9tat d'avancement."), /* @__PURE__ */ React.createElement("form", { onSubmit: handleTrack, className: "flex gap-2 mb-6" }, /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      required: true,
      value: searchId,
      onChange: (e) => setSearchId(e.target.value),
      placeholder: t.tracking_input_placeholder,
      className: "flex-1 bg-card border border-taupe/30 px-3.5 py-2.5 text-xs text-noir uppercase focus:border-caramel"
    }
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "submit",
      disabled: loading,
      className: "px-5 py-2.5 bg-noir text-white text-xs font-semibold uppercase tracking-wider hover:bg-caramel transition-colors"
    },
    loading ? "..." : t.tracking_btn
  )), notFound && /* @__PURE__ */ React.createElement("div", { className: "p-4 bg-[#FEE2E2] text-[#991B1B] text-xs border border-[#FCA5A5] mb-4" }, 'Aucune commande trouv\xE9e pour la r\xE9f\xE9rence "', searchId, '". V\xE9rifiez le code.'), orderResult && /* @__PURE__ */ React.createElement("div", { className: "bg-card border border-taupe/20 p-5 space-y-4" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between pb-3 border-b border-taupe/15" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "text-xs text-taupe-dark" }, t.tracking_input_label), /* @__PURE__ */ React.createElement("div", { className: "text-sm font-bold text-noir" }, orderResult.id)), /* @__PURE__ */ React.createElement("span", { className: "px-3 py-1 bg-noir text-white text-xs font-semibold rounded-xs" }, orderResult.status)), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-2 gap-3 text-xs" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { className: "text-taupe-dark block" }, t.tracking_client, " :"), /* @__PURE__ */ React.createElement("span", { className: "font-medium text-noir" }, orderResult.customerName)), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { className: "text-taupe-dark block" }, t.tracking_city, " :"), /* @__PURE__ */ React.createElement("span", { className: "font-medium text-noir" }, orderResult.city)), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { className: "text-taupe-dark block" }, t.tracking_date, " :"), /* @__PURE__ */ React.createElement("span", { className: "font-medium text-noir" }, new Date(orderResult.date).toLocaleDateString())), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { className: "text-taupe-dark block" }, t.total, " :"), /* @__PURE__ */ React.createElement("span", { className: "font-bold text-caramel" }, Number(orderResult.total).toLocaleString(), " MAD"))), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => onViewInvoice(orderResult),
      className: "w-full mt-2 py-2.5 border border-noir text-xs font-semibold uppercase tracking-wider hover:bg-noir hover:text-white transition-colors"
    },
    t.tracking_view_invoice
  ))));
}
function AdminModal({
  token,
  adminUser,
  setAdminUser,
  adminPass,
  setAdminPass,
  loginError,
  onLogin,
  onLogout,
  onUpdateAdminAuth,
  kpis,
  activeTab,
  setActiveTab,
  products,
  orders,
  lang,
  t,
  onClose,
  onRefreshOrders,
  onDeleteOrderLocal,
  onRefreshProducts,
  onReorderProductsLocal,
  onDeleteProductLocal,
  onEditProduct,
  onAddProduct,
  onViewInvoice,
  showToast,
  onViewProductPage,
  onCopyProductLink,
  heroSlides,
  onSaveSlider,
  cms,
  onSaveCms,
  testimonials,
  onRefreshTestimonials
}) {
  const [sliderDraft, setSliderDraft] = useState(() => JSON.parse(JSON.stringify(heroSlides || [])));
  const [sliderUploadingIdx, setSliderUploadingIdx] = useState(null);
  const [sliderSaving, setSliderSaving] = useState(false);
  const [prodSearch, setProdSearch] = useState("");
  const [prodCat, setProdCat] = useState("ALL");
  const [prodPage, setProdPage] = useState(1);
  const [confirmDeleteProdId, setConfirmDeleteProdId] = useState(null);
  const [deletingProdId, setDeletingProdId] = useState(null);
  const [adminThumbIdxMap, setAdminThumbIdxMap] = useState({});
  const [draggedProdId, setDraggedProdId] = useState(null);
  const [dragOverProdId, setDragOverProdId] = useState(null);
  const [reorderingProds, setReorderingProds] = useState(false);
  const PRODUCTS_PER_PAGE = 10;
  const [orderFilter, setOrderFilter] = useState("ALL");
  const [orderSearch, setOrderSearch] = useState("");
  const [orderPage, setOrderPage] = useState(1);
  const [confirmDeleteOrderId, setConfirmDeleteOrderId] = useState(null);
  const [deletingOrderId, setDeletingOrderId] = useState(null);
  const ORDERS_PER_PAGE = 10;
  const [cmsDraft, setCmsDraft] = useState(() => ({
    topBannerFr: cms?.topBannerFr || "Livraison express offerte dans tout le Maroc \u2022 Paiement s\xE9curis\xE9 \xE0 la livraison (COD)",
    topBannerAr: cms?.topBannerAr || "\u062A\u0648\u0635\u064A\u0644 \u0633\u0631\u064A\u0639 \u0645\u062C\u0627\u0646\u064A \u0641\u064A \u062C\u0645\u064A\u0639 \u0623\u0646\u062D\u0627\u0621 \u0627\u0644\u0645\u063A\u0631\u0628 \u2022 \u0627\u0644\u062F\u0641\u0639 \u0639\u0646\u062F \u0627\u0644\u0627\u0633\u062A\u0644\u0627\u0645",
    brandName: cms?.brandName || "MODANOVA",
    brandTagline: cms?.brandTagline || "Men's Essentials",
    storyBadge: cms?.storyBadge || "Maison de Haute Maroquinerie & Confection",
    storyTitle: cms?.storyTitle || "L'Art de l'Excellence & du Minimalisme Brut",
    storyText1: cms?.storyText1 || "Fond\xE9e avec la volont\xE9 de red\xE9finir l'\xE9l\xE9gance masculine contemporaine, MODANOVA s\xE9lectionne des cuirs pleine fleur d'exception et des toiles techniques robustes pour concevoir des pi\xE8ces intemporelles.",
    storyText2: cms?.storyText2 || "Chaque sacoche, veste et soulier est m\xE9ticuleusement assembl\xE9 \xE0 la main, garantissant une long\xE9vit\xE9 absolue et un style d'affirmation sobre pens\xE9 pour le quotidien de l'homme moderne.",
    storyImage: cms?.storyImage || "",
    conciergeAddress: cms?.conciergeAddress || "Boulevard Mohamed V, Quartier Industriel",
    conciergeCity: cms?.conciergeCity || "K\xE9nitra, Maroc",
    whatsappNumber: cms?.whatsappNumber || "+212600000000"
  }));
  const [cmsSaving, setCmsSaving] = useState(false);
  const [cmsUploadingPhoto, setCmsUploadingPhoto] = useState(false);
  const [testimonialModalOpen, setTestimonialModalOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState(null);
  const [testimonialForm, setTestimonialForm] = useState({
    author: "",
    city: "Casablanca",
    rating: 5,
    textFr: "",
    textAr: "",
    verified: true
  });
  const [testimonialSaving, setTestimonialSaving] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [secNewUser, setSecNewUser] = useState(adminUser || "admin");
  const [secCurrentPass, setSecCurrentPass] = useState("");
  const [secNewPass, setSecNewPass] = useState("");
  const [secConfirmPass, setSecConfirmPass] = useState("");
  const [showSecCurrentPass, setShowSecCurrentPass] = useState(false);
  const [showSecNewPass, setShowSecNewPass] = useState(false);
  const [secSavingPass, setSecSavingPass] = useState(false);
  const [secPassMessage, setSecPassMessage] = useState(null);
  const [waConfig, setWaConfig] = useState({
    adminWhatsappNumber: "212600773716",
    whatsappAutoNotifyEnabled: true,
    autoRedirectCustomerToWhatsapp: true,
    callmebotApiKey: "",
    whatsappWebhookUrl: ""
  });
  const [waSaving, setWaSaving] = useState(false);
  const [waTesting, setWaTesting] = useState(false);
  const [liveNewOrderAlert, setLiveNewOrderAlert] = useState(null);
  const knownOrderIdsRef = useRef(null);
  useEffect(() => {
    if (!token) return;
    fetch("/api/admin/config", {
      headers: { Authorization: `Bearer ${token}` }
    }).then((r) => r.ok ? r.json() : null).then((data) => {
      if (data) {
        if (data.adminUser) setSecNewUser(data.adminUser);
        setWaConfig({
          adminWhatsappNumber: data.adminWhatsappNumber || "212600773716",
          whatsappAutoNotifyEnabled: data.whatsappAutoNotifyEnabled !== false,
          autoRedirectCustomerToWhatsapp: data.autoRedirectCustomerToWhatsapp !== false,
          callmebotApiKey: data.callmebotApiKey || "",
          whatsappWebhookUrl: data.whatsappWebhookUrl || ""
        });
      }
    }).catch(() => {
    });
  }, [token]);
  useEffect(() => {
    if (!token) return;
    if (Array.isArray(orders) && knownOrderIdsRef.current === null) {
      knownOrderIdsRef.current = new Set(orders.map((o) => o.id));
    }
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/orders", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) return;
        const latestOrders = await res.json();
        if (!Array.isArray(latestOrders)) return;
        if (knownOrderIdsRef.current === null) {
          knownOrderIdsRef.current = new Set(latestOrders.map((o) => o.id));
          return;
        }
        const newlyArrived = latestOrders.filter((o) => o && o.id && !knownOrderIdsRef.current.has(o.id));
        if (newlyArrived.length > 0) {
          newlyArrived.forEach((o) => knownOrderIdsRef.current.add(o.id));
          const newest = newlyArrived[0];
          setLiveNewOrderAlert(newest);
          if (onRefreshOrders) onRefreshOrders();
          showToast(`\u{1F514} Nouvelle commande re\xE7ue : ${newest.id} (${newest.customerName} \u2014 ${newest.total} MAD)`, "success");
          try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "sine";
            osc.frequency.setValueAtTime(880, ctx.currentTime);
            osc.frequency.setValueAtTime(1174.66, ctx.currentTime + 0.15);
            gain.gain.setValueAtTime(0.18, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(1e-3, ctx.currentTime + 0.6);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.6);
          } catch {
          }
        }
      } catch {
      }
    }, 15e3);
    return () => clearInterval(interval);
  }, [token, orders]);
  const handleChangeAdminPassword = async (e) => {
    e.preventDefault();
    setSecPassMessage(null);
    if (!secCurrentPass) {
      setSecPassMessage({ type: "error", text: "Veuillez saisir votre mot de passe actuel." });
      return;
    }
    if (!secNewPass || secNewPass.trim().length < 4) {
      setSecPassMessage({ type: "error", text: "Le nouveau mot de passe doit contenir au moins 4 caract\xE8res." });
      return;
    }
    if (secNewPass !== secConfirmPass) {
      setSecPassMessage({ type: "error", text: "La confirmation du nouveau mot de passe ne correspond pas." });
      return;
    }
    setSecSavingPass(true);
    try {
      const res = await fetch("/api/admin/password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: secCurrentPass,
          newPassword: secNewPass,
          newUser: secNewUser
        })
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        if (onUpdateAdminAuth && data.token) {
          onUpdateAdminAuth(data.token, data.adminUser || secNewUser);
        }
        setSecCurrentPass("");
        setSecNewPass("");
        setSecConfirmPass("");
        setSecPassMessage({
          type: "success",
          text: "\u2705 Mot de passe administrateur modifi\xE9 et sauvegard\xE9 d\xE9finitivement sur Firebase !"
        });
        showToast("Mot de passe administrateur mis \xE0 jour avec succ\xE8s !", "success");
      } else {
        setSecPassMessage({
          type: "error",
          text: data.error || "Erreur lors du changement de mot de passe."
        });
        showToast(data.error || "Mot de passe actuel incorrect", "error");
      }
    } catch {
      setSecPassMessage({ type: "error", text: "Erreur de connexion au serveur." });
    } finally {
      setSecSavingPass(false);
    }
  };
  const handleSaveWaConfig = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setWaSaving(true);
    try {
      const res = await fetch("/api/admin/config", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(waConfig)
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        showToast("Configuration des notifications WhatsApp sauvegard\xE9e sur Firebase !", "success");
      } else {
        showToast(data.error || "Erreur lors de la sauvegarde", "error");
      }
    } catch {
      showToast("Erreur de connexion au serveur", "error");
    } finally {
      setWaSaving(false);
    }
  };
  const handleTestWhatsAppNotification = async () => {
    setWaTesting(true);
    try {
      await fetch("/api/admin/config", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(waConfig)
      });
      const res = await fetch("/api/admin/test-whatsapp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        if (data.sentViaApi) {
          showToast("\u2705 Notification WhatsApp automatique envoy\xE9e avec succ\xE8s sur votre t\xE9l\xE9phone !", "success");
        } else if (data.adminWhatsappUrl) {
          showToast("\u{1F4F2} Ouverture de la notification WhatsApp de test...", "info");
          const a = document.createElement("a");
          a.href = data.adminWhatsappUrl;
          a.target = "_blank";
          a.rel = "noopener noreferrer";
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }
      } else {
        showToast(data.error || "Erreur lors du test WhatsApp", "error");
      }
    } catch {
      showToast("Erreur de connexion lors du test WhatsApp", "error");
    } finally {
      setWaTesting(false);
    }
  };
  const [clearingCache, setClearingCache] = useState(false);
  const [lastCacheClearedAt, setLastCacheClearedAt] = useState(null);
  const handleClearCache = async () => {
    if (clearingCache) return;
    setClearingCache(true);
    try {
      const res = await fetch("/api/admin/clear-cache", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json().catch(() => ({}));
      try {
        if ("caches" in window && window.caches) {
          const cacheNames = await window.caches.keys();
          await Promise.all(cacheNames.map((name) => window.caches.delete(name)));
        }
      } catch {
      }
      try {
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && (k.includes("cache") || k.includes("products") || k.includes("slider") || k.includes("cms"))) {
            keysToRemove.push(k);
          }
        }
        keysToRemove.forEach((k) => localStorage.removeItem(k));
      } catch {
      }
      await Promise.all([
        onRefreshProducts ? onRefreshProducts() : Promise.resolve(),
        onRefreshOrders ? onRefreshOrders() : Promise.resolve(),
        onRefreshTestimonials ? onRefreshTestimonials() : Promise.resolve()
      ]);
      try {
        const bust = Date.now();
        const [sliderRes, cmsRes] = await Promise.all([
          fetch(`/api/slider?t=${bust}`, { cache: "no-store" }),
          fetch(`/api/cms?t=${bust}`, { cache: "no-store" })
        ]);
        if (sliderRes.ok) {
          const freshSlides = await sliderRes.json();
          if (Array.isArray(freshSlides) && freshSlides.length > 0 && onSaveSlider) {
            onSaveSlider(freshSlides);
            setSliderDraft(JSON.parse(JSON.stringify(freshSlides)));
          }
        }
        if (cmsRes.ok) {
          const freshCms = await cmsRes.json();
          if (freshCms && typeof freshCms === "object" && onSaveCms) {
            onSaveCms(freshCms);
          }
        }
      } catch {
      }
      const nowStr = (/* @__PURE__ */ new Date()).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
      setLastCacheClearedAt(nowStr);
      if (res.ok && data.ok) {
        showToast(`\u{1F9F9} Cache vid\xE9 avec succ\xE8s ! (${data.counts?.products ?? products.length} produits & ${data.counts?.orders ?? orders.length} commandes synchronis\xE9s depuis Firebase)`, "success");
      } else {
        showToast("\u{1F9F9} Cache du navigateur vid\xE9 et donn\xE9es rafra\xEEchies !", "success");
      }
    } catch {
      showToast("Erreur lors du vidage du cache", "error");
    } finally {
      setClearingCache(false);
    }
  };
  useEffect(() => {
    if (heroSlides && heroSlides.length > 0) {
      setSliderDraft(JSON.parse(JSON.stringify(heroSlides)));
    }
  }, [heroSlides]);
  useEffect(() => {
    if (cms) {
      setCmsDraft({
        topBannerFr: cms.topBannerFr || "",
        topBannerAr: cms.topBannerAr || "",
        brandName: cms.brandName || "MODANOVA",
        brandTagline: cms.brandTagline || "Men's Essentials",
        storyBadge: cms.storyBadge || "",
        storyTitle: cms.storyTitle || "",
        storyText1: cms.storyText1 || "",
        storyText2: cms.storyText2 || "",
        storyImage: cms.storyImage || "",
        conciergeAddress: cms.conciergeAddress || "",
        conciergeCity: cms.conciergeCity || "K\xE9nitra, Maroc",
        whatsappNumber: cms.whatsappNumber || "+212600000000"
      });
    }
  }, [cms]);
  const handleSlideFieldChange = (idx, field, val) => {
    setSliderDraft((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: val };
      return copy;
    });
  };
  const handleSliderPhotoUpload = async (idx, e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setSliderUploadingIdx(idx);
    try {
      const base64Data = await compressImageFile(file, 1400, 0.82);
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          file: base64Data,
          filename: file.name,
          folder: "slider"
        })
      });
      const data = await res.json();
      if (res.ok && data.url) {
        handleSlideFieldChange(idx, "wallpaper", data.url);
        showToast(`Photo du slide 0${idx + 1} upload\xE9e et stock\xE9e sur Firebase !`, "success");
      } else {
        showToast(data.error || "Erreur upload", "error");
      }
    } catch (err) {
      showToast("Erreur lors de l'upload vers Firebase", "error");
    } finally {
      setSliderUploadingIdx(null);
      e.target.value = "";
    }
  };
  const handleSaveAllSlides = async () => {
    setSliderSaving(true);
    try {
      const res = await fetch("/api/slider", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ slides: sliderDraft })
      });
      const data = await res.json();
      if (res.ok && data.slides) {
        if (onSaveSlider) onSaveSlider(data.slides);
        showToast("Slider d'accueil mis \xE0 jour et synchronis\xE9 avec Firebase !", "success");
      } else {
        showToast(data.error || "Erreur lors de l'enregistrement", "error");
      }
    } catch {
      showToast("Erreur de connexion", "error");
    } finally {
      setSliderSaving(false);
    }
  };
  const handleCmsPhotoUpload = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setCmsUploadingPhoto(true);
    try {
      const base64Data = await compressImageFile(file, 1200, 0.82);
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          file: base64Data,
          filename: file.name,
          folder: "cms"
        })
      });
      const data = await res.json();
      if (res.ok && data.url) {
        setCmsDraft((prev) => ({ ...prev, storyImage: data.url }));
        showToast("Photo de pr\xE9sentation du Savoir-Faire upload\xE9e vers Firebase !", "success");
      } else {
        showToast(data.error || "Erreur upload", "error");
      }
    } catch {
      showToast("Erreur lors de l'upload vers Firebase", "error");
    } finally {
      setCmsUploadingPhoto(false);
      e.target.value = "";
    }
  };
  const handleSaveCms = async () => {
    setCmsSaving(true);
    try {
      const res = await fetch("/api/cms", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(cmsDraft)
      });
      const data = await res.json();
      if (res.ok && data.cms) {
        if (onSaveCms) onSaveCms(data.cms);
        showToast("Contenu du site mis \xE0 jour et synchronis\xE9 sur Firebase !", "success");
      } else {
        showToast(data.error || "Erreur enregistrement CMS", "error");
      }
    } catch {
      showToast("Erreur de connexion", "error");
    } finally {
      setCmsSaving(false);
    }
  };
  const openAddTestimonial = () => {
    setEditingTestimonial(null);
    setTestimonialForm({
      author: "",
      city: "Casablanca",
      rating: 5,
      textFr: "",
      textAr: "",
      verified: true
    });
    setTestimonialModalOpen(true);
  };
  const openEditTestimonial = (item) => {
    setEditingTestimonial(item);
    setTestimonialForm({
      author: item.author || "",
      city: item.city || "Casablanca",
      rating: item.rating || 5,
      textFr: item.textFr || item.text || "",
      textAr: item.textAr || "",
      verified: item.verified !== false
    });
    setTestimonialModalOpen(true);
  };
  const handleSaveTestimonial = async (e) => {
    e.preventDefault();
    if (!testimonialForm.author || !testimonialForm.textFr) {
      showToast("Veuillez renseigner au moins l'auteur et le texte en fran\xE7ais.", "warning");
      return;
    }
    setTestimonialSaving(true);
    try {
      const url = editingTestimonial ? `/api/testimonials/${editingTestimonial.id}` : "/api/testimonials";
      const method = editingTestimonial ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(testimonialForm)
      });
      const data = await res.json();
      if (res.ok) {
        showToast(editingTestimonial ? "T\xE9moignage modifi\xE9 avec succ\xE8s !" : "T\xE9moignage ajout\xE9 avec succ\xE8s !", "success");
        setTestimonialModalOpen(false);
        if (onRefreshTestimonials) onRefreshTestimonials();
      } else {
        showToast(data.error || "Erreur enregistrement t\xE9moignage", "error");
      }
    } catch {
      showToast("Erreur de connexion", "error");
    } finally {
      setTestimonialSaving(false);
    }
  };
  const handleDeleteTestimonial = async (id) => {
    if (!confirm("Voulez-vous vraiment supprimer ce t\xE9moignage client ?")) return;
    try {
      const res = await fetch(`/api/testimonials/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        showToast("T\xE9moignage supprim\xE9 avec succ\xE8s.", "info");
        if (onRefreshTestimonials) onRefreshTestimonials();
      } else {
        showToast("Erreur lors de la suppression.", "error");
      }
    } catch {
      showToast("Erreur de connexion", "error");
    }
  };
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        onRefreshOrders();
        showToast(t.toast_status_updated, "success");
      }
    } catch {
      showToast("Erreur mise \xE0 jour", "error");
    }
  };
  const handleDeleteProduct = async (id) => {
    const numId = Number(id);
    if (!numId) return;
    setDeletingProdId(numId);
    setConfirmDeleteProdId(null);
    if (onDeleteProductLocal) {
      onDeleteProductLocal(numId);
    }
    try {
      const res = await fetch(`/api/products/${encodeURIComponent(numId)}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        await onRefreshProducts();
        showToast(t.toast_product_deleted, "info");
      } else {
        await onRefreshProducts();
        showToast("Erreur suppression produit", "error");
      }
    } catch {
      showToast("Erreur suppression", "error");
    } finally {
      setDeletingProdId(null);
    }
  };
  const persistProductsOrder = async (newOrderedProducts, targetPageAfterMove = null) => {
    const normalized = newOrderedProducts.map((item, idx) => ({
      ...item,
      position: idx + 1
    }));
    if (onReorderProductsLocal) {
      onReorderProductsLocal(normalized);
    }
    if (targetPageAfterMove != null) {
      setProdPage(targetPageAfterMove);
    }
    setReorderingProds(true);
    try {
      const orderedIds = normalized.map((item) => Number(item.id));
      const res = await fetch("/api/products/reorder", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ orderedIds })
      });
      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        if (Array.isArray(data.products) && onReorderProductsLocal) {
          onReorderProductsLocal(data.products);
        } else {
          await onRefreshProducts();
        }
        showToast("Ordre des produits mis \xE0 jour et sauvegard\xE9 sur Firebase !", "success");
      } else {
        await onRefreshProducts();
        showToast("Erreur lors de l'enregistrement de l'ordre", "error");
      }
    } catch {
      showToast("Erreur de connexion", "error");
    } finally {
      setReorderingProds(false);
    }
  };
  const handleMoveProductToRank = async (productId, targetRank1Based) => {
    const list = [...products || []];
    const fromIdx = list.findIndex((item) => Number(item.id) === Number(productId));
    if (fromIdx < 0) return;
    const toIdx = Math.max(0, Math.min(list.length - 1, Number(targetRank1Based) - 1));
    if (fromIdx === toIdx) return;
    const [movedItem] = list.splice(fromIdx, 1);
    list.splice(toIdx, 0, movedItem);
    const targetPage = Math.max(1, Math.ceil((toIdx + 1) / PRODUCTS_PER_PAGE));
    await persistProductsOrder(list, targetPage);
  };
  const handleStepProductRank = async (productId, delta) => {
    const list = [...products || []];
    const fromIdx = list.findIndex((item) => Number(item.id) === Number(productId));
    if (fromIdx < 0) return;
    const targetRank = fromIdx + 1 + delta;
    if (targetRank < 1 || targetRank > list.length) return;
    await handleMoveProductToRank(productId, targetRank);
  };
  const handleDropProductOnTarget = async (sourceProdId, targetProdId) => {
    setDraggedProdId(null);
    setDragOverProdId(null);
    if (!sourceProdId || !targetProdId || Number(sourceProdId) === Number(targetProdId)) return;
    const list = [...products || []];
    const targetIdx = list.findIndex((item) => Number(item.id) === Number(targetProdId));
    if (targetIdx < 0) return;
    await handleMoveProductToRank(sourceProdId, targetIdx + 1);
  };
  const handleDeleteOrder = async (id) => {
    const cleanId = String(id || "").trim().toUpperCase();
    if (!cleanId) return;
    setDeletingOrderId(cleanId);
    setConfirmDeleteOrderId(null);
    if (onDeleteOrderLocal) {
      onDeleteOrderLocal(cleanId);
    }
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(cleanId)}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        await onRefreshOrders();
        showToast(`Commande ${cleanId} supprim\xE9e d\xE9finitivement`, "info");
      } else {
        await onRefreshOrders();
        showToast("Erreur lors de la suppression de la commande", "error");
      }
    } catch {
      showToast("Erreur suppression", "error");
    } finally {
      setDeletingOrderId(null);
    }
  };
  const [prodHomeFilter, setProdHomeFilter] = useState("ALL");
  const [togglingHomeProdId, setTogglingHomeProdId] = useState(null);
  const handleToggleProductHome = async (prod) => {
    if (!prod || !prod.id || togglingHomeProdId === prod.id) return;
    const nextShowOnHome = prod.showOnHome === false ? true : false;
    setTogglingHomeProdId(prod.id);
    if (onReorderProductsLocal && Array.isArray(products)) {
      onReorderProductsLocal(
        products.map((item) => Number(item?.id) === Number(prod.id) ? { ...item, showOnHome: nextShowOnHome } : item)
      );
    }
    try {
      const res = await fetch(`/api/products/${encodeURIComponent(prod.id)}/home-visibility`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ showOnHome: nextShowOnHome })
      });
      if (res.ok) {
        await onRefreshProducts();
        showToast(
          nextShowOnHome ? `\u{1F3E0} \xAB ${prod.nameFr} \xBB est maintenant affich\xE9 sur la Page Principale (Index) !` : `\u{1F4C2} \xAB ${prod.nameFr} \xBB est masqu\xE9 de l'Index (visible uniquement sur Tous les Produits).`,
          "success"
        );
      } else {
        await onRefreshProducts();
        showToast("Erreur lors de la mise \xE0 jour de l'affichage Accueil", "error");
      }
    } catch {
      await onRefreshProducts();
      showToast("Erreur de connexion", "error");
    } finally {
      setTogglingHomeProdId(null);
    }
  };
  const filteredProducts = (products || []).filter((p) => {
    if (!p) return false;
    const matchSearch = !prodSearch || p.nameFr && p.nameFr.toLowerCase().includes(prodSearch.toLowerCase()) || p.nameAr && p.nameAr.toLowerCase().includes(prodSearch.toLowerCase()) || p.id && String(p.id).toLowerCase().includes(prodSearch.toLowerCase());
    const matchCat = prodCat === "ALL" || String(p.category || "").toLowerCase() === String(prodCat).toLowerCase();
    const matchHome = prodHomeFilter === "ALL" ? true : prodHomeFilter === "HOME_ONLY" ? p.showOnHome !== false : p.showOnHome === false;
    return matchSearch && matchCat && matchHome;
  });
  const totalProdPages = Math.max(1, Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE));
  const safeProdPage = Math.min(Math.max(1, prodPage), totalProdPages);
  const startProdIdx = (safeProdPage - 1) * PRODUCTS_PER_PAGE;
  const paginatedProducts = filteredProducts.slice(startProdIdx, startProdIdx + PRODUCTS_PER_PAGE);
  const filteredOrders = (orders || []).filter((o) => {
    if (!o) return false;
    const matchStatus = orderFilter === "ALL" || o.status === orderFilter;
    const q = (orderSearch || "").trim().toLowerCase();
    const matchSearch = !q || String(o.id || "").toLowerCase().includes(q) || String(o.customerName || "").toLowerCase().includes(q) || String(o.customerPhone || "").toLowerCase().includes(q) || String(o.city || "").toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });
  const totalOrderPages = Math.max(1, Math.ceil(filteredOrders.length / ORDERS_PER_PAGE));
  const safeOrderPage = Math.min(Math.max(1, orderPage), totalOrderPages);
  const startOrderIdx = (safeOrderPage - 1) * ORDERS_PER_PAGE;
  const paginatedOrders = filteredOrders.slice(startOrderIdx, startOrderIdx + ORDERS_PER_PAGE);
  if (!token) {
    return /* @__PURE__ */ React.createElement("div", { className: "fixed inset-0 z-50 bg-[#121212] flex items-center justify-center p-4" }, /* @__PURE__ */ React.createElement("div", { className: "w-full max-w-md bg-[#1C1C1C] border border-[#2F2F2F] p-8 shadow-2xl relative text-white rounded-xs" }, /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: onClose,
        className: "absolute top-4 right-4 text-white/50 hover:text-white text-sm",
        title: "Retourner \xE0 la boutique"
      },
      "\u2715"
    ), /* @__PURE__ */ React.createElement("div", { className: "text-center mb-8" }, /* @__PURE__ */ React.createElement("div", { className: "font-serif text-3xl font-extrabold tracking-widest text-[#E6C687] mb-1" }, "MODANOVA"), /* @__PURE__ */ React.createElement("div", { className: "text-[10px] uppercase font-mono tracking-widest text-white/50" }, "PANEL ADMINISTRATEUR S\xC9CURIS\xC9")), /* @__PURE__ */ React.createElement("form", { onSubmit: onLogin, className: "space-y-5" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-[11px] font-bold uppercase tracking-wider text-white/70 mb-2" }, "Identifiant"), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "text",
        value: adminUser,
        onChange: (e) => setAdminUser(e.target.value),
        placeholder: "admin",
        className: "w-full bg-[#121212] border border-[#333] px-3.5 py-2.5 text-sm text-white placeholder-white/30 focus:border-[#E6C687] focus:outline-none",
        required: true
      }
    )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-[11px] font-bold uppercase tracking-wider text-white/70 mb-2" }, "Mot de passe"), /* @__PURE__ */ React.createElement("div", { className: "relative" }, /* @__PURE__ */ React.createElement(
      "input",
      {
        type: showLoginPassword ? "text" : "password",
        value: adminPass,
        onChange: (e) => setAdminPass(e.target.value),
        placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022",
        autoComplete: "current-password",
        className: "w-full bg-[#121212] border border-[#333] px-3.5 py-2.5 pr-14 text-sm text-white placeholder-white/30 focus:border-[#E6C687] focus:outline-none",
        required: true
      }
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        onClick: () => setShowLoginPassword((prev) => !prev),
        className: "absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-white/50 hover:text-[#E6C687] transition-colors"
      },
      showLoginPassword ? "Masquer" : "Afficher"
    ))), loginError && /* @__PURE__ */ React.createElement("div", { className: "p-3 bg-red-950/60 border border-red-800 text-red-200 text-xs" }, loginError), /* @__PURE__ */ React.createElement("div", { className: "pt-2 flex flex-col gap-2" }, /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "submit",
        className: "w-full py-3 bg-[#E6C687] hover:bg-[#D4B373] text-[#121212] font-bold text-xs uppercase tracking-widest transition-colors shadow-sm"
      },
      "Connexion au Dashboard"
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        onClick: onClose,
        className: "w-full py-2.5 text-white/60 hover:text-white text-xs transition-colors"
      },
      "\u2190 Retour \xE0 la Boutique"
    )))));
  }
  return /* @__PURE__ */ React.createElement("div", { className: "fixed inset-0 z-50 bg-[#141414] flex flex-col md:flex-row w-screen h-screen overflow-hidden text-noir antialiased font-sans" }, /* @__PURE__ */ React.createElement("aside", { className: "w-full md:w-64 bg-[#141414] text-white flex flex-col shrink-0 border-b md:border-b-0 md:border-r border-[#262626] h-auto md:h-full z-20" }, /* @__PURE__ */ React.createElement("div", { className: "p-5 border-b border-[#262626] flex items-center justify-between" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "font-serif text-xl font-bold tracking-widest text-[#E6C687]" }, "MODANOVA"), /* @__PURE__ */ React.createElement("div", { className: "text-[10px] uppercase font-mono tracking-wider text-white/50" }, "PANEL ADMINISTRATEUR")), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: onClose,
      className: "md:hidden text-white/60 hover:text-white text-lg p-1",
      title: "Fermer"
    },
    "\u2715"
  )), /* @__PURE__ */ React.createElement("nav", { className: "flex-1 p-3 space-y-1.5 overflow-x-auto md:overflow-y-auto flex md:flex-col" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setActiveTab("products"),
      className: `w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-semibold uppercase tracking-wider rounded-xs transition-colors ${activeTab === "products" ? "bg-[#E6C687] text-[#141414] font-bold shadow-xs" : "text-white/70 hover:bg-white/5 hover:text-white"}`
    },
    /* @__PURE__ */ React.createElement("span", { className: "flex items-center gap-2.5" }, /* @__PURE__ */ React.createElement("span", null, "\u{1F4E6}"), /* @__PURE__ */ React.createElement("span", null, "Produits")),
    /* @__PURE__ */ React.createElement("span", { className: `text-[10px] px-1.5 py-0.5 rounded-full font-mono ${activeTab === "products" ? "bg-[#141414] text-[#E6C687]" : "bg-white/10 text-white/80"}` }, products.length)
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setActiveTab("orders"),
      className: `w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-semibold uppercase tracking-wider rounded-xs transition-colors ${activeTab === "orders" ? "bg-[#E6C687] text-[#141414] font-bold shadow-xs" : "text-white/70 hover:bg-white/5 hover:text-white"}`
    },
    /* @__PURE__ */ React.createElement("span", { className: "flex items-center gap-2.5" }, /* @__PURE__ */ React.createElement("span", null, "\u{1F4CB}"), /* @__PURE__ */ React.createElement("span", null, "Commandes")),
    /* @__PURE__ */ React.createElement("span", { className: `text-[10px] px-1.5 py-0.5 rounded-full font-mono ${activeTab === "orders" ? "bg-[#141414] text-[#E6C687]" : "bg-white/10 text-white/80"}` }, orders.length)
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setActiveTab("slider"),
      className: `w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-semibold uppercase tracking-wider rounded-xs transition-colors ${activeTab === "slider" ? "bg-[#E6C687] text-[#141414] font-bold shadow-xs" : "text-white/70 hover:bg-white/5 hover:text-white"}`
    },
    /* @__PURE__ */ React.createElement("span", { className: "flex items-center gap-2.5" }, /* @__PURE__ */ React.createElement("span", null, "\u{1F5BC}\uFE0F"), /* @__PURE__ */ React.createElement("span", null, "Slider Accueil")),
    /* @__PURE__ */ React.createElement("span", { className: `text-[10px] px-1.5 py-0.5 rounded-full font-mono ${activeTab === "slider" ? "bg-[#141414] text-[#E6C687]" : "bg-white/10 text-white/80"}` }, "3 slides")
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setActiveTab("cms"),
      className: `w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-semibold uppercase tracking-wider rounded-xs transition-colors ${activeTab === "cms" ? "bg-[#E6C687] text-[#141414] font-bold shadow-xs" : "text-white/70 hover:bg-white/5 hover:text-white"}`
    },
    /* @__PURE__ */ React.createElement("span", { className: "flex items-center gap-2.5" }, /* @__PURE__ */ React.createElement("span", null, "\u{1F4DD}"), /* @__PURE__ */ React.createElement("span", null, "Gestion Contenu")),
    /* @__PURE__ */ React.createElement("span", { className: "text-[9px] bg-emerald-600/30 text-emerald-300 px-1.5 py-0.5 rounded-xs font-mono" }, "CMS")
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setActiveTab("testimonials"),
      className: `w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-semibold uppercase tracking-wider rounded-xs transition-colors ${activeTab === "testimonials" ? "bg-[#E6C687] text-[#141414] font-bold shadow-xs" : "text-white/70 hover:bg-white/5 hover:text-white"}`
    },
    /* @__PURE__ */ React.createElement("span", { className: "flex items-center gap-2.5" }, /* @__PURE__ */ React.createElement("span", null, "\u2B50"), /* @__PURE__ */ React.createElement("span", null, "T\xE9moignages")),
    /* @__PURE__ */ React.createElement("span", { className: `text-[10px] px-1.5 py-0.5 rounded-full font-mono ${activeTab === "testimonials" ? "bg-[#141414] text-[#E6C687]" : "bg-white/10 text-white/80"}` }, (testimonials || []).length)
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setActiveTab("security"),
      className: `w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-semibold uppercase tracking-wider rounded-xs transition-colors ${activeTab === "security" ? "bg-[#E6C687] text-[#141414] font-bold shadow-xs" : "text-white/70 hover:bg-white/5 hover:text-white"}`
    },
    /* @__PURE__ */ React.createElement("span", { className: "flex items-center gap-2.5" }, /* @__PURE__ */ React.createElement("span", null, "\u{1F512}"), /* @__PURE__ */ React.createElement("span", null, "S\xE9curit\xE9 & WhatsApp")),
    /* @__PURE__ */ React.createElement("span", { className: "text-[9px] bg-[#25D366]/25 text-[#25D366] px-1.5 py-0.5 rounded-xs font-mono font-bold" }, "PRO")
  )), /* @__PURE__ */ React.createElement("div", { className: "p-4 border-t border-[#262626] hidden md:flex flex-col gap-2" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: handleClearCache,
      disabled: clearingCache,
      className: "w-full py-2.5 px-3 bg-[#E6C687]/15 hover:bg-[#E6C687]/25 border border-[#E6C687]/40 text-[#E6C687] text-xs font-bold uppercase tracking-wider rounded-xs transition-colors flex items-center justify-center gap-2",
      title: "Vider le cache serveur et navigateur et recharger depuis Firebase"
    },
    /* @__PURE__ */ React.createElement("span", null, clearingCache ? "\u23F3" : "\u{1F9F9}"),
    /* @__PURE__ */ React.createElement("span", null, clearingCache ? "Vidage du cache..." : "Vider le Cache")
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: onClose,
      className: "w-full py-2.5 px-3 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white text-xs font-semibold rounded-xs transition-colors flex items-center justify-center gap-2"
    },
    /* @__PURE__ */ React.createElement("span", null, "\u2190"),
    /* @__PURE__ */ React.createElement("span", null, "Voir la Boutique")
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: onLogout,
      className: "w-full py-2 px-3 text-red-400 hover:text-red-300 text-xs font-semibold text-center transition-colors"
    },
    "D\xE9connexion"
  ))), /* @__PURE__ */ React.createElement("main", { className: "flex-1 flex flex-col h-full overflow-hidden bg-[#F5F4F0]" }, liveNewOrderAlert && /* @__PURE__ */ React.createElement("div", { className: "bg-[#065F46] text-white px-6 py-3 flex flex-wrap items-center justify-between gap-3 shadow-md shrink-0 animate-fade-up" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3 text-xs" }, /* @__PURE__ */ React.createElement("span", { className: "text-lg" }, "\u{1F514}"), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { className: "font-bold uppercase tracking-wider text-[#A7F3D0] mr-2" }, "Nouvelle Commande Re\xE7ue !"), /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("strong", null, liveNewOrderAlert.id), " \u2014 ", liveNewOrderAlert.customerName, " (", liveNewOrderAlert.customerPhone, ") \u2022 ", liveNewOrderAlert.city, " \u2022 ", /* @__PURE__ */ React.createElement("strong", null, Number(liveNewOrderAlert.total).toLocaleString(), " MAD")))), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement(
    "a",
    {
      href: buildAdminCustomerWhatsAppLink(liveNewOrderAlert, lang),
      target: "_blank",
      rel: "noopener noreferrer",
      className: "px-3 py-1.5 bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-bold rounded-xs flex items-center gap-1.5 shadow-2xs"
    },
    /* @__PURE__ */ React.createElement(WhatsAppIcon, { className: "w-3.5 h-3.5 fill-white" }),
    /* @__PURE__ */ React.createElement("span", null, "Contacter Client sur WhatsApp")
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: () => {
        setActiveTab("orders");
        setLiveNewOrderAlert(null);
      },
      className: "px-3 py-1.5 bg-white/15 hover:bg-white/25 text-white text-xs font-semibold rounded-xs"
    },
    "Voir la commande"
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: () => setLiveNewOrderAlert(null),
      className: "text-white/70 hover:text-white px-1.5"
    },
    "\u2715"
  ))), /* @__PURE__ */ React.createElement("header", { className: "px-6 py-4 bg-white border-b border-taupe/20 flex items-center justify-between shadow-xs shrink-0" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h2", { className: "font-serif text-xl font-bold text-noir flex items-center gap-2" }, activeTab === "products" && "Catalogue & Produits", activeTab === "orders" && "Gestion des Commandes", activeTab === "slider" && "Slider de la Page d'Accueil", activeTab === "cms" && "Gestion du Contenu Fixe (CMS)", activeTab === "testimonials" && "Avis & T\xE9moignages Clients", activeTab === "security" && "S\xE9curit\xE9 Admin, Notifications WhatsApp & Logo de Partage"), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-taupe-dark" }, activeTab === "products" && "G\xE9rez vos cr\xE9ations, photos Firebase, prix et stocks.", activeTab === "orders" && "Suivez et confirmez les commandes COD des clients via WhatsApp.", activeTab === "slider" && "Personnalisez vos 3 banni\xE8res et uploadez des fonds haute d\xE9finition.", activeTab === "cms" && "Modifiez les textes et photos du site sans toucher au code source.", activeTab === "testimonials" && "Ajoutez, modifiez ou supprimez les retours d\u2019exp\xE9rience de vos clients.", activeTab === "security" && "Changez votre mot de passe administrateur et configurez les alertes WhatsApp automatiques des commandes.")), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3" }, activeTab === "products" && /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: onAddProduct,
      className: "px-4 py-2 bg-noir hover:bg-caramel text-white text-xs font-bold uppercase tracking-wider rounded-xs transition-colors flex items-center gap-2 shadow-xs"
    },
    /* @__PURE__ */ React.createElement("span", null, "+"),
    /* @__PURE__ */ React.createElement("span", null, "Nouveau Produit")
  ), activeTab === "slider" && /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: handleSaveAllSlides,
      disabled: sliderSaving,
      className: "px-4 py-2 bg-noir hover:bg-caramel text-white text-xs font-bold uppercase tracking-wider rounded-xs transition-colors flex items-center gap-2 shadow-xs"
    },
    /* @__PURE__ */ React.createElement("span", null, sliderSaving ? "\u23F3 Sauvegarde..." : "\u{1F4BE} Enregistrer Slider")
  ), activeTab === "cms" && /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: handleSaveCms,
      disabled: cmsSaving,
      className: "px-4 py-2 bg-noir hover:bg-caramel text-white text-xs font-bold uppercase tracking-wider rounded-xs transition-colors flex items-center gap-2 shadow-xs"
    },
    /* @__PURE__ */ React.createElement("span", null, cmsSaving ? "\u23F3 Sauvegarde..." : "\u{1F4BE} Enregistrer Contenu")
  ), activeTab === "testimonials" && /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: openAddTestimonial,
      className: "px-4 py-2 bg-noir hover:bg-caramel text-white text-xs font-bold uppercase tracking-wider rounded-xs transition-colors flex items-center gap-2 shadow-xs"
    },
    /* @__PURE__ */ React.createElement("span", null, "+"),
    /* @__PURE__ */ React.createElement("span", null, "Ajouter T\xE9moignage")
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: handleClearCache,
      disabled: clearingCache,
      className: "px-3.5 py-2 bg-[#FAF9F6] hover:bg-noir text-noir hover:text-[#E6C687] border border-taupe/40 text-xs font-bold uppercase tracking-wider rounded-xs transition-colors flex items-center gap-1.5 shadow-2xs",
      title: "Vider le cache du site et resynchroniser avec Firebase"
    },
    /* @__PURE__ */ React.createElement("span", null, clearingCache ? "\u23F3" : "\u{1F9F9}"),
    /* @__PURE__ */ React.createElement("span", { className: "hidden sm:inline" }, clearingCache ? "Vidage..." : "Vider le Cache")
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: onClose,
      className: "p-2 text-taupe-dark hover:text-noir text-lg rounded-xs hover:bg-black/5 transition-colors",
      title: "Fermer le panel"
    },
    "\u2715"
  ))), /* @__PURE__ */ React.createElement("div", { className: "flex-1 overflow-y-auto p-4 md:p-6 space-y-6" }, /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4" }, /* @__PURE__ */ React.createElement("div", { className: "bg-white p-4 border border-taupe/20 shadow-2xs rounded-xs" }, /* @__PURE__ */ React.createElement("div", { className: "text-[10px] uppercase font-bold tracking-wider text-taupe-dark" }, "Chiffre d'Affaires"), /* @__PURE__ */ React.createElement("div", { className: "font-serif text-2xl font-bold text-caramel mt-1 tabular-nums" }, (kpis && (kpis.revenue != null ? kpis.revenue : kpis.totalSales) || 0).toLocaleString(), " MAD"), /* @__PURE__ */ React.createElement("div", { className: "text-[11px] text-taupe mt-0.5" }, "Commandes valid\xE9es & en cours")), /* @__PURE__ */ React.createElement(
    "div",
    {
      onClick: () => setActiveTab("orders"),
      className: "bg-white p-4 border border-taupe/20 hover:border-caramel shadow-2xs rounded-xs cursor-pointer transition-colors group",
      title: "Cliquez pour afficher toutes les commandes"
    },
    /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ React.createElement("div", { className: "text-[10px] uppercase font-bold tracking-wider text-taupe-dark group-hover:text-noir" }, "Total Commandes"), /* @__PURE__ */ React.createElement("span", { className: "text-[10px] font-semibold text-caramel group-hover:underline" }, "Voir tout \u2192")),
    /* @__PURE__ */ React.createElement("div", { className: "font-serif text-2xl font-bold text-noir mt-1 tabular-nums" }, (kpis && (kpis.totalOrders != null ? kpis.totalOrders : kpis.orderCount)) ?? (orders && orders.length || 0)),
    /* @__PURE__ */ React.createElement("div", { className: "text-[11px] text-taupe mt-0.5" }, (orders || []).filter((o) => o && o.status === "En attente").length, " en attente de confirmation")
  ), /* @__PURE__ */ React.createElement("div", { className: "bg-white p-4 border border-taupe/20 shadow-2xs rounded-xs" }, /* @__PURE__ */ React.createElement("div", { className: "text-[10px] uppercase font-bold tracking-wider text-taupe-dark" }, "Panier Moyen"), /* @__PURE__ */ React.createElement("div", { className: "font-serif text-2xl font-bold text-noir mt-1 tabular-nums" }, kpis && (kpis.avgOrderValue != null ? kpis.avgOrderValue : kpis.avgBasket) || 0, " MAD"), /* @__PURE__ */ React.createElement("div", { className: "text-[11px] text-taupe mt-0.5" }, "Moyenne par panier")), /* @__PURE__ */ React.createElement(
    "div",
    {
      onClick: () => setActiveTab("products"),
      className: "bg-white p-4 border border-taupe/20 hover:border-caramel shadow-2xs rounded-xs cursor-pointer transition-colors group",
      title: "Cliquez pour afficher tous les produits"
    },
    /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ React.createElement("div", { className: "text-[10px] uppercase font-bold tracking-wider text-taupe-dark group-hover:text-noir" }, "Articles en Ligne"), /* @__PURE__ */ React.createElement("span", { className: "text-[10px] font-semibold text-caramel group-hover:underline" }, "Voir tout \u2192")),
    /* @__PURE__ */ React.createElement("div", { className: "font-serif text-2xl font-bold text-noir mt-1 tabular-nums" }, (products || []).length),
    /* @__PURE__ */ React.createElement("div", { className: "text-[11px] text-taupe mt-0.5" }, (products || []).filter((p) => p && (p.stock || 0) > 0).length, " en stock imm\xE9diat")
  )), activeTab === "products" && /* @__PURE__ */ React.createElement("div", { className: "bg-white border border-taupe/20 rounded-xs shadow-2xs overflow-hidden" }, /* @__PURE__ */ React.createElement("div", { className: "p-4 border-b border-taupe/15 flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between bg-canvas/40" }, /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap items-center gap-2.5 w-full lg:w-auto" }, /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      value: prodSearch,
      onChange: (e) => {
        setProdSearch(e.target.value);
        setProdPage(1);
      },
      placeholder: "Rechercher par nom ou r\xE9f\xE9rence...",
      className: "w-full sm:w-56 bg-white border border-taupe/30 px-3 py-1.5 text-xs text-noir focus:border-caramel"
    }
  ), /* @__PURE__ */ React.createElement(
    "select",
    {
      value: prodCat,
      onChange: (e) => {
        setProdCat(e.target.value);
        setProdPage(1);
      },
      className: "bg-white border border-taupe/30 px-3 py-1.5 text-xs text-noir focus:border-caramel"
    },
    /* @__PURE__ */ React.createElement("option", { value: "ALL" }, "Toutes Cat\xE9gories"),
    PRODUCT_CATEGORIES.map((c) => /* @__PURE__ */ React.createElement("option", { key: c, value: c }, c))
  ), /* @__PURE__ */ React.createElement(
    "select",
    {
      value: prodHomeFilter,
      onChange: (e) => {
        setProdHomeFilter(e.target.value);
        setProdPage(1);
      },
      className: "bg-white border border-taupe/30 px-3 py-1.5 text-xs text-noir focus:border-caramel font-medium",
      title: "Filtrer selon la pr\xE9sence sur la Page Principale (Index)"
    },
    /* @__PURE__ */ React.createElement("option", { value: "ALL" }, "Affichage : Tous (", (products || []).length, ")"),
    /* @__PURE__ */ React.createElement("option", { value: "HOME_ONLY" }, "\u{1F3E0} Sur Page Principale (", (products || []).filter((p) => p && p.showOnHome !== false).length, ")"),
    /* @__PURE__ */ React.createElement("option", { value: "CATALOG_ONLY" }, "\u{1F4C2} Catalogue seul (", (products || []).filter((p) => p && p.showOnHome === false).length, ")")
  ), /* @__PURE__ */ React.createElement("div", { className: "text-[11px] text-taupe-dark bg-white/80 border border-taupe/20 px-2.5 py-1 rounded-xs flex items-center gap-1.5" }, /* @__PURE__ */ React.createElement("span", null, "\u21C5"), /* @__PURE__ */ React.createElement("span", null, "D\xE9placez vos produits ou cochez ", /* @__PURE__ */ React.createElement("strong", null, "\u{1F3E0} Page Index"), " pour choisir ceux affich\xE9s sur l'accueil"))), /* @__PURE__ */ React.createElement("div", { className: "text-xs font-semibold text-taupe-dark whitespace-nowrap flex items-center gap-2 justify-end" }, reorderingProds && /* @__PURE__ */ React.createElement("span", { className: "text-[11px] text-caramel font-bold animate-pulse" }, "\u23F3 Sauvegarde de l'ordre..."), /* @__PURE__ */ React.createElement("span", null, filteredProducts.length === 0 ? "0 produit" : `Produits ${startProdIdx + 1}\u2013${Math.min(startProdIdx + PRODUCTS_PER_PAGE, filteredProducts.length)} sur ${filteredProducts.length}`))), /* @__PURE__ */ React.createElement("div", { className: "overflow-x-auto" }, /* @__PURE__ */ React.createElement("table", { className: "w-full text-left text-xs border-collapse" }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", { className: "bg-canvas border-b border-taupe/20 text-taupe-dark uppercase text-[10px] tracking-wider" }, /* @__PURE__ */ React.createElement("th", { className: "p-3 text-center w-36" }, "Ordre / Position"), /* @__PURE__ */ React.createElement("th", { className: "p-3" }, "Aper\xE7u"), /* @__PURE__ */ React.createElement("th", { className: "p-3" }, "D\xE9signation"), /* @__PURE__ */ React.createElement("th", { className: "p-3 text-center" }, "Page Principale (Index)"), /* @__PURE__ */ React.createElement("th", { className: "p-3" }, "Cat\xE9gorie"), /* @__PURE__ */ React.createElement("th", { className: "p-3" }, "Prix"), /* @__PURE__ */ React.createElement("th", { className: "p-3" }, "Stock"), /* @__PURE__ */ React.createElement("th", { className: "p-3 text-right" }, "Actions"))), /* @__PURE__ */ React.createElement("tbody", { className: "divide-y divide-taupe/15" }, paginatedProducts.length === 0 ? /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("td", { colSpan: "8", className: "p-8 text-center text-taupe-dark" }, "Aucun produit ne correspond \xE0 votre recherche.")) : paginatedProducts.map((p, idx) => {
    const prodNum = startProdIdx + idx + 1;
    const globalIdx = (products || []).findIndex((item) => Number(item?.id) === Number(p.id));
    const globalRank = globalIdx >= 0 ? globalIdx + 1 : prodNum;
    const totalGlobalProds = (products || []).length;
    const imgs = Array.isArray(p.images) && p.images.length > 0 ? p.images : [];
    const curThumbIdx = imgs.length > 0 ? (adminThumbIdxMap[p.id] || 0) % imgs.length : 0;
    const thumb = imgs[curThumbIdx] || "";
    const isConfirmingProdDelete = confirmDeleteProdId === p.id;
    const isDeletingProd = deletingProdId === p.id;
    const isDragged = draggedProdId === p.id;
    const isDragOver = dragOverProdId === p.id && draggedProdId !== p.id;
    return /* @__PURE__ */ React.createElement(
      "tr",
      {
        key: p.id || prodNum,
        draggable: !reorderingProds,
        onDragStart: (e) => {
          setDraggedProdId(p.id);
          try {
            e.dataTransfer.effectAllowed = "move";
            e.dataTransfer.setData("text/plain", String(p.id));
          } catch {
          }
        },
        onDragOver: (e) => {
          e.preventDefault();
          if (dragOverProdId !== p.id) {
            setDragOverProdId(p.id);
          }
        },
        onDragLeave: () => {
          if (dragOverProdId === p.id) {
            setDragOverProdId(null);
          }
        },
        onDrop: (e) => {
          e.preventDefault();
          const sourceId = draggedProdId || e.dataTransfer.getData("text/plain");
          handleDropProductOnTarget(sourceId, p.id);
        },
        onDragEnd: () => {
          setDraggedProdId(null);
          setDragOverProdId(null);
        },
        className: `transition-colors ${isDragged ? "opacity-50 bg-caramel/10" : isDragOver ? "bg-caramel/15 border-y-2 border-caramel" : "hover:bg-canvas/50"}`
      },
      /* @__PURE__ */ React.createElement("td", { className: "p-3" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-center gap-1.5" }, /* @__PURE__ */ React.createElement(
        "span",
        {
          className: "cursor-grab active:cursor-grabbing text-taupe hover:text-noir select-none px-1 text-sm font-bold",
          title: "Glisser-d\xE9poser cette ligne pour changer l'ordre"
        },
        "\u22EE\u22EE"
      ), /* @__PURE__ */ React.createElement(
        "select",
        {
          value: globalRank,
          disabled: reorderingProds,
          onChange: (e) => handleMoveProductToRank(p.id, Number(e.target.value)),
          className: `px-2 py-1 rounded-xs border font-mono text-[11px] font-bold tabular-nums cursor-pointer transition-colors ${globalRank === 1 ? "bg-noir text-[#E6C687] border-noir" : "bg-white text-noir border-taupe/35 hover:border-caramel"}`,
          title: "Choisir directement la position de ce produit (1er, 2\xE8me, 3\xE8me, 12\xE8me...)"
        },
        Array.from({ length: totalGlobalProds }, (_, i) => i + 1).map((posNum) => /* @__PURE__ */ React.createElement("option", { key: posNum, value: posNum, className: "bg-white text-noir font-mono" }, posNum === 1 ? "1er" : `${posNum}e`))
      ), /* @__PURE__ */ React.createElement("div", { className: "flex flex-col gap-0.5" }, /* @__PURE__ */ React.createElement(
        "button",
        {
          type: "button",
          disabled: reorderingProds || globalRank <= 1,
          onClick: () => handleStepProductRank(p.id, -1),
          className: `w-5 h-4 flex items-center justify-center text-[9px] font-bold border rounded-2xs transition-colors ${globalRank <= 1 ? "border-taupe/15 text-taupe/40 cursor-not-allowed" : "border-taupe/30 bg-white hover:bg-noir hover:text-white text-noir"}`,
          title: "Monter d'une position (\u2191)"
        },
        "\u25B2"
      ), /* @__PURE__ */ React.createElement(
        "button",
        {
          type: "button",
          disabled: reorderingProds || globalRank >= totalGlobalProds,
          onClick: () => handleStepProductRank(p.id, 1),
          className: `w-5 h-4 flex items-center justify-center text-[9px] font-bold border rounded-2xs transition-colors ${globalRank >= totalGlobalProds ? "border-taupe/15 text-taupe/40 cursor-not-allowed" : "border-taupe/30 bg-white hover:bg-noir hover:text-white text-noir"}`,
          title: "Descendre d'une position (\u2193)"
        },
        "\u25BC"
      )))),
      /* @__PURE__ */ React.createElement("td", { className: "p-3" }, /* @__PURE__ */ React.createElement("div", { className: "w-16 h-20 bg-[#F7F5F0] border border-taupe/20 overflow-hidden relative rounded-xs p-1 flex items-center justify-center group" }, thumb ? /* @__PURE__ */ React.createElement("img", { src: thumb, alt: p.nameFr, className: "w-full h-full object-contain" }) : /* @__PURE__ */ React.createElement("div", { className: "w-full h-full flex items-center justify-center text-[9px] text-taupe" }, "Sans photo"), imgs.length > 1 && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(
        "button",
        {
          type: "button",
          onClick: () => setAdminThumbIdxMap((prev) => ({
            ...prev,
            [p.id]: ((prev[p.id] || 0) - 1 + imgs.length) % imgs.length
          })),
          className: "absolute start-0.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white/90 hover:bg-noir text-noir hover:text-white text-[10px] font-bold flex items-center justify-center shadow-2xs",
          title: "Photo pr\xE9c\xE9dente"
        },
        "\u2039"
      ), /* @__PURE__ */ React.createElement(
        "button",
        {
          type: "button",
          onClick: () => setAdminThumbIdxMap((prev) => ({
            ...prev,
            [p.id]: ((prev[p.id] || 0) + 1) % imgs.length
          })),
          className: "absolute end-0.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white/90 hover:bg-noir text-noir hover:text-white text-[10px] font-bold flex items-center justify-center shadow-2xs",
          title: "Photo suivante"
        },
        "\u203A"
      ), /* @__PURE__ */ React.createElement("span", { className: "absolute bottom-0.5 end-0.5 bg-black/70 text-white text-[8px] font-mono px-1 rounded-2xs tabular-nums" }, curThumbIdx + 1, "/", imgs.length)))),
      /* @__PURE__ */ React.createElement("td", { className: "p-3" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-1.5 flex-wrap" }, /* @__PURE__ */ React.createElement("span", { className: "font-semibold text-noir" }, p.nameFr), globalRank === 1 && /* @__PURE__ */ React.createElement("span", { className: "text-[9px] uppercase tracking-wider font-bold text-caramel" }, "\u2022 1er de la liste"), p.videoUrl && String(p.videoUrl).trim() && /* @__PURE__ */ React.createElement("span", { className: "px-1.5 py-0.5 bg-noir text-[#E6C687] text-[9px] font-bold uppercase rounded-2xs" }, "\u{1F3AC} Vid\xE9o")), /* @__PURE__ */ React.createElement("div", { className: "text-[11px] text-taupe-dark font-arabic" }, p.nameAr), /* @__PURE__ */ React.createElement("div", { className: "text-[10px] text-taupe font-mono mt-0.5" }, "REF: ", p.id)),
      /* @__PURE__ */ React.createElement("td", { className: "p-3 text-center" }, /* @__PURE__ */ React.createElement(
        "button",
        {
          type: "button",
          disabled: togglingHomeProdId === p.id,
          onClick: () => handleToggleProductHome(p),
          className: `px-2.5 py-1.5 rounded-xs border text-[10px] font-bold uppercase tracking-wider transition-all inline-flex items-center gap-1.5 ${p.showOnHome !== false ? "bg-emerald-50 border-emerald-400 text-emerald-800 hover:bg-emerald-100" : "bg-canvas border-taupe/35 text-taupe-dark hover:border-noir hover:text-noir"}`,
          title: "Cliquez pour afficher ou masquer ce produit sur la Page Principale (Index)"
        },
        /* @__PURE__ */ React.createElement("span", null, p.showOnHome !== false ? "\u{1F3E0} Oui (Index)" : "\u{1F4C2} Non (Catalogue)")
      )),
      /* @__PURE__ */ React.createElement("td", { className: "p-3" }, /* @__PURE__ */ React.createElement("span", { className: "inline-block px-2 py-0.5 bg-canvas border border-taupe/20 text-[10px] text-noir" }, p.category)),
      /* @__PURE__ */ React.createElement("td", { className: "p-3" }, /* @__PURE__ */ React.createElement("div", { className: "font-bold text-noir tabular-nums" }, p.price, " MAD"), p.oldPrice && /* @__PURE__ */ React.createElement("div", { className: "text-[10px] text-taupe line-through tabular-nums" }, p.oldPrice, " MAD")),
      /* @__PURE__ */ React.createElement("td", { className: "p-3" }, p.stock > 0 ? /* @__PURE__ */ React.createElement("span", { className: "text-emerald-700 font-semibold" }, p.stock, " ex. total") : /* @__PURE__ */ React.createElement("span", { className: "text-red-600 font-semibold" }, "Rupture (0)"), hasVariantStockMatrix(p) && /* @__PURE__ */ React.createElement("div", { className: "mt-1 flex flex-wrap gap-1 max-w-[210px]" }, Object.entries(p.variantStock).slice(0, 6).map(([k, v]) => {
        const [sz, col] = String(k).split("__");
        const qVal = Number(v) || 0;
        return /* @__PURE__ */ React.createElement(
          "span",
          {
            key: k,
            className: `text-[9px] font-mono px-1 py-0.5 rounded-2xs border ${qVal > 0 ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-red-50 border-red-200 text-red-700 line-through"}`,
            title: `Taille ${sz} \u2014 Couleur ${getColorLabel(col, "fr")} : ${qVal} en stock`
          },
          sz,
          "\xB7",
          getColorLabel(col, "fr"),
          ":",
          qVal
        );
      }), Object.keys(p.variantStock).length > 6 && /* @__PURE__ */ React.createElement("span", { className: "text-[9px] text-taupe-dark font-mono" }, "+", Object.keys(p.variantStock).length - 6))),
      /* @__PURE__ */ React.createElement("td", { className: "p-3 text-right" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-end gap-1.5 flex-wrap" }, /* @__PURE__ */ React.createElement(
        "button",
        {
          onClick: () => onCopyProductLink(p.id),
          className: "px-2 py-1 bg-white border border-taupe/30 hover:border-noir text-noir text-[11px] rounded-xs shadow-2xs",
          title: "Copier le lien SEO du produit"
        },
        "\u{1F517} Copier Lien"
      ), /* @__PURE__ */ React.createElement(
        "button",
        {
          onClick: () => onViewProductPage(p.id),
          className: "px-2 py-1 bg-white border border-taupe/30 hover:border-noir text-noir text-[11px] rounded-xs shadow-2xs",
          title: "Voir la page produit"
        },
        "\u{1F441}\uFE0F Voir"
      ), /* @__PURE__ */ React.createElement(
        "button",
        {
          onClick: () => onEditProduct(p),
          className: "px-2 py-1 bg-noir hover:bg-caramel text-white text-[11px] rounded-xs transition-colors",
          title: "Modifier le produit et r\xE9organiser ses photos"
        },
        "\u270F\uFE0F Modifier"
      ), isConfirmingProdDelete ? /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-1 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded-xs" }, /* @__PURE__ */ React.createElement(
        "button",
        {
          onClick: () => handleDeleteProduct(p.id),
          disabled: isDeletingProd,
          className: "px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold rounded-xs transition-colors whitespace-nowrap",
          title: "Confirmer la suppression d\xE9finitive"
        },
        isDeletingProd ? "..." : "Supprimer"
      ), /* @__PURE__ */ React.createElement(
        "button",
        {
          onClick: () => setConfirmDeleteProdId(null),
          className: "px-1.5 py-1 text-taupe-dark hover:text-noir text-[10px] font-semibold",
          title: "Annuler"
        },
        "Annuler"
      )) : /* @__PURE__ */ React.createElement(
        "button",
        {
          onClick: () => setConfirmDeleteProdId(p.id),
          disabled: isDeletingProd,
          className: "px-2 py-1 border border-red-200 hover:border-red-600 bg-red-50/50 hover:bg-red-600 text-red-600 hover:text-white text-[11px] font-bold rounded-xs transition-colors",
          title: "Supprimer ce produit"
        },
        "\u2715"
      )))
    );
  })))), filteredProducts.length > 0 && /* @__PURE__ */ React.createElement("div", { className: "p-4 border-t border-taupe/15 bg-canvas/40 flex flex-col sm:flex-row items-center justify-between gap-3" }, /* @__PURE__ */ React.createElement("div", { className: "text-xs text-taupe-dark" }, "Affichage des produits ", /* @__PURE__ */ React.createElement("span", { className: "font-bold text-noir" }, startProdIdx + 1), " \xE0", " ", /* @__PURE__ */ React.createElement("span", { className: "font-bold text-noir" }, Math.min(startProdIdx + PRODUCTS_PER_PAGE, filteredProducts.length)), " sur", " ", /* @__PURE__ */ React.createElement("span", { className: "font-bold text-noir" }, filteredProducts.length), " (Page ", safeProdPage, " sur ", totalProdPages, ")"), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-1.5 flex-wrap justify-center" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setProdPage(Math.max(1, safeProdPage - 1)),
      disabled: safeProdPage <= 1,
      className: `px-3 py-1.5 text-xs font-semibold rounded-xs border transition-colors ${safeProdPage <= 1 ? "bg-canvas text-taupe border-taupe/20 cursor-not-allowed opacity-60" : "bg-white text-noir border-taupe/30 hover:border-noir"}`
    },
    "\u2190 Pr\xE9c\xE9dent"
  ), Array.from({ length: totalProdPages }, (_, i) => i + 1).map((pageNum) => /* @__PURE__ */ React.createElement(
    "button",
    {
      key: pageNum,
      onClick: () => setProdPage(pageNum),
      className: `w-8 h-8 text-xs font-bold rounded-xs border transition-colors tabular-nums ${safeProdPage === pageNum ? "bg-noir text-white border-noir shadow-2xs" : "bg-white text-noir border-taupe/30 hover:border-caramel hover:text-caramel"}`,
      title: `Page ${pageNum} (Produits ${(pageNum - 1) * PRODUCTS_PER_PAGE + 1} \xE0 ${Math.min(pageNum * PRODUCTS_PER_PAGE, filteredProducts.length)})`
    },
    pageNum
  )), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setProdPage(Math.min(totalProdPages, safeProdPage + 1)),
      disabled: safeProdPage >= totalProdPages,
      className: `px-3 py-1.5 text-xs font-semibold rounded-xs border transition-colors ${safeProdPage >= totalProdPages ? "bg-canvas text-taupe border-taupe/20 cursor-not-allowed opacity-60" : "bg-white text-noir border-taupe/30 hover:border-noir"}`
    },
    "Suivant \u2192"
  )))), activeTab === "orders" && /* @__PURE__ */ React.createElement("div", { className: "bg-white border border-taupe/20 rounded-xs shadow-2xs overflow-hidden" }, /* @__PURE__ */ React.createElement("div", { className: "p-4 border-b border-taupe/15 flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between bg-canvas/40" }, /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap items-center gap-2" }, ["ALL", "En attente", "Confirm\xE9e", "En cours", "Livr\xE9e", "Annul\xE9e"].map((s) => /* @__PURE__ */ React.createElement(
    "button",
    {
      key: s,
      onClick: () => {
        setOrderFilter(s);
        setOrderPage(1);
      },
      className: `px-3 py-1.5 text-xs font-semibold rounded-xs transition-colors whitespace-nowrap ${orderFilter === s ? "bg-noir text-white" : "bg-white border border-taupe/25 text-taupe-dark hover:text-noir"}`
    },
    s === "ALL" ? `Toutes (${(orders || []).length})` : `${s} (${(orders || []).filter((o) => o && o.status === s).length})`
  ))), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3 justify-between lg:justify-end" }, /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      value: orderSearch,
      onChange: (e) => {
        setOrderSearch(e.target.value);
        setOrderPage(1);
      },
      placeholder: "Rechercher N\xB0, client, t\xE9l, ville...",
      className: "w-full sm:w-60 bg-white border border-taupe/30 px-3 py-1.5 text-xs text-noir focus:border-caramel rounded-xs"
    }
  ), /* @__PURE__ */ React.createElement("div", { className: "text-xs font-semibold text-taupe-dark whitespace-nowrap" }, filteredOrders.length === 0 ? "0 commande" : `Commandes ${startOrderIdx + 1}\u2013${Math.min(startOrderIdx + ORDERS_PER_PAGE, filteredOrders.length)} sur ${filteredOrders.length}`))), /* @__PURE__ */ React.createElement("div", { className: "overflow-x-auto" }, /* @__PURE__ */ React.createElement("table", { className: "w-full text-left text-xs border-collapse" }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", { className: "bg-canvas border-b border-taupe/20 text-taupe-dark uppercase text-[10px] tracking-wider" }, /* @__PURE__ */ React.createElement("th", { className: "p-3 text-center w-12" }, "#"), /* @__PURE__ */ React.createElement("th", { className: "p-3" }, "N\xB0 Commande"), /* @__PURE__ */ React.createElement("th", { className: "p-3" }, "Date"), /* @__PURE__ */ React.createElement("th", { className: "p-3" }, "Client & T\xE9l\xE9phone"), /* @__PURE__ */ React.createElement("th", { className: "p-3" }, "Ville & Adresse"), /* @__PURE__ */ React.createElement("th", { className: "p-3" }, "Montant (COD)"), /* @__PURE__ */ React.createElement("th", { className: "p-3" }, "Statut"), /* @__PURE__ */ React.createElement("th", { className: "p-3 text-right" }, "Actions Rapides"))), /* @__PURE__ */ React.createElement("tbody", { className: "divide-y divide-taupe/15" }, paginatedOrders.length === 0 ? /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("td", { colSpan: "8", className: "p-8 text-center text-taupe-dark" }, "Aucune commande trouv\xE9e.")) : paginatedOrders.map((o, idx) => {
    const orderNum = startOrderIdx + idx + 1;
    const parsedDate = o.date ? new Date(o.date) : null;
    const formattedDate = parsedDate && !isNaN(parsedDate.getTime()) ? parsedDate.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" }) : "\u2014";
    const isConfirmingDelete = confirmDeleteOrderId === o.id;
    const isDeleting = deletingOrderId === o.id;
    return /* @__PURE__ */ React.createElement("tr", { key: o.id || orderNum, className: "hover:bg-canvas/50 transition-colors" }, /* @__PURE__ */ React.createElement("td", { className: "p-3 text-center" }, /* @__PURE__ */ React.createElement("span", { className: "inline-flex items-center justify-center w-6 h-6 rounded-xs bg-noir/5 border border-taupe/25 font-mono text-[11px] font-bold text-noir tabular-nums" }, orderNum)), /* @__PURE__ */ React.createElement("td", { className: "p-3 font-mono font-bold text-noir whitespace-nowrap" }, o.id), /* @__PURE__ */ React.createElement("td", { className: "p-3 text-taupe-dark whitespace-nowrap" }, formattedDate), /* @__PURE__ */ React.createElement("td", { className: "p-3" }, /* @__PURE__ */ React.createElement("div", { className: "font-semibold text-noir" }, o.customerName || "\u2014"), /* @__PURE__ */ React.createElement("div", { className: "text-[11px] font-mono text-caramel" }, o.customerPhone || "\u2014")), /* @__PURE__ */ React.createElement("td", { className: "p-3" }, /* @__PURE__ */ React.createElement("div", { className: "font-medium text-noir" }, o.city || "\u2014"), /* @__PURE__ */ React.createElement("div", { className: "text-[10px] text-taupe truncate max-w-[200px]", title: o.address }, o.address || "\u2014")), /* @__PURE__ */ React.createElement("td", { className: "p-3 font-bold text-noir tabular-nums whitespace-nowrap" }, o.total != null ? `${o.total} MAD` : "\u2014"), /* @__PURE__ */ React.createElement("td", { className: "p-3" }, /* @__PURE__ */ React.createElement(
      "select",
      {
        value: o.status || "En attente",
        onChange: (e) => handleStatusChange(o.id, e.target.value),
        className: "bg-white border border-taupe/30 px-2 py-1 text-xs text-noir font-semibold rounded-xs"
      },
      ["En attente", "Confirm\xE9e", "En cours", "Livr\xE9e", "Annul\xE9e"].map((s) => /* @__PURE__ */ React.createElement("option", { key: s, value: s }, s))
    )), /* @__PURE__ */ React.createElement("td", { className: "p-3 text-right" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-end gap-1.5" }, /* @__PURE__ */ React.createElement(
      "a",
      {
        href: buildAdminCustomerWhatsAppLink(o, lang),
        target: "_blank",
        rel: "noopener noreferrer",
        className: "px-2.5 py-1.5 bg-[#25D366] hover:bg-[#1EBE5D] text-white font-semibold text-[11px] rounded-xs shadow-2xs flex items-center gap-1 transition-colors whitespace-nowrap",
        title: `Envoyer message de confirmation \xE0 ${o.customerPhone}`
      },
      /* @__PURE__ */ React.createElement(WhatsAppIcon, { className: "w-3.5 h-3.5 fill-white shrink-0" }),
      /* @__PURE__ */ React.createElement("span", null, "Confirmer WhatsApp")
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => onViewInvoice(o),
        className: "px-2 py-1.5 border border-taupe/30 hover:border-noir text-noir text-[11px] rounded-xs bg-white shadow-2xs whitespace-nowrap",
        title: "Imprimer la Facture"
      },
      "\u{1F5A8}\uFE0F Facture"
    ), isConfirmingDelete ? /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-1 bg-red-50 border border-red-200 px-1.5 py-1 rounded-xs" }, /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => handleDeleteOrder(o.id),
        disabled: isDeleting,
        className: "px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold rounded-xs transition-colors whitespace-nowrap",
        title: "Confirmer la suppression d\xE9finitive"
      },
      isDeleting ? "..." : "Supprimer"
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => setConfirmDeleteOrderId(null),
        className: "px-1.5 py-1 text-taupe-dark hover:text-noir text-[10px] font-semibold",
        title: "Annuler"
      },
      "Annuler"
    )) : /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => setConfirmDeleteOrderId(o.id),
        disabled: isDeleting,
        className: "px-2.5 py-1.5 border border-red-200 hover:border-red-600 bg-red-50/50 hover:bg-red-600 text-red-600 hover:text-white text-xs font-bold rounded-xs transition-colors",
        title: "Supprimer cette commande"
      },
      "\u2715"
    ))));
  })))), filteredOrders.length > 0 && /* @__PURE__ */ React.createElement("div", { className: "p-4 border-t border-taupe/15 bg-canvas/40 flex flex-col sm:flex-row items-center justify-between gap-3" }, /* @__PURE__ */ React.createElement("div", { className: "text-xs text-taupe-dark" }, "Affichage des commandes ", /* @__PURE__ */ React.createElement("span", { className: "font-bold text-noir" }, startOrderIdx + 1), " \xE0", " ", /* @__PURE__ */ React.createElement("span", { className: "font-bold text-noir" }, Math.min(startOrderIdx + ORDERS_PER_PAGE, filteredOrders.length)), " sur", " ", /* @__PURE__ */ React.createElement("span", { className: "font-bold text-noir" }, filteredOrders.length), " (Page ", safeOrderPage, " sur ", totalOrderPages, ")"), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-1.5 flex-wrap justify-center" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setOrderPage(Math.max(1, safeOrderPage - 1)),
      disabled: safeOrderPage <= 1,
      className: `px-3 py-1.5 text-xs font-semibold rounded-xs border transition-colors ${safeOrderPage <= 1 ? "bg-canvas text-taupe border-taupe/20 cursor-not-allowed opacity-60" : "bg-white text-noir border-taupe/30 hover:border-noir"}`
    },
    "\u2190 Pr\xE9c\xE9dent"
  ), Array.from({ length: totalOrderPages }, (_, i) => i + 1).map((pageNum) => /* @__PURE__ */ React.createElement(
    "button",
    {
      key: pageNum,
      onClick: () => setOrderPage(pageNum),
      className: `w-8 h-8 text-xs font-bold rounded-xs border transition-colors tabular-nums ${safeOrderPage === pageNum ? "bg-noir text-white border-noir shadow-2xs" : "bg-white text-noir border-taupe/30 hover:border-caramel hover:text-caramel"}`,
      title: `Page ${pageNum} (Commandes ${(pageNum - 1) * ORDERS_PER_PAGE + 1} \xE0 ${Math.min(pageNum * ORDERS_PER_PAGE, filteredOrders.length)})`
    },
    pageNum
  )), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setOrderPage(Math.min(totalOrderPages, safeOrderPage + 1)),
      disabled: safeOrderPage >= totalOrderPages,
      className: `px-3 py-1.5 text-xs font-semibold rounded-xs border transition-colors ${safeOrderPage >= totalOrderPages ? "bg-canvas text-taupe border-taupe/20 cursor-not-allowed opacity-60" : "bg-white text-noir border-taupe/30 hover:border-noir"}`
    },
    "Suivant \u2192"
  )))), activeTab === "slider" && /* @__PURE__ */ React.createElement("div", { className: "space-y-6" }, /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6" }, sliderDraft.map((slide, sIdx) => /* @__PURE__ */ React.createElement("div", { key: slide.id || sIdx, className: "bg-white border border-taupe/20 p-5 rounded-xs flex flex-col justify-between space-y-4 shadow-2xs" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between pb-3 border-b border-taupe/15 mb-4" }, /* @__PURE__ */ React.createElement("span", { className: "font-bold text-xs uppercase tracking-wider text-caramel" }, "Slide 0", sIdx + 1), /* @__PURE__ */ React.createElement("span", { className: "text-[10px] font-mono bg-noir/5 px-2 py-0.5 text-taupe-dark" }, slide.tag || `0${sIdx + 1}`)), /* @__PURE__ */ React.createElement("div", { className: "mb-4" }, /* @__PURE__ */ React.createElement("label", { className: "block text-[11px] font-bold uppercase tracking-wider text-noir mb-1.5" }, "Photo de fond (Wallpaper)"), /* @__PURE__ */ React.createElement("div", { className: "relative aspect-video w-full bg-noir/5 border border-taupe/25 rounded-xs overflow-hidden mb-2 group" }, slide.wallpaper ? /* @__PURE__ */ React.createElement("img", { src: slide.wallpaper, alt: `Slide ${sIdx + 1}`, className: "w-full h-full object-cover" }) : /* @__PURE__ */ React.createElement("div", { className: "w-full h-full flex items-center justify-center text-taupe text-xs" }, "Pas d'image"), /* @__PURE__ */ React.createElement("div", { className: "absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2" }, /* @__PURE__ */ React.createElement("label", { className: "px-3 py-1.5 bg-caramel hover:bg-caramel/90 text-white text-xs font-semibold cursor-pointer rounded-xs transition-colors flex items-center gap-1.5 shadow-sm" }, /* @__PURE__ */ React.createElement("span", null, sliderUploadingIdx === sIdx ? "\u23F3 Upload..." : "\u{1F4F8} Changer photo"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "file",
      accept: "image/*",
      onChange: (e) => handleSliderPhotoUpload(sIdx, e),
      className: "hidden",
      disabled: sliderUploadingIdx === sIdx
    }
  )))), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      value: slide.wallpaper || "",
      onChange: (e) => handleSlideFieldChange(sIdx, "wallpaper", e.target.value),
      placeholder: "URL Firebase ou chemin...",
      className: "flex-1 bg-white border border-taupe/30 px-2.5 py-1.5 text-[11px] text-noir focus:border-caramel"
    }
  ), /* @__PURE__ */ React.createElement("label", { className: "px-3 py-1.5 bg-noir hover:bg-caramel text-white text-[11px] font-semibold cursor-pointer rounded-xs transition-colors shrink-0" }, /* @__PURE__ */ React.createElement("span", null, sliderUploadingIdx === sIdx ? "..." : "\u{1F4C1} Upload"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "file",
      accept: "image/*",
      onChange: (e) => handleSliderPhotoUpload(sIdx, e),
      className: "hidden",
      disabled: sliderUploadingIdx === sIdx
    }
  )))), /* @__PURE__ */ React.createElement("div", { className: "space-y-3 text-xs" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block font-bold text-[10px] uppercase text-taupe-dark mb-1" }, "Onglet Navigation (Tag) *"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      value: slide.tag || "",
      onChange: (e) => handleSlideFieldChange(sIdx, "tag", e.target.value),
      placeholder: sIdx === 0 ? "01 - Jackets" : sIdx === 1 ? "02 - Accessoires" : "03 - Chaussures",
      className: "w-full bg-white border border-taupe/30 px-2.5 py-1.5 text-xs text-noir focus:border-caramel font-mono"
    }
  )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block font-bold text-[10px] uppercase text-taupe-dark mb-1" }, "Surtitre (Badge)"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      value: slide.badge || "",
      onChange: (e) => handleSlideFieldChange(sIdx, "badge", e.target.value),
      placeholder: "Maison de maroquinerie...",
      className: "w-full bg-white border border-taupe/30 px-2.5 py-1.5 text-xs text-noir focus:border-caramel"
    }
  )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block font-bold text-[10px] uppercase text-taupe-dark mb-1" }, "Titre Principal *"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      value: slide.title || "",
      onChange: (e) => handleSlideFieldChange(sIdx, "title", e.target.value),
      placeholder: "L'Essence du Luxe Brut...",
      className: "w-full bg-white border border-taupe/30 px-2.5 py-1.5 text-xs text-noir font-serif font-bold focus:border-caramel"
    }
  )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block font-bold text-[10px] uppercase text-taupe-dark mb-1" }, "Sous-titre / Description"), /* @__PURE__ */ React.createElement(
    "textarea",
    {
      rows: "3",
      value: slide.subtitle || "",
      onChange: (e) => handleSlideFieldChange(sIdx, "subtitle", e.target.value),
      placeholder: "Pens\xE9 pour l'homme contemporain au Maroc...",
      className: "w-full bg-white border border-taupe/30 px-2.5 py-1.5 text-xs text-noir focus:border-caramel leading-relaxed"
    }
  )), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-2 gap-2" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block font-bold text-[10px] uppercase text-taupe-dark mb-1" }, "Bouton 1 (CTA)"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      value: slide.cta1 || "",
      onChange: (e) => handleSlideFieldChange(sIdx, "cta1", e.target.value),
      placeholder: "Explorer la Collection",
      className: "w-full bg-white border border-taupe/30 px-2 py-1 text-xs text-noir focus:border-caramel"
    }
  )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block font-bold text-[10px] uppercase text-taupe-dark mb-1" }, "Bouton 2 (Story)"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      value: slide.cta2 || "",
      onChange: (e) => handleSlideFieldChange(sIdx, "cta2", e.target.value),
      placeholder: "Notre Savoir-Faire",
      className: "w-full bg-white border border-taupe/30 px-2 py-1 text-xs text-noir focus:border-caramel"
    }
  )))))))), /* @__PURE__ */ React.createElement("div", { className: "flex justify-end pt-2" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: handleSaveAllSlides,
      disabled: sliderSaving,
      className: "px-6 py-3 bg-noir hover:bg-caramel text-white text-xs font-bold uppercase tracking-wider rounded-xs transition-colors shadow-sm flex items-center gap-2"
    },
    /* @__PURE__ */ React.createElement("span", null, sliderSaving ? "\u23F3 Sauvegarde en cours..." : "\u{1F4BE} Enregistrer et Synchroniser sur Firebase")
  ))), activeTab === "cms" && /* @__PURE__ */ React.createElement("div", { className: "space-y-6" }, /* @__PURE__ */ React.createElement("div", { className: "bg-white border border-taupe/20 p-6 rounded-xs shadow-2xs space-y-6" }, /* @__PURE__ */ React.createElement("div", { className: "border-b border-taupe/15 pb-6" }, /* @__PURE__ */ React.createElement("h3", { className: "font-serif text-base font-bold text-noir mb-3 flex items-center gap-2" }, /* @__PURE__ */ React.createElement("span", null, "\u{1F4E2}"), /* @__PURE__ */ React.createElement("span", null, "Bandeau d'Annonce Sup\xE9rieur & Marque")), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-[11px] font-bold uppercase text-taupe-dark mb-1" }, "Texte Bandeau (Fran\xE7ais)"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      value: cmsDraft.topBannerFr,
      onChange: (e) => setCmsDraft((p) => ({ ...p, topBannerFr: e.target.value })),
      className: "w-full bg-white border border-taupe/30 px-3 py-2 text-xs text-noir focus:border-caramel"
    }
  )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-[11px] font-bold uppercase text-taupe-dark mb-1" }, "Texte Bandeau (Arabe)"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      value: cmsDraft.topBannerAr,
      onChange: (e) => setCmsDraft((p) => ({ ...p, topBannerAr: e.target.value })),
      className: "w-full bg-white border border-taupe/30 px-3 py-2 text-xs text-noir focus:border-caramel font-arabic text-right"
    }
  )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-[11px] font-bold uppercase text-taupe-dark mb-1" }, "Nom de Marque Principal"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      value: cmsDraft.brandName,
      onChange: (e) => setCmsDraft((p) => ({ ...p, brandName: e.target.value })),
      className: "w-full bg-white border border-taupe/30 px-3 py-2 text-xs text-noir font-bold font-serif focus:border-caramel"
    }
  )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-[11px] font-bold uppercase text-taupe-dark mb-1" }, "Slogan de Marque (Tagline)"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      value: cmsDraft.brandTagline,
      onChange: (e) => setCmsDraft((p) => ({ ...p, brandTagline: e.target.value })),
      className: "w-full bg-white border border-taupe/30 px-3 py-2 text-xs text-noir focus:border-caramel font-mono"
    }
  )))), /* @__PURE__ */ React.createElement("div", { className: "border-b border-taupe/15 pb-6" }, /* @__PURE__ */ React.createElement("h3", { className: "font-serif text-base font-bold text-noir mb-3 flex items-center gap-2" }, /* @__PURE__ */ React.createElement("span", null, "\u{1F9F5}"), /* @__PURE__ */ React.createElement("span", null, 'Section "Notre Savoir-Faire" (Histoire & Atelier)')), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-[11px] font-bold uppercase text-taupe-dark mb-1" }, "Surtitre (Badge)"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      value: cmsDraft.storyBadge,
      onChange: (e) => setCmsDraft((p) => ({ ...p, storyBadge: e.target.value })),
      className: "w-full bg-white border border-taupe/30 px-3 py-2 text-xs text-noir focus:border-caramel"
    }
  )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-[11px] font-bold uppercase text-taupe-dark mb-1" }, "Titre Principal"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      value: cmsDraft.storyTitle,
      onChange: (e) => setCmsDraft((p) => ({ ...p, storyTitle: e.target.value })),
      className: "w-full bg-white border border-taupe/30 px-3 py-2 text-xs text-noir font-serif font-bold focus:border-caramel"
    }
  )), /* @__PURE__ */ React.createElement("div", { className: "md:col-span-2" }, /* @__PURE__ */ React.createElement("label", { className: "block text-[11px] font-bold uppercase text-taupe-dark mb-1" }, "Paragraphe 1 (Mati\xE8res & Vision)"), /* @__PURE__ */ React.createElement(
    "textarea",
    {
      rows: "3",
      value: cmsDraft.storyText1,
      onChange: (e) => setCmsDraft((p) => ({ ...p, storyText1: e.target.value })),
      className: "w-full bg-white border border-taupe/30 px-3 py-2 text-xs text-noir focus:border-caramel leading-relaxed"
    }
  )), /* @__PURE__ */ React.createElement("div", { className: "md:col-span-2" }, /* @__PURE__ */ React.createElement("label", { className: "block text-[11px] font-bold uppercase text-taupe-dark mb-1" }, "Paragraphe 2 (Confection & Long\xE9vit\xE9)"), /* @__PURE__ */ React.createElement(
    "textarea",
    {
      rows: "3",
      value: cmsDraft.storyText2,
      onChange: (e) => setCmsDraft((p) => ({ ...p, storyText2: e.target.value })),
      className: "w-full bg-white border border-taupe/30 px-3 py-2 text-xs text-noir focus:border-caramel leading-relaxed"
    }
  )), /* @__PURE__ */ React.createElement("div", { className: "md:col-span-2 pt-2" }, /* @__PURE__ */ React.createElement("label", { className: "block text-[11px] font-bold uppercase text-taupe-dark mb-1.5" }, "Photo Principale de la Section Savoir-Faire (Firebase Storage)"), /* @__PURE__ */ React.createElement("div", { className: "flex flex-col sm:flex-row items-start sm:items-center gap-4" }, /* @__PURE__ */ React.createElement("div", { className: "w-32 h-24 bg-card border border-taupe/25 rounded-xs overflow-hidden shrink-0 relative" }, cmsDraft.storyImage ? /* @__PURE__ */ React.createElement("img", { src: cmsDraft.storyImage, alt: "Story", className: "w-full h-full object-cover" }) : /* @__PURE__ */ React.createElement("div", { className: "w-full h-full flex items-center justify-center text-[10px] text-taupe" }, "Photo par d\xE9faut")), /* @__PURE__ */ React.createElement("div", { className: "flex-1 w-full space-y-2" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      value: cmsDraft.storyImage,
      onChange: (e) => setCmsDraft((p) => ({ ...p, storyImage: e.target.value })),
      placeholder: "URL photo Firebase...",
      className: "flex-1 bg-white border border-taupe/30 px-3 py-2 text-xs text-noir focus:border-caramel"
    }
  ), /* @__PURE__ */ React.createElement("label", { className: "px-4 py-2 bg-noir hover:bg-caramel text-white text-xs font-semibold cursor-pointer rounded-xs transition-colors shrink-0" }, /* @__PURE__ */ React.createElement("span", null, cmsUploadingPhoto ? "\u23F3 Upload..." : "\u{1F4C1} Uploader vers Firebase"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "file",
      accept: "image/*",
      onChange: handleCmsPhotoUpload,
      className: "hidden",
      disabled: cmsUploadingPhoto
    }
  ))), /* @__PURE__ */ React.createElement("p", { className: "text-[11px] text-taupe-dark" }, "Uploadez une image d'atelier ou de maroquinerie haute d\xE9finition pour illustrer votre savoir-faire.")))))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h3", { className: "font-serif text-base font-bold text-noir mb-3 flex items-center gap-2" }, /* @__PURE__ */ React.createElement("span", null, "\u{1F4CD}"), /* @__PURE__ */ React.createElement("span", null, "Coordonn\xE9es de l'Atelier & Support")), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-[11px] font-bold uppercase text-taupe-dark mb-1" }, "Adresse"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      value: cmsDraft.conciergeAddress,
      onChange: (e) => setCmsDraft((p) => ({ ...p, conciergeAddress: e.target.value })),
      className: "w-full bg-white border border-taupe/30 px-3 py-2 text-xs text-noir focus:border-caramel"
    }
  )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-[11px] font-bold uppercase text-taupe-dark mb-1" }, "Ville & Pays"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      value: cmsDraft.conciergeCity,
      onChange: (e) => setCmsDraft((p) => ({ ...p, conciergeCity: e.target.value })),
      className: "w-full bg-white border border-taupe/30 px-3 py-2 text-xs text-noir focus:border-caramel"
    }
  )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-[11px] font-bold uppercase text-taupe-dark mb-1" }, "Num\xE9ro WhatsApp Magasin"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      value: cmsDraft.whatsappNumber,
      onChange: (e) => setCmsDraft((p) => ({ ...p, whatsappNumber: e.target.value })),
      placeholder: "+212600000000",
      className: "w-full bg-white border border-taupe/30 px-3 py-2 text-xs text-noir focus:border-caramel font-mono"
    }
  )))), /* @__PURE__ */ React.createElement("div", { className: "pt-4 border-t border-taupe/15 flex justify-end" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: handleSaveCms,
      disabled: cmsSaving,
      className: "px-6 py-3 bg-noir hover:bg-caramel text-white text-xs font-bold uppercase tracking-wider rounded-xs transition-colors shadow-sm flex items-center gap-2"
    },
    /* @__PURE__ */ React.createElement("span", null, cmsSaving ? "\u23F3 Sauvegarde en cours..." : "\u{1F4BE} Enregistrer et Publier sur le Site")
  )))), activeTab === "testimonials" && /* @__PURE__ */ React.createElement("div", { className: "space-y-4" }, /* @__PURE__ */ React.createElement("div", { className: "bg-white border border-taupe/20 p-4 rounded-xs shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h3", { className: "font-serif text-base font-bold text-noir" }, "Avis et T\xE9moignages Clients"), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-taupe-dark" }, "Ces avis s'affichent automatiquement dans la section T\xE9moignages de la page d'accueil avec les \xE9toiles et le badge v\xE9rifi\xE9.")), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: openAddTestimonial,
      className: "px-4 py-2 bg-noir hover:bg-caramel text-white text-xs font-bold uppercase tracking-wider rounded-xs transition-colors shrink-0 flex items-center gap-1.5 shadow-2xs"
    },
    /* @__PURE__ */ React.createElement("span", null, "+"),
    /* @__PURE__ */ React.createElement("span", null, "Ajouter un T\xE9moignage")
  )), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" }, !testimonials || testimonials.length === 0 ? /* @__PURE__ */ React.createElement("div", { className: "col-span-full bg-white border border-taupe/20 p-12 text-center text-taupe-dark" }, 'Aucun t\xE9moignage client enregistr\xE9. Cliquez sur "+ Ajouter un T\xE9moignage" pour cr\xE9er le premier !') : testimonials.map((item) => /* @__PURE__ */ React.createElement("div", { key: item.id, className: "bg-white border border-taupe/20 p-5 rounded-xs shadow-2xs flex flex-col justify-between space-y-4" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between mb-2" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-1 text-caramel text-sm" }, "\u2605".repeat(item.rating || 5), /* @__PURE__ */ React.createElement("span", { className: "text-[11px] font-bold text-noir ml-1" }, item.rating || 5, ".0")), item.verified !== false && /* @__PURE__ */ React.createElement("span", { className: "text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded-xs font-semibold" }, "\u2713 Achat V\xE9rifi\xE9")), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-noir italic leading-relaxed line-clamp-4" }, '"', item.textFr || item.text, '"'), item.textAr && /* @__PURE__ */ React.createElement("p", { className: "text-xs text-taupe-dark font-arabic text-right mt-2 line-clamp-2" }, '"', item.textAr, '"')), /* @__PURE__ */ React.createElement("div", { className: "pt-3 border-t border-taupe/15 flex items-center justify-between" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "text-xs font-bold text-noir" }, item.author), /* @__PURE__ */ React.createElement("div", { className: "text-[10px] text-taupe" }, item.city)), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-1.5" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => openEditTestimonial(item),
      className: "px-2 py-1 bg-white border border-taupe/30 hover:border-noir text-noir text-[11px] rounded-xs",
      title: "Modifier ce t\xE9moignage"
    },
    "\u270F\uFE0F"
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => handleDeleteTestimonial(item.id),
      className: "px-2 py-1 text-red-600 hover:text-red-800 text-[11px]",
      title: "Supprimer ce t\xE9moignage"
    },
    "\u2715"
  ))))))), activeTab === "security" && /* @__PURE__ */ React.createElement("div", { className: "space-y-6 max-w-5xl" }, /* @__PURE__ */ React.createElement("div", { className: "bg-white border border-taupe/20 p-6 rounded-xs shadow-2xs" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-start justify-between gap-4 border-b border-taupe/15 pb-4 mb-5" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h3", { className: "font-serif text-lg font-bold text-noir flex items-center gap-2" }, /* @__PURE__ */ React.createElement("span", null, "\u{1F511}"), /* @__PURE__ */ React.createElement("span", null, "Changer le Mot de Passe Administrateur")), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-taupe-dark mt-0.5" }, "Modifiez vos identifiants d'acc\xE8s au Panel Administrateur. Le nouveau mot de passe est chiffr\xE9 et enregistr\xE9 de mani\xE8re permanente dans votre base de donn\xE9es Firebase.")), /* @__PURE__ */ React.createElement("span", { className: "px-2.5 py-1 bg-noir text-[#E6C687] text-[10px] font-mono uppercase tracking-wider rounded-xs shrink-0" }, "Firebase Auth Sync")), /* @__PURE__ */ React.createElement("form", { onSubmit: handleChangeAdminPassword, className: "space-y-4 max-w-xl" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-[11px] font-bold uppercase tracking-wider text-taupe-dark mb-1" }, "Identifiant Administrateur"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      value: secNewUser,
      onChange: (e) => setSecNewUser(e.target.value),
      placeholder: "admin",
      className: "w-full bg-[#FAF9F6] border border-taupe/30 px-3.5 py-2.5 text-xs text-noir font-semibold focus:border-caramel",
      required: true
    }
  )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-[11px] font-bold uppercase tracking-wider text-taupe-dark mb-1" }, "Mot de Passe Actuel *"), /* @__PURE__ */ React.createElement("div", { className: "relative" }, /* @__PURE__ */ React.createElement(
    "input",
    {
      type: showSecCurrentPass ? "text" : "password",
      value: secCurrentPass,
      onChange: (e) => setSecCurrentPass(e.target.value),
      placeholder: "Saisissez votre mot de passe actuel",
      className: "w-full bg-[#FAF9F6] border border-taupe/30 px-3.5 py-2.5 pr-16 text-xs text-noir focus:border-caramel",
      required: true
    }
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: () => setShowSecCurrentPass((p) => !p),
      className: "absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-taupe-dark hover:text-noir"
    },
    showSecCurrentPass ? "Masquer" : "Afficher"
  ))), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-[11px] font-bold uppercase tracking-wider text-taupe-dark mb-1" }, "Nouveau Mot de Passe *"), /* @__PURE__ */ React.createElement("div", { className: "relative" }, /* @__PURE__ */ React.createElement(
    "input",
    {
      type: showSecNewPass ? "text" : "password",
      value: secNewPass,
      onChange: (e) => setSecNewPass(e.target.value),
      placeholder: "Nouveau mot de passe",
      className: "w-full bg-[#FAF9F6] border border-taupe/30 px-3.5 py-2.5 pr-16 text-xs text-noir focus:border-caramel",
      required: true
    }
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: () => setShowSecNewPass((p) => !p),
      className: "absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-taupe-dark hover:text-noir"
    },
    showSecNewPass ? "Masquer" : "Afficher"
  ))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-[11px] font-bold uppercase tracking-wider text-taupe-dark mb-1" }, "Confirmer le Nouveau Mot de Passe *"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: showSecNewPass ? "text" : "password",
      value: secConfirmPass,
      onChange: (e) => setSecConfirmPass(e.target.value),
      placeholder: "R\xE9p\xE9tez le nouveau mot de passe",
      className: "w-full bg-[#FAF9F6] border border-taupe/30 px-3.5 py-2.5 text-xs text-noir focus:border-caramel",
      required: true
    }
  ))), secPassMessage && /* @__PURE__ */ React.createElement("div", { className: `p-3 text-xs border rounded-xs ${secPassMessage.type === "success" ? "bg-emerald-50 border-emerald-300 text-emerald-800 font-semibold" : "bg-red-50 border-red-300 text-red-800"}` }, secPassMessage.text), /* @__PURE__ */ React.createElement("div", { className: "pt-2" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "submit",
      disabled: secSavingPass,
      className: "px-6 py-2.5 bg-noir hover:bg-caramel text-white text-xs font-bold uppercase tracking-wider rounded-xs transition-colors shadow-xs"
    },
    secSavingPass ? "\u23F3 Mise \xE0 jour en cours..." : "\u{1F512} Mettre \xE0 jour le Mot de Passe"
  )))), /* @__PURE__ */ React.createElement("div", { className: "bg-white border border-taupe/20 p-6 rounded-xs shadow-2xs" }, /* @__PURE__ */ React.createElement("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-taupe/15 pb-4 mb-5" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h3", { className: "font-serif text-lg font-bold text-noir flex items-center gap-2" }, /* @__PURE__ */ React.createElement(WhatsAppIcon, { className: "w-5 h-5 fill-[#25D366]" }), /* @__PURE__ */ React.createElement("span", null, "Notifications Automatiques WhatsApp (Nouvelles Commandes)")), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-taupe-dark mt-0.5" }, "Recevez automatiquement les d\xE9tails complets sur votre WhatsApp d\xE8s qu'un client passe une commande sur le site.")), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: handleTestWhatsAppNotification,
      disabled: waTesting,
      className: "px-4 py-2 bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-bold uppercase tracking-wider rounded-xs transition-colors flex items-center gap-2 shrink-0 shadow-xs"
    },
    /* @__PURE__ */ React.createElement(WhatsAppIcon, { className: "w-4 h-4 fill-white" }),
    /* @__PURE__ */ React.createElement("span", null, waTesting ? "Test en cours..." : "\u{1F4F2} Tester la Notification WhatsApp")
  )), /* @__PURE__ */ React.createElement("form", { onSubmit: handleSaveWaConfig, className: "space-y-5" }, /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-[11px] font-bold uppercase tracking-wider text-taupe-dark mb-1" }, "Votre Num\xE9ro WhatsApp Administrateur (R\xE9ception des commandes)"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      value: waConfig.adminWhatsappNumber,
      onChange: (e) => setWaConfig((p) => ({ ...p, adminWhatsappNumber: e.target.value })),
      placeholder: "212600773716",
      className: "w-full bg-[#FAF9F6] border border-taupe/30 px-3.5 py-2.5 text-xs text-noir font-mono focus:border-caramel"
    }
  ), /* @__PURE__ */ React.createElement("p", { className: "text-[11px] text-taupe-dark mt-1" }, "Format international avec indicatif Maroc (ex: ", /* @__PURE__ */ React.createElement("strong", null, "212600773716"), ").")), /* @__PURE__ */ React.createElement("div", { className: "flex flex-col justify-center space-y-2.5 bg-[#FAF9F6] border border-taupe/20 p-3.5 rounded-xs" }, /* @__PURE__ */ React.createElement("label", { className: "flex items-center gap-2.5 cursor-pointer" }, /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "checkbox",
      checked: waConfig.whatsappAutoNotifyEnabled,
      onChange: (e) => setWaConfig((p) => ({ ...p, whatsappAutoNotifyEnabled: e.target.checked })),
      className: "w-4 h-4 accent-[#25D366]"
    }
  ), /* @__PURE__ */ React.createElement("span", { className: "text-xs font-bold text-noir" }, "Activer les alertes WhatsApp automatiques \xE0 chaque commande")), /* @__PURE__ */ React.createElement("label", { className: "flex items-center gap-2.5 cursor-pointer" }, /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "checkbox",
      checked: waConfig.autoRedirectCustomerToWhatsapp,
      onChange: (e) => setWaConfig((p) => ({ ...p, autoRedirectCustomerToWhatsapp: e.target.checked })),
      className: "w-4 h-4 accent-noir"
    }
  ), /* @__PURE__ */ React.createElement("span", { className: "text-xs text-noir" }, "Ouvrir automatiquement WhatsApp chez le client d\xE8s la validation de sa commande")))), /* @__PURE__ */ React.createElement("div", { className: "bg-[#F0FDF4] border border-[#BBF7D0] p-4 rounded-xs space-y-3" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ React.createElement("span", { className: "text-xs font-bold text-[#065F46] uppercase tracking-wider flex items-center gap-1.5" }, /* @__PURE__ */ React.createElement("span", null, "\u26A1"), /* @__PURE__ */ React.createElement("span", null, "Mode 100% Automatique en Arri\xE8re-Plan (CallMeBot WhatsApp API \u2014 Gratuit)")), /* @__PURE__ */ React.createElement("span", { className: "text-[10px] bg-[#25D366] text-white px-2 py-0.5 rounded-xs font-bold" }, "Recommand\xE9")), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-[#065F46]/90 leading-relaxed" }, "Pour recevoir un message WhatsApp automatique instantan\xE9 m\xEAme si le client ferme la page imm\xE9diatement apr\xE8s sa commande, activez votre cl\xE9 gratuite CallMeBot en 30 secondes :"), /* @__PURE__ */ React.createElement("ol", { className: "text-xs text-[#065F46] list-decimal list-inside space-y-1 font-medium bg-white/80 p-3 rounded-xs border border-[#BBF7D0]" }, /* @__PURE__ */ React.createElement("li", null, "Ajoutez le num\xE9ro ", /* @__PURE__ */ React.createElement("strong", null, "+34 644 52 74 88"), " sur votre t\xE9l\xE9phone et envoyez-lui par WhatsApp ce message exact :", " ", /* @__PURE__ */ React.createElement("code", { className: "bg-[#DCFCE7] px-1.5 py-0.5 rounded font-mono text-[#065F46] select-all" }, "I allow callmebot to send me messages")), /* @__PURE__ */ React.createElement("li", null, "CallMeBot vous r\xE9pondra imm\xE9diatement sur WhatsApp avec votre code ", /* @__PURE__ */ React.createElement("strong", null, "apikey"), " (ex: ", /* @__PURE__ */ React.createElement("em", null, "1234567"), ") et le num\xE9ro exact. Collez ce code ci-dessous :")), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4 pt-1" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-[11px] font-bold uppercase tracking-wider text-[#065F46] mb-1" }, "Cl\xE9 API CallMeBot (API Key)"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      value: waConfig.callmebotApiKey,
      onChange: (e) => setWaConfig((p) => ({ ...p, callmebotApiKey: e.target.value })),
      placeholder: "Ex: 4829103 (Re\xE7u par WhatsApp)",
      className: "w-full bg-white border border-[#86EFAC] px-3.5 py-2 text-xs text-noir font-mono focus:border-[#25D366]"
    }
  )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block text-[11px] font-bold uppercase tracking-wider text-taupe-dark mb-1" }, "Webhook Personnalis\xE9 (Optionnel : Make / UltraMsg / Zapier)"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      value: waConfig.whatsappWebhookUrl,
      onChange: (e) => setWaConfig((p) => ({ ...p, whatsappWebhookUrl: e.target.value })),
      placeholder: "https://hook.eu1.make.com/...",
      className: "w-full bg-white border border-taupe/30 px-3.5 py-2 text-xs text-noir font-mono focus:border-caramel"
    }
  )))), /* @__PURE__ */ React.createElement("div", { className: "flex justify-end pt-2" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "submit",
      disabled: waSaving,
      className: "px-6 py-2.5 bg-noir hover:bg-caramel text-white text-xs font-bold uppercase tracking-wider rounded-xs transition-colors shadow-xs"
    },
    waSaving ? "\u23F3 Sauvegarde..." : "\u{1F4BE} Enregistrer la Configuration WhatsApp"
  )))), /* @__PURE__ */ React.createElement("div", { className: "bg-white border border-taupe/20 p-6 rounded-xs shadow-2xs" }, /* @__PURE__ */ React.createElement("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-taupe/15 pb-4 mb-5" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h3", { className: "font-serif text-lg font-bold text-noir flex items-center gap-2" }, /* @__PURE__ */ React.createElement("span", null, "\u{1F310}"), /* @__PURE__ */ React.createElement("span", null, "Aper\xE7u du Lien sur WhatsApp, Statut WhatsApp & Messenger")), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-taupe-dark mt-0.5" }, "Votre logo officiel ", /* @__PURE__ */ React.createElement("strong", null, "MODANOVA FASHION"), " est configur\xE9 en haute d\xE9finition pour s'afficher automatiquement lorsque vous partagez le lien de votre site.")), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: () => {
        const shareUrl = window.location.origin;
        const waShare = `https://wa.me/?text=${encodeURIComponent(`D\xE9couvrez la collection MODANOVA \u2014 Men's Essentials : ${shareUrl}`)}`;
        window.open(waShare, "_blank", "noopener,noreferrer");
      },
      className: "px-4 py-2 bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-bold uppercase tracking-wider rounded-xs transition-colors flex items-center gap-2 shrink-0 shadow-xs"
    },
    /* @__PURE__ */ React.createElement(WhatsAppIcon, { className: "w-4 h-4 fill-white" }),
    /* @__PURE__ */ React.createElement("span", null, "Partager le Lien sur WhatsApp")
  )), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6 items-center" }, /* @__PURE__ */ React.createElement("div", { className: "bg-[#E5DDD5] p-4 rounded-xs border border-taupe/30" }, /* @__PURE__ */ React.createElement("div", { className: "text-[10px] font-bold uppercase tracking-wider text-taupe-dark mb-2" }, "Aper\xE7u en direct sur WhatsApp / Messenger :"), /* @__PURE__ */ React.createElement("div", { className: "bg-[#DCF8C6] p-2.5 rounded-lg shadow-xs max-w-sm" }, /* @__PURE__ */ React.createElement("div", { className: "bg-white/90 rounded overflow-hidden border border-black/5 mb-1.5" }, /* @__PURE__ */ React.createElement(
    "img",
    {
      src: "/og-logo.jpg",
      alt: "MODANOVA Logo Preview",
      className: "w-full h-40 object-contain bg-white p-2 border-b border-black/5"
    }
  ), /* @__PURE__ */ React.createElement("div", { className: "p-2.5" }, /* @__PURE__ */ React.createElement("div", { className: "text-xs font-bold text-noir truncate" }, "MODANOVA \u2014 Men's Essentials | Luxe Minimaliste Maroc"), /* @__PURE__ */ React.createElement("div", { className: "text-[11px] text-taupe-dark line-clamp-2 mt-0.5" }, "Luxe contemporain masculin au Maroc. Pi\xE8ces d'exception & Paiement \xE0 la livraison partout au Maroc."), /* @__PURE__ */ React.createElement("div", { className: "text-[10px] text-taupe font-mono mt-1 truncate" }, window.location.host || "modanova.ma"))), /* @__PURE__ */ React.createElement("div", { className: "text-xs text-[#075E54] font-medium underline break-all" }, window.location.origin))), /* @__PURE__ */ React.createElement("div", { className: "space-y-3 text-xs text-taupe-dark leading-relaxed" }, /* @__PURE__ */ React.createElement("div", { className: "p-3.5 bg-[#FAF9F6] border border-taupe/20 rounded-xs space-y-2" }, /* @__PURE__ */ React.createElement("div", { className: "font-bold text-noir" }, "\u2705 Configuration OpenGraph & Favicon Active :"), /* @__PURE__ */ React.createElement("ul", { className: "list-disc list-inside space-y-1 text-[11px]" }, /* @__PURE__ */ React.createElement("li", null, /* @__PURE__ */ React.createElement("strong", null, "Image de partage large (1200\xD7630 JPG) :"), " ", /* @__PURE__ */ React.createElement("code", null, "/og-logo.jpg")), /* @__PURE__ */ React.createElement("li", null, /* @__PURE__ */ React.createElement("strong", null, "Image de partage carr\xE9e WhatsApp (600\xD7600 JPG) :"), " ", /* @__PURE__ */ React.createElement("code", null, "/og-logo-square.jpg")), /* @__PURE__ */ React.createElement("li", null, /* @__PURE__ */ React.createElement("strong", null, "Ic\xF4ne d'onglet & iPhone/Android :"), " ", /* @__PURE__ */ React.createElement("code", null, "/logo.png"), " & ", /* @__PURE__ */ React.createElement("code", null, "/favicon.ico")), /* @__PURE__ */ React.createElement("li", null, /* @__PURE__ */ React.createElement("strong", null, "Sauvegarde permanente :"), " Votre logo est \xE9galement sauvegard\xE9 dans Firebase Firestore.")))))), /* @__PURE__ */ React.createElement("div", { className: "bg-white border border-taupe/20 p-6 rounded-xs shadow-2xs" }, /* @__PURE__ */ React.createElement("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-taupe/15 pb-4 mb-4" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h3", { className: "font-serif text-lg font-bold text-noir flex items-center gap-2" }, /* @__PURE__ */ React.createElement("span", null, "\u{1F9F9}"), /* @__PURE__ */ React.createElement("span", null, "Vider le Cache Syst\xE8me & Navigateur (Clear Cache)")), /* @__PURE__ */ React.createElement("p", { className: "text-xs text-taupe-dark mt-0.5" }, "Purge le cache local du serveur et du navigateur, puis recharge imm\xE9diatement toutes les donn\xE9es en direct depuis votre base de donn\xE9es ", /* @__PURE__ */ React.createElement("strong", null, "Firebase Firestore"), " (sans supprimer aucun produit ni aucune commande).")), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: handleClearCache,
      disabled: clearingCache,
      className: "px-5 py-2.5 bg-noir hover:bg-caramel text-[#E6C687] hover:text-white text-xs font-bold uppercase tracking-wider rounded-xs transition-colors flex items-center gap-2 shrink-0 shadow-xs"
    },
    /* @__PURE__ */ React.createElement("span", null, clearingCache ? "\u23F3" : "\u{1F9F9}"),
    /* @__PURE__ */ React.createElement("span", null, clearingCache ? "Vidage du cache en cours..." : "Vider le Cache Maintenant")
  )), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs" }, /* @__PURE__ */ React.createElement("div", { className: "p-3 bg-[#FAF9F6] border border-taupe/20 rounded-xs" }, /* @__PURE__ */ React.createElement("div", { className: "font-bold text-noir mb-0.5" }, "1. Cache Serveur & Images"), /* @__PURE__ */ React.createElement("p", { className: "text-[11px] text-taupe-dark" }, "R\xE9initialise le fichier de cache local du serveur et force la lecture directe depuis Firebase.")), /* @__PURE__ */ React.createElement("div", { className: "p-3 bg-[#FAF9F6] border border-taupe/20 rounded-xs" }, /* @__PURE__ */ React.createElement("div", { className: "font-bold text-noir mb-0.5" }, "2. Cache Navigateur"), /* @__PURE__ */ React.createElement("p", { className: "text-[11px] text-taupe-dark" }, "Vide les donn\xE9es temporaires du navigateur tout en conservant votre session administrateur active.")), /* @__PURE__ */ React.createElement("div", { className: "p-3 bg-[#FAF9F6] border border-taupe/20 rounded-xs" }, /* @__PURE__ */ React.createElement("div", { className: "font-bold text-noir mb-0.5" }, "3. Synchronisation Firebase"), /* @__PURE__ */ React.createElement("p", { className: "text-[11px] text-taupe-dark" }, lastCacheClearedAt ? `\u2705 Dernier vidage r\xE9ussi \xE0 ${lastCacheClearedAt}` : `Pr\xEAt \u2014 ${products.length} produits & ${orders.length} commandes synchronis\xE9s.`))))))), testimonialModalOpen && /* @__PURE__ */ React.createElement("div", { className: "fixed inset-0 z-60 bg-black/70 flex items-center justify-center p-4" }, /* @__PURE__ */ React.createElement("div", { className: "bg-white w-full max-w-lg rounded-xs shadow-2xl border border-taupe/30 overflow-hidden" }, /* @__PURE__ */ React.createElement("div", { className: "p-4 bg-noir text-white flex items-center justify-between" }, /* @__PURE__ */ React.createElement("h3", { className: "font-serif text-sm font-bold tracking-wide" }, editingTestimonial ? "Modifier le T\xE9moignage" : "Nouveau T\xE9moignage Client"), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setTestimonialModalOpen(false),
      className: "text-white/60 hover:text-white"
    },
    "\u2715"
  )), /* @__PURE__ */ React.createElement("form", { onSubmit: handleSaveTestimonial, className: "p-5 space-y-4 text-xs" }, /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-2 gap-3" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block font-bold uppercase text-[10px] text-taupe-dark mb-1" }, "Nom du Client *"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      value: testimonialForm.author,
      onChange: (e) => setTestimonialForm((p) => ({ ...p, author: e.target.value })),
      placeholder: "Ex: Youssef Bennani",
      className: "w-full bg-white border border-taupe/30 px-3 py-2 text-xs text-noir focus:border-caramel",
      required: true
    }
  )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block font-bold uppercase text-[10px] text-taupe-dark mb-1" }, "Ville *"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      value: testimonialForm.city,
      onChange: (e) => setTestimonialForm((p) => ({ ...p, city: e.target.value })),
      placeholder: "Ex: Casablanca",
      className: "w-full bg-white border border-taupe/30 px-3 py-2 text-xs text-noir focus:border-caramel",
      required: true
    }
  ))), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-2 gap-3" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block font-bold uppercase text-[10px] text-taupe-dark mb-1" }, "Note (\xC9toiles)"), /* @__PURE__ */ React.createElement(
    "select",
    {
      value: testimonialForm.rating,
      onChange: (e) => setTestimonialForm((p) => ({ ...p, rating: Number(e.target.value) })),
      className: "w-full bg-white border border-taupe/30 px-3 py-2 text-xs text-noir font-bold focus:border-caramel"
    },
    /* @__PURE__ */ React.createElement("option", { value: 5 }, "\u2605\u2605\u2605\u2605\u2605 (5/5)"),
    /* @__PURE__ */ React.createElement("option", { value: 4 }, "\u2605\u2605\u2605\u2605\u2606 (4/5)"),
    /* @__PURE__ */ React.createElement("option", { value: 3 }, "\u2605\u2605\u2605\u2606\u2606 (3/5)")
  )), /* @__PURE__ */ React.createElement("div", { className: "flex items-center pt-5" }, /* @__PURE__ */ React.createElement("label", { className: "flex items-center gap-2 cursor-pointer" }, /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "checkbox",
      checked: testimonialForm.verified,
      onChange: (e) => setTestimonialForm((p) => ({ ...p, verified: e.target.checked })),
      className: "w-4 h-4 accent-noir"
    }
  ), /* @__PURE__ */ React.createElement("span", { className: "text-[11px] font-semibold text-noir" }, "Badge Achat V\xE9rifi\xE9")))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block font-bold uppercase text-[10px] text-taupe-dark mb-1" }, "Avis en Fran\xE7ais *"), /* @__PURE__ */ React.createElement(
    "textarea",
    {
      rows: "3",
      value: testimonialForm.textFr,
      onChange: (e) => setTestimonialForm((p) => ({ ...p, textFr: e.target.value })),
      placeholder: "Ex: Qualit\xE9 irr\xE9prochable du cuir, livraison express le lendemain...",
      className: "w-full bg-white border border-taupe/30 px-3 py-2 text-xs text-noir focus:border-caramel",
      required: true
    }
  )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block font-bold uppercase text-[10px] text-taupe-dark mb-1" }, "Avis en Arabe (Optionnel)"), /* @__PURE__ */ React.createElement(
    "textarea",
    {
      rows: "2",
      value: testimonialForm.textAr,
      onChange: (e) => setTestimonialForm((p) => ({ ...p, textAr: e.target.value })),
      placeholder: "\u0645\u062B\u0627\u0644: \u062C\u0648\u062F\u0629 \u0645\u0645\u062A\u0627\u0632\u0629 \u0648\u0633\u0631\u0639\u0629 \u0641\u064A \u0627\u0644\u062A\u0648\u0635\u064A\u0644...",
      className: "w-full bg-white border border-taupe/30 px-3 py-2 text-xs text-noir focus:border-caramel font-arabic text-right"
    }
  )), /* @__PURE__ */ React.createElement("div", { className: "pt-3 border-t border-taupe/15 flex justify-end gap-2" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: () => setTestimonialModalOpen(false),
      className: "px-4 py-2 border border-taupe/30 text-noir hover:bg-canvas text-xs"
    },
    "Annuler"
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "submit",
      disabled: testimonialSaving,
      className: "px-5 py-2 bg-noir hover:bg-caramel text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-2xs"
    },
    testimonialSaving ? "Sauvegarde..." : "Enregistrer"
  ))))));
}
function ProductFormModal({ initialData, token, lang, t, onClose, onSaved, onError }) {
  const [nameFr, setNameFr] = useState(initialData.nameFr || "");
  const [nameAr, setNameAr] = useState(initialData.nameAr || "");
  const [price, setPrice] = useState(initialData.price || "");
  const [oldPrice, setOldPrice] = useState(initialData.oldPrice || "");
  const [stock, setStock] = useState(initialData.stock ?? 10);
  const [category, setCategory] = useState(initialData.category || PRODUCT_CATEGORIES[0]);
  const [badge, setBadge] = useState(initialData.badge || "new");
  const [showOnHome, setShowOnHome] = useState(initialData.showOnHome !== false);
  const [videoUrl, setVideoUrl] = useState(initialData.videoUrl || "");
  const [imagesList, setImagesList] = useState(Array.isArray(initialData.images) ? [...initialData.images] : []);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [draggedImgIdx, setDraggedImgIdx] = useState(null);
  const [dragOverImgIdx, setDragOverImgIdx] = useState(null);
  const [descFr, setDescFr] = useState(initialData.descFr || "");
  const [descAr, setDescAr] = useState(initialData.descAr || "");
  const [sizesStr, setSizesStr] = useState(
    Array.isArray(initialData.sizes) && initialData.sizes.length > 0 ? initialData.sizes.join(", ") : "Unique"
  );
  const [colorsStr, setColorsStr] = useState(
    Array.isArray(initialData.colors) && initialData.colors.length > 0 ? initialData.colors.join(", ") : "Noir:#171717"
  );
  const [variantStockMap, setVariantStockMap] = useState(() => {
    if (initialData.variantStock && typeof initialData.variantStock === "object" && Object.keys(initialData.variantStock).length > 0) {
      return { ...initialData.variantStock };
    }
    const initSizes = Array.isArray(initialData.sizes) && initialData.sizes.length > 0 ? initialData.sizes : ["Unique"];
    const initColors = Array.isArray(initialData.colors) && initialData.colors.length > 0 ? initialData.colors : ["#171717"];
    const map = {};
    const combosCount = Math.max(1, initSizes.length * initColors.length);
    const defaultPerCombo = initialData.id ? Math.max(1, Math.floor((Number(initialData.stock) || 5) / combosCount)) : 5;
    initSizes.forEach((s) => {
      initColors.forEach((c) => {
        map[makeVariantKey(s, c)] = defaultPerCombo;
      });
    });
    return map;
  });
  const [bulkFillValue, setBulkFillValue] = useState(5);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const parsedSizes = useMemo(() => {
    const arr = sizesStr.split(",").map((s) => s.trim()).filter(Boolean);
    return arr.length > 0 ? arr : ["Unique"];
  }, [sizesStr]);
  const parsedColors = useMemo(() => {
    const arr = colorsStr.split(",").map((s) => s.trim()).filter(Boolean);
    return arr.length > 0 ? arr : ["Noir:#171717"];
  }, [colorsStr]);
  const getCellQty = (size, color) => {
    const exactKey = makeVariantKey(size, color);
    if (variantStockMap[exactKey] !== void 0) {
      return Math.max(0, Number(variantStockMap[exactKey]) || 0);
    }
    const cLabel = getColorLabel(color, "fr").toLowerCase();
    for (const [k, v] of Object.entries(variantStockMap)) {
      const [ks, kc] = String(k).split("__");
      if (ks && kc && ks.trim().toLowerCase() === size.toLowerCase() && (kc.trim().toLowerCase() === color.toLowerCase() || getColorLabel(kc, "fr").toLowerCase() === cLabel)) {
        return Math.max(0, Number(v) || 0);
      }
    }
    return 0;
  };
  const setCellQty = (size, color, val) => {
    const cleanQty = Math.max(0, Math.floor(Number(val) || 0));
    const key = makeVariantKey(size, color);
    setVariantStockMap((prev) => ({
      ...prev,
      [key]: cleanQty
    }));
  };
  const totalCalculatedStock = useMemo(() => {
    let sum = 0;
    parsedSizes.forEach((sz) => {
      parsedColors.forEach((col) => {
        sum += getCellQty(sz, col);
      });
    });
    return sum;
  }, [parsedSizes, parsedColors, variantStockMap]);
  useEffect(() => {
    setStock(totalCalculatedStock);
  }, [totalCalculatedStock]);
  const handleApplyBulkQty = () => {
    const q = Math.max(0, Math.floor(Number(bulkFillValue) || 0));
    const next = { ...variantStockMap };
    parsedSizes.forEach((sz) => {
      parsedColors.forEach((col) => {
        next[makeVariantKey(sz, col)] = q;
      });
    });
    setVariantStockMap(next);
  };
  const handleAddPresetColor = (preset) => {
    const tokenStr = `${preset.labelFr}:${preset.hex}`;
    const currentList = colorsStr.split(",").map((s) => s.trim()).filter(Boolean);
    const alreadyExists = currentList.some(
      (c) => getColorLabel(c, "fr").toLowerCase() === preset.labelFr.toLowerCase() || c.toUpperCase() === preset.hex.toUpperCase()
    );
    if (!alreadyExists) {
      const updated = [...currentList, tokenStr];
      setColorsStr(updated.join(", "));
      setVariantStockMap((prev) => {
        const copy = { ...prev };
        parsedSizes.forEach((sz) => {
          copy[makeVariantKey(sz, tokenStr)] = 5;
        });
        return copy;
      });
    }
  };
  const handleApplySizePreset = (presetSizesArr) => {
    setSizesStr(presetSizesArr.join(", "));
    setVariantStockMap((prev) => {
      const copy = { ...prev };
      presetSizesArr.forEach((sz) => {
        parsedColors.forEach((col) => {
          const k = makeVariantKey(sz, col);
          if (copy[k] === void 0) copy[k] = 5;
        });
      });
      return copy;
    });
  };
  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setUploading(true);
    setUploadError("");
    try {
      for (const file of files) {
        const base64Data = await compressImageFile(file, 1100, 0.82);
        const res = await fetch("/api/upload", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            file: base64Data,
            filename: file.name,
            folder: "products"
          })
        });
        const data = await res.json();
        if (res.ok && data.url) {
          setImagesList((prev) => [...prev, data.url]);
        } else {
          setUploadError(data.error || "Erreur lors de l'upload de l'image");
        }
      }
    } catch (err) {
      setUploadError("Erreur lors de l'envoi vers Firebase Storage");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };
  const handleRemoveImage = (indexToRemove) => {
    setImagesList((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };
  const handleMoveImage = (fromIndex, toIndex) => {
    setImagesList((prev) => {
      if (fromIndex < 0 || fromIndex >= prev.length) return prev;
      const boundedTo = Math.max(0, Math.min(prev.length - 1, toIndex));
      if (fromIndex === boundedTo) return prev;
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(boundedTo, 0, moved);
      return next;
    });
  };
  const handleAddManualImageUrl = () => {
    const trimmed = (newImageUrl || "").trim();
    if (!trimmed) return;
    setImagesList((prev) => [...prev, trimmed]);
    setNewImageUrl("");
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const pendingUrl = (newImageUrl || "").trim();
      const finalImages = pendingUrl ? [...imagesList, pendingUrl] : [...imagesList];
      const sizes = parsedSizes;
      const colors = parsedColors;
      const cleanVariantStock = {};
      let sumStock = 0;
      sizes.forEach((sz) => {
        colors.forEach((col) => {
          const q = getCellQty(sz, col);
          cleanVariantStock[makeVariantKey(sz, col)] = q;
          sumStock += q;
        });
      });
      const payload = {
        id: initialData.id,
        position: initialData.position,
        nameFr,
        nameAr,
        price: Number(price),
        oldPrice: oldPrice ? Number(oldPrice) : null,
        stock: sumStock,
        inStock: sumStock > 0,
        variantStock: cleanVariantStock,
        category,
        badge: sumStock <= 0 ? "out" : badge === "out" ? "new" : badge,
        isNew: badge === "new",
        showOnHome: Boolean(showOnHome),
        videoUrl: (videoUrl || "").trim(),
        rating: initialData.rating || 5,
        images: finalImages.length > 0 ? finalImages : ['data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><rect width="400" height="400" fill="%23f3f1ec"/><text x="200" y="200" fill="%23999" text-anchor="middle">MODANOVA</text></svg>'],
        descFr,
        descAr,
        sizes,
        colors
      };
      const res = await fetch("/api/products", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const resData = await res.json().catch(() => ({}));
        onSaved(resData.product || payload);
      } else {
        const data = await res.json();
        onError(data.error || "Erreur enregistrement");
      }
    } catch (err) {
      onError("Erreur de connexion");
    }
  };
  return /* @__PURE__ */ React.createElement("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4" }, /* @__PURE__ */ React.createElement("div", { className: "fixed inset-0 bg-black/60 backdrop-blur-xs", onClick: onClose }), /* @__PURE__ */ React.createElement("div", { className: "relative bg-canvas w-full max-w-3xl max-h-[92vh] overflow-y-auto z-10 shadow-2xl border border-taupe/30 p-6 sm:p-8" }, /* @__PURE__ */ React.createElement("button", { onClick: onClose, className: "absolute top-4 end-4 text-taupe-dark hover:text-noir text-lg" }, "\u2715"), /* @__PURE__ */ React.createElement("h3", { className: "font-serif text-2xl font-bold text-noir mb-4" }, initialData.id ? "Modifier le Produit" : "Ajouter un Produit"), /* @__PURE__ */ React.createElement("form", { onSubmit: handleSubmit, className: "space-y-4 text-xs" }, /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-2 gap-3" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block font-bold uppercase mb-1" }, "Nom (FR) *"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      required: true,
      value: nameFr,
      onChange: (e) => setNameFr(e.target.value),
      className: "w-full bg-card border border-taupe/30 p-2"
    }
  )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block font-bold uppercase mb-1" }, "Nom (AR)"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      dir: "rtl",
      value: nameAr,
      onChange: (e) => setNameAr(e.target.value),
      className: "w-full bg-card border border-taupe/30 p-2"
    }
  ))), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-3 gap-3" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block font-bold uppercase mb-1" }, "Prix (MAD) *"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "number",
      required: true,
      value: price,
      onChange: (e) => setPrice(e.target.value),
      className: "w-full bg-card border border-taupe/30 p-2"
    }
  )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block font-bold uppercase mb-1" }, "Ancien Prix"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "number",
      value: oldPrice,
      onChange: (e) => setOldPrice(e.target.value),
      className: "w-full bg-card border border-taupe/30 p-2"
    }
  )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block font-bold uppercase mb-1" }, "Stock Total (Calcul\xE9 auto)"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "number",
      readOnly: true,
      value: stock,
      className: "w-full bg-[#EFECE6] border border-taupe/30 p-2 font-bold text-noir cursor-not-allowed",
      title: "Le stock total est calcul\xE9 automatiquement \xE0 partir des quantit\xE9s de chaque taille et couleur ci-dessous"
    }
  ))), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-2 gap-3" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block font-bold uppercase mb-1" }, "Cat\xE9gorie *"), /* @__PURE__ */ React.createElement(
    "select",
    {
      value: category,
      onChange: (e) => setCategory(e.target.value),
      className: "w-full bg-card border border-taupe/30 p-2 font-medium"
    },
    PRODUCT_CATEGORIES.map((cat) => /* @__PURE__ */ React.createElement("option", { key: cat, value: cat }, cat))
  )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block font-bold uppercase mb-1" }, "Badge"), /* @__PURE__ */ React.createElement(
    "select",
    {
      value: badge,
      onChange: (e) => setBadge(e.target.value),
      className: "w-full bg-card border border-taupe/30 p-2"
    },
    /* @__PURE__ */ React.createElement("option", { value: "new" }, "Nouveau"),
    /* @__PURE__ */ React.createElement("option", { value: "exclusive" }, "Exclusif"),
    /* @__PURE__ */ React.createElement("option", { value: "luxury" }, "\xC9dition Limit\xE9e"),
    /* @__PURE__ */ React.createElement("option", { value: "out" }, "Rupture")
  ))), /* @__PURE__ */ React.createElement("div", { className: `p-3.5 rounded-xs border transition-colors flex items-start justify-between gap-3 ${showOnHome ? "bg-emerald-50/70 border-emerald-400" : "bg-card border-taupe/30"}` }, /* @__PURE__ */ React.createElement("label", { className: "flex items-start gap-3 cursor-pointer select-none flex-1" }, /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "checkbox",
      checked: showOnHome,
      onChange: (e) => setShowOnHome(e.target.checked),
      className: "mt-0.5 w-4 h-4 accent-noir cursor-pointer"
    }
  ), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { className: "font-bold uppercase text-[11px] text-noir block" }, "\u{1F3E0} Afficher ce produit sur la Page Principale (Index / Accueil)"), /* @__PURE__ */ React.createElement("span", { className: "text-[10px] text-taupe-dark block mt-0.5" }, showOnHome ? "\u2705 Ce produit est visible sur la Page Principale (Accueil) ET sur la page \xAB Tous les Produits & Filtres \xBB." : "\u{1F4C2} Ce produit est masqu\xE9 de la Page Principale (Accueil) et s'affiche uniquement sur la page \xAB Tous les Produits & Filtres \xBB (/produits)."))), /* @__PURE__ */ React.createElement("span", { className: `px-2 py-0.5 text-[10px] font-bold uppercase rounded-2xs shrink-0 ${showOnHome ? "bg-emerald-700 text-white" : "bg-taupe/30 text-noir"}` }, showOnHome ? "Sur Index" : "Catalogue seul")), /* @__PURE__ */ React.createElement("div", { className: "border border-taupe/35 bg-white p-4 rounded-xs space-y-3 shadow-2xs" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between gap-2" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "font-bold uppercase text-[11px] text-noir block" }, "\u{1F3AC} Lien Vid\xE9o du Produit (Optionnel)"), /* @__PURE__ */ React.createElement("span", { className: "text-[10px] text-taupe-dark block mt-0.5" }, "Collez un lien vid\xE9o ", /* @__PURE__ */ React.createElement("strong", null, "YouTube"), ", ", /* @__PURE__ */ React.createElement("strong", null, "YouTube Shorts"), ", ", /* @__PURE__ */ React.createElement("strong", null, "TikTok"), ", ", /* @__PURE__ */ React.createElement("strong", null, "Vimeo"), ", ", /* @__PURE__ */ React.createElement("strong", null, "Google Drive"), ", ", /* @__PURE__ */ React.createElement("strong", null, "Instagram Reel"), " ou un lien direct ", /* @__PURE__ */ React.createElement("strong", null, ".mp4 / .webm"), ".")), videoUrl && videoUrl.trim() && /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: () => setVideoUrl(""),
      className: "px-2.5 py-1 bg-red-50 hover:bg-red-600 text-red-700 hover:text-white border border-red-200 text-[10px] font-bold rounded-2xs transition-colors shrink-0"
    },
    "\u2715 Supprimer vid\xE9o"
  )), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "url",
      value: videoUrl,
      onChange: (e) => setVideoUrl(e.target.value),
      placeholder: "Ex: https://www.youtube.com/watch?v=... ou https://youtu.be/... ou https://.../video.mp4",
      className: "w-full bg-card border border-taupe/30 px-3 py-2 font-mono text-xs text-noir focus:border-caramel"
    }
  ), videoUrl && videoUrl.trim() && /* @__PURE__ */ React.createElement("div", { className: "pt-2 border-t border-taupe/15" }, /* @__PURE__ */ React.createElement("div", { className: "text-[10px] font-bold uppercase tracking-wider text-caramel mb-1.5" }, "\u25B6 Aper\xE7u en direct de la vid\xE9o :"), /* @__PURE__ */ React.createElement("div", { className: "max-w-sm mx-auto" }, /* @__PURE__ */ React.createElement(ProductVideoPlayer, { videoUrl, title: nameFr || "Aper\xE7u Vid\xE9o", lang })))), /* @__PURE__ */ React.createElement("div", { className: "border border-dashed border-caramel/50 bg-[#FAF7F2] p-4 rounded-xs space-y-3" }, /* @__PURE__ */ React.createElement("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-3" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { className: "font-bold uppercase text-[11px] text-noir block" }, "\u{1F4F8} Photos du Produit & Ordre d'Affichage (1er, 2\xE8me, 3\xE8me...)"), /* @__PURE__ */ React.createElement("span", { className: "text-[10px] text-taupe-dark block mt-0.5" }, "D\xE9placez les photos (fl\xE8ches ", /* @__PURE__ */ React.createElement("strong", null, "\u2190 \u2192"), ", menu ", /* @__PURE__ */ React.createElement("strong", null, "1er, 2e, 3e..."), " ou glisser-d\xE9poser) pour choisir la 1\xE8re photo principale, la 2\xE8me, la 3\xE8me, etc.")), /* @__PURE__ */ React.createElement("label", { className: `px-3.5 py-2 bg-noir hover:bg-caramel text-white text-[11px] font-semibold cursor-pointer rounded-xs transition-colors flex items-center gap-1.5 shrink-0 shadow-xs ${uploading ? "opacity-50 pointer-events-none" : ""}` }, /* @__PURE__ */ React.createElement("span", null, uploading ? "\u23F3 Upload Firebase..." : "\u{1F4C1} Ajouter photo(s)"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "file",
      accept: "image/*",
      multiple: true,
      onChange: handleFileUpload,
      className: "hidden",
      disabled: uploading
    }
  ))), uploadError && /* @__PURE__ */ React.createElement("div", { className: "p-2 bg-red-100 text-red-800 text-[11px] rounded-xs" }, uploadError), imagesList.length > 0 ? /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 border-t border-taupe/20" }, imagesList.map((imgUrl, i) => {
    const isFirst = i === 0;
    const isBeingDragged = draggedImgIdx === i;
    const isDragTarget = dragOverImgIdx === i && draggedImgIdx !== i;
    return /* @__PURE__ */ React.createElement(
      "div",
      {
        key: `${i}-${imgUrl.slice(0, 24)}`,
        draggable: true,
        onDragStart: (e) => {
          setDraggedImgIdx(i);
          try {
            e.dataTransfer.effectAllowed = "move";
            e.dataTransfer.setData("text/plain", String(i));
          } catch {
          }
        },
        onDragOver: (e) => {
          e.preventDefault();
          if (dragOverImgIdx !== i) {
            setDragOverImgIdx(i);
          }
        },
        onDragLeave: () => {
          if (dragOverImgIdx === i) {
            setDragOverImgIdx(null);
          }
        },
        onDrop: (e) => {
          e.preventDefault();
          const fromIdx = draggedImgIdx != null ? draggedImgIdx : Number(e.dataTransfer.getData("text/plain"));
          setDraggedImgIdx(null);
          setDragOverImgIdx(null);
          if (!isNaN(fromIdx)) {
            handleMoveImage(fromIdx, i);
          }
        },
        onDragEnd: () => {
          setDraggedImgIdx(null);
          setDragOverImgIdx(null);
        },
        className: `relative bg-white border rounded-xs p-2 flex flex-col justify-between shadow-2xs transition-all cursor-grab active:cursor-grabbing ${isBeingDragged ? "opacity-40 scale-95 border-caramel" : isDragTarget ? "border-2 border-caramel ring-2 ring-caramel/30 bg-caramel/5" : isFirst ? "border-2 border-caramel" : "border-taupe/30 hover:border-noir/50"}`
      },
      /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between gap-1 mb-1.5" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-1" }, /* @__PURE__ */ React.createElement(
        "span",
        {
          className: `px-1.5 py-0.5 text-[10px] font-bold uppercase rounded-2xs ${isFirst ? "bg-noir text-[#E6C687]" : "bg-canvas text-noir border border-taupe/25"}`
        },
        isFirst ? "\u2605 1\xE8re (Principale)" : `${i + 1}\xE8me`
      )), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-1" }, imagesList.length > 1 && /* @__PURE__ */ React.createElement(
        "select",
        {
          value: i + 1,
          onChange: (e) => handleMoveImage(i, Number(e.target.value) - 1),
          className: "bg-canvas border border-taupe/35 text-noir font-mono text-[10px] font-bold px-1 py-0.5 rounded-2xs cursor-pointer hover:border-caramel",
          title: "Choisir la position de cette photo (1\xE8re, 2\xE8me, 3\xE8me...)"
        },
        imagesList.map((_, posIdx) => /* @__PURE__ */ React.createElement("option", { key: posIdx, value: posIdx + 1 }, posIdx === 0 ? "Pos: 1er" : `Pos: ${posIdx + 1}e`))
      ), /* @__PURE__ */ React.createElement(
        "button",
        {
          type: "button",
          onClick: () => handleRemoveImage(i),
          className: "bg-red-600 hover:bg-red-700 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-2xs transition-colors",
          title: "Supprimer cette photo"
        },
        "\u2715"
      ))),
      /* @__PURE__ */ React.createElement("div", { className: "w-full h-28 bg-[#F7F5F0] border border-taupe/15 rounded-2xs overflow-hidden flex items-center justify-center p-1 mb-2" }, /* @__PURE__ */ React.createElement("img", { src: imgUrl, alt: `Photo ${i + 1}`, className: "w-full h-full object-contain pointer-events-none" })),
      imagesList.length > 1 && /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between gap-1 pt-1 border-t border-taupe/15" }, /* @__PURE__ */ React.createElement(
        "button",
        {
          type: "button",
          disabled: i === 0,
          onClick: () => handleMoveImage(i, i - 1),
          className: `px-2 py-1 text-[10px] font-bold rounded-2xs border transition-colors ${i === 0 ? "border-taupe/15 text-taupe/40 cursor-not-allowed" : "border-taupe/30 bg-canvas hover:bg-noir hover:text-white text-noir"}`,
          title: "D\xE9placer vers la gauche (position pr\xE9c\xE9dente)"
        },
        "\u2190 Gauche"
      ), !isFirst && /* @__PURE__ */ React.createElement(
        "button",
        {
          type: "button",
          onClick: () => handleMoveImage(i, 0),
          className: "px-1.5 py-1 text-[10px] font-bold rounded-2xs bg-caramel/15 hover:bg-caramel text-caramel hover:text-white border border-caramel/30 transition-colors",
          title: "D\xE9finir comme 1\xE8re photo principale"
        },
        "\u2605 1er"
      ), /* @__PURE__ */ React.createElement(
        "button",
        {
          type: "button",
          disabled: i === imagesList.length - 1,
          onClick: () => handleMoveImage(i, i + 1),
          className: `px-2 py-1 text-[10px] font-bold rounded-2xs border transition-colors ${i === imagesList.length - 1 ? "border-taupe/15 text-taupe/40 cursor-not-allowed" : "border-taupe/30 bg-canvas hover:bg-noir hover:text-white text-noir"}`,
          title: "D\xE9placer vers la droite (position suivante)"
        },
        "Droite \u2192"
      ))
    );
  })) : /* @__PURE__ */ React.createElement("div", { className: "text-center py-4 text-taupe-dark text-[11px] border-t border-taupe/15" }, "Aucune photo ajout\xE9e pour le moment. Cliquez sur \xAB \u{1F4C1} Ajouter photo(s) \xBB ci-dessus."), /* @__PURE__ */ React.createElement("div", { className: "pt-2 border-t border-taupe/20" }, /* @__PURE__ */ React.createElement("label", { className: "block font-bold uppercase text-[10px] text-taupe-dark mb-1" }, "Ajouter une photo via lien URL (optionnel)"), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      value: newImageUrl,
      onChange: (e) => setNewImageUrl(e.target.value),
      onKeyDown: (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          handleAddManualImageUrl();
        }
      },
      placeholder: "https://... ou /uploads/...",
      className: "flex-1 bg-white border border-taupe/30 px-2.5 py-1.5 font-mono text-[11px]"
    }
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: handleAddManualImageUrl,
      className: "px-3 py-1.5 bg-noir hover:bg-caramel text-white text-[11px] font-semibold rounded-xs transition-colors shrink-0"
    },
    "+ Ajouter URL"
  )))), /* @__PURE__ */ React.createElement("div", { className: "border border-taupe/30 bg-white p-4 rounded-xs space-y-4 shadow-2xs" }, /* @__PURE__ */ React.createElement("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-taupe/15 pb-3" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { className: "font-bold uppercase text-xs text-noir block" }, "\u{1F4E6} Gestion des Quantit\xE9s par Taille / Pointure & par Couleur"), /* @__PURE__ */ React.createElement("span", { className: "text-[11px] text-taupe-dark" }, "D\xE9finissez le stock exact pour chaque combinaison (V\xEAtements, Chaussures et Accessoires). D\xE8s qu'une taille d'une couleur tombe \xE0 0, le client est inform\xE9 qu'elle est \xE9puis\xE9e.")), /* @__PURE__ */ React.createElement("span", { className: "px-2.5 py-1 bg-noir text-[#E6C687] font-mono text-[11px] font-bold rounded-xs shrink-0" }, "Total : ", totalCalculatedStock, " en stock")), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block font-bold uppercase mb-1 text-noir" }, "Tailles / Pointures / Formats (s\xE9par\xE9s par virgule) *"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      value: sizesStr,
      onChange: (e) => setSizesStr(e.target.value),
      placeholder: "Ex: S, M, L, XL ou 40, 41, 42, 43 ou Unique",
      className: "w-full bg-card border border-taupe/30 p-2 font-mono text-xs"
    }
  ), /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap gap-1.5 mt-1.5" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: () => handleApplySizePreset(["S", "M", "L", "XL", "XXL"]),
      className: "px-2 py-0.5 bg-canvas hover:bg-noir hover:text-white border border-taupe/30 text-[10px] font-semibold rounded-2xs transition-colors"
    },
    "\u{1F455} V\xEAtements (S, M, L, XL, XXL)"
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: () => handleApplySizePreset(["40", "41", "42", "43", "44", "45"]),
      className: "px-2 py-0.5 bg-canvas hover:bg-noir hover:text-white border border-taupe/30 text-[10px] font-semibold rounded-2xs transition-colors"
    },
    "\u{1F45E} Chaussures (40 \xE0 45)"
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: () => handleApplySizePreset(["Unique"]),
      className: "px-2 py-0.5 bg-canvas hover:bg-noir hover:text-white border border-taupe/30 text-[10px] font-semibold rounded-2xs transition-colors"
    },
    "\u{1F45C} Accessoires (Taille Unique)"
  ))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block font-bold uppercase mb-1 text-noir" }, "Couleurs (s\xE9par\xE9es par virgule) *"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "text",
      value: colorsStr,
      onChange: (e) => setColorsStr(e.target.value),
      placeholder: "Ex: Noir:#171717, Marron:#3D2B1F, Blanc:#FFFFFF",
      className: "w-full bg-card border border-taupe/30 p-2 font-mono text-xs"
    }
  ), /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap gap-1 mt-1.5" }, PRESET_COLOR_PALETTE.map((p) => /* @__PURE__ */ React.createElement(
    "button",
    {
      key: p.labelFr,
      type: "button",
      onClick: () => handleAddPresetColor(p),
      className: "px-1.5 py-0.5 bg-canvas hover:bg-noir hover:text-white border border-taupe/30 text-[10px] font-medium rounded-2xs flex items-center gap-1 transition-colors",
      title: `Ajouter la couleur ${p.labelFr}`
    },
    /* @__PURE__ */ React.createElement(
      "span",
      {
        className: "w-2.5 h-2.5 rounded-full border border-black/30 inline-block",
        style: { backgroundColor: p.hex }
      }
    ),
    /* @__PURE__ */ React.createElement("span", null, "+", p.labelFr)
  ))))), /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap items-center justify-between gap-2 bg-[#FAF7F2] border border-taupe/20 px-3 py-2 rounded-xs" }, /* @__PURE__ */ React.createElement("span", { className: "text-[11px] font-semibold text-noir" }, "\u26A1 Remplissage rapide : appliquer une m\xEAme quantit\xE9 \xE0 toutes les tailles & couleurs :"), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "number",
      min: "0",
      value: bulkFillValue,
      onChange: (e) => setBulkFillValue(e.target.value),
      className: "w-16 bg-white border border-taupe/30 px-2 py-1 text-center font-mono font-bold text-xs"
    }
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: handleApplyBulkQty,
      className: "px-3 py-1 bg-noir hover:bg-caramel text-white text-[11px] font-semibold rounded-2xs transition-colors"
    },
    "Appliquer partout"
  ))), /* @__PURE__ */ React.createElement("div", { className: "overflow-x-auto border border-taupe/25 rounded-xs" }, /* @__PURE__ */ React.createElement("table", { className: "w-full text-left border-collapse text-xs" }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", { className: "bg-canvas border-b border-taupe/25 text-noir font-bold" }, /* @__PURE__ */ React.createElement("th", { className: "p-2.5 border-r border-taupe/20 min-w-[130px]" }, "Couleur \\ Taille"), parsedSizes.map((sz) => /* @__PURE__ */ React.createElement("th", { key: sz, className: "p-2.5 text-center border-r border-taupe/15 font-mono min-w-[76px]" }, sz)), /* @__PURE__ */ React.createElement("th", { className: "p-2.5 text-center bg-[#EFECE6] font-mono min-w-[80px]" }, "Sous-total"))), /* @__PURE__ */ React.createElement("tbody", { className: "divide-y divide-taupe/15" }, parsedColors.map((col) => {
    const cName = getColorLabel(col, "fr");
    const cHex = getColorCss(col);
    const rowSum = parsedSizes.reduce((acc, sz) => acc + getCellQty(sz, col), 0);
    return /* @__PURE__ */ React.createElement("tr", { key: col, className: "hover:bg-canvas/50" }, /* @__PURE__ */ React.createElement("td", { className: "p-2.5 border-r border-taupe/20 font-semibold text-noir" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement(
      "span",
      {
        className: "w-4 h-4 rounded-full border border-black/25 shrink-0",
        style: { backgroundColor: cHex }
      }
    ), /* @__PURE__ */ React.createElement("span", null, cName))), parsedSizes.map((sz) => {
      const cellVal = getCellQty(sz, col);
      const isZero = cellVal <= 0;
      return /* @__PURE__ */ React.createElement("td", { key: sz, className: "p-2 text-center border-r border-taupe/15" }, /* @__PURE__ */ React.createElement(
        "input",
        {
          type: "number",
          min: "0",
          value: cellVal,
          onChange: (e) => setCellQty(sz, col, e.target.value),
          className: `w-16 text-center font-mono font-bold px-1.5 py-1 border rounded-2xs focus:outline-none ${isZero ? "bg-red-50 border-red-300 text-red-700" : "bg-white border-emerald-400 text-noir focus:border-caramel"}`
        }
      ), /* @__PURE__ */ React.createElement("div", { className: `text-[9px] mt-0.5 font-semibold ${isZero ? "text-red-600" : "text-emerald-700"}` }, isZero ? "\xC9puis\xE9 (0)" : `${cellVal} en stock`));
    }), /* @__PURE__ */ React.createElement("td", { className: "p-2.5 text-center font-mono font-bold bg-[#FAF9F6] text-noir" }, rowSum, " ex."));
  }))))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block font-bold uppercase mb-1" }, "Description (FR)"), /* @__PURE__ */ React.createElement(
    "textarea",
    {
      rows: "2",
      value: descFr,
      onChange: (e) => setDescFr(e.target.value),
      className: "w-full bg-card border border-taupe/30 p-2"
    }
  )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "block font-bold uppercase mb-1" }, "Description (AR)"), /* @__PURE__ */ React.createElement(
    "textarea",
    {
      rows: "2",
      dir: "rtl",
      value: descAr,
      onChange: (e) => setDescAr(e.target.value),
      className: "w-full bg-card border border-taupe/30 p-2"
    }
  )), /* @__PURE__ */ React.createElement("div", { className: "pt-2 flex justify-end gap-2" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      onClick: onClose,
      className: "px-4 py-2 border border-taupe/30 hover:border-noir text-noir"
    },
    "Annuler"
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "submit",
      className: "px-6 py-2 bg-noir text-white font-semibold uppercase tracking-wider hover:bg-caramel transition-colors"
    },
    "Enregistrer sur Firebase"
  )))));
}
const rootEl = document.getElementById("root");
if (rootEl) {
  ReactDOM.createRoot(rootEl).render(/* @__PURE__ */ React.createElement(App, null));
}
