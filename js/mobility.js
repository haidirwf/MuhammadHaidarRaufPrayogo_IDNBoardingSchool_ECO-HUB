


document.addEventListener("DOMContentLoaded", () => {
  const IMPACT_KEY = "Eco Hub_impact_tracker";
  const REPORTS_KEY = "Eco Hub_reports";
  const COMMUNITY_ACTIVITIES_KEY = "Eco Hub_community_activities_v1";
  const AQI_CACHE_KEY = "Eco Hub_aqi_cache_v1";
  const GEO_CACHE_KEY = "Eco Hub_geo_cache_v1";
  const ROUTE_CACHE_KEY = "Eco Hub_route_cache_v1";
  const WEEKLY_PLAN_KEY = "Eco Hub_weekly_plan_v1";
  const AQI_TTL_MS = 10 * 60 * 1000;
  const GEO_TTL_MS = 30 * 24 * 60 * 60 * 1000;
  const ROUTE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
  const MOCK_MODE = localStorage.getItem("Eco Hub_mock_mode") === "1";
  const DUMMY_MAP_MODE = window.ECO_HUB_MAP_CONFIG?.dummyOnly ?? true;
  const INDONESIA_BOUNDS = [
    [-11.2, 94.5],
    [6.8, 141.5],
  ];

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
    Bekasi: { lat: -6.2349, lon: 106.9896 },
    Bogor: { lat: -6.5944, lon: 106.7892 },
    Depok: { lat: -6.4025, lon: 106.7942 },
    Tangerang: { lat: -6.1783, lon: 106.6319 },
    Semarang: { lat: -6.9667, lon: 110.4167 },
    Surabaya: { lat: -7.2575, lon: 112.7521 },
    Malang: { lat: -7.9666, lon: 112.6326 },
    Yogyakarta: { lat: -7.7956, lon: 110.3695 },
    Denpasar: { lat: -8.6705, lon: 115.2126 },
    Medan: { lat: 3.5952, lon: 98.6722 },
    Palembang: { lat: -2.9909, lon: 104.7567 },
    Batam: { lat: 1.0456, lon: 104.0305 },
    Pontianak: { lat: -0.0263, lon: 109.3425 },
    Balikpapan: { lat: -1.2379, lon: 116.8529 },
    Samarinda: { lat: -0.5022, lon: 117.1537 },
    Banjarmasin: { lat: -3.3186, lon: 114.5944 },
    Makassar: { lat: -5.1477, lon: 119.4328 },
    Manado: { lat: 1.4748, lon: 124.8421 },
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
  const modeDetails = document.querySelector(".mode-details");
  const resultTag = document.getElementById("result-tag");
  const routeEtaEl = document.getElementById("route-eta");

  const dashboardAqi = document.getElementById("dashboard-aqi");
  const dashboardReports = document.getElementById("dashboard-reports");
  const priorityArea = document.getElementById("priority-area");
  const priorityCount = document.getElementById("priority-count");
  const dashboardActions = document.getElementById("dashboard-actions");
  const dashboardSaved = document.getElementById("dashboard-saved");
  const aqiBadge = document.getElementById("aqi-badge");
  const aqiCityNote = document.getElementById("aqi-city-note");
  const aqiDesc = document.getElementById("aqi-desc");
  const dashboardPm25 = document.getElementById("dashboard-pm25");
  const dashboardPm10 = document.getElementById("dashboard-pm10");
  const dashboardHumidity = document.getElementById("dashboard-humidity");
  const areaScoreEl = document.getElementById("area-score");
  const areaScoreNote = document.getElementById("area-score-note");
  const communityActionMapEl = document.getElementById("community-action-map");

  const recGrid = document.getElementById("recommendation-grid");

  const impactActions = document.getElementById("impact-actions");
  const impactCarbon = document.getElementById("impact-carbon");
  const impactLevel = document.getElementById("impact-level");
  const impactProgress = document.getElementById("impact-progress");
  const impactNext = document.getElementById("impact-next");

  const heroInsightText = document.getElementById("hero-insight-text");
  const heroAqi = document.getElementById("hero-aqi");
  const heroSaving = document.getElementById("hero-saving");
  const weeklyTarget = document.getElementById("weekly-target");
  const weeklyProgress = document.getElementById("weekly-progress");
  const weeklyStatus = document.getElementById("weekly-status");
  const weeklyPlanList = document.getElementById("weekly-plan-list");
  const leaderboardList = document.getElementById("leaderboard-list");

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
  const routeCache = new Map();
  const communityMapState = {
    map: null,
    layerGroup: null,
  };
  let lastGeocodeAt = 0;

  function setButtonLoading(button, loading, loadingText = "Memproses...") {
    if (!button) return;

    if (loading) {
      if (!button.dataset.originalLabel) {
        button.dataset.originalLabel = button.innerHTML;
      }
      button.disabled = true;
      button.classList.add("is-loading");
      button.innerHTML = `<span class="btn-inline-spinner" aria-hidden="true"></span><span>${loadingText}</span>`;
      return;
    }

    button.classList.remove("is-loading");
    const originalLabel = button.dataset.originalLabel;
    if (originalLabel) {
      button.innerHTML = originalLabel;
    }
    button.disabled = false;
  }

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
    const storedRoute = safeParse(localStorage.getItem(ROUTE_CACHE_KEY), {});

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

    Object.entries(storedRoute).forEach(([key, item]) => {
      if (item && typeof item.ts === "number" && now - item.ts <= ROUTE_TTL_MS) {
        routeCache.set(key, item);
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

  function persistRouteCache() {
    const MAX_ROUTE_CACHE_ITEMS = 120;
    while (routeCache.size > MAX_ROUTE_CACHE_ITEMS) {
      const oldestKey = routeCache.keys().next().value;
      if (!oldestKey) break;
      routeCache.delete(oldestKey);
    }

    const obj = {};
    routeCache.forEach((value, key) => {
      obj[key] = value;
    });
    localStorage.setItem(ROUTE_CACHE_KEY, JSON.stringify(obj));
  }

  function routeCacheKey(from, to) {
    return `${from.lat.toFixed(5)},${from.lng.toFixed(5)}|${to.lat.toFixed(5)},${to.lng.toFixed(5)}`;
  }

  async function fetchRealRoute(from, to) {
    const key = routeCacheKey(from, to);
    const cached = routeCache.get(key);
    if (cached && typeof cached.ts === "number" && Date.now() - cached.ts <= ROUTE_TTL_MS) {
      return cached.value;
    }

    if (MOCK_MODE || DUMMY_MAP_MODE) return null;

    let timeout = null;
    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`;
      const controller = new AbortController();
      timeout = setTimeout(() => controller.abort(), 9000);
      const res = await fetch(url, { signal: controller.signal });

      const data = await res.json();
      if (!data || data.code !== "Ok" || !Array.isArray(data.routes) || !data.routes[0]) {
        return null;
      }

      const route = data.routes[0];
      const geometry = Array.isArray(route.geometry?.coordinates)
        ? route.geometry.coordinates.map((coord) => [coord[1], coord[0]])
        : null;

      const value = {
        distanceKm: Number(route.distance || 0) / 1000,
        durationMin: Number(route.duration || 0) / 60,
        geometry,
      };

      routeCache.set(key, { value, ts: Date.now() });
      persistRouteCache();
      return value;
    } catch (error) {
      return null;
    } finally {
      if (timeout) clearTimeout(timeout);
    }
  }

  function estimateEtaMinutes(distanceKm, mode, routeDurationMin = null) {
    const speedByMode = {
      walk: 4.5,
      bike: 14,
      bus: 24,
      carpool: 30,
      motor: 32,
    };

    if (typeof routeDurationMin === "number" && routeDurationMin > 0) {
      if (mode === "motor") return Math.max(1, Math.round(routeDurationMin));
      if (mode === "carpool") return Math.max(1, Math.round(routeDurationMin * 1.1));
      if (mode === "bus") return Math.max(1, Math.round(routeDurationMin * 1.35));
    }

    const speed = speedByMode[mode] || 25;
    return Math.max(1, Math.round((distanceKm / speed) * 60));
  }

  function formatEta(minutes) {
    if (!Number.isFinite(minutes) || minutes <= 0) return "-";
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h <= 0) return `${m}m`;
    if (m === 0) return `${h}j`;
    return `${h}j ${m}m`;
  }

  function makeExportSummary() {
    return [
      `Jarak Rute: ${routeDistanceEl?.textContent || "0"} km`,
      `Estimasi Waktu: ${routeEtaEl?.textContent || "-"}`,
      `Emisi Pilihan: ${currentEmissionEl?.textContent || "0"} kg/minggu`,
      `Emisi Saran: ${targetEmissionEl?.textContent || "0"} kg/minggu`,
      `Penghematan: ${savedEmissionEl?.textContent || "0"} kg/minggu`,
      `Waktu Ekspor: ${new Date().toLocaleString("id-ID")}`,
    ];
  }

  function exportSummaryPng() {
    const lines = makeExportSummary();
    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 630;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#f2f6ef";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#b8c9b4";
    ctx.lineWidth = 2;
    ctx.strokeRect(52, 52, 1096, 526);

    ctx.fillStyle = "#1f2a1f";
    ctx.font = "700 44px Arial";
    ctx.fillText("EcoSense - Ringkasan Simulasi", 84, 120);

    ctx.fillStyle = "#2d5a27";
    ctx.font = "700 30px Arial";
    ctx.fillText("Smart Mobility Summary", 84, 180);

    ctx.fillStyle = "#243024";
    ctx.font = "500 30px Arial";
    lines.forEach((line, idx) => {
      ctx.fillText(line, 84, 245 + idx * 58);
    });

    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = `ecosense-summary-${Date.now()}.png`;
    link.click();
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

  function paintDummyMapBase(map) {
    if (!map || !window.L) return;

    const sumatra = [
      [5.4, 95.1],
      [4.4, 96.4],
      [3.0, 98.0],
      [1.8, 99.5],
      [0.2, 100.8],
      [-1.5, 102.1],
      [-3.5, 103.4],
      [-5.4, 104.8],
      [-5.8, 105.4],
      [-4.4, 104.0],
      [-2.0, 102.3],
      [0.8, 100.2],
      [3.0, 98.3],
      [4.8, 96.8],
    ];
    const javaBali = [
      [-6.1, 105.0],
      [-6.4, 106.2],
      [-6.8, 108.1],
      [-7.1, 110.3],
      [-7.7, 112.9],
      [-8.2, 114.6],
      [-8.5, 115.4],
      [-8.8, 116.5],
      [-8.9, 118.1],
      [-8.6, 119.9],
      [-8.9, 121.8],
      [-9.4, 123.7],
      [-10.0, 124.6],
      [-9.2, 122.4],
      [-8.7, 120.3],
      [-8.4, 118.2],
      [-8.0, 116.1],
      [-7.6, 113.8],
      [-7.1, 111.5],
      [-6.7, 109.1],
      [-6.2, 106.8],
    ];
    const kalimantan = [
      [3.9, 108.0],
      [3.2, 110.5],
      [2.5, 113.2],
      [1.8, 116.0],
      [0.5, 117.7],
      [-1.3, 118.3],
      [-2.7, 117.1],
      [-3.1, 114.6],
      [-2.5, 112.1],
      [-1.1, 109.5],
      [0.6, 108.3],
      [2.4, 108.1],
    ];
    const sulawesi = [
      [1.8, 119.1],
      [2.7, 121.0],
      [2.3, 123.2],
      [1.2, 124.8],
      [0.0, 124.2],
      [-1.8, 123.4],
      [-3.8, 122.3],
      [-4.9, 120.8],
      [-4.2, 119.3],
      [-2.3, 120.2],
      [-1.0, 121.2],
      [0.7, 121.0],
      [1.5, 120.0],
    ];
    const papua = [
      [-1.6, 130.0],
      [0.6, 131.5],
      [1.6, 133.8],
      [0.9, 136.2],
      [-0.7, 138.2],
      [-2.0, 140.1],
      [-3.8, 141.1],
      [-5.9, 139.2],
      [-6.5, 136.5],
      [-5.2, 133.5],
      [-3.9, 131.2],
    ];

    window.L.rectangle(
      INDONESIA_BOUNDS,
      {
        stroke: false,
        fillColor: "#eef3ea",
        fillOpacity: 0.96,
      },
    ).addTo(map);

    [sumatra, javaBali, kalimantan, sulawesi, papua].forEach((island) => {
      window.L.polygon(island, {
        color: "#9fb59a",
        weight: 1,
        fillColor: "#d9e8d0",
        fillOpacity: 0.92,
      }).addTo(map);
    });

    [
      [
        [3.6, 98.7],
        [-0.9, 104.5],
        [-6.2, 106.8],
        [-7.8, 110.4],
        [-7.3, 112.7],
        [-5.1, 119.4],
      ],
      [
        [-6.2, 106.8],
        [-0.0, 109.3],
        [-1.2, 116.9],
        [1.5, 124.8],
      ],
      [
        [-5.1, 119.4],
        [-3.7, 128.2],
        [-2.5, 140.7],
      ],
    ].forEach((path, idx) => {
      window.L.polyline(path, {
        color: idx === 0 ? "#8c968c" : "#a6aea6",
        weight: idx === 0 ? 4 : 3,
        opacity: 0.75,
      }).addTo(map);
    });
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

  function updateAreaScore(aqi, reportCount) {
    const normalizedAqi = Math.max(0, Math.min(220, Number(aqi || 0)));
    const reportPenalty = Math.min(30, Number(reportCount || 0) * 3);
    const score = Math.max(15, Math.round(100 - normalizedAqi * 0.35 - reportPenalty));

    if (areaScoreEl) areaScoreEl.textContent = String(score);
    if (areaScoreNote) {
      if (score >= 75) {
        areaScoreNote.textContent = "Area relatif sehat. Pertahankan transportasi rendah emisi.";
      } else if (score >= 55) {
        areaScoreNote.textContent = "Area butuh perbaikan bertahap melalui mobilitas hijau dan aksi warga.";
      } else {
        areaScoreNote.textContent = "Area prioritas tinggi. Perlu intervensi cepat dan pengurangan emisi harian.";
      }
    }
  }

  function getCommunityActivitiesForMap(cityName) {
    const raw = safeParse(localStorage.getItem(COMMUNITY_ACTIVITIES_KEY), []);
    if (!Array.isArray(raw) || raw.length === 0) return [];

    const cityCoord = CITIES[cityName] || CITIES.Jakarta;
    const cityPoint = { lat: cityCoord.lat, lng: cityCoord.lon };

    const normalized = raw
      .map((item) => {
        const lat = Number(item?.whereCoords?.lat);
        const lng = Number(item?.whereCoords?.lng);
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

        const dt = item?.datetime ? new Date(item.datetime) : null;
        const timeText =
          dt && !Number.isNaN(dt.getTime())
            ? dt.toLocaleString("id-ID", {
                day: "2-digit",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              })
            : "Waktu belum ditetapkan";

        return {
          id: item?.id || "",
          title: item?.title || "Kegiatan Warga",
          type: "Kegiatan Warga",
          lat,
          lng,
          detail: `${item?.what || "Aksi komunitas"} | ${timeText}`,
          participants: Number(item?.participants || 0),
          distanceKm: haversineDistanceKm({ lat, lng }, cityPoint),
        };
      })
      .filter(Boolean);

    if (!normalized.length) return [];

    const nearby = normalized.filter((item) => item.distanceKm <= 70);
    const picked = (nearby.length ? nearby : normalized)
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, 8);

    return picked.map((item) => ({
      ...item,
      source: "community_activity",
    }));
  }

  function initCommunityActionMap() {
    if (!communityActionMapEl || !window.L || communityMapState.map) return;

    const map = window.L.map(communityActionMapEl, {
      attributionControl: false,
      zoomControl: true,
      dragging: true,
      scrollWheelZoom: true,
      doubleClickZoom: true,
      touchZoom: true,
      boxZoom: true,
      keyboard: true,
      tap: true,
    }).setView([-2.5, 118], 5);

    if (!MOCK_MODE && !DUMMY_MAP_MODE) {
      window.L.tileLayer(MAP_TILE_SOURCES[0].url, {
        ...MAP_TILE_SOURCES[0].options,
        referrerPolicy: "strict-origin-when-cross-origin",
        crossOrigin: true,
      }).addTo(map);
    } else {
      paintDummyMapBase(map);
      map.fitBounds(INDONESIA_BOUNDS, { padding: [10, 10] });
    }

    communityMapState.map = map;
    communityMapState.layerGroup = window.L.layerGroup().addTo(map);
    setTimeout(() => map.invalidateSize(), 120);
  }

  function renderCommunityActionMap(cityName, topArea) {
    if (!communityActionMapEl || !window.L) return;
    initCommunityActionMap();
    if (!communityMapState.map || !communityMapState.layerGroup) return;

    const userActivities = getCommunityActivitiesForMap(cityName);
    const actions = [...userActivities];

    communityMapState.layerGroup.clearLayers();
    actions.forEach((item) => {
      const isCommunityActivity = item.source === "community_activity";
      const detailHref =
        isCommunityActivity && item.id
          ? `kegiatan.html#activity-${encodeURIComponent(item.id)}`
          : "kegiatan.html#activity-list";
      const popupHtml = isCommunityActivity
        ? `<strong>${item.title}</strong><br>${item.type}<br>${item.detail}<br>${item.participants} peserta<br><a class="map-detail-link" href="${detailHref}">Lihat Detail</a>`
            : `<strong>${item.title}</strong><br>${item.type}<br><a class="map-detail-link" href="${detailHref}">Lihat Detail</a>`;
      window.L.circleMarker([item.lat, item.lng], {
        radius: 6,
        color: isCommunityActivity ? "#1f4f8f" : "#2d5a27",
        fillColor: isCommunityActivity ? "#5f94d0" : "#73a567",
        fillOpacity: 0.92,
        weight: 1.2,
      })
        .bindPopup(popupHtml)
        .addTo(communityMapState.layerGroup);
    });

    if (DUMMY_MAP_MODE) {
      communityMapState.map.fitBounds(INDONESIA_BOUNDS, { padding: [10, 10] });
    } else {
      const bounds = window.L.latLngBounds(actions.map((item) => [item.lat, item.lng]));
      if (bounds.isValid()) {
        communityMapState.map.fitBounds(bounds, { padding: [22, 22], maxZoom: 13 });
      } else {
        communityMapState.map.setView([-2.5, 118], 5);
      }
    }
  }

  function updateWeeklyPlannerUI() {
    const state = getWeeklyPlanState();
    const target = Math.max(1, Number(state.targetKg || 10));
    const saved = Math.max(0, Number(state.savedKg || 0));
    const progressPct = Math.min(100, (saved / target) * 100);
    if (weeklyTarget && weeklyTarget.value !== String(target)) {
      weeklyTarget.value = String(target);
    }

    if (weeklyProgress) {
      weeklyProgress.style.width = `${progressPct.toFixed(1)}%`;
      weeklyProgress.parentElement?.setAttribute("aria-valuenow", String(Math.round(progressPct)));
    }

    if (weeklyStatus) {
      if (saved >= target) {
        weeklyStatus.textContent = `Target mingguan tercapai: ${saved.toFixed(2)} / ${target} kg CO2.`;
      } else {
        weeklyStatus.textContent = `Progress minggu ini: ${saved.toFixed(2)} / ${target} kg CO2.`;
      }
    }

    if (weeklyPlanList) {
      const remaining = Math.max(0, target - saved);
      weeklyPlanList.innerHTML = `
        <li>Target minggu ini: hemat ${target} kg CO2.</li>
        <li>Sisa menuju target: ${remaining.toFixed(2)} kg CO2.</li>
        <li>Tips cepat: pilih moda bus/carpool untuk rute menengah.</li>
      `;
    }
  }

  function pushWeeklyProgress(savedKg) {
    const state = getWeeklyPlanState();
    state.savedKg = Math.max(0, Number(state.savedKg || 0) + Math.max(0, Number(savedKg || 0)));
    saveWeeklyPlanState(state);
    updateWeeklyPlannerUI();
  }

  function renderLeaderboard() {
    if (!leaderboardList) return;
    const impact = getImpactState();
    const weekly = getWeeklyPlanState();

    const entries = [
      { name: "Kamu", score: Math.round(impact.actions * 5 + weekly.savedKg * 4) },
      { name: "Komunitas Hijau Timur", score: 126 },
      { name: "Eco Riders Selatan", score: 113 },
      { name: "Urban Tree Squad", score: 104 },
    ].sort((a, b) => b.score - a.score);

    leaderboardList.innerHTML = entries
      .map(
        (entry, idx) =>
          `<li><span class="leaderboard-rank">#${idx + 1}</span><span>${entry.name}</span><strong>${entry.score} pts</strong></li>`,
      )
      .join("");
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
    const ready = Boolean(mapState.from && mapState.to);
    if (simulateBtn) {
      simulateBtn.disabled = !ready;
      simulateBtn.title = ready ? "" : "Pilih titik asal dan tujuan di peta terlebih dahulu";
    }
  }

  function getWeekKey(date = new Date()) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const day = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 1 - day);
    return `${d.getUTCFullYear()}-W${String(Math.ceil((((d - new Date(Date.UTC(d.getUTCFullYear(), 0, 1))) / 86400000) + 1) / 7)).padStart(2, "0")}`;
  }

  function getWeeklyPlanState() {
    const defaultState = {
      weekKey: getWeekKey(),
      targetKg: Number(weeklyTarget?.value || 10),
      savedKg: 0,
    };
    const raw = localStorage.getItem(WEEKLY_PLAN_KEY);
    if (!raw) return defaultState;

    try {
      const state = { ...defaultState, ...JSON.parse(raw) };
      if (state.weekKey !== getWeekKey()) {
        return defaultState;
      }
      return state;
    } catch (_) {
      return defaultState;
    }
  }

  function saveWeeklyPlanState(state) {
    localStorage.setItem(WEEKLY_PLAN_KEY, JSON.stringify(state));
  }

  function syncModeDetailsByViewport() {
    if (!modeDetails) return;
    if (window.innerWidth >= 769) {
      modeDetails.setAttribute("open", "open");
    } else {
      modeDetails.removeAttribute("open");
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

    mapState.map = window.L.map(mapEl, { zoomControl: true }).setView([-2.5, 118], 5);
    if (!MOCK_MODE && !DUMMY_MAP_MODE) {
      mountTileLayer(0);
    } else {
      paintDummyMapBase(mapState.map);
      mapState.map.fitBounds(INDONESIA_BOUNDS, { padding: [10, 10] });
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

  async function resolveAndDrawRoute(from, to, modeForEta = "motor") {
    const realRoute = await fetchRealRoute(from, to);
    const distanceKm =
      realRoute && Number.isFinite(realRoute.distanceKm) && realRoute.distanceKm > 0
        ? realRoute.distanceKm
        : haversineDistanceKm(from, to);
    const etaMinutes = estimateEtaMinutes(distanceKm, modeForEta, realRoute?.durationMin);

    if (mapState.routeLine && mapState.map) {
      mapState.map.removeLayer(mapState.routeLine);
      mapState.routeLine = null;
    }

    if (mapState.map && window.L) {
      const latlngs =
        realRoute && Array.isArray(realRoute.geometry) && realRoute.geometry.length > 1
          ? realRoute.geometry
          : [
              [from.lat, from.lng],
              [to.lat, to.lng],
            ];

      mapState.routeLine = window.L.polyline(latlngs, {
        color: "#2d5a27",
        weight: 4,
        opacity: 0.9,
      }).addTo(mapState.map);

      mapState.map.fitBounds(mapState.routeLine.getBounds(), { padding: [40, 40] });
    }

    return { realRoute, distanceKm, etaMinutes };
  }

  function renderModeComparison(distanceKm, tripsPerWeek, routeDurationMin = null) {
    if (!modeComparison) return;

    const roundTripKm = distanceKm * 2;
    const emissionByMode = Object.entries(MODE_FACTORS).map(([key, mode]) => {
      const kg = (mode.factor * roundTripKm * tripsPerWeek) / 1000;
      const etaMin = estimateEtaMinutes(distanceKm, key, routeDurationMin);
      return { key, ...mode, kg, etaMin };
    });

    const rows = emissionByMode.sort((a, b) => a.kg - b.kg);
    const maxKg = Math.max(...rows.map((item) => item.kg), 1);

    modeComparison.innerHTML = rows
      .map((item) => {
        const width = Math.max(2, (item.kg / maxKg) * 100);

        return `
          <div class="mode-row">
            <small>${item.label}</small>
            <div class="mode-bar-wrap">
              <div class="mode-bar" data-width="${width.toFixed(1)}" style="background:${item.color}"></div>
            </div>
            <div class="mode-value">${item.kg.toFixed(2)} kg <span>${formatEta(item.etaMin)}</span></div>
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
        action: "Kurangi perjalanan jam 11.00-14.00",
      });
    } else {
      items.push({
        title: "Waktu Tepat untuk Mobilitas Hijau",
        desc: "Kualitas udara cukup baik. Jadwalkan jalan kaki atau bersepeda untuk perjalanan pendek.",
        chip: "Good Air Window",
        action: "Pilih rute hijau untuk jarak <2 km",
      });
    }

    if (context.savedKg > 0) {
      items.push({
        title: "Pertahankan Mode Alternatif",
        desc: `Pilihanmu berpotensi menekan emisi ${context.savedKg.toFixed(2)} kg CO2 per minggu. Konsisten 1 bulan akan berdampak besar.`,
        chip: "Behavior Shift",
        action: "Ulangi mode ini minimal 3 hari ke depan",
      });
    } else {
      items.push({
        title: "Optimalkan Mode Perjalanan",
        desc: "Coba mode dengan emisi lebih rendah untuk rute ini agar penghematan karbon lebih terasa.",
        chip: "Optimization",
        action: "Coba bus/carpool untuk perjalanan berikutnya",
      });
    }

    if (context.priorityArea.count >= 3) {
      items.push({
        title: "Aktivasi Aksi Komunitas Lokal",
        desc: `Area ${context.priorityArea.area} sedang padat laporan. Ajak komunitas lokal untuk aksi akhir pekan ini.`,
        chip: "Community Action",
        action: "Buat agenda aksi komunitas akhir pekan",
      });
    }

    recGrid.innerHTML = items
      .slice(0, 4)
      .map(
        (item) => `
          <article class="card recommendation-card fade-up visible">
            <h3>${item.title}</h3>
            <p>${item.desc}</p>
            <p class="recommendation-action">Aksi cepat: <strong>${item.action}</strong></p>
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
    if (aqiCityNote) aqiCityNote.textContent = city;
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
    updateAreaScore(air.aqi, topArea.count);
    renderCommunityActionMap(city, topArea);

    return {
      city,
      aqi: air.aqi,
      air,
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
    renderLeaderboard();
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

    if (MOCK_MODE || DUMMY_MAP_MODE) {
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

  weeklyTarget?.addEventListener("change", () => {
    const state = getWeeklyPlanState();
    state.targetKg = Number(weeklyTarget.value || 10);
    saveWeeklyPlanState(state);
    updateWeeklyPlannerUI();
    renderLeaderboard();
  });

  document.getElementById("export-png-btn")?.addEventListener("click", () => {
    exportSummaryPng();
  });

  document.getElementById("export-pdf-btn")?.addEventListener("click", () => {
    window.print();
  });

  form?.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!mapState.from || !mapState.to) {
      setEmptyMessage("Pilih titik asal dan tujuan dulu di peta, lalu klik hitung.");
      emptyCard?.classList.remove("hidden");
      resultCard?.classList.add("hidden");
      return;
    }

    const from = mapState.from;
    const to = mapState.to;
    const selectedMode = modeSelect?.value || "motor";
    const tripsPerWeek = Math.max(1, Number(tripsWeek?.value || 10));

    setButtonLoading(simulateBtn, true, "Menghitung...");
    try {
      const { realRoute, distanceKm, etaMinutes } = await resolveAndDrawRoute(
        from,
        to,
        selectedMode,
      );

      const simResult = simulateMobility({
        distanceKm,
        tripsPerWeek,
        selectedMode,
      });

      emptyCard?.classList.add("hidden");
      resultCard?.classList.remove("hidden");
      resultCard?.scrollIntoView({ behavior: "smooth", block: "start" });

      if (routeDistanceEl) routeDistanceEl.textContent = distanceKm.toFixed(2);
      if (routeEtaEl) routeEtaEl.textContent = formatEta(etaMinutes);
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
        const routeBasis = realRoute ? "rute jalan nyata" : "estimasi garis lurus";
        simulationInsight.textContent =
          `Jarak ${routeBasis} sekitar ${distanceKm.toFixed(2)} km dengan estimasi waktu ${formatEta(etaMinutes)}. Jika memakai ${selectedLabel} sebanyak ${tripsPerWeek}x pulang-pergi/minggu, emisi diperkirakan ${simResult.selectedKg.toFixed(2)} kg CO2.`;
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

      renderModeComparison(distanceKm, tripsPerWeek, realRoute?.durationMin || null);
      pushImpactFromSimulation(simResult.savedKg);
      pushWeeklyProgress(simResult.savedKg);

      const nearestCity = nearestCityFromPoints(mapState.from, mapState.to);
      if (dashboardCitySelect) dashboardCitySelect.value = nearestCity;

      const context = await updateDashboardByCity(nearestCity, simResult);
      renderRecommendations({ ...context, savedKg: simResult.savedKg });
    } finally {
      setButtonLoading(simulateBtn, false);
    }
  });

  (async function init() {
    hydrateCaches();
    initMap();
    syncModeDetailsByViewport();
    window.addEventListener("resize", syncModeDetailsByViewport);
    updatePointLabels();
    setEmptyMessage("Klik peta untuk memilih asal dan tujuan perjalanan.");

    updateImpactUI();
    updateWeeklyPlannerUI();
    renderLeaderboard();

    const initialCity = dashboardCitySelect?.value || "Jakarta";
    const context = await updateDashboardByCity(initialCity);

    if (heroSaving) heroSaving.textContent = "Belum ada";
    if (context.priorityArea.count === 0 && heroInsightText) {
      heroInsightText.textContent =
        "Mulai dengan klik peta untuk menentukan asal dan tujuan. Kami hitungkan emisinya secara otomatis.";
    }
  })();
});
