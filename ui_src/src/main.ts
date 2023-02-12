import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";

import "./assets/pico.min.css";
import "./assets/extend.css";
const app = createApp(App);

app.use(router);

app.mount("#app");
