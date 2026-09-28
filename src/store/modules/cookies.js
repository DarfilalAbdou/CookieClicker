let productionTimer;
const speedBoostCost = 250;
const speedBoostDuration = 30;

const upgradeCatalog = [
  {
    id: "click",
    name: "Click",
    baseCost: 25,
    production: 1,
  },
  {
    id: "grandma",
    name: "Grandma",
    baseCost: 120,
    production: 5,
  },
  {
    id: "factory",
    name: "Cookie factory",
    baseCost: 550,
    production: 20,
  },
];

const state = () => ({
  cookies: 0,
  autoProduction: 0,
  speedBoostSeconds: 0,
  upgrades: upgradeCatalog.map((upgrade) => ({...upgrade, level: 0})),
});

const getters = {
  cookieCount: (state) => state.cookies,
  speedBoostCost: () => speedBoostCost,
  speedBoostSeconds: (state) => state.speedBoostSeconds,
  availableUpgrades: (state) =>
    state.upgrades.map((upgrade) => ({
      ...upgrade,
      cost: Math.floor(upgrade.baseCost * Math.pow(1.15, upgrade.level)),
    })),
  canAfford: (state) => (upgrade) => state.cookies >= upgrade.cost,
};

const mutations = {
  loadGame(state, game) {
    if (!game) return;
    state.cookies = game.cookies;
    state.autoProduction = game.autoProduction;
    state.speedBoostSeconds = game.speedBoostSeconds || 0;
    state.upgrades = game.upgrades;
  },
  resetGame(state) {
    state.cookies = 0;
    state.autoProduction = 0;
    state.speedBoostSeconds = 0;
    state.upgrades = upgradeCatalog.map((upgrade) => ({...upgrade, level: 0}));
  },
  addCookies(state, amount = 1) {
    state.cookies += amount;
  },
  buySpeedBoost(state) {
    if (state.cookies < speedBoostCost) return;

    state.cookies -= speedBoostCost;
    state.speedBoostSeconds = speedBoostDuration;
  },
  tickSpeedBoost(state) {
    if (state.speedBoostSeconds > 0) state.speedBoostSeconds -= 1;
  },
  buyUpgrade(state, upgradeId) {
    const upgrade = state.upgrades.find((item) => item.id === upgradeId);
    if (!upgrade) return;

    const cost = Math.floor(upgrade.baseCost * Math.pow(1.15, upgrade.level));
    if (state.cookies < cost) return;

    state.cookies -= cost;
    upgrade.level += 1;
    state.autoProduction += upgrade.production;
  },
};

const actions = {
  clickCookie({state, commit, dispatch}) {
    const multiplier = state.speedBoostSeconds > 0 ? 2 : 1;
    commit("addCookies", multiplier);
    dispatch("auth/saveGame", null, {root: true});
  },
  buyUpgrade({commit, dispatch}, upgradeId) {
    commit("buyUpgrade", upgradeId);
    dispatch("auth/saveGame", null, {root: true});
  },
  buySpeedBoost({commit, dispatch}) {
    commit("buySpeedBoost");
    dispatch("auth/saveGame", null, {root: true});
  },
  startAutoProduction({dispatch}) {
    if (productionTimer) return;
    productionTimer = window.setInterval(() => {
      dispatch("produceAutomatically");
    }, 1000);
  },
  stopAutoProduction() {
    window.clearInterval(productionTimer);
    productionTimer = undefined;
  },
  produceAutomatically({state, commit, dispatch}) {
    const boostWasActive = state.speedBoostSeconds > 0;
    if (state.autoProduction > 0) {
      const multiplier = boostWasActive ? 2 : 1;
      commit("addCookies", state.autoProduction * multiplier);
    }
    if (boostWasActive) commit("tickSpeedBoost");
    if (state.autoProduction > 0 || boostWasActive) {
      dispatch("auth/saveGame", null, {root: true});
    }
  },
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};
