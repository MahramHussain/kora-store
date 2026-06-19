# 🏟️ Kora Vault: Product Ingestion & Management Manual

Welcome to the **Kora Store Product Management System**! This guide outlines how to safely add new products (apparel, shoes, accessories), manage image assets, and retire items without breaking the database or running into transaction errors.

---

## 🛠️ Option 1: Adding Products via the Command Center (Recommended)

The Admin Command Center (`/admin`) is the easiest way to add or edit products in real time.

### Step 1: Upload the Image Asset
Since images are hosted locally inside the project, you must drop the image files into the static uploads folder first:
📁 **`public/uploads/products/`**
* Filenames must be lowercased and use hyphens (e.g., `nike-air-max.png`, `real-madrid-away.jpg`).

### Step 2: Use the Command Center Form
Go to the **Command Center** and fill out the product form:
* **Category Dropdown**: Selecting **Shoes** (Boots) will automatically load standard UAE shoe sizes (`38, 39, 40...`). Selecting **Accessories** will default to `"One Size"`.
* **Image Filenames Field**: Simply type the filename (e.g., `nike-air-max.png`). The Command Center will automatically prepend `/uploads/products/` behind the scenes!
  - If you need to add multiple images, separate them by commas: `nike-air-max-1.png, nike-air-max-2.png`.

---

## 💻 Option 2: Adding Products via Metadata JSON File

If you are importing catalog data in bulk, you can use the seed engine.

### Step 1: Drop Your Image Assets
Place your product images inside:
📁 **`public/uploads/products/`**

### Step 2: Configure the Metadata JSON
Open the metadata document at:
📁 **`prisma/products.json`**

Append your new product block to the JSON array:
```json
  {
    "id": "liverpool-24-25-home",
    "name": "Liverpool 24/25 Home Kit",
    "category": "Shirts",
    "team": "Liverpool",
    "price": 85.00,
    "description": "Crafted from dry-fit premium fibers.",
    "images": ["/uploads/products/liverpool-24-25-home.png"],
    "sizes": ["S", "M", "L", "XL"],
    "tag": "Latest",
    "stock": 10
  }
```

### Step 3: Trigger the Ingestion Command
Run the sync script in the terminal:
```bash
npm run db:seed
```

---

## ⚠️ Safe Product Retirement & Deletion

### The Foreign Key Restriction
When a customer places an order, the system locks the product's record to that order in the database for invoicing history. 
* **If you attempt to delete a product that has been ordered by a customer, the operation will fail with a foreign key constraint error.** This is a safety feature that prevents destroying customer purchase history.

### How to Safely Retire or Discontinue a Product

1. **Set Stock to `0` (Recommended)**:
   - Edit the product in the Command Center or JSON file and set its **Stock** value to `0`.
   - The shopping catalog will automatically display a high-contrast **"Sold Out"** overlay.
   - The product page will disable the "Add to Vault" button, protecting your database integrity while preserving transaction histories.
   
2. **Remove tags (Optional)**:
   - Clear the product's tag (set it to `None`) so that it no longer appears in premium lists like "Trending" or "Latest".

3. **Database Archiving**:
   - If you must completely hide a product from search and catalogs while keeping orders intact, we recommend adding an `archived` Boolean column in the schema or filtering out `stock: 0` products from the shop view.
