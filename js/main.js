// Global map config:
// - dummyOnly: true  => semua map pakai dummy (hemat API)
// - dummyOnly: false => aktifkan kembali tile/API peta online (OSM/Nominatim/OSRM)
window.ECO_HUB_MAP_CONFIG = {
  dummyOnly: false,
};

window.EcoHubMapFallback = {
  bounds: {
    minLat: -11.2,
    maxLat: 6.8,
    minLng: 94.5,
    maxLng: 141.5,
  },
  eventToLatLng(container, event) {
    const rect = container.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, event.clientX - rect.left));
    const y = Math.max(0, Math.min(rect.height, event.clientY - rect.top));
    const lng =
      this.bounds.minLng +
      (x / Math.max(1, rect.width)) * (this.bounds.maxLng - this.bounds.minLng);
    const lat =
      this.bounds.maxLat -
      (y / Math.max(1, rect.height)) * (this.bounds.maxLat - this.bounds.minLat);
    return { lat, lng };
  },
  latLngToPercent(point) {
    const left =
      ((point.lng - this.bounds.minLng) /
        (this.bounds.maxLng - this.bounds.minLng)) *
      100;
    const top =
      ((this.bounds.maxLat - point.lat) /
        (this.bounds.maxLat - this.bounds.minLat)) *
      100;
    return { left, top };
  },
};

document.addEventListener("DOMContentLoaded", () => {
  // Cleanup sisa data gamifikasi dari versi lama.
  try {
    localStorage.removeItem("Eco Hub_gamification");
  } catch (error) {
    console.warn("Gagal membersihkan data gamifikasi lama:", error);
  }

  if (location.protocol === "http:" || location.protocol === "https:") {
    const hasManifest = document.querySelector('link[rel="manifest"]');
    if (!hasManifest) {
      const manifestLink = document.createElement("link");
      manifestLink.rel = "manifest";
      manifestLink.href = "manifest.json";
      document.head.appendChild(manifestLink);
    }
  }

  // Mobile Menu
  const hamburger = document.querySelector(".hamburger");
  const mobileMenu = document.querySelector(".mobile-menu");
  const overlay = document.querySelector(".mobile-menu-overlay");

  if (hamburger) {
    hamburger.addEventListener("click", toggleMenu);
    overlay.addEventListener("click", toggleMenu);
  }

  function toggleMenu() {
    mobileMenu.classList.toggle("active");
    overlay.classList.toggle("active");
    hamburger.classList.toggle("active");
  }

  // Close mobile menu on link click (UX Fix)
  const mobileLinks = document.querySelectorAll(
    ".mobile-nav-link, .mobile-menu .btn",
  );
  mobileLinks.forEach((link) => {
    link.addEventListener("click", () => {
      if (mobileMenu.classList.contains("active")) {
        toggleMenu();
      }
    });
  });

  // Navbar Scroll Effect
  const navbar = document.querySelector(".navbar");
  window.addEventListener("scroll", () => {
    if (window.scrollY > 60) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
  });

  // Scroll to Top
  const scrollTopBtn = document.createElement("button");
  scrollTopBtn.className = "scroll-top";
  scrollTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
  document.body.appendChild(scrollTopBtn);
  window.addEventListener("scroll", () => {
    if (window.scrollY > 400) {
      scrollTopBtn.classList.add("visible");
    } else {
      scrollTopBtn.classList.remove("visible");
    }
  });

  scrollTopBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  // Intersection Observer for Animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");

        // Handle stat counters if present
        if (entry.target.classList.contains("count-up")) {
          animateValue(entry.target);
          observer.unobserve(entry.target); // Only animate once
        }
      }
    });
  }, observerOptions);

  document
    .querySelectorAll(".fade-up, .count-up")
    .forEach((el) => observer.observe(el));

  // Active Link Handling
  const currentPath = window.location.pathname.split("/").pop() || "index.html";
  const navLinks = document.querySelectorAll(".nav-link, .mobile-nav-link");

  navLinks.forEach((link) => {
    const href = link.getAttribute("href");
    if (href === currentPath) {
      link.classList.add("active");
    }
  });
  initQuickStartCta();
});

function initQuickStartCta() {
  const ctaTriggers = document.querySelectorAll(
    'a.btn.btn-primary.hide-mobile[href="index.html#mobility-sim"], .mobile-menu a.btn.btn-primary.btn-full[href="index.html#mobility-sim"]',
  );
  if (!ctaTriggers.length) return;

  const overlay = document.createElement("div");
  overlay.className = "quick-start-overlay";
  overlay.innerHTML = `
    <div class="quick-start-sheet" role="dialog" aria-modal="true" aria-label="Mulai Sekarang">
      <h3>Pilih Aksi</h3>
      <p>Mulai dari langkah yang paling kamu butuhkan sekarang.</p>
      <div class="quick-start-actions">
        <a class="btn btn-primary" href="index.html#mobility-sim">Mulai Hitung Karbon</a>
        <a class="btn btn-outline" href="kegiatan.html#create-form-card">Buat Kegiatan</a>
      </div>
      <button type="button" class="quick-start-close" aria-label="Tutup">Tutup</button>
    </div>
  `;
  document.body.appendChild(overlay);

  const closeBtn = overlay.querySelector(".quick-start-close");
  const actionLinks = overlay.querySelectorAll("a");

  function openQuickStart() {
    overlay.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function closeQuickStart() {
    overlay.classList.remove("active");
    document.body.style.overflow = "";
  }

  ctaTriggers.forEach((trigger) => {
    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      openQuickStart();
    });
  });

  closeBtn?.addEventListener("click", closeQuickStart);
  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) closeQuickStart();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && overlay.classList.contains("active")) {
      closeQuickStart();
    }
  });
  actionLinks.forEach((link) => {
    link.addEventListener("click", () => {
      closeQuickStart();
    });
  });
}

function animateValue(obj) {
  const target = parseInt(obj.getAttribute("data-target"));
  const duration = 2000;
  const stepTime = Math.abs(Math.floor(duration / target));

  let current = 0;
  const timer = setInterval(() => {
    current += Math.ceil(target / 100);
    if (current >= target) {
      current = target;
      clearInterval(timer);
    }
    obj.innerText =
      current.toLocaleString("id-ID") + (obj.getAttribute("data-suffix") || "");
  }, 20);
}


