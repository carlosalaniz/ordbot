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
      Bulk orders
    </header>
    If you have a bulk order (more than 15 NFTs), please contact us directly via Discord.
    We can mint up to 1,000 images per bulk order the same day as payment is received.
    <br>
    <br>
    Please be mindful that we are on central time, and there may be a response delay 
    during certain hours.
    <br>
    <br>
    Contact us directly via
    <a href="https://discord.gg/sAWEj2uZ">Discord</a> or Twitter
    <a href="https://twitter.com/extra_ordinal">@extra_ordinal</a>.
    
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
