const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 3000;

// ── Data paths ──────────────────────────────────────────────────────────────
const DATA_DIR = path.join(__dirname, 'data');
const PROD_FILE = path.join(DATA_DIR, 'products.json');
const GAL_FILE = path.join(DATA_DIR, 'gallery.json');
const INQ_FILE = path.join(DATA_DIR, 'inquiries.json');
const CONF_FILE = path.join(DATA_DIR, 'config.json');

// Ensure data dir and files exist
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

function initFile(filePath, defaultData) {
    let needsInit = false;
    if (!fs.existsSync(filePath)) {
        needsInit = true;
    } else {
        try {
            const data = fs.readFileSync(filePath, 'utf-8');
            if (!data.trim()) needsInit = true;
            else JSON.parse(data); // Will throw if invalid
        } catch (e) {
            needsInit = true; // Corrupt or empty file
        }
    }
    if (needsInit) {
        fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
    }
}

// Default data
const defaultProducts = [
    {
        id: 1, name: "Super Kernel Basmati Rice", category: "basmati",
        description: "The finest long-grain aromatic basmati rice, aged to perfection. Known for its exceptional fragrance, fluffy texture, and distinct elongation upon cooking. Ideal for biryanis, pulao, and pilaf dishes.",
        specs: ["Grain Length: 7.2mm+", "Moisture: ≤12.5%", "Broken: ≤1%", "Purity: 99%+"],
        badge: "Premium", image: "/images/products/basmati-super.jpg", featured: true
    },
    {
        id: 2, name: "1121 Basmati Rice (Raw)", category: "basmati",
        description: "World-famous 1121 variety with extraordinary grain length. This extra-long grain rice is a market leader, prized for its aroma and extreme elongation. Available in raw and sella forms.",
        specs: ["Grain Length: 8.3mm+", "Moisture: ≤12%", "Broken: ≤0.5%", "Variety: 1121"],
        badge: "Export Quality", image: "/images/products/basmati-1121.jpg", featured: true
    },
    {
        id: 3, name: "PK-386 Basmati Rice", category: "basmati",
        description: "Traditional Pakistani basmati variety with excellent cooking quality. Delivers authentic aroma and taste cherished across South Asia and the Middle East. Perfect for everyday use and special occasions.",
        specs: ["Grain Length: 6.8mm+", "Moisture: ≤13%", "Broken: ≤2%", "Origin: Punjab, Pakistan"],
        badge: "Traditional", image: "/images/products/basmati-pk386.jpg", featured: false
    },
    {
        id: 4, name: "IRRI-6 Non-Basmati Rice", category: "non-basmati",
        description: "High-yielding medium-grain IRRI-6 variety. A versatile and economical choice for bulk buyers, food industries, and international markets. Consistent quality with reliable supply throughout the year.",
        specs: ["Grain Length: 5.5mm", "Moisture: ≤14%", "Broken: ≤5%", "Variety: IRRI-6"],
        badge: "High Yield", image: "/images/products/nonbasmati-irri6.jpg", featured: true
    },
    {
        id: 5, name: "IRRI-9 Non-Basmati Rice", category: "non-basmati",
        description: "Medium-grain IRRI-9 variety known for its bright white appearance and soft texture after cooking. Widely used in restaurants, catering services, and household consumption across Asia and Africa.",
        specs: ["Grain Length: 5.8mm", "Moisture: ≤14%", "Broken: ≤3%", "Color: Bright White"],
        badge: "Popular", image: "/images/products/nonbasmati-irri9.jpg", featured: false
    },
    {
        id: 6, name: "Broken Rice (D-Grade)", category: "non-basmati",
        description: "Economical broken rice suitable for rice flour production, animal feed, brewing industries, and budget-conscious markets. Available in 25%, 50%, and 100% broken grades. Consistent supply guaranteed.",
        specs: ["Broken: 25-100%", "Moisture: ≤14%", "Usage: Industry/Feed", "Packing: Flexible"],
        badge: "Economical", image: "/images/products/broken-rice.jpg", featured: false
    }
];

const defaultGallery = [
    { id: 1, title: "Rice Processing Plant", caption: "State-of-the-art milling facility", category: "facility", image: "/images/gallery/plant.jpg" },
    { id: 2, title: "Quality Testing Lab", caption: "ISO-standard quality control laboratory", category: "facility", image: "/images/gallery/lab.jpg" },
    { id: 3, title: "Storage Silos", caption: "Climate-controlled storage for 50,000 MT", category: "storage", image: "/images/gallery/silos.jpg" },
    { id: 4, title: "Paddy Fields", caption: "Contracted farming across Punjab & Sindh", category: "farming", image: "/images/gallery/fields.jpg" },
    { id: 5, title: "Packaging Unit", caption: "Automated packaging lines — 5 MT/hour", category: "facility", image: "/images/gallery/packaging.jpg" },
    { id: 6, title: "Export Shipment", caption: "Ready for international dispatch", category: "logistics", image: "/images/gallery/export.jpg" }
];

const defaultConfig = {
    adminUsername: "admin",
    adminPasswordHash: bcrypt.hashSync("AlAhmed@2024", 10),
    adminUrlSlug: "agri-admin-panel",
    siteEmail: "info@alahmedagri.com",
    sitePhone: "+92-300-0000000",
    siteAddress: "Rice Market, Sukkur, Sindh, Pakistan"
};

initFile(PROD_FILE, defaultProducts);
initFile(GAL_FILE, defaultGallery);
initFile(INQ_FILE, []);
initFile(CONF_FILE, defaultConfig);

// ── Helpers ──────────────────────────────────────────────────────────────────
const readJSON = (f) => JSON.parse(fs.readFileSync(f, 'utf-8'));
const writeJSON = (f, d) => fs.writeFileSync(f, JSON.stringify(d, null, 2));

// ── Upload config ─────────────────────────────────────────────────────────────
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const type = req.body.uploadType || 'products';
        const dir = path.join(__dirname, 'public', 'images', type);
        fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// ── Middleware ────────────────────────────────────────────────────────────────
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
    secret: 'alahmed-agri-secret-2024',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 2 * 60 * 60 * 1000 } // 2 hours
}));

// Auth middleware for admin
function requireAdmin(req, res, next) {
    if (req.session && req.session.isAdmin) return next();
    const conf = readJSON(CONF_FILE);
    res.redirect(`/${conf.adminUrlSlug}`);
}

// ── PUBLIC ROUTES ─────────────────────────────────────────────────────────────

app.get('/', (req, res) => {
    const products = readJSON(PROD_FILE).filter(p => p.featured).slice(0, 3);
    const gallery = readJSON(GAL_FILE).slice(0, 3);
    res.render('home', { products, gallery, page: 'home' });
});

app.get('/about', (req, res) => {
    const gallery = readJSON(GAL_FILE).slice(0, 4);
    res.render('about', { gallery, page: 'about' });
});

app.get('/products', (req, res) => {
    const products = readJSON(PROD_FILE);
    const cat = req.query.cat || 'all';
    const filtered = cat === 'all' ? products : products.filter(p => p.category === cat);
    res.render('products', { products: filtered, activeCategory: cat, page: 'products' });
});

app.get('/gallery', (req, res) => {
    const gallery = readJSON(GAL_FILE);
    res.render('gallery', { gallery, page: 'gallery' });
});

app.get('/brands-careers', (req, res) => {
    res.render('brands-careers', { page: 'brands-careers' });
});

// Contact form submission
app.post('/contact', (req, res) => {
    const { name, email, phone, subject, message } = req.body;
    if (!name || !email || !message) {
        return res.json({ success: false, error: 'Please fill all required fields.' });
    }
    const inquiries = readJSON(INQ_FILE);
    inquiries.unshift({
        id: Date.now(),
        name, email, phone: phone || '', subject: subject || 'General Inquiry', message,
        date: new Date().toISOString(),
        read: false
    });
    writeJSON(INQ_FILE, inquiries);
    res.json({ success: true, message: 'Your inquiry has been sent! We will contact you within 24 hours.' });
});

// ── ADMIN ROUTES ──────────────────────────────────────────────────────────────

// Dynamic admin URL from config
app.get('/:slug', (req, res, next) => {
    const conf = readJSON(CONF_FILE);
    if (req.params.slug !== conf.adminUrlSlug) return next();
    res.render('admin/login', { error: null, slug: conf.adminUrlSlug });
});

app.post('/:slug/login', (req, res, next) => {
    const conf = readJSON(CONF_FILE);
    if (req.params.slug !== conf.adminUrlSlug) return next();
    const { username, password } = req.body;
    if (username === conf.adminUsername && bcrypt.compareSync(password, conf.adminPasswordHash)) {
        req.session.isAdmin = true;
        return res.redirect(`/${conf.adminUrlSlug}/dashboard`);
    }
    res.render('admin/login', { error: 'Invalid credentials.', slug: conf.adminUrlSlug });
});

app.get('/:slug/dashboard', (req, res, next) => {
    const conf = readJSON(CONF_FILE);
    if (req.params.slug !== conf.adminUrlSlug) return next();
    if (!req.session.isAdmin) return res.redirect(`/${conf.adminUrlSlug}`);
    const products = readJSON(PROD_FILE);
    const gallery = readJSON(GAL_FILE);
    const inquiries = readJSON(INQ_FILE);
    res.render('admin/dashboard', { products, gallery, inquiries, conf, slug: conf.adminUrlSlug, page: 'dashboard' });
});

// Admin: Add Product
app.post('/:slug/products/add', requireAdmin, upload.single('image'), (req, res) => {
    const conf = readJSON(CONF_FILE);
    const products = readJSON(PROD_FILE);
    const { name, category, description, badge, featured, spec1, spec2, spec3, spec4 } = req.body;
    const specs = [spec1, spec2, spec3, spec4].filter(Boolean);
    const imgPath = req.file ? `/images/products/${req.file.filename}` : '/images/products/default.jpg';
    products.push({
        id: Date.now(), name, category, description, specs, badge: badge || '',
        image: imgPath, featured: featured === 'on'
    });
    writeJSON(PROD_FILE, products);
    res.redirect(`/${conf.adminUrlSlug}/dashboard#products`);
});

// Admin: Delete Product
app.post('/:slug/products/delete/:id', requireAdmin, (req, res) => {
    const conf = readJSON(CONF_FILE);
    let products = readJSON(PROD_FILE);
    products = products.filter(p => String(p.id) !== String(req.params.id));
    writeJSON(PROD_FILE, products);
    res.redirect(`/${conf.adminUrlSlug}/dashboard#products`);
});

// Admin: Toggle Featured
app.post('/:slug/products/toggle-featured/:id', requireAdmin, (req, res) => {
    const conf = readJSON(CONF_FILE);
    const products = readJSON(PROD_FILE);
    const prod = products.find(p => String(p.id) === String(req.params.id));
    if (prod) prod.featured = !prod.featured;
    writeJSON(PROD_FILE, products);
    res.redirect(`/${conf.adminUrlSlug}/dashboard#products`);
});

// Admin: Add Gallery Image
app.post('/:slug/gallery/add', requireAdmin, upload.single('image'), (req, res) => {
    const conf = readJSON(CONF_FILE);
    const gallery = readJSON(GAL_FILE);
    const { title, caption, category } = req.body;
    const imgPath = req.file ? `/images/gallery/${req.file.filename}` : '/images/gallery/default.jpg';
    gallery.push({ id: Date.now(), title, caption, category, image: imgPath });
    writeJSON(GAL_FILE, gallery);
    res.redirect(`/${conf.adminUrlSlug}/dashboard#gallery`);
});

// Admin: Delete Gallery Image
app.post('/:slug/gallery/delete/:id', requireAdmin, (req, res) => {
    const conf = readJSON(CONF_FILE);
    let gallery = readJSON(GAL_FILE);
    gallery = gallery.filter(g => String(g.id) !== String(req.params.id));
    writeJSON(GAL_FILE, gallery);
    res.redirect(`/${conf.adminUrlSlug}/dashboard#gallery`);
});

// Admin: Mark inquiry as read
app.post('/:slug/inquiries/read/:id', requireAdmin, (req, res) => {
    const conf = readJSON(CONF_FILE);
    const inquiries = readJSON(INQ_FILE);
    const inq = inquiries.find(i => String(i.id) === String(req.params.id));
    if (inq) inq.read = true;
    writeJSON(INQ_FILE, inquiries);
    res.redirect(`/${conf.adminUrlSlug}/dashboard#inquiries`);
});

// Admin: Logout
app.get('/:slug/logout', (req, res) => {
    const conf = readJSON(CONF_FILE);
    req.session.destroy();
    res.redirect(`/${conf.adminUrlSlug}`);
});

// 404
app.use((req, res) => {
    res.status(404).render('404', { page: '404' });
});

app.listen(PORT, () => {
    const conf = readJSON(CONF_FILE);
    console.log(`\n🌾 Al-Ahmed Agri running on http://localhost:${PORT}`);
    console.log(`🔐 Admin panel: http://localhost:${PORT}/${conf.adminUrlSlug}`);
    console.log(`   Username: admin | Password: AlAhmed@2024\n`);
});