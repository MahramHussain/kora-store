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

---

## 📧 Custom Email Routing & Reply Alias Configuration

You can configure a fully masked support email flow where emails sent to **`support@korastore.ae`** forward directly to **`korastore.ae@gmail.com`**, and when you reply from Gmail, it goes out as **`support@korastore.ae`** without revealing your personal email address.

---

### Step 1: Set up Incoming Forwarding (via Cloudflare)
Cloudflare provides a free, secure email routing service:
1. Log in to your **Cloudflare Dashboard** and select the `korastore.ae` domain.
2. Navigate to **Email** ➔ **Email Routing** on the sidebar.
3. Click **Destination addresses** ➔ **Add destination address** and enter `korastore.ae@gmail.com`.
4. Cloudflare will send a verification link to your Gmail. Open it and click verify.
5. In Cloudflare, go to **Routing rules** ➔ **Create rule**.
   - **Custom address**: `support@korastore.ae`
   - **Action**: Forward to
   - **Destination**: Select `korastore.ae@gmail.com`
6. Click Save. Cloudflare will prompt you to automatically configure the correct MX/TXT records on your DNS. Click **Add records automatically**.
*Result: Any incoming mail to support@korastore.ae will land in your Gmail inbox.*

---

### Step 2: Set up SMTP Reply Alias (via Gmail & Resend)
Since you already have a verified domain and API key in **Resend**, you can utilize Resend's secure SMTP relay inside your Gmail client so that your personal address remains completely masked:

1. Open your **Gmail** account (`korastore.ae@gmail.com`).
2. Click the **Gear icon (Settings)** in the top right ➔ click **See all settings**.
3. Go to the **Accounts and Import** tab.
4. Locate the **Send mail as:** section and click **Add another email address**.
5. In the pop-up window:
   - **Name**: "KoraStore Support"
   - **Email Address**: `support@korastore.ae`
   - Check **Treat as an alias** and click **Next Step**.
6. Enter the **Resend SMTP credentials**:
   - **SMTP Server**: `smtp.resend.com`
   - **Port**: `587` (TLS)
   - **Username**: `resend`
   - **Password**: `re_GwVdskrA_MaTtbwbjsDyEmC8FTuNhYjQB` *(Your Resend API Key)*
7. Choose **Secured connection using TLS** and click **Add Account**.
8. Gmail will send a verification code to `support@korastore.ae` to prove ownership. Since you set up Cloudflare Email Routing in Step 1, this verification code will be forwarded to your Gmail inbox within seconds.
9. Copy-paste the verification code into the prompt to activate the alias.

---

### Step 3: Default Sending Preferences
In the same **Accounts and Import** tab under "Send mail as":
* Under **"When replying to a message:"**, select **"Reply from the same address the message was sent to"**.
* This ensures that whenever you click reply to any email sent to `support@korastore.ae`, Gmail automatically selects your support email as the sender, sending it securely via Resend and masking `korastore.ae@gmail.com`.
