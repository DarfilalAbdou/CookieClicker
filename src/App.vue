<script setup>
import { computed,onMounted,onUnmounted,ref } from "vue";
import { useStore } from "vuex";

const store=useStore();
const username = ref("");
const password=ref("");
const authMode =ref("login");

const cookies=computed(() => store.getters["cookies/cookieCount"]);
const upgrades = computed(() => store.getters["cookies/availableUpgrades"]);
const speedBoostCost = computed(() => store.getters["cookies/speedBoostCost"]);
const speedBoostSeconds = computed(() => store.getters["cookies/speedBoostSeconds"]);
const loggedIn =computed(() => store.getters["auth/isLoggedIn"]);
const currentUser = computed(() => store.getters["auth/currentUser"]);
const authError = computed(() => store.getters["auth/error"]);

const formatNumber=(value) => new Intl.NumberFormat("en-US").format(value);
const canBuy = (upgrade) => store.getters["cookies/canAfford"](upgrade);

const submitAuth = async () => {
  const action = authMode.value === "login" ? "auth/login" : "auth/register";
  const success = await store.dispatch(action, {
    username: username.value,
    password: password.value,
  });

  if (success) {
    password.value = "";
  }
};

const logout = () => store.dispatch("auth/logout");

onMounted(() => store.dispatch("auth/restoreSession"));
onUnmounted(() => store.dispatch("cookies/stopAutoProduction"));
</script>

<template>
  <main class="app-shell">
    <section v-if="!loggedIn" class="auth-box">
      <h1>Cookie Clicker</h1>
      <p>{{ authMode === "login" ? "Log in" : "Create account" }}</p>

      <form @submit.prevent="submitAuth">
        <input
          v-model="username"
          type="text"
          placeholder="username"
          autocomplete="username"
        />
        <input
          v-model="password"
          type="password"
          placeholder="password"
          autocomplete="current-password"
        />
        <button type="submit">
          {{ authMode === "login" ? "Log in" : "Register" }}
        </button>
      </form>

      <p v-if="authError" class="error">{{ authError }}</p>
      <button
        type="button"
        @click="authMode = authMode === 'login' ? 'register' : 'login'"
      >
        {{ authMode === "login" ? "Create an account" : "Back to login" }}
      </button>
    </section>

    <section v-else>
      <p>user: {{ currentUser }}</p>
      <button type="button" @click="logout">Log out</button>

      <p class="cookie-count">{{ formatNumber(cookies) }}</p>
      <button
        class="cookie-button"
        type="button"
        aria-label="Add one cookie"
        @click="store.dispatch('cookies/clickCookie')"
      >
        cookie
      </button>

      <div class="upgrade-list">
        <button
          v-for="upgrade in upgrades"
          :key="upgrade.id"
          class="upgrade-row"
          type="button"
          :disabled="!canBuy(upgrade)"
          @click="store.dispatch('cookies/buyUpgrade', upgrade.id)"
        >
          {{ upgrade.name }} ({{ upgrade.level }}) -
          {{ formatNumber(upgrade.cost) }} cookies
        </button>
      </div>

      <p v-if="speedBoostSeconds > 0" class="boost-status">
        2x speed active: {{ speedBoostSeconds }}s
      </p>
      <button
        class="upgrade-row"
        type="button"
        :disabled="cookies < speedBoostCost"
        @click="store.dispatch('cookies/buySpeedBoost')"
      >
        Buy 2x speed for 30 seconds - {{ formatNumber(speedBoostCost) }} cookies
      </button>
    </section>
  </main>
</template>
