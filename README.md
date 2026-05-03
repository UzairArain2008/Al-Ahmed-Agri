# 🌾 Al Ahmed Rice Agro Exports — Website

A full-featured business showcase website with Node.js/Express backend and hidden admin panel.

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Start the Server

```bash
npm start
```

### 3. Open in Browser

```
http://localhost:3000
```

---

## 🔐 Admin Panel Access

The admin panel is hidden from the public. To access it:

**URL:** `http://localhost:3000/agri-admin-panel`

**Default Login:**

- Username: `admin`
- Password: `AlAhmed@2024`

> ⚠️ Change these credentials after first login by editing `data/config.json`

---

## 📁 Project Structure

```
al-ahmed-agri/
├── server.js              ← Main server file
├── package.json
├── data/
│   ├── products.json      ← Products database (auto-created)
│   ├── gallery.json       ← Gallery database (auto-created)
│   ├── inquiries.json     ← Contact form submissions
│   └── config.json        ← Admin credentials & settings
├── views/
│   ├── partials/
│   │   ├── header.ejs
│   │   └── footer.ejs
│   ├── admin/
│   │   ├── login.ejs
│   │   └── dashboard.ejs
│   ├── home.ejs
│   ├── about.ejs
│   ├── products.ejs
│   ├── gallery.ejs
│   ├── brands-careers.ejs
│   └── 404.ejs
└── public/
    ├── css/style.css
    ├── js/main.js
    └── images/
        ├── products/      ← Uploaded product images go here
        └── gallery/       ← Uploaded gallery images go here
```

---

## 🛠 Admin Panel Features

1. **Products Management**
   - Add products with image upload, name, category, description, specs, badge
   - Toggle products as "Featured" (shown on homepage)
   - Delete products

2. **Gallery Management**
   - Upload facility/infrastructure photos
   - Add title, caption, category
   - Delete images

3. **Inquiries**
   - View all contact form submissions
   - Mark as read/unread
   - See customer details and messages

---

## 🌐 Deployment (Recommended: Railway, Render, or VPS)

1. Push to GitHub
2. Connect to Railway/Render
3. Set environment variables if needed
4. The `data/` folder will persist on VPS (use a volume on Railway/Render)

> **Important:** For cloud deployment, use a persistent volume for the `data/` and `public/images/` folders so uploads and data are not lost on redeploy.

---

## ✏️ Customization

- **Admin URL slug:** Edit `adminUrlSlug` in `data/config.json`
- **Admin password:** Edit `adminPasswordHash` (generate with bcrypt)
- **Contact details:** Edit footer in `views/partials/footer.ejs`
- **Colors/fonts:** Edit `public/css/style.css` CSS variables at the top

---

## 📦 Dependencies

- `express` — Web server
- `ejs` — Templating engine
- `express-session` — Admin session management
- `multer` — File/image uploads
- `bcryptjs` — Password hashing
- `body-parser` — Request parsing
