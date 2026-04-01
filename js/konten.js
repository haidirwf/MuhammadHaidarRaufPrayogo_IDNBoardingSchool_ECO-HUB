document.addEventListener("DOMContentLoaded", () => {
  /* -----------------------------------------------------
       ARTICLE DATA & FILTER
       ----------------------------------------------------- */
  const articles = [
    {
      id: 1,
      title: "Mengapa Jakarta Masuk 10 Kota Polusi Terburuk?",
      category: "Polusi Udara",
      author: "Rizky P",
      date: "15 Feb 2026",
      thumbColor: "#E8F5E9",
      wikiTopic: "Pencemaran_udara",
      imgUrl:
        "https://images.unsplash.com/photo-1698128827557-0b05ccb18fbf?auto=format&fit=crop&q=80&w=600",
    },
    {
      id: 2,
      title: "Cara Kerja PLTS dan Masa Depan Energi Terbarukan",
      category: "Perubahan Iklim",
      author: "Sarah A",
      date: "14 Feb 2026",
      thumbColor: "#FFF3E0",
      wikiTopic: "Energi_surya",
      imgUrl:
        "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&q=80&w=600",
    },
    {
      id: 3,
      title: "Hutan Mangrove: Benteng Terakhir Pesisir Indonesia",
      category: "Konservasi",
      author: "Budi T",
      date: "12 Feb 2026",
      thumbColor: "#E1F5FE",
      wikiTopic: "Hutan_bakau",
      imgUrl:
        "https://images.unsplash.com/photo-1589556183130-530470785fab?auto=format&fit=crop&q=80&w=600",
    },
    {
      id: 4,
      title: "Bahaya Mikroplastik di Makanan Kita",
      category: "Polusi Laut",
      author: "Dina M",
      date: "10 Feb 2026",
      thumbColor: "#FBE9E7",
      wikiTopic: "Mikroplastik",
      imgUrl:
        "https://images.unsplash.com/photo-1621451537084-482c73073a0f?auto=format&fit=crop&q=80&w=600",
    },
    {
      id: 5,
      title: "Tips Mengolah Kompos di Rumah Sempit",
      category: "Pengelolaan Sampah",
      author: "Eco Team",
      date: "09 Feb 2026",
      thumbColor: "#F3E5F5",
      wikiTopic: "Kompos",
      imgUrl:
        "https://images.unsplash.com/photo-1644575881028-9f170fd241ed?auto=format&fit=crop&q=80&w=600",
    },
    {
      id: 6,
      title: "El Nino dan La Nina: Apa Bedanya?",
      category: "Perubahan Iklim",
      author: "BMKG Info",
      date: "08 Feb 2026",
      thumbColor: "#FFF3E0",
      wikiTopic: "El_Niño",
      imgUrl:
        "https://images.unsplash.com/photo-1549885606-bbc17accf949?auto=format&fit=crop&q=80&w=600",
    },
    {
      id: 7,
      title: "5 Tanaman Pembersih Udara Ruangan",
      category: "Polusi Udara",
      author: "Green Decor",
      date: "05 Feb 2026",
      thumbColor: "#E8F5E9",
      wikiTopic: "Tanaman_hias",
      imgUrl:
        "https://images.unsplash.com/photo-1600411833196-7c1f6b1a8b90?auto=format&fit=crop&q=80&w=600",
    },
    {
      id: 8,
      title: "Mengenal 'Carbon Offsetting' Lebih Dekat",
      category: "Perubahan Iklim",
      author: "Eco Hub",
      date: "03 Feb 2026",
      thumbColor: "#FFF3E0",
      wikiTopic: "Perdagangan_emisi",
      imgUrl:
        "https://images.unsplash.com/photo-1598335624134-5bceb5de202d?auto=format&fit=crop&q=80&w=600",
    },
    {
      id: 9,
      title: "Mengapa Penyu Makan Plastik?",
      category: "Polusi Laut",
      author: "Marine Bio",
      date: "01 Feb 2026",
      thumbColor: "#E1F5FE",
      wikiTopic: "Penyu",
      imgUrl:
        "https://images.unsplash.com/photo-1549557143-90d216195a97?auto=format&fit=crop&q=80&w=600",
    },
    {
      id: 10,
      title: "Zero Waste Living: Mulai dari Mana?",
      category: "Pengelolaan Sampah",
      author: "Siska W",
      date: "28 Jan 2026",
      thumbColor: "#F3E5F5",
      wikiTopic: "Nirlimbah",
      imgUrl:
        "https://images.unsplash.com/photo-1645739467767-ee1ea618d36c?auto=format&fit=crop&q=80&w=600",
    },
    {
      id: 11,
      title: "Konservasi Orangutan Kalimantan",
      category: "Konservasi",
      author: "WWF Partner",
      date: "25 Jan 2026",
      thumbColor: "#E1F5FE",
      wikiTopic: "Orangutan",
      imgUrl:
        "https://images.unsplash.com/photo-1699709823274-f3cb659b640b?auto=format&fit=crop&q=80&w=600",
    },
    {
      id: 12,
      title: "Dampak Fast Fashion pada Lingkungan",
      category: "Pengelolaan Sampah",
      author: "Fashion Rev",
      date: "20 Jan 2026",
      thumbColor: "#F3E5F5",
      wikiTopic: "Fesyen_cepat",
      imgUrl:
        "https://images.unsplash.com/photo-1495556650867-99590cea3657?auto=format&fit=crop&q=80&w=600",
    },
  ];

  const grid = document.getElementById("articles-grid");
  const noResults = document.getElementById("no-results");
  const searchInput = document.getElementById("search-input");
  const filterPills = document.querySelectorAll(".filter-pill");

  let activeCategory = "Semua";
  let searchQuery = "";

  function renderArticles() {
    if (!grid) return;

    // Filter logic
    const filtered = articles.filter((art) => {
      const matchCat =
        activeCategory === "Semua" || art.category === activeCategory;
      const matchSearch =
        art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        art.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });

    if (filtered.length === 0) {
      grid.classList.add("hidden");
      noResults.classList.remove("hidden");
    } else {
      grid.classList.remove("hidden");
      noResults.classList.add("hidden");

      grid.innerHTML = filtered
        .map(
          (art) => `
                <a href="artikel.html?q=${art.wikiTopic || "Lingkungan_hidup"}&title=${encodeURIComponent(art.title)}&img=${encodeURIComponent(art.imgUrl)}" class="article-item fade-up" style="text-decoration: none; color: inherit;">
                    <div class="article-thumb" style="height: 180px; background-image: url('${art.imgUrl}'); background-size: cover; background-position: center;"></div>
                    <div class="article-body">
                        <span class="article-cat">${art.category}</span>
                        <h3>${art.title}</h3>
                        <p class="article-excerpt">Klik untuk membaca artikel selengkapnya tentang ${art.title} yang bersumber dari ensiklopedia bebas.</p>
                        <div class="article-footer">
                            <span>${art.author} • ${art.date}</span>
                            <button class="bookmark-btn"><i class="fas fa-bookmark" size="16"></i></button>
                        </div>
                    </div>
                </a>
            `,
        )
        .join("");

      // Re-init generic fade-up observer for new elements?

      // Simple animation trigger for new items
      setTimeout(() => {
        document.querySelectorAll(".article-item").forEach((el, i) => {
          setTimeout(() => el.classList.add("visible"), i * 50);
        });
      }, 50);
    }
  }

  // Event Listeners for Filters
  filterPills.forEach((pill) => {
    pill.addEventListener("click", () => {
      filterPills.forEach((p) => p.classList.remove("active"));
      pill.classList.add("active");
      activeCategory = pill.getAttribute("data-category");
      renderArticles();
    });
  });

  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      searchQuery = e.target.value;
      renderArticles();
    });
  }

  // Initial Render
  renderArticles();

  /* -----------------------------------------------------
       ECOFACT WIDGET
       ----------------------------------------------------- */
  const facts = [
    "Setiap tahun, 8 juta ton plastik berakhir di lautan kita.",
    "Satu pohon dewasa dapat menyerap 22kg CO2 per tahun.",
    "Daur ulang satu kaleng aluminium menghemat energi untuk menyalakan TV selama 3 jam.",
    "Hutan hujan Amazon menghasilkan 20% oksigen dunia.",
  ];

  const factText = document.getElementById("ecofact-text");
  const shareFactBtn = document.getElementById("share-fact");

  if (factText) {
    const randomFact = facts[Math.floor(Math.random() * facts.length)];
    factText.innerText = `"${randomFact}"`; // Add quotes

    shareFactBtn.addEventListener("click", () => {
      navigator.clipboard.writeText(randomFact).then(() => {
        const originalText = shareFactBtn.innerHTML;
        shareFactBtn.innerHTML = '<i class="fas fa-check"></i> Tersalin!';
        setTimeout(() => {
          shareFactBtn.innerHTML = originalText;
        }, 2000);
      });
    });
  }

  /* -----------------------------------------------------
       QUIZ WIDGET
       ----------------------------------------------------- */
  const quizData = [
    {
      q: "Berapa lama waktu yang dibutuhkan plastik untuk terurai?",
      opts: ["10 tahun", "100 tahun", "450 tahun", "1000 tahun"],
      a: 2, // Index of correct
      expl: "Plastik butuh ~450 tahun. Jangan buang sembarangan!",
    },
    {
      q: "Gas rumah kaca manakah yang paling banyak dihasilkan aktivitas manusia?",
      opts: ["Metana", "Karbon Dioksida", "Ozon", "Nitrogen Oksida"],
      a: 1,
      expl: "CO2 adalah penyumbang terbesar pemanasan global.",
    },
    {
      q: "Manakah yang BUKAN sumber energi terbarukan?",
      opts: ["Angin", "Matahari", "Batubara", "Air"],
      a: 2,
      expl: "Batubara adalah bahan bakar fosil yang terbatas.",
    },
    {
      q: "Apa sebutan untuk proses pengolahan limbah organik menjadi pupuk?",
      opts: ["Daur ulang", "Reduksi", "Kompos", "Insitu"],
      a: 2,
      expl: "Pengomposan mengubah sisa organik menjadi nutrisi tanah.",
    },
    {
      q: "Hari Lingkungan Hidup Sedunia diperingati setiap tanggal?",
      opts: ["22 April", "5 Juni", "10 Januari", "1 Desember"],
      a: 1,
      expl: "5 Juni adalah World Environment Day sejak 1974.",
    },
  ];

  let currentQ = 0;
  let score = 0;

  const quizContainer = document.getElementById("quiz-container");
  const startStep = document.getElementById("quiz-start");
  const qStep = document.getElementById("quiz-question");
  const rStep = document.getElementById("quiz-result");

  // Elements
  const qText = document.getElementById("question-text");
  const optsContainer = document.getElementById("options-container");
  const feedbackArea = document.getElementById("feedback-area");
  const feedbackText = document.getElementById("feedback-text");
  const slideBtn = document.getElementById("next-q-btn");
  const progressBar = document.getElementById("quiz-progress");

  // Start
  const startBtn = document.getElementById("start-quiz-btn");
  if (startBtn) {
    startBtn.addEventListener("click", () => {
      startStep.classList.remove("active");
      qStep.classList.add("active");
      loadQuestion();
    });
  }

  function loadQuestion() {
    const data = quizData[currentQ];
    qText.innerText = `${currentQ + 1}. ${data.q}`;

    // Progress
    const prog = (currentQ / quizData.length) * 100;
    progressBar.style.width = `${prog}%`;

    // Reset state
    optsContainer.innerHTML = "";
    feedbackArea.classList.add("hidden");

    data.opts.forEach((opt, idx) => {
      const btn = document.createElement("div");
      btn.className = "quiz-option";
      btn.innerText = opt;
      btn.addEventListener("click", () => handleAnswer(idx, btn));
      optsContainer.appendChild(btn);
    });
  }

  function handleAnswer(selectedIndex, btnElement) {
    // Disable all clicks
    const allOpts = optsContainer.querySelectorAll(".quiz-option");
    allOpts.forEach((b) => (b.style.pointerEvents = "none"));

    const data = quizData[currentQ];
    const isCorrect = selectedIndex === data.a;

    if (isCorrect) {
      btnElement.classList.add("correct");
      score++;
      feedbackText.innerText = "Benar! " + data.expl;
      feedbackText.style.color = "var(--color-green-primary)";
    } else {
      btnElement.classList.add("wrong");
      // Highlight correct one
      allOpts[data.a].classList.add("correct");
      feedbackText.innerText = "Salah. " + data.expl;
      feedbackText.style.color = "var(--color-red-alert)";
    }

    feedbackArea.classList.remove("hidden");

    // Setup next button logic
    // Remove old listeners to be safe (recreation method is safer but quick hack:)
    slideBtn.onclick = () => {
      currentQ++;
      if (currentQ < quizData.length) {
        loadQuestion();
      } else {
        showResult();
      }
    };
  }

  function showResult() {
    qStep.classList.remove("active");
    rStep.classList.add("active");

    document.getElementById("score-val").innerText = score;
    const msg = document.getElementById("score-msg");
    const title = document.getElementById("score-title");

    if (score === 5) {
      title.innerText = "Pahlawan Bumi! 🌍";
      msg.innerText = "Sempurna! Pengetahuanmu luar biasa.";
    } else if (score >= 3) {
      title.innerText = "Penjaga Hijau! 🌿";
      msg.innerText = "Bagus! Kamu cukup paham tentang lingkungan.";
    } else {
      title.innerText = "Pemula Lingkungan 🌱";
      msg.innerText = "Terus belajar untuk bumi yang lebih baik!";
    }
  }

  // Restart
  const restartBtn = document.getElementById("restart-quiz-btn");
  if (restartBtn) {
    restartBtn.addEventListener("click", () => {
      currentQ = 0;
      score = 0;
      rStep.classList.remove("active");
      qStep.classList.add("active");
      loadQuestion();
    });
  }
});

