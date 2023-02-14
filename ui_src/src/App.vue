<script setup lang="ts">
import { RouterLink, RouterView } from "vue-router";
import OrderPreview from "./components/OrderPreview.vue";
import ServerMessage from "./components/ServerMessageDialog.vue";
import ServerMessageDialogDivArray from "./components/ServerMessageDialogDivArray.vue";
</script>

<template>
  <!-- <ServerMessage  /> -->
  <dialog :open="!service_ok">
    <article>
      Something went wrong on our side. It's ok will fix it soon!
    </article>
  </dialog>
  
  <main class="container">
    <nav>
      <ul>
        <li>
          <div><b>EXTRA-<br />ORDINALS</b></div>
        </li>
        <li>|</li>
        <li>
          <RouterLink to="/">Create</RouterLink>
        </li>
        <li>
          <RouterLink to="/status">Status</RouterLink>
        </li>
        <li>
          <RouterLink to="/bulk">🆕Bulk orders</RouterLink>
        </li>
      </ul>

      <ul>
        <li>
          <button class="contrast outline" style="padding: 0.25rem 0.5rem !important" @click="switchScheme()">
            {{ theme_icon[scheme] }}
          </button>
        </li>
      </ul>
    </nav>
    <ServerMessageDialogDivArray />

    <RouterView />
    <OrderPreview />
    <footer dir="rtl">
      <p><small>
          🐸<span class="secondary">Version 0.1</span>🐸</small> |
        <small>Only fans: <a href="https://twitter.com/extra_ordinal">@extra_ordinal</a></small>
        | <small><a href="https://discord.gg/sAWEj2uZ">Discord Server</a></small>
      </p>
    </footer>
  </main>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { config } from "./config";
import client from "./client";
export default defineComponent({
  data() {
    return {
      service_ok: true,
      scheme: "",
      theme_icon: {
        dark: "☀️",
        light: "🌘",
      } as { [key: string]: string },
    };
  },
  methods: {
    schemeFromLocalStorage() {
      return void 0 !== window.localStorage &&
        null !== window.localStorage.getItem(config.localStorageKey.colorScheme)
        ? window.localStorage.getItem(config.localStorageKey.colorScheme)
        : this.scheme;
    },
    schemeToLocalStorage() {
      void 0 !== window.localStorage &&
        window.localStorage.setItem(
          config.localStorageKey.colorScheme,
          this.scheme
        );
    },
    switchScheme() {
      this.applyScheme(this.scheme === "dark" ? "light" : "dark");
    },
    preferredColorScheme() {
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    },
    applyScheme(scheme: "dark" | "light" | "auto" | string) {
      this.scheme = scheme === "auto" ? this.preferredColorScheme() : scheme;
      document.querySelector("html")?.setAttribute("data-theme", this.scheme);
      this.schemeToLocalStorage();
    },
  },
  async beforeMount() {
    const userId = localStorage.getItem("identity");
    try {
      this.service_ok = await client.service_status().then(s => s === 'OK');
    } catch (e) {
      this.service_ok = false;
    }
    this.scheme = this.schemeFromLocalStorage() || this.preferredColorScheme();
    this.applyScheme(this.scheme);
  },
});
</script>
