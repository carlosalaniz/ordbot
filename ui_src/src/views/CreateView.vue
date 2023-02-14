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

.status-title {
  color: var(--primary)
}
</style>
<template>
  <!-- <dialog :open="plans.length === 0">
    <article :aria-busy="true">Cargando...</article>
  </dialog> -->
  <article>
    <header>
      Upload your NFT
    </header>
    <div>
      Instructions:
      <ol>
        <li>Select an image to inscribe. Images must be at most 80 kb. We recommend <a href="https://ezgif.com/jpg-to-webp">ezgif.com</a> to compress images.</li>
        <li>Select a transfer fee speed. More about fees <a href="https://99bitcoins.com/bitcoin/fees/">here.</a></li>
        <li>Add your destination address; this is where we will send your NFT once inscribed.</li>
        <li>Press Mint and wait for the payment instructions screen to pop up.</li>
        <li>Follow payment instructions.</li>
      </ol>

    </div>

<details>
  <summary>Additional Information:</summary>
  <ul>
    If you exit the payment screen without sending payment, your order will be saved
      and viewable at the bottom of the screen titled 'PENDING_PAYMENT'. You will have 
      90 minutes to pay before the order will be cancelled; your timeout countdown 
      will be viewable with the order.
      <br>
      <br>
      If you have questions or need assistance to send payment, please contact us via 
      <a href="https://discord.gg/sAWEj2uZ">Discord</a> or Twitter
    <a href="https://twitter.com/extra_ordinal">@extra_ordinal</a>.
  </ul>
</details>
  <details>
    <summary>Order Status Meanings:</summary>
    <ol>
          <li><span class="status-title">PENDING_PAYMENT:</span> Payment has not yet been received.</li>
          <li><span class="status-title">WAITING_PAYMENT_CONFIRMATION:</span> Your payment has been seen in MEMPOOL, but
            is not yet confirmed. </li>
          <li><span class="status-title">PAYMENT_CONFIRMED:</span> Your payment has been confirmed on the blockchain. </li>
          <li><span class="status-title">WAITING_INSCRIBED_CONFIRMATION:</span> Your NFT has been inscribed, but not yet confirmed.
            You can check the status of this on any blockchain explorer by checking the deposit
            address.
          </li>
          <li><span class="status-title">INSCRIBED:</span> Your NFT has been inscribed and confirmed and will be sent to your
            destination wallet within 5 minutes.
          </li>
          <li><span class="status-title">🎉SENT:</span> Your NFT has been sent to your wallet. We use the same fee for this transaction
            as the one that you selected in the first step. The confirmation time will vary depending
            on your original selection.
          </li>
          <li><span class="status-title">ERROR:</span> Something went wrong. Please reach out to us via Discord or Twitter.</li>
        </ol>
</details>
    <br />
    <div class="grid">
      <div>
        <div id="preview">
          <label for="file"><b>Select your file</b>
            <input type="file" @change="onFileChange" id="file" name="file">
          </label>
          <span v-if="byteSize">File Size: {{ byteSize }} Bytes</span>
          <img v-if="objectURL" :src="objectURL" />
        </div>
        <p></p>
        <hr v-if="objectURL" />
      </div>
      <div>
        <label for="range">
          <div>
            <b>Fee:</b> {{(fee_options[fee_option])}}
          </div>
          <input :disabled="loaders.slider" type="range" @change="onFeeChange" min="2" max="5" v-model="fee_option" id="range" name="range">
        </label>
        <label for="range"> Destination Address (Bc1 only)
          <input type="text" v-model="dst_address">

        </label>
        <div>
          <p v-if="feeEstimate"><b :aria-busy="loaders.estimate">Estimate total:</b> {{ feeEstimate }} Sats</p>
          <button :aria-busy="loaders.mint" :disabled="loaders.mint || !objectURL || !dst_address" @click="mint()">Mint</button>
          <ul>
            <li v-for="error in errors" class="error">{{ error }}</li>
          </ul>
        </div>
      </div>
    </div>
    <!-- <blockquote> -->
        ⚠️ This software is in an alpha state, please be patient, some prompts might take time to load.
        <p>
          <strong>
            Do not refresh the page while things are loading.
          </strong>
        </p>
      <!-- </blockquote> -->
  </article>

  <DepositView v-if="mintResult && modal['qr_modal']" :depositAddress="mintResult.depositAddress" :total="mintResult.total" :expiresIn="mintResult.expiresIn" @close="toggleModal('qr_modal');reload()" />

</template>
<script lang="ts">
import { defineComponent } from "vue";
import client from "@/client";

export default defineComponent({
  data() {
    return {
      modal: {} as { [k: string]: boolean },
      mintResult: null as any,
      planid: 0,
      fee_option: 5 as number,
      plans: [] as any[],
      latestCreatedAccessCode: undefined as any,
      fee_options: {
        2: "ECONOMY",
        3: "HOUR",
        4: "HALF_HOUR",
        5: "FASTEST",
      } as { [key: number]: string },
      objectURL: undefined as string | undefined,
      feeEstimate: 0,
      byteSize: 0,
      file: null as File | null,
      dst_address: null as string | null,
      errors: [] as string[],
      loaders: {
        slider: false,
        estimate: false,
        mint: false
      }
    };
  },
  methods: {
    reload(){
      location.reload()
    },
    toggleModal(modal: string) {
      console.log(modal);
      this.modal[modal] = !this.modal[modal];
    },
    onFileChange(e: any) {
      const file = e.target.files[0];
      this.file = file;
      this.objectURL = URL.createObjectURL(file);
      this.byteSize = file.size;
      this.estimate()
    },
    async estimate() {
      this.loaders.estimate = true;
      if (this.byteSize && this.fee_option) {
        this.feeEstimate = await client.estimate(
          this.byteSize,
          this.fee_options[this.fee_option]
        );
      }
      this.loaders.estimate = false;
    },
    async mint() {
      this.loaders.mint = true;
      const response = await client.queue(
        this.file!,
        this.fee_options[this.fee_option!],
        this.dst_address!
      )
      console.log(response)
      if (Array.isArray(response)) {
        this.errors = response;
        setTimeout(() => { this.errors = [] }, 5000);
      } else {
        debugger;
        this.mintResult = response;
        this.modal['qr_modal'] = true;
      }
      this.loaders.mint = false;
    },
    async onFeeChange() {
      this.loaders.slider = true;
      await this.estimate()
      this.loaders.slider = false;
    }


  },
  async beforeMount() {
    // this.plans = await client.actions.getPlans();
    // console.log(this.plans);
  },
});
</script>
