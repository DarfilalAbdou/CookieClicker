const USERS_KEY = "cookie-clicker-users";
const SESSION_KEY = "cookie-clicker-session";

const readUsers = () => {
  const savedUsers = window.localStorage.getItem(USERS_KEY);
  return savedUsers ? JSON.parse(savedUsers) : {};
};

const readSession = () => window.localStorage.getItem(SESSION_KEY) || "";

const writeUsers = (users) => {
  window.localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export default {
  namespaced: true,
  state: () => ({
    users: readUsers(),
    currentUser: readSession(),
    error: "",
  }),
  getters: {
    isLoggedIn: (state) => Boolean(state.currentUser),
    currentUser: (state) => state.currentUser,
    error: (state) => state.error,
  },
  mutations: {
    setError(state, error) {
      state.error = error;
    },
    setCurrentUser(state, username) {
      state.currentUser = username;
      if (username) {
        window.localStorage.setItem(SESSION_KEY, username);
      } else {
        window.localStorage.removeItem(SESSION_KEY);
      }
    },
    registerUser(state, {username, password, game}) {
      state.users[username] = {password, game};
      writeUsers(state.users);
    },
    saveGame(state, game) {
      if (!state.currentUser || !state.users[state.currentUser]) return;
      state.users[state.currentUser].game = game;
      writeUsers(state.users);
    },
  },
  actions: {
    restoreSession({state, commit, dispatch}) {
      const user = state.users[state.currentUser];
      if (!user) {
        commit("setCurrentUser", "");
        return;
      }

      commit("cookies/loadGame", user.game, {root: true});
      dispatch("cookies/startAutoProduction", null, {root: true});
    },
    register({state, commit, rootState, dispatch}, {username, password}) {
      const cleanUsername = username.trim();
      if (!cleanUsername || !password) {
        commit("setError", "Username and password are required.");
        return false;
      }
      if (state.users[cleanUsername]) {
        commit("setError", "This username already exists.");
        return false;
      }

      commit("registerUser", {
        username: cleanUsername,
        password,
        game: JSON.parse(JSON.stringify(rootState.cookies)),
      });
      commit("setCurrentUser", cleanUsername);
      commit("setError", "");
      commit("cookies/loadGame", state.users[cleanUsername].game, {root: true});
      dispatch("cookies/startAutoProduction", null, {root: true});
      return true;
    },
    login({state, commit, dispatch}, {username, password}) {
      const user = state.users[username.trim()];
      if (!user || user.password !== password) {
        commit("setError", "Wrong username or password.");
        return false;
      }

      commit("setCurrentUser", username.trim());
      commit("setError", "");
      commit("cookies/loadGame", user.game, {root: true});
      dispatch("cookies/startAutoProduction", null, {root: true});
      return true;
    },
    saveGame({state, commit, rootState}) {
      if (state.currentUser) {
        commit("saveGame", JSON.parse(JSON.stringify(rootState.cookies)));
      }
    },
    logout({commit, dispatch}) {
      dispatch("saveGame");
      dispatch("cookies/stopAutoProduction", null, {root: true});
      commit("cookies/resetGame", null, {root: true});
      commit("setCurrentUser", "");
      commit("setError", "");
    },
  },
};
