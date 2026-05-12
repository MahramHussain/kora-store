# Kora Store - Future Development Roadmap

## Phase 1: Fixing Architectural Inconsistencies (Order Handling)
Based on our architectural analysis, we will overhaul the checkout and order handling system to function like a true premium e-commerce catalogue.

### 1. Rebuilding the Checkout Flow
Currently, `src/app/checkout/page.tsx` does not actually process orders. We will replace the "fake" `setTimeout` flow with a robust system that securely contacts the backend via `/api/checkout` and properly integrates with our database and payment flows.

### 2. Updating the Database Schema
The Prisma `Order` model currently lacks critical fields. We will expand the schema to include:
- Shipping Address (street, city, phone number)
- Payment Method
- Applied Promo Codes
- Shipping Costs and Tax tracking

### 3. Implementing Inventory Validation
We will re-introduce the `stock` column to the `Product` model. A premium site must validate inventory; we will build backend checks to lock inventory and prevent users from purchasing out-of-stock items.

### 4. Cart Clearing Mechanism
We will update the `CartContext` with a `clearCart()` function that wipes the local state and deletes the synced `CartItem` rows in the database upon a successful checkout.

### 5. Order Confirmation & References
We will implement a system to generate unique, user-friendly Order Reference Numbers (e.g., `#KORA-8429`). We will also integrate a communication layer (like Resend or SendGrid) to trigger professional order confirmation emails.

---

## Phase 2: Automated Product Ingestion System
To streamline catalogue management, we will build an automated product importer.
- **The Workflow**: You will upload product images into the `assets` folder alongside a `metadata.json` (or similar) file containing all product details (name, price, category, sizes, description, etc.).
- **The Script**: I will build a custom seeding system that parses this metadata, links the uploaded images, and automatically injects everything directly into the Prisma database. This eliminates manual data entry and ensures the database perfectly matches your local assets.

---

## Phase 3: Vault & Homepage Overhaul
Once the backend and ingestion systems are rock solid, we will return to the frontend to elevate the core browsing experience:
- **Vault Overhaul**: We will redesign the `/shop` (Vault) area, adding advanced filtering, dynamic loading, and premium grid layouts.
- **Homepage Additions**: We will enhance the homepage with new sections, dynamic content (like trending gear or new drops), and interactive elements to immediately capture the user's attention.
