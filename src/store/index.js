import {createStore} from "vuex";
import cookies from "./modules/cookies";
import auth from "./modules/auth";

export default createStore({
  modules: {
    cookies,
    auth,
  },
});
