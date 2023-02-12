<script setup lang="ts">
import DepositView from "../components/DepositView.vue";

</script>
<style>
#preview {
  max-width: 80%;
  max-height: 80%;
  margin: 0 auto
}

.error {
  color: var(--del-color)
}
</style>
<template>
  <!-- <dialog :open="plans.length === 0">
    <article :aria-busy="true">Cargando...</article>
  </dialog> -->

  <article>
    <header>
      Check status
    </header>
    Deposit Address:
    <input v-model="depositAddress" type="text" />
    <div v-if="status_result" class=" grid">
      <div>
        <div id="preview">
          <img :src="status_result.imageUrl" />
        </div>
        <p></p>
      </div>
      <div>
        <hgroup>
          <h3>Status:</h3>
          <h4>PENDING_PAYMENT</h4>
        </hgroup>
        <hgroup>
          <h3>Fee:</h3>
          <h4>277418 SATS</h4>
        </hgroup>
        <hgroup>
          <h3>Last updated:</h3>
          <h4>2023-02-11T23:56:19.081Z</h4>
        </hgroup>
      </div>
    </div>
    <button :aria-busy="loading" :disabled="!depositAddress || depositAddress.length === 0" @click="getStatus()">Check Status</button>
    <div v-if="not_found" style="color: var(--del-color)">Order not found</div>
    <footer>

    </footer>
  </article>

</template>
<script lang="ts">
import { defineComponent } from "vue";
import client from "@/client";

export default defineComponent({
  data() {
    return {
      loading: false,
      not_found: false,
      depositAddress: "" as string | null,
      errors: [] as any,
      status_result: null as null | {
        state: string,
        last_updated: string,
        total_fee: number,
        imageUrl: string
      }
    };
  },
  methods: {
    async getStatus() {
      this.loading = true;
      this.not_found = false;
      this.status_result = null;

      const response = await client.status(
        this.depositAddress!
      )
      console.log(response)
      if (response === 404) {
        this.not_found = true;
      } else {
        this.status_result = response;
        this.status_result!.imageUrl = client.imageAddress(this.depositAddress!);
      }
      this.loading = false;
    }


  }
});
</script>
