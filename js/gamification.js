// Gamification and EcoPoints System
const GAMIFICATION_KEY = "Eco-Hub_gamification";

const DEFAULT_STATE = {
  points: 0,
  level: 1,
  reports: 0,
  carbonCalculations: 0,
  badges: [],
};

function getGamificationState() {
  const saved = localStorage.getItem(GAMIFICATION_KEY);
  return saved ? JSON.parse(saved) : { ...DEFAULT_STATE };
}

function saveGamificationState(state) {
  localStorage.setItem(GAMIFICATION_KEY, JSON.stringify(state));
  initProfileUI();
}

window.addEcoPoints = function (points, reason) {
  const state = getGamificationState();
  state.points += points;

  // Level up logic (1 level per 50 points)
  const newLevel = Math.floor(state.points / 50) + 1;
  let leveledUp = false;
  if (newLevel > state.level) {
    state.level = newLevel;
    leveledUp = true;
  }

  saveGamificationState(state);
  showPwaToast(`+${points} Poin: ${reason}`, "star");

  if (leveledUp) {
    setTimeout(
      () => showPwaToast(`🎉 Naik Level ${state.level}!`, "award"),
      1500,
    );
  }
};

window.showPwaToast = function (message, iconName = "check-circle") {
  const toast = document.createElement("div");
  toast.className = "eco-toast";
  toast.innerHTML = `<i data-lucide="${iconName}" size="18"></i> <span>${message}</span>`;
  document.body.appendChild(toast);

  if (window.lucide) window.lucide.createIcons({ root: toast });

  requestAnimationFrame(() => {
    toast.classList.add("show");
  });

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 400);
  }, 4000);
};

function initProfileUI() {
  const state = getGamificationState();

  // Check if widget already exists
  let widget = document.getElementById("eco-profile-widget");
  if (!widget) {
    widget = document.createElement("div");
    widget.id = "eco-profile-widget";
    document.body.appendChild(widget);

    // Modal for showing details
    widget.addEventListener("click", showGamificationModal);
  }

  widget.innerHTML = `
        <div class="eco-badge-ui">
            <i data-lucide="award" size="24"></i>
            <div class="eco-info">
                <span class="eco-level">Lvl ${state.level}</span>
                <span class="eco-pts">${state.points} Pts</span>
            </div>
        </div>
    `;
  if (window.lucide) window.lucide.createIcons({ root: widget });
}

function showGamificationModal() {
  const state = getGamificationState();
  let modal = document.getElementById("gami-modal");

  if (!modal) {
    modal = document.createElement("div");
    modal.id = "gami-modal";
    modal.className = "gami-modal-overlay";
    document.body.appendChild(modal);

    modal.addEventListener("click", (e) => {
      // Close if clicking outside the card or on the close button
      if (e.target === modal || e.target.closest(".gami-modal-close")) {
        modal.classList.remove("open");
      }
    });
  }

  // Update content dynamically
  modal.innerHTML = `
      <div class="gami-modal-card">
          <button class="gami-modal-close"><i data-lucide="x" size="24"></i></button>
          <h3>Profil Eco Warrior</h3>
          <div class="gami-stats-grid">
              <div class="gami-stat">
                  <h4>Level</h4>
                  <div class="gami-val">${state.level}</div>
              </div>
              <div class="gami-stat">
                  <h4>Total Poin</h4>
                  <div class="gami-val">${state.points} <i data-lucide="zap" size="16"></i></div>
              </div>
              <div class="gami-stat">
                  <h4>Target Next</h4>
                  <div class="gami-val">${state.level * 50 - state.points} Pts Lagi</div>
              </div>
          </div>
          <h4 style="margin-top:24px;margin-bottom:12px;">Pencapaian</h4>
          <div class="gami-badges">
              <div class="gami-badge active">
                  <i data-lucide="sprout" size="24"></i>
                  <span>Pemula</span>
              </div>
              <div class="gami-badge ${state.points >= 50 ? "active" : "locked"}">
                  <i data-lucide="leaf" size="24"></i>
                  <span>Aktivis</span>
              </div>
              <div class="gami-badge ${state.points >= 150 ? "active" : "locked"}">
                  <i data-lucide="tree-pine" size="24"></i>
                  <span>Penjaga Bumi</span>
              </div>
          </div>
      </div>
  `;

  if (window.lucide) window.lucide.createIcons({ root: modal });

  // Trigger reflow & open
  requestAnimationFrame(() => modal.classList.add("open"));
}

document.addEventListener("DOMContentLoaded", initProfileUI);
