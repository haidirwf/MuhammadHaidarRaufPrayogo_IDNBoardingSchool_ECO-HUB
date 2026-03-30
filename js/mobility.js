document.addEventListener("DOMContentLoaded", () => {
  const IMPACT_KEY = "Eco-Hub_impact_tracker";
  const REPORTS_KEY = "Eco-Hub_reports";
  const AQI_CACHE_KEY = "Eco-Hub_aqi_cache_v1";
  const GEO_CACHE_KEY = "Eco-Hub_geo_cache_v1";
  const AQI_TTL_MS = 10 * 60 * 1000;
  const GEO_TTL_MS = 30 * 24 * 60 * 60 * 1000;
  const MOCK_MODE = localStorage.getItem("Eco-Hub_mock_mode") === "1";

  // g CO2 per km per person (estimasi edukasi)
  const MODE_FACTORS = {
    walk: { label: "Jalan Kaki", factor: 0, color: "#4a7c42" },
    bike: { label: "Sepeda", factor: 8, color: "#6aa85f" },
    bus: { label: "Bus/Transum", factor: 68, color: "#8b6914" },
    carpool: { label: "Carpool", factor: 95, color: "#c48a2a" },
    motor: { label: "Kendaraan Pribadi", factor: 170, color: "#c0392b" },
  };

  const CITIES = {
    Jakarta: { lat: -6.2088, lon: 106.8456 },
    Bandung: { lat: -6.9175, lon: 107.6191 },
    Surabaya: { lat: -7.2575, lon: 112.7521 },
    Yogyakarta: { lat: -7.7956, lon: 110.3695 },
    Makassar: { lat: -5.1477, lon: 119.4328 },
  };
  const MAP_TILE_SOURCES = [
    {
      name: "CARTO Light",
      url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
      options: {
        subdomains: "abcd",
        maxZoom: 20,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; CARTO',
      },
    },
    {
      name: "OpenStreetMap",
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      options: {
        maxZoom: 19,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      },
    },
  ];

  const form = document.getElementById("mobility-form");
  const modeSelect = document.getElementById("mode-select");
  const tripsWeek = document.getElementById("trips-week");
  const fromPointLabel = document.getElementById("from-point-label");
  const toPointLabel = document.getElementById("to-point-label");
  const swapPointsBtn = document.getElementById("swap-points-btn");
  const clearPointsBtn = document.getElementById("clear-points-btn");
  const simulateBtn = document.getElementById("simulate-btn");

  const dashboardCitySelect = document.getElementById("dashboard-city-select");
  const refreshDashboardBtn = document.getElementById("refresh-dashboard-aqi");

  const resultCard = document.getElementById("mobility-result");
  const emptyCard = document.getElementById("mobility-empty");
  const routeDistanceEl = document.getElementById("route-distance");
  const currentEmissionEl = document.getElementById("current-emission");
  const targetEmissionEl = document.getElementById("target-emission");
  const savedEmissionEl = document.getElementById("saved-emission");
  const simulationInsight = document.getElementById("simulation-insight");
  const populationInsight = document.getElementById("population-insight");
  const modeComparison = document.getElementById("mode-comparison");
  const resultTag = document.getElementById("result-tag");

  const dashboardAqi = document.getElementById("dashboard-aqi");
  const dashboardReports = document.getElementById("dashboard-reports");
  const priorityArea = document.getElementById("priority-area");
  const priorityCount = document.getElementById("priority-count");
  const dashboardActions = document.getElementById("dashboard-actions");
  const dashboardSaved = document.getElementById("dashboard-saved");
  const aqiBadge = document.getElementById("aqi-badge");
  const aqiDesc = document.getElementById("aqi-desc");
  const dashboardPm25 = document.getElementById("dashboard-pm25");
  const dashboardPm10 = document.getElementById("dashboard-pm10");
  const dashboardHumidity = document.getElementById("dashboard-humidity");

  const recGrid = document.getElementById("recommendation-grid");

  const impactActions = document.getElementById("impact-actions");
  const impactCarbon = document.getElementById("impact-carbon");
  const impactLevel = document.getElementById("impact-level");
  const impactProgress = document.getElementById("impact-progress");
  const impactNext = document.getElementById("impact-next");

  const heroInsightText = document.getElementById("hero-insight-text");
  const heroAqi = document.getElementById("hero-aqi");
  const heroSaving = document.getElementById("hero-saving");

  const mapEl = document.getElementById("mobility-map");
  const mapState = {
    from: null,
    to: null,
    map: null,
    tileLayer: null,
    tileIndex: 0,
    tileErrors: 0,
    fromMarker: null,
    toMarker: null,
    routeLine: null,
  };
  const geocodeCache = new Map();
  const aqiCache = new Map();
  let lastGeocodeAt = 0;

  function safeParse(raw, fallback = {}) {
    if (!raw) return fallback;
    try {
      return JSON.parse(raw);
    } catch (_) {
      return fallback;
    }
  }

  function hydrateCaches() {
    const now = Date.now();
    const storedAqi = safeParse(localStorage.getItem(AQI_CACHE_KEY), {});
    const storedGeo = safeParse(localStorage.getItem(GEO_CACHE_KEY), {});

    Object.entries(storedAqi).forEach(([key, item]) => {
      if (item && typeof item.ts === "number" && now - item.ts <= AQI_TTL_MS) {
        aqiCache.set(key, item);
      }
    });

    Object.entries(storedGeo).forEach(([key, item]) => {
      if (item && typeof item.ts === "number" && now - item.ts <= GEO_TTL_MS) {
        geocodeCache.set(key, item.value);
      }
    });
  }

  function persistAqiCache() {
    const obj = {};
    aqiCache.forEach((value, key) => {
      obj[key] = value;
    });
    localStorage.setItem(AQI_CACHE_KEY, JSON.stringify(obj));
  }

  function persistGeoCache() {
    const now = Date.now();
    const obj = {};
    geocodeCache.forEach((value, key) => {
      obj[key] = { value, ts: now };
    });
    localStorage.setItem(GEO_CACHE_KEY, JSON.stringify(obj));
  }

  function mountTileLayer(index) {
    if (!mapState.map || !window.L) return;
    const source = MAP_TILE_SOURCES[index];
    if (!source) return;

    if (mapState.tileLayer) {
      mapState.map.removeLayer(mapState.tileLayer);
      mapState.tileLayer = null;
    }

    mapState.tileErrors = 0;
    mapState.tileIndex = index;
    mapState.tileLayer = window.L.tileLayer(source.url, {
      ...source.options,
      referrerPolicy: "strict-origin-when-cross-origin",
      crossOrigin: true,
    });

    mapState.tileLayer.on("tileerror", () => {
      mapState.tileErrors += 1;
      if (mapState.tileErrors >= 5 && mapState.tileIndex < MAP_TILE_SOURCES.length - 1) {
        mountTileLayer(mapState.tileIndex + 1);
      }
    });

    mapState.tileLayer.addTo(mapState.map);
  }

  function getImpactState() {
    const defaultState = {
      actions: 0,
      savedKg: 0,
      lastSimulation: null,
      recommendationsViewed: 0,
    };

    const raw = localStorage.getItem(IMPACT_KEY);
    if (!raw) return defaultState;

    try {
      return { ...defaultState, ...JSON.parse(raw) };
    } catch (error) {
      console.warn("Impact state invalid", error);
      return defaultState;
    }
  }

  function saveImpactState(state) {
    localStorage.setItem(IMPACT_KEY, JSON.stringify(state));
  }

  function getReports() {
    const raw = localStorage.getItem(REPORTS_KEY);
    if (!raw) return [];

    try {
      return JSON.parse(raw);
    } catch (error) {
      console.warn("Reports invalid", error);
      return [];
    }
  }

  function animateNumber(el, toValue, suffix = "") {
    if (!el) return;
    const current = Number(el.dataset.current || 0);
    const target = Number(toValue);
    const steps = 20;
    const inc = (target - current) / steps;
    let step = 0;

    clearInterval(el._timer);
    el._timer = setInterval(() => {
      step += 1;
      const next = step >= steps ? target : current + inc * step;
      el.textContent = `${next.toFixed(1).replace(/\.0$/, "")}${suffix}`;
      el.dataset.current = String(next);

      if (step >= steps) {
        clearInterval(el._timer);
      }
    }, 20);
  }

  function updateImpactUI() {
    const state = getImpactState();
    const level = getLevelByActions(state.actions);

    animateNumber(impactActions, state.actions);
    animateNumber(impactCarbon, state.savedKg);
    if (impactLevel) impactLevel.textContent = level.name;

    if (impactProgress) {
      const progressValue = Math.max(0, Math.min(100, level.progressPct));
      impactProgress.style.width = `${progressValue}%`;
      impactProgress.parentElement.setAttribute("aria-valuenow", String(Math.round(progressValue)));
    }

    if (impactNext) {
      impactNext.textContent =
        level.remaining > 0
          ? `${level.remaining} aksi lagi menuju ${level.nextName}.`
          : "Level tertinggi tercapai. Kamu Earth Guardian!";
    }

    setBadgeState(level.code);
    animateNumber(dashboardActions, state.actions);
    animateNumber(dashboardSaved, state.savedKg);
  }

  function setBadgeState(levelCode) {
    const badges = document.querySelectorAll(".badge-item");
    if (!badges.length) return;

    badges.forEach((badge) => badge.classList.remove("active"));
    badges[0].classList.add("active");

    if (levelCode === "green_mover" || levelCode === "earth_guardian") {
      const greenMover = document.querySelector('[data-badge="green_mover"]');
      if (greenMover) greenMover.classList.add("active");
    }

    if (levelCode === "earth_guardian") {
      const earthGuardian = document.querySelector('[data-badge="earth_guardian"]');
      if (earthGuardian) earthGuardian.classList.add("active");
    }
  }

  function getLevelByActions(actions) {
    if (actions >= 20) {
      return {
        code: "earth_guardian",
        name: "Earth Guardian",
        progressPct: 100,
        remaining: 0,
        nextName: "-",
      };
    }

    if (actions >= 8) {
      return {
        code: "green_mover",
        name: "Green Mover",
        progressPct: ((actions - 8) / 12) * 100,
        remaining: 20 - actions,
        nextName: "Earth Guardian",
      };
    }

    return {
      code: "eco_starter",
      name: "Eco Starter",
      progressPct: (actions / 8) * 100,
      remaining: 8 - actions,
      nextName: "Green Mover",
    };
  }

  async function fetchAQI(city) {
    const cityData = CITIES[city] || CITIES.Jakarta;
    const cacheKey = city;
    const cached = aqiCache.get(cacheKey);
    if (cached && Date.now() - cached.ts <= AQI_TTL_MS) {
      return cached.value;
    }

    if (MOCK_MODE) {
      const mock = {
        aqi: 65,
        pm25: 22,
        pm10: 35,
        humidity: 60,
      };
      aqiCache.set(cacheKey, { value: mock, ts: Date.now() });
      persistAqiCache();
      return mock;
    }

    try {
      const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${cityData.lat}&longitude=${cityData.lon}&current=us_aqi,pm2_5,pm10`;
      const response = await fetch(url);
      const data = await response.json();

      if (data && data.current && typeof data.current.us_aqi === "number") {
        const live = {
          aqi: data.current.us_aqi,
          pm25: data.current.pm2_5,
          pm10: data.current.pm10,
          humidity: 55 + Math.floor(Math.random() * 25),
        };
        aqiCache.set(cacheKey, { value: live, ts: Date.now() });
        persistAqiCache();
        return live;
      }
    } catch (error) {
      console.warn("AQI fetch failed", error);
    }

    const fallback = {
      aqi: 65,
      pm25: 22,
      pm10: 35,
      humidity: 60,
    };
    aqiCache.set(cacheKey, { value: fallback, ts: Date.now() });
    persistAqiCache();
    return fallback;
  }

  function getAqiDescriptor(aqi) {
    if (aqi <= 50) {
      return {
        label: "Baik",
        desc: "Udara relatif aman untuk aktivitas luar ruangan.",
        className: "good",
      };
    }

    if (aqi <= 100) {
      return {
        label: "Sedang",
        desc: "Kelompok sensitif disarankan mengurangi paparan lama.",
        className: "warn",
      };
    }

    return {
      label: "Tidak Sehat",
      desc: "Batasi aktivitas luar dan prioritaskan perlindungan pernapasan.",
      className: "danger",
    };
  }

  function updateReportsDashboard() {
    const reports = getReports();
    if (dashboardReports) dashboardReports.textContent = String(reports.length);

    if (reports.length === 0) {
      if (priorityArea) priorityArea.textContent = "Belum ada";
      if (priorityCount) priorityCount.textContent = "Belum ada data lokasi padat laporan.";
      return { area: "Belum ada", count: 0 };
    }

    const areaCount = {};
    reports.forEach((report) => {
      const area = (report.location || "Unknown").split(",")[0].trim();
      areaCount[area] = (areaCount[area] || 0) + 1;
    });

    const sorted = Object.entries(areaCount).sort((a, b) => b[1] - a[1]);
    const [topArea, count] = sorted[0];

    if (priorityArea) priorityArea.textContent = topArea;
    if (priorityCount) priorityCount.textContent = `${count} laporan aktif di area ini. Prioritaskan aksi komunitas.`;

    return { area: topArea, count };
  }

  function haversineDistanceKm(from, to) {
    const R = 6371;
    const dLat = ((to.lat - from.lat) * Math.PI) / 180;
    const dLon = ((to.lng - from.lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((from.lat * Math.PI) / 180) * Math.cos((to.lat * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  function formatPointLabel(point) {
    if (!point) return "Belum dipilih";
    if (point.label) return point.label;
    return `${point.lat.toFixed(4)}, ${point.lng.toFixed(4)}`;
  }

  function updatePointLabels() {
    if (fromPointLabel) fromPointLabel.textContent = formatPointLabel(mapState.from);
    if (toPointLabel) toPointLabel.textContent = formatPointLabel(mapState.to);
    if (simulateBtn) {
      const ready = Boolean(mapState.from && mapState.to);
      simulateBtn.disabled = !ready;
      simulateBtn.title = ready ? "" : "Pilih titik asal dan tujuan di peta terlebih dahulu";
    }
  }

  function updateMapVisuals() {
    if (!mapState.map || !window.L) return;

    if (mapState.fromMarker) {
      mapState.map.removeLayer(mapState.fromMarker);
      mapState.fromMarker = null;
    }
    if (mapState.toMarker) {
      mapState.map.removeLayer(mapState.toMarker);
      mapState.toMarker = null;
    }
    if (mapState.routeLine) {
      mapState.map.removeLayer(mapState.routeLine);
      mapState.routeLine = null;
    }

    if (mapState.from) {
      mapState.fromMarker = window.L.marker([mapState.from.lat, mapState.from.lng], { title: "Asal" })
        .addTo(mapState.map)
        .bindPopup("Titik Asal");
    }

    if (mapState.to) {
      mapState.toMarker = window.L.marker([mapState.to.lat, mapState.to.lng], { title: "Tujuan" })
        .addTo(mapState.map)
        .bindPopup("Titik Tujuan");
    }

    if (mapState.from && mapState.to) {
      mapState.routeLine = window.L.polyline(
        [
          [mapState.from.lat, mapState.from.lng],
          [mapState.to.lat, mapState.to.lng],
        ],
        { color: "#2d5a27", weight: 4, opacity: 0.85 },
      ).addTo(mapState.map);

      mapState.map.fitBounds(mapState.routeLine.getBounds(), { padding: [40, 40] });
    }
  }

  function initMap() {
    if (!mapEl || !window.L) return;

    mapState.map = window.L.map(mapEl, { zoomControl: true }).setView([-6.2, 106.8], 11);
    if (!MOCK_MODE) {
      mountTileLayer(0);
    } else {
      mapEl.style.background =
        "radial-gradient(circle at 20% 20%, rgba(45,90,39,0.14), transparent 35%), #eef1eb";
    }

    mapState.map.on("click", (event) => {
      const point = {
        lat: event.latlng.lat,
        lng: event.latlng.lng,
        label: "Mencari alamat...",
      };
      if (!mapState.from) {
        mapState.from = point;
        resolvePointAddress("from");
      } else if (!mapState.to) {
        mapState.to = point;
        resolvePointAddress("to");
      } else {
        mapState.from = point;
        mapState.to = null;
        resolvePointAddress("from");
      }

      updatePointLabels();
      updateMapVisuals();
    });

    setTimeout(() => mapState.map.invalidateSize(), 120);
  }

  function recommendMode(distanceKm) {
    if (distanceKm <= 2) return "walk";
    if (distanceKm <= 8) return "bike";
    if (distanceKm <= 20) return "bus";
    return "carpool";
  }

  function renderModeComparison(distanceKm, tripsPerWeek) {
    if (!modeComparison) return;

    const roundTripKm = distanceKm * 2;
    const emissionByMode = Object.entries(MODE_FACTORS).map(([key, mode]) => {
      const kg = (mode.factor * roundTripKm * tripsPerWeek) / 1000;
      return { key, ...mode, kg };
    });

    const maxKg = Math.max(...emissionByMode.map((item) => item.kg), 1);
    modeComparison.innerHTML = emissionByMode
      .map((item) => {
        const width = Math.max(2, (item.kg / maxKg) * 100);

        return `
          <div class="mode-row">
            <small>${item.label}</small>
            <div class="mode-bar-wrap">
              <div class="mode-bar" data-width="${width.toFixed(1)}" style="background:${item.color}"></div>
            </div>
            <div class="mode-value">${item.kg.toFixed(2)} kg</div>
          </div>
        `;
      })
      .join("");

    requestAnimationFrame(() => {
      modeComparison.querySelectorAll(".mode-bar").forEach((bar) => {
        bar.style.width = `${bar.dataset.width}%`;
      });
    });
  }

  function simulateMobility({ distanceKm, tripsPerWeek, selectedMode }) {
    const weeklyKm = distanceKm * 2 * tripsPerWeek;
    const recommendedMode = recommendMode(distanceKm);

    const selectedKg = (MODE_FACTORS[selectedMode].factor * weeklyKm) / 1000;
    const suggestedKg = (MODE_FACTORS[recommendedMode].factor * weeklyKm) / 1000;
    const savedKg = Math.max(0, selectedKg - suggestedKg);

    return {
      selectedKg,
      suggestedKg,
      savedKg,
      recommendedMode,
      yearlySavedKg: savedKg * 52,
      people100SavedKg: savedKg * 100,
      weeklyKm,
    };
  }

  function getSimulationTag(savedKg) {
    if (savedKg >= 10) return { text: "Potensi Hemat Tinggi", className: "good" };
    if (savedKg >= 4) return { text: "Potensi Hemat Menengah", className: "warn" };
    return { text: "Potensi Hemat Rendah", className: "danger" };
  }

  function nearestCityFromPoints(from, to) {
    const mid = {
      lat: (from.lat + to.lat) / 2,
      lng: (from.lng + to.lng) / 2,
    };

    let nearest = "Jakarta";
    let minDistance = Infinity;

    Object.entries(CITIES).forEach(([name, coord]) => {
      const dist = haversineDistanceKm(mid, { lat: coord.lat, lng: coord.lon });
      if (dist < minDistance) {
        minDistance = dist;
        nearest = name;
      }
    });

    return nearest;
  }

  function renderRecommendations(context) {
    if (!recGrid) return;
    const items = [];

    if (context.aqi > 100) {
      items.push({
        title: "Mode Rendah Emisi Prioritas Hari Ini",
        desc: "AQI sedang tinggi. Gunakan bus/carpool atau kurangi perjalanan yang tidak mendesak.",
        chip: "Air Quality Alert",
      });
    } else {
      items.push({
        title: "Waktu Tepat untuk Mobilitas Hijau",
        desc: "Kualitas udara cukup baik. Jadwalkan jalan kaki atau bersepeda untuk perjalanan pendek.",
        chip: "Good Air Window",
      });
    }

    if (context.savedKg > 0) {
      items.push({
        title: "Pertahankan Mode Alternatif",
        desc: `Pilihanmu berpotensi menekan emisi ${context.savedKg.toFixed(2)} kg CO2 per minggu. Konsisten 1 bulan akan berdampak besar.`,
        chip: "Behavior Shift",
      });
    } else {
      items.push({
        title: "Optimalkan Mode Perjalanan",
        desc: "Coba mode dengan emisi lebih rendah untuk rute ini agar penghematan karbon lebih terasa.",
        chip: "Optimization",
      });
    }

    if (context.priorityArea.count >= 3) {
      items.push({
        title: "Aktivasi Aksi Komunitas Lokal",
        desc: `Area ${context.priorityArea.area} sedang padat laporan. Ajak komunitas lokal untuk aksi akhir pekan ini.`,
        chip: "Community Action",
      });
    }

    recGrid.innerHTML = items
      .slice(0, 4)
      .map(
        (item) => `
          <article class="card recommendation-card fade-up visible">
            <h3>${item.title}</h3>
            <p>${item.desc}</p>
            <span class="recommendation-chip">${item.chip}</span>
          </article>
        `,
      )
      .join("");

    if (window.lucide) window.lucide.createIcons({ root: recGrid });

    const state = getImpactState();
    state.recommendationsViewed += 1;
    state.actions += 1;
    saveImpactState(state);
    updateImpactUI();
  }

  function updateHeroInsight(simResult, aqi) {
    const baseline = simResult?.savedKg || 0;
    const savedText = baseline > 0 ? `${baseline.toFixed(2)} kg/minggu` : "Belum ada";

    if (heroAqi) heroAqi.textContent = String(Math.round(aqi));
    if (heroSaving) heroSaving.textContent = savedText;

    if (!heroInsightText) return;
    heroInsightText.textContent =
      baseline > 0
        ? `Jika pola perjalanan ini dipertahankan, kamu bisa menghemat sekitar ${simResult.yearlySavedKg.toFixed(0)} kg CO2 per tahun.`
        : "Klik asal dan tujuan di peta lalu hitung untuk melihat potensi penghematan karbon tahunanmu.";
  }

  async function updateDashboardByCity(city, simResult = null) {
    const air = await fetchAQI(city);
    const descriptor = getAqiDescriptor(air.aqi);

    if (dashboardAqi) dashboardAqi.textContent = String(Math.round(air.aqi));
    if (aqiBadge) {
      aqiBadge.textContent = descriptor.label;
      aqiBadge.className = `state-chip ${descriptor.className}`;
    }
    if (aqiDesc) aqiDesc.textContent = descriptor.desc;
    if (dashboardPm25) dashboardPm25.textContent = `${Number(air.pm25).toFixed(0)} ug/m3`;
    if (dashboardPm10) dashboardPm10.textContent = `${Number(air.pm10).toFixed(0)} ug/m3`;
    if (dashboardHumidity) dashboardHumidity.textContent = `${air.humidity}%`;

    updateHeroInsight(simResult, air.aqi);
    const topArea = updateReportsDashboard();

    return {
      aqi: air.aqi,
      priorityArea: topArea,
    };
  }

  function pushImpactFromSimulation(savedKg) {
    const state = getImpactState();
    state.actions += 2;
    state.savedKg += savedKg;
    state.lastSimulation = new Date().toISOString();
    saveImpactState(state);

    if (window.addEcoPoints) {
      window.addEcoPoints(15, "Simulasi Eco Mobility");
    }

    updateImpactUI();
  }

  function setEmptyMessage(message) {
    if (!emptyCard) return;
    const msg = emptyCard.querySelector("p");
    if (msg) msg.textContent = message;
  }

  function geocodeCacheKey(point) {
    return `${point.lat.toFixed(5)},${point.lng.toFixed(5)}`;
  }

  function nearestCityForPoint(point) {
    let nearest = "Jakarta";
    let minDistance = Infinity;

    Object.entries(CITIES).forEach(([name, coord]) => {
      const dist = haversineDistanceKm(point, { lat: coord.lat, lng: coord.lon });
      if (dist < minDistance) {
        minDistance = dist;
        nearest = name;
      }
    });

    return nearest;
  }

  function mockAddressFromPoint(point) {
    const city = nearestCityForPoint(point);
    return `Sekitar ${city} (${point.lat.toFixed(4)}, ${point.lng.toFixed(4)})`;
  }

  async function reverseGeocode(point) {
    const key = geocodeCacheKey(point);
    if (geocodeCache.has(key)) return geocodeCache.get(key);

    if (MOCK_MODE) {
      const mockAddress = mockAddressFromPoint(point);
      geocodeCache.set(key, mockAddress);
      persistGeoCache();
      return mockAddress;
    }

    const elapsed = Date.now() - lastGeocodeAt;
    if (elapsed < 1100) {
      await new Promise((resolve) => setTimeout(resolve, 1100 - elapsed));
    }
    lastGeocodeAt = Date.now();

    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${point.lat}&lon=${point.lng}`;
      const res = await fetch(url, {
        headers: {
          "Accept-Language": "id-ID,id;q=0.9,en;q=0.8",
        },
      });
      const data = await res.json();

      let address = data.display_name || `${point.lat.toFixed(4)}, ${point.lng.toFixed(4)}`;
      if (data.address) {
        const { road, suburb, village, city, town, county } = data.address;
        const compact = [road, suburb || village, city || town || county].filter(Boolean);
        if (compact.length) address = compact.join(", ");
      }

      geocodeCache.set(key, address);
      persistGeoCache();
      return address;
    } catch (error) {
      const fallbackAddress = mockAddressFromPoint(point);
      geocodeCache.set(key, fallbackAddress);
      persistGeoCache();
      return fallbackAddress;
    }
  }

  async function resolvePointAddress(role) {
    const target = role === "from" ? mapState.from : mapState.to;
    if (!target) return;

    const snapshot = { lat: target.lat, lng: target.lng };
    const address = await reverseGeocode(snapshot);

    const current = role === "from" ? mapState.from : mapState.to;
    if (!current) return;

    const samePoint =
      Math.abs(current.lat - snapshot.lat) < 0.000001 &&
      Math.abs(current.lng - snapshot.lng) < 0.000001;

    if (samePoint) {
      current.label = address;
      updatePointLabels();
    }
  }

  swapPointsBtn?.addEventListener("click", () => {
    if (!mapState.from || !mapState.to) return;
    const temp = mapState.from;
    mapState.from = mapState.to;
    mapState.to = temp;
    updatePointLabels();
    updateMapVisuals();
  });

  clearPointsBtn?.addEventListener("click", () => {
    mapState.from = null;
    mapState.to = null;
    updatePointLabels();
    updateMapVisuals();
    setEmptyMessage("Klik peta untuk memilih asal dan tujuan perjalanan.");
  });

  dashboardCitySelect?.addEventListener("change", async () => {
    await updateDashboardByCity(dashboardCitySelect.value);
  });

  refreshDashboardBtn?.addEventListener("click", async () => {
    refreshDashboardBtn.disabled = true;
    refreshDashboardBtn.classList.add("is-loading");
    await updateDashboardByCity(dashboardCitySelect.value);
    setTimeout(() => {
      refreshDashboardBtn.disabled = false;
      refreshDashboardBtn.classList.remove("is-loading");
    }, 300);
  });

  form?.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!mapState.from || !mapState.to) {
      setEmptyMessage("Pilih titik asal dan tujuan dulu di peta, lalu klik hitung.");
      emptyCard?.classList.remove("hidden");
      resultCard?.classList.add("hidden");
      return;
    }

    const distanceKm = haversineDistanceKm(mapState.from, mapState.to);
    const selectedMode = modeSelect?.value || "motor";
    const tripsPerWeek = Math.max(1, Number(tripsWeek?.value || 10));

    const simResult = simulateMobility({
      distanceKm,
      tripsPerWeek,
      selectedMode,
    });

    emptyCard?.classList.add("hidden");
    resultCard?.classList.remove("hidden");
    resultCard?.scrollIntoView({ behavior: "smooth", block: "start" });

    if (routeDistanceEl) routeDistanceEl.textContent = distanceKm.toFixed(2);
    if (currentEmissionEl) currentEmissionEl.textContent = simResult.selectedKg.toFixed(2);
    if (targetEmissionEl) targetEmissionEl.textContent = simResult.suggestedKg.toFixed(2);
    if (savedEmissionEl) savedEmissionEl.textContent = simResult.savedKg.toFixed(2);

    const tag = getSimulationTag(simResult.savedKg);
    if (resultTag) {
      resultTag.textContent = tag.text;
      resultTag.className = `state-chip ${tag.className}`;
    }

    const selectedLabel = MODE_FACTORS[selectedMode].label;
    const suggestedLabel = MODE_FACTORS[simResult.recommendedMode].label;

    if (simulationInsight) {
      simulationInsight.textContent =
        `Jarak rute sekitar ${distanceKm.toFixed(2)} km. Jika memakai ${selectedLabel} sebanyak ${tripsPerWeek}x pulang-pergi/minggu, emisi diperkirakan ${simResult.selectedKg.toFixed(2)} kg CO2.`;
    }

    if (populationInsight) {
      if (simResult.savedKg > 0) {
        populationInsight.textContent =
          `Untuk rute ini, mode yang lebih efisien adalah ${suggestedLabel}. Potensi hematmu ${simResult.savedKg.toFixed(2)} kg CO2 per minggu (${simResult.people100SavedKg.toFixed(0)} kg jika dilakukan 100 orang).`;
      } else {
        populationInsight.textContent =
          `Mode ${selectedLabel} sudah termasuk efisien untuk rute ini. Pertahankan kebiasaan ini agar dampaknya konsisten.`;
      }
    }

    renderModeComparison(distanceKm, tripsPerWeek);
    pushImpactFromSimulation(simResult.savedKg);

    const nearestCity = nearestCityFromPoints(mapState.from, mapState.to);
    if (dashboardCitySelect) dashboardCitySelect.value = nearestCity;

    const context = await updateDashboardByCity(nearestCity, simResult);
    renderRecommendations({ ...context, savedKg: simResult.savedKg });
  });

  (async function init() {
    hydrateCaches();
    initMap();
    updatePointLabels();
    setEmptyMessage("Klik peta untuk memilih asal dan tujuan perjalanan.");

    updateImpactUI();

    const initialCity = dashboardCitySelect?.value || "Jakarta";
    const context = await updateDashboardByCity(initialCity);

    if (heroSaving) heroSaving.textContent = "Belum ada";
    if (context.priorityArea.count === 0 && heroInsightText) {
      heroInsightText.textContent =
        "Mulai dengan klik peta untuk menentukan asal dan tujuan. Kami hitungkan emisinya secara otomatis.";
    }
  })();
});
