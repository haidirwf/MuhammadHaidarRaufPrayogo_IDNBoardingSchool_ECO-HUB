document.addEventListener("DOMContentLoaded", () => {
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
  scrollTopBtn.innerHTML = '<i data-lucide="arrow-up"></i>';
  document.body.appendChild(scrollTopBtn);

  // Re-run icons for dynamically added element
  if (window.lucide) {
    lucide.createIcons();
  }

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
});

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
