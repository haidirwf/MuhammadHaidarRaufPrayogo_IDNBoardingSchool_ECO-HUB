document.addEventListener("DOMContentLoaded", () => {
  // --- Data Management ---
  const DUMMY_MAP_MODE = window.ECO_HUB_MAP_CONFIG?.dummyOnly ?? true;
  const INDONESIA_BOUNDS = [
    [-11.2, 94.5],
    [6.8, 141.5],
  ];
  const STORAGE_KEY = "Eco Hub_reports";
  const ALLOWED_STATUS_CLASS = new Set([
    "status-diterima",
    "status-proses",
    "status-selesai",
  ]);

  // 1. Improved Dummy Data
  const seedReports = [
    {
      ref: "ECO-2026-1001",
      type: "Tumpukan Sampah Liar",
      location: "Pinggir Kali Bekasi, Bekasi Utara",
      desc: "Tumpukan sampah plastik dan limbah rumah tangga yang menumpuk di pinggir kali, menimbulkan bau menyengat.",
      time: "2 jam lalu",
      status: "Dalam Proses",
      statusClass: "status-proses",
      date: "2026-02-18",
    },
    {
      ref: "ECO-2026-1002",
      type: "Pencemaran Sungai",
      location: "Jalan Riau, Bandung Wetan",
      desc: "Air sungai berubah warna menjadi hitam pekat dan berbusa, diduga akibat limbah tekstil.",
      time: "5 jam lalu",
      status: "Diterima",
      statusClass: "status-diterima",
      date: "2026-02-18",
    },
    {
      ref: "ECO-2026-1003",
      type: "Polusi Udara (Pembakaran)",
      location: "Pamulang, Tangerang Selatan",
      desc: "Pembakaran sampah kabel ilegal yang menghasilkan asap hitam tebal setiap sore hari.",
      time: "1 hari lalu",
      status: "Selesai",
      statusClass: "status-selesai",
      date: "2026-02-17",
    },
  ];

  function getReports() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seedReports));
      return seedReports;
    }
    try {
      return JSON.parse(stored);
    } catch (error) {
      console.warn("Invalid report storage. Reset to seed data.", error);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seedReports));
      return seedReports;
    }
  }

  function addReport(report) {
    const reports = getReports();
    reports.unshift(report); // Add to top
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
    renderFeed();
  }

  // --- Feed Logic & Modal ---
  const feedList = document.getElementById("feed-list");

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function normalizeStatusClass(status, statusClass) {
    if (ALLOWED_STATUS_CLASS.has(statusClass)) return statusClass;
    if (status === "Selesai") return "status-selesai";
    if (status === "Dalam Proses") return "status-proses";
    return "status-diterima";
  }

  // Modal Elements
  const modal = document.getElementById("report-modal");
  window.closeModal = () => {
    if (modal) modal.classList.remove("open");
  };

  // Close on overlay click
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });
  }

  // Function to open detail
  window.showReportDetail = (ref) => {
    const reports = getReports();
    const rep = reports.find((r) => r.ref === ref);
    if (!rep || !modal) return;

    // Populate Modal
    document.getElementById("modal-type").innerText = rep.type;
    document.getElementById("modal-ref").innerText = rep.ref;
    document.getElementById("modal-date").innerText = rep.date || rep.time;
    document.getElementById("modal-loc").innerText = rep.location;
    document.getElementById("modal-desc").innerText =
      rep.desc || "Tidak ada deskripsi detail.";

    const pill = document.getElementById("modal-status-pill");
    pill.innerText = rep.status;
    pill.className = `status-pill ${normalizeStatusClass(rep.status, rep.statusClass)}`;

    // Open
    modal.classList.add("open");
  };

  function renderFeed() {
    if (!feedList) return;
    const reports = getReports();
    const recent = reports.slice(0, 5); // display top 5

    feedList.innerHTML = recent
      .map((rep) => {
        const safeRef = encodeURIComponent(String(rep.ref || ""));
        const safeType = escapeHtml(rep.type || "Jenis tidak diketahui");
        const safeTime = escapeHtml(rep.time || "Baru saja");
        const safeLocation = escapeHtml(
          String(rep.location || "Lokasi tidak diketahui")
            .split(",")[0]
            .trim(),
        );
        const safeStatus = escapeHtml(rep.status || "Diterima");
        const safeStatusClass = normalizeStatusClass(rep.status, rep.statusClass);

        return `
          <div class="feed-card ${safeStatusClass} fade-up"
               style="cursor: pointer;"
               data-report-ref="${safeRef}">
              <div class="feed-header">
                  <span class="feed-type">${safeType}</span>
                  <span class="feed-time">${safeTime}</span>
              </div>
              <div class="feed-loc">
                  <i data-lucide="map-pin" size="14"></i> ${safeLocation}...
              </div>
              <div class="feed-status">
                  <span class="status-pill">${safeStatus}</span>
              </div>
          </div>
        `;
      })
      .join("");

    if (window.lucide) lucide.createIcons();

    const cards = feedList.querySelectorAll("[data-report-ref]");
    cards.forEach((card) => {
      card.addEventListener("click", () => {
        const ref = decodeURIComponent(card.getAttribute("data-report-ref") || "");
        if (ref) showReportDetail(ref);
      });
    });

    // Trigger animations
    setTimeout(() => {
      const animatedCards = feedList.querySelectorAll(".feed-card");
      animatedCards.forEach((card, index) => {
        setTimeout(() => {
          card.classList.add("visible");
        }, index * 100);
      });
    }, 50);
  }

  function getStatusClass(status) {
    if (status === "Selesai") return "status-selesai";
    if (status === "Dalam Proses") return "status-proses";
    return "status-diterima";
  }

  renderFeed(); // Init

  // --- Check Status Logic ---
  const checkBtn = document.getElementById("check-status-btn");
  const checkInput = document.getElementById("check-ref-input");
  const checkResult = document.getElementById("check-result");

  if (checkBtn && checkInput && checkResult) {
    checkBtn.addEventListener("click", () => {
      const query = checkInput.value.trim().toUpperCase();
      if (!query) return;

      // UX loading feedback
      const originalText = checkBtn.innerText;
      checkBtn.innerHTML =
        '<i class="spinner" style="display:inline-block;width:16px;height:16px;border:2px solid currentColor;border-right-color:transparent;border-radius:50%;animation:spin 1s linear infinite;margin-right:8px;"></i> Mencari...';
      checkBtn.disabled = true;
      checkResult.classList.add("hidden");

      setTimeout(() => {
        checkResult.classList.remove("hidden");
        const reports = getReports();
        const found = reports.find((r) => r.ref === query);

        // Same UI Style logic as requested
        if (found) {
          const safeType = escapeHtml(found.type || "Jenis tidak diketahui");
          const safeLocation = escapeHtml(found.location || "Lokasi tidak diketahui");
          const safeStatus = escapeHtml(found.status || "Diterima");
          const safeStatusClass = normalizeStatusClass(found.status, found.statusClass);
          checkResult.innerHTML = `
                      <div class="result-found-card">
                          <div class="result-icon-box success">
                              <i data-lucide="check-circle" class="icon-success"></i>
                          </div>
                          <div class="result-content">
                              <h4>Laporan Ditemukan</h4>
                              <div class="result-detail-item"><strong>Jenis:</strong> ${safeType}</div>
                              <div class="result-detail-item"><strong>Lokasi:</strong> ${safeLocation}</div>
                              <span class="status-badge ${safeStatusClass}">${safeStatus}</span>
                          </div>
                      </div>
                  `;
          checkResult.className = "check-result-container fade-up visible";
        } else {
          const safeQuery = escapeHtml(query);
          checkResult.innerHTML = `
                      <div class="result-not-found-card">
                          <div class="result-icon-box error">
                              <i data-lucide="alert-circle" class="icon-error"></i>
                          </div>
                          <div class="result-content">
                              <h4>Tidak Ditemukan</h4>
                              <p>Nomor referensi <strong>${safeQuery}</strong> tidak terdaftar dlm sistem kami.</p>
                          </div>
                      </div>
                  `;
          checkResult.className = "check-result-container fade-up visible";
        }

        checkBtn.innerHTML = originalText;
        checkBtn.disabled = false;
        if (window.lucide) lucide.createIcons();
      }, 600);
    });
  }

  // --- Form Submit Animation Fix ---
  const form = document.getElementById("lapor-form");
  const submitBtn = document.querySelector(".submit-btn");
  const submitBtnText = submitBtn?.querySelector(".btn-text");
  const submitSpinner = submitBtn?.querySelector(".spinner");
  const successState = document.getElementById("success-state");

  // Char count
  const desc = document.getElementById("deskripsi");
  if (desc) {
    desc.addEventListener(
      "input",
      (e) =>
        (document.getElementById("char-val").innerText = e.target.value.length),
    );
  }

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const severity = document.querySelector('input[name="severity"]:checked');
      if (!severity) {
        alert("Mohon pilih tingkat keparahan.");
        return;
      }

      // 2. Fix Animation: Use Class Toggling
      submitBtn.classList.add("loading");
      submitBtn.disabled = true;
      submitBtnText?.classList.add("hidden");
      submitSpinner?.classList.remove("hidden");

      setTimeout(() => {
        const nama = document.getElementById("nama").value;
        const jenis = document.getElementById("jenis").value;
        const lokasiInput = document.getElementById("lokasi");
        const lokasi = lokasiInput.value;
        const lat = lokasiInput.dataset.lat || null;
        const lng = lokasiInput.dataset.lng || null;

        const deskripsi = document.getElementById("deskripsi").value;
        const ref = "ECO-2026-" + Math.floor(1000 + Math.random() * 9000);

        const newReport = {
          ref: ref,
          type: jenis,
          location: lokasi,
          lat: lat ? parseFloat(lat) : null,
          lng: lng ? parseFloat(lng) : null,
          desc: deskripsi,
          time: "Baru saja",
          status: "Diterima",
          statusClass: "status-diterima",
          date: new Date().toLocaleDateString("id-ID"),
        };

        addReport(newReport);

        document.getElementById("ref-num").innerText = ref;
        document.getElementById("success-name").innerText = nama;

        form.classList.add("hidden");
        successState.classList.remove("hidden");
        if (window.lucide) lucide.createIcons();

        document
          .getElementById("report-form-card")
          .scrollIntoView({ behavior: "smooth", block: "start" });

        // Gamification Hook
        if (window.addEcoPoints) {
          window.addEcoPoints(50, "Melaporkan Isu Lingkungan");
        }

        // Reset
        form.reset();
        submitBtn.classList.remove("loading");
        submitBtn.disabled = false;
        submitBtnText?.classList.remove("hidden");
        submitSpinner?.classList.add("hidden");
      }, 1500);
    });
  }

  // File Preview
  const fInput = document.getElementById("file-upload");
  if (fInput) {
    fInput.addEventListener("change", (e) => {
      if (e.target.files.length) {
        document.getElementById("file-preview").classList.remove("hidden");
        document.getElementById("filename").innerText = e.target.files[0].name;
      }
    });
  }

  // --- Picker Map Logic ---
  const pickerMapDiv = document.getElementById("picker-map");
  if (pickerMapDiv && window.L) {
    const locInput = document.getElementById("lokasi");
    const gpsBtn = document.getElementById("btn-get-location");
    const locationLoading = document.getElementById("location-loading");
    const LAST_GPS_KEY = "Eco Hub_lastKnownLocation";

    function paintDummyMapBase(map) {
      if (!map) return;
      const islands = [
        [
          [5.4, 95.1],
          [3.0, 98.0],
          [0.2, 100.8],
          [-3.5, 103.4],
          [-5.8, 105.4],
          [-2.0, 102.3],
          [3.0, 98.3],
        ],
        [
          [-6.1, 105.0],
          [-6.8, 108.1],
          [-7.7, 112.9],
          [-8.9, 118.1],
          [-10.0, 124.6],
          [-8.7, 120.3],
          [-7.1, 111.5],
        ],
        [
          [3.9, 108.0],
          [2.5, 113.2],
          [0.5, 117.7],
          [-2.7, 117.1],
          [-3.1, 114.6],
          [-1.1, 109.5],
        ],
        [
          [1.8, 119.1],
          [2.3, 123.2],
          [0.0, 124.2],
          [-3.8, 122.3],
          [-4.9, 120.8],
          [-2.3, 120.2],
        ],
        [
          [-1.6, 130.0],
          [1.6, 133.8],
          [-0.7, 138.2],
          [-3.8, 141.1],
          [-6.5, 136.5],
          [-3.9, 131.2],
        ],
      ];

      L.rectangle(
        INDONESIA_BOUNDS,
        { stroke: false, fillColor: "#eef3ea", fillOpacity: 0.96 },
      ).addTo(map);

      islands.forEach((island) => {
        L.polygon(island, {
          color: "#9fb59a",
          weight: 1,
          fillColor: "#d9e8d0",
          fillOpacity: 0.92,
        }).addTo(map);
      });

      [
        [
          [3.6, 98.7],
          [-6.2, 106.8],
          [-7.3, 112.7],
          [-5.1, 119.4],
        ],
        [
          [-6.2, 106.8],
          [-1.2, 116.9],
          [1.5, 124.8],
        ],
      ].forEach((path, idx) => {
        L.polyline(path, {
          color: idx === 0 ? "#8c968c" : "#a6aea6",
          weight: 3,
          opacity: 0.75,
        }).addTo(map);
      });
    }

    const pickerMap = L.map("picker-map").setView([-2.5, 118], 5);
    if (!DUMMY_MAP_MODE) {
      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
        {
          attribution: "&copy; OpenStreetMap",
          subdomains: "abcd",
          maxZoom: 20,
        },
      ).addTo(pickerMap);
    } else {
      paintDummyMapBase(pickerMap);
      pickerMap.fitBounds(INDONESIA_BOUNDS, { padding: [10, 10] });
    }

    let pickerMarker = null;
    const reverseCache = new Map();

    async function reverseGeocode(lat, lng) {
      const cacheKey = `${lat.toFixed(5)},${lng.toFixed(5)}`;
      if (reverseCache.has(cacheKey)) {
        return reverseCache.get(cacheKey);
      }

      if (DUMMY_MAP_MODE) {
        return `Sekitar (${lat.toFixed(5)}, ${lng.toFixed(5)})`;
      }

      try {
        locInput.value = `${lat.toFixed(5)}, ${lng.toFixed(5)} (mencari alamat...)`;
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
          {
            headers: { "Accept-Language": "id-ID,id;q=0.9" },
            signal: controller.signal,
          },
        );
        clearTimeout(timeout);
        const data = await res.json();

        let address =
          data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
        if (data.address) {
          const { road, suburb, city, town, village } = data.address;
          const parts = [road, suburb || village, city || town].filter(Boolean);
          if (parts.length > 0) address = parts.join(", ");
        }
        reverseCache.set(cacheKey, address);
        return address;
      } catch (e) {
        return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
      }
    }

    async function applyPickedLocation(lat, lng, moveMap = true) {
      if (moveMap) pickerMap.setView([lat, lng], 15);

      if (pickerMarker) {
        pickerMarker.setLatLng([lat, lng]);
      } else {
        pickerMarker = L.marker([lat, lng]).addTo(pickerMap);
      }

      // Set coordinates immediately so UX tetap jalan meskipun reverse geocode gagal.
      locInput.value = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
      locInput.dataset.lat = lat;
      locInput.dataset.lng = lng;

      const resolved = await reverseGeocode(lat, lng);
      locInput.value = resolved;
      locInput.dataset.lat = lat;
      locInput.dataset.lng = lng;
    }

    pickerMap.on("click", (e) => {
      applyPickedLocation(e.latlng.lat, e.latlng.lng, false);
    });

    if (gpsBtn) {
      gpsBtn.addEventListener("click", () => {
        if ("geolocation" in navigator) {
          gpsBtn.disabled = true;
          gpsBtn.innerHTML =
            '<i class="spinner" style="display:inline-block;width:14px;height:14px;border:2px solid currentColor;border-right-color:transparent;border-radius:50%;animation:spin 1s linear infinite;"></i>';
          locationLoading?.classList.remove("hidden");
          const resetGpsBtn = () => {
            gpsBtn.disabled = false;
            gpsBtn.innerHTML = '<i data-lucide="crosshair"></i>';
            locationLoading?.classList.add("hidden");
            if (window.lucide)
              window.lucide.createIcons({ root: gpsBtn.parentElement });
          };

          const getCurrentPositionAsync = (options) =>
            new Promise((resolve, reject) => {
              navigator.geolocation.getCurrentPosition(resolve, reject, options);
            });

          (async () => {
            try {
              // Try precise GPS first.
              const precisePosition = await getCurrentPositionAsync({
                enableHighAccuracy: true,
                timeout: 12000,
                maximumAge: 60000,
              });

              const lat = precisePosition.coords.latitude;
              const lng = precisePosition.coords.longitude;
              await applyPickedLocation(lat, lng, true);
              localStorage.setItem(LAST_GPS_KEY, JSON.stringify({ lat, lng }));
              resetGpsBtn();
              return;
            } catch (firstErr) {
              // Fallback: quicker network/cached location.
              try {
                const fallbackPosition = await getCurrentPositionAsync({
                  enableHighAccuracy: false,
                  timeout: 10000,
                  maximumAge: 600000,
                });

                const lat = fallbackPosition.coords.latitude;
                const lng = fallbackPosition.coords.longitude;
                await applyPickedLocation(lat, lng, true);
                localStorage.setItem(LAST_GPS_KEY, JSON.stringify({ lat, lng }));
                resetGpsBtn();
                return;
              } catch (secondErr) {
                // Fallback terakhir: pakai cached location perangkat jika tersedia.
                try {
                  const cachedPosition = await getCurrentPositionAsync({
                    enableHighAccuracy: false,
                    timeout: 8000,
                    maximumAge: Infinity,
                  });

                  const lat = cachedPosition.coords.latitude;
                  const lng = cachedPosition.coords.longitude;
                  await applyPickedLocation(lat, lng, true);
                  localStorage.setItem(LAST_GPS_KEY, JSON.stringify({ lat, lng }));
                  resetGpsBtn();
                  alert("GPS lambat. Menggunakan lokasi cache perangkat.");
                  return;
                } catch (thirdErr) {
                  const err = thirdErr || secondErr || firstErr;

                  if (err && err.code === 1) {
                    resetGpsBtn();
                    alert("Izin lokasi ditolak. Aktifkan izin lokasi di browser.");
                    return;
                  }

                  if (err && err.code === 3) {
                    try {
                      const lastKnownRaw = localStorage.getItem(LAST_GPS_KEY);
                      const lastKnown = lastKnownRaw
                        ? JSON.parse(lastKnownRaw)
                        : null;
                      if (
                        lastKnown &&
                        Number.isFinite(lastKnown.lat) &&
                        Number.isFinite(lastKnown.lng)
                      ) {
                        await applyPickedLocation(lastKnown.lat, lastKnown.lng, true);
                        resetGpsBtn();
                        alert(
                          "GPS sedang timeout. Lokasi terakhir digunakan sebagai cadangan.",
                        );
                        return;
                      }
                    } catch (parseErr) {
                      // Ignore corrupted cache and continue to map-center fallback.
                    }

                    const center = pickerMap.getCenter();
                    await applyPickedLocation(center.lat, center.lng, true);
                    resetGpsBtn();
                    alert(
                      "Permintaan lokasi timeout. Dipakai titik tengah peta sebagai estimasi, silakan geser manual jika perlu.",
                    );
                    return;
                  }

                  resetGpsBtn();
                  if (err && err.code === 2) {
                    alert(
                      "Lokasi tidak tersedia. Coba lagi di area dengan sinyal GPS lebih baik.",
                    );
                  } else {
                    alert("Gagal mendapatkan lokasi GPS.");
                  }
                }
              }
            }
          })();
        } else {
          alert("Browser tidak mensupport Geolocation.");
        }
      });
    }
  }

  // --- Map Logic ---
  const mapContainer = document.getElementById("lapor-map");
  let mainMap = null;
  let mainMarkersGroup = null;

  if (mapContainer && window.L) {
    mainMap = L.map("lapor-map").setView([-2.5, 118], 5);

    if (!DUMMY_MAP_MODE) {
      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
        {
          attribution: "&copy; OpenStreetMap",
          subdomains: "abcd",
          maxZoom: 20,
        },
      ).addTo(mainMap);
    } else {
      paintDummyMapBase(mainMap);
      mainMap.fitBounds(INDONESIA_BOUNDS, { padding: [10, 10] });
    }

    mainMarkersGroup = L.layerGroup().addTo(mainMap);
  }

  const originalRenderFeed = renderFeed;
  renderFeed = function () {
    originalRenderFeed();

    if (mainMap && mainMarkersGroup && window.L) {
      mainMarkersGroup.clearLayers();
      const reports = getReports();

      const coordsFallbackDB = {
        "ECO-2026-1001": [-6.215, 106.91],
        "ECO-2026-1002": [-6.91, 107.61],
        "ECO-2026-1003": [-6.34, 106.73],
      };

      reports.forEach((m) => {
        let lat =
          m.lat ||
          (coordsFallbackDB[m.ref] ? coordsFallbackDB[m.ref][0] : null);
        let lng =
          m.lng ||
          (coordsFallbackDB[m.ref] ? coordsFallbackDB[m.ref][1] : null);

        if (lat && lng) {
          const badgeHtml = `<div style="background-color:var(--color-green-primary);width:16px;height:16px;border-radius:50%;border:2px solid white;box-shadow:0 2px 4px rgba(0,0,0,0.3);"></div>`;
          const customIcon = L.divIcon({
            html: badgeHtml,
            className: "",
            iconSize: [16, 16],
            iconAnchor: [8, 8],
          });
          L.marker([lat, lng], { icon: customIcon })
            .addTo(mainMarkersGroup)
            .bindPopup(m.type + " - " + m.location.split(",")[0]);
        }
      });
    }
  };

  if (typeof renderFeed === "function") renderFeed();
});
