# ETTORE — Security Specification

## 1. Data Invariants
- **Product Invariant**: Products in `/products` are public to browse and read, but only authenticated administrators (`isAdmin()`) can create, update, or delete products.
- **Order Placement Invariant**: Customers place orders without needing an account (Cash on Delivery). An order document ID must strictly match `^CMD-[A-Z0-9]{6}$`. The customer phone must strictly follow the Moroccan mobile format `^(06|07)[0-9]{8}$`. Initial order creation must start in `'En attente'` status.
- **Order Tracking Invariant**: Single-document read (`get`) on `/orders/{orderId}` is permitted for direct order tracking, while collection query (`list`) is strictly restricted to verified administrators to prevent customer PII scraping.
- **Order Status Update Invariant**: Only administrators can update order status (e.g. from `'En attente'` to `'Confirmée'` or `'Livrée'`). Immutable fields such as `id`, `total`, and customer identity cannot be tampered with.
- **Admin Invariant**: Administrative privileges are verified through `/admins/{uid}` or authenticated administrator email (`startime.iptv@gmail.com` with `email_verified == true`).

## 2. The Dirty Dozen Attack Payloads
1. **Ghost Field Injection**: Attempt to insert `{ ..., isSuperAdmin: true }` in order document. -> REJECTED by schema and field constraints.
2. **Phone Number Spoofing**: Attempt to insert international or landline phone `"0522123456"`. -> REJECTED by regex `^(06|07)[0-9]{8}$`.
3. **Order ID Poisoning**: Attempt to create an order with 2KB string ID. -> REJECTED by `isValidId()` and `^CMD-[A-Z0-9]{6}$`.
4. **Direct Terminal State Modification**: Customer trying to set `status: 'Livrée'` at creation. -> REJECTED by `incoming().status == 'En attente'`.
5. **Customer Scraping List Attack**: Unauthenticated user querying `orders` collection. -> REJECTED by `allow list: if isAdmin()`.
6. **Price Alteration on Update**: Admin update changing order `total`. -> REJECTED by `incoming().total == existing().total`.
7. **Negative Price on Product**: Attempt to create product with `price: -500`. -> REJECTED by `data.price >= 0`.
8. **Catalog Vandalism**: Non-admin attempting to delete product. -> REJECTED by `allow delete: if isAdmin()`.
9. **Admin Document Self-Promotion**: User writing their own UID into `/admins/{uid}`. -> REJECTED by `allow write: if false`.
10. **Empty Cart Order**: Order submitted with empty `items: []`. -> REJECTED by `data.items.size() > 0`.
11. **Gigantic Text Injection**: Customer address with 10,000 characters. -> REJECTED by `data.address.size() <= 300`.
12. **Status Tampering with Invalid Status**: Update with `status: 'HACKED'`. -> REJECTED by enum check `['En attente', 'Confirmée', 'En cours', 'Livrée', 'Annulée']`.
