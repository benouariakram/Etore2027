# MODANOVA / ETTORE — Security Specification & Audit

## 1. Data & Schema Invariants
- **Product Schema Invariant**: Products in `/products/{productId}` strictly enforce `isValidProduct(data)` (required keys `id`, `nameFr`, `price`, `stock`, `category`, whitelisted fields including `costPrice`, `showOnHome`, `videoUrl`, `position`, `variantStock`, bounded strings/arrays, and non-negative numeric checks). `id` is immutable on update.
- **Public API Filtering**: Unauthenticated `GET /api/products` and `GET /api/products/:id` endpoints strip admin-only `costPrice`.
- **Order Placement & Shipment Invariant**:
  - Order IDs strictly match `^CMD-[A-Z0-9]{6}$`.
  - Moroccan customer phones strictly match `^(06|07)[0-9]{8}$`.
  - Initial creation forces `status == 'En attente'`.
  - Line items must be non-empty (`size() > 0 && size() <= 100 && items[0] is map`).
  - Nested `shipment` metadata strictly validates carrier (`ozon`, `cathedis`, `amana`), tracking status (`PICKUP_PENDING`, `IN_TRANSIT`, `OUT_FOR_DELIVERY`, `DELIVERED`, `RETURNED`), mode (`api`, `bordereau`), and whitelisted keys via `isValidShipment()`.
  - `id` and `date` remain immutable on update.
- **Settings & Media Invariants**:
  - `/settings/{settingId}` restricts access to `['catalogMeta', 'heroSlider', 'cms', 'testimonials', 'adminConfig', 'coupons']` with per-document payload checks and `allow list: if false`.
  - `/media/{mediaId}` validates payload size (`<= 1,040,000` chars) and blocks `list` queries.
- **Admin Registry Invariant**: `/admins/{uid}` forbids client writes (`allow write: if false`).

## 2. Important Production Architecture Note (Auth / Admin SDK)
- Currently, `server.ts` accesses Firestore through `src/firebase.ts` using the Firebase Web Client SDK without a signed-in Firebase Auth session (`request.auth == null`).
- Consequently, `firestore.rules` validates strict schemas, bounds, regexes, and immutability, while keeping server-originated reads/writes functional.
- **Before large-scale public deployment**, migrate server-side Firestore access (`src/firebase.ts`) to `firebase-admin` (using a Google Cloud Service Account) so that `firestore.rules` can strictly enforce `isAdmin()` on `/orders` reads/updates/deletes, `/products` writes/deletes (and hide `costPrice` from direct Firestore queries), `/settings/adminConfig` (containing `passwordHash` and carrier API keys), `/settings/coupons`, and `/media`.

## 3. Dirty Dozen Attack Payloads Verified Against Schema Rules
1. **Ghost Field Injection**: `{ ..., isSuperAdmin: true }` in order or product -> **REJECTED** (`data.keys().hasOnly(...)`).
2. **Phone Number Spoofing**: `"0522123456"` -> **REJECTED** (`^(06|07)[0-9]{8}$`).
3. **Order ID Poisoning**: 2KB document ID or mismatched ID -> **REJECTED** (`isValidId()` & `^CMD-[A-Z0-9]{6}$`).
4. **Direct Terminal State on Create**: Order created with `status: 'Livrée'` -> **REJECTED** (`incoming().status == 'En attente'`).
5. **Shipment Carrier/Status Tampering**: Arbitrary keys or invalid carrier inside `shipment` -> **REJECTED** (`isValidShipment()`).
6. **Negative Product Price / Cost**: `price: -500` or `costPrice: -10` -> **REJECTED** (`>= 0`).
7. **Admin Self-Promotion**: Writing own UID to `/admins/{uid}` -> **REJECTED** (`allow write: if false`).
8. **Empty Cart Order**: `items: []` or non-map element -> **REJECTED** (`items.size() > 0 && items[0] is map`).
9. **Gigantic Text / Media Injection**: Address > 500 chars or media > 1.04MB -> **REJECTED**.
10. **Invalid Status Enum**: `status: 'HACKED'` -> **REJECTED**.
11. **Unknown Settings Key**: Writing `/settings/maliciousKey` -> **REJECTED** (`isValidSettingId()`).
12. **Order ID / Creation Date Tampering on Update**: Modifying `id` or `date` -> **REJECTED**.
