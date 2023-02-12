<script setup lang="ts">
import { RouterLink, RouterView } from "vue-router";
import IconLogout from "./components/icons/IconLogout.vue";
</script>

<template>
  <dialog open>
    <article>
     We are fixing bugs! Come back later!
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
          <RouterLink to="/status">Check Status</RouterLink>
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
    <hr />

    <RouterView />
    <footer dir="rtl">
      <hr>
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
export default defineComponent({
  data() {
    return {
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
  beforeMount() {
    this.scheme = this.schemeFromLocalStorage() || this.preferredColorScheme();
    this.applyScheme(this.scheme);
  },
});
</script>
