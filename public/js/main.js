/* ═══════════════════════════════════════════════════════════
   AL-AHMED AGRI — main.js
═══════════════════════════════════════════════════════════ */

// ── NAVBAR ────────────────────────────────────────────────────
const navbar = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');

if (navbar) {
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 40);
    });
}

if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('open');
        const open = navLinks.classList.contains('open');
        hamburger.querySelectorAll('span').forEach((s, i) => {
            s.style.transform = open
                ? i === 0 ? 'rotate(45deg) translate(5px,5px)'
                    : i === 1 ? 'opacity: 0'
                        : 'rotate(-45deg) translate(5px,-5px)'
                : '';
            s.style.opacity = (open && i === 1) ? '0' : '';
        });
    });

    // Close menu on link click
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => navLinks.classList.remove('open'));
    });
}

// ── SCROLL REVEAL ─────────────────────────────────────────────
function initReveal() {
    const elements = document.querySelectorAll(
        '.product-card, .feature-card, .why-card, .gal-item, .masonry-item, ' +
        '.brand-card, .career-card, .culture-item, .value-item, .cap-item, ' +
        '.pfc-img-col, .pfc-body, .about-gal-item, .cd-item'
    );

    elements.forEach(el => el.classList.add('reveal'));

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, i) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, i * 60);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    elements.forEach(el => observer.observe(el));
}

// ── CONTACT FORM ──────────────────────────────────────────────
function initContactForm() {
    const form = document.getElementById('contactForm');
    const submitBtn = document.getElementById('submitBtn');
    const formMsg = document.getElementById('formMsg');

    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>Sending...</span>';

        const data = Object.fromEntries(new FormData(form).entries());

        try {
            const res = await fetch('/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const json = await res.json();

            formMsg.style.display = 'block';
            formMsg.className = 'form-message ' + (json.success ? 'success' : 'error');
            formMsg.textContent = json.success
                ? '✓ ' + json.message
                : '✗ ' + (json.error || 'Something went wrong. Please try again.');

            if (json.success) {
                form.reset();
                setTimeout(() => { formMsg.style.display = 'none'; }, 6000);
            }
        } catch (err) {
            formMsg.style.display = 'block';
            formMsg.className = 'form-message error';
            formMsg.textContent = '✗ Network error. Please try again.';
        }

        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>Send Inquiry</span><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>';
    });
}

// ── SMOOTH SCROLL FOR ANCHOR LINKS ────────────────────────────
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
            const target = document.querySelector(link.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}

// ── INIT ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    initReveal();
    initContactForm();
    initSmoothScroll();
});