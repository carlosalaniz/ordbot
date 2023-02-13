<!-- BlogPost.vue -->
<script lang="ts">
import QrcodeVue from "qrcode.vue";
import { defineComponent } from "vue";
export default defineComponent({

  data() {
    return {
      addressCopied: false,
      amountCopied: false,
      countDownText: null as any,
      interval: null as any
    }
  },
  components: {
    QrcodeVue,
  },
  props: {
    depositAddress: String,
    total: Number,
    expiresIn: String,
  },
  methods: {
    // copyAddress() {
    //   this.addressCopied = true
    //   setTimeout(() => { this.addressCopied = false }, 3000)
    //   const element = document.querySelector("#address");
    //   element.
    //   document.execCommand('copy');
    // },
    // copyAmount() {
    //   this.amountCopied = true
    //   setTimeout(() => { this.amountCopied = false }, 3000)
    //   const element = document.querySelector("#address");
    //   element.select();
    //   element.setSelectionRange(0, 99999);
    //   document.execCommand('copy');
    // }
    minutesAndSeconds() {
      const now = Date.now();
      const expiresIn = new Date(this.expiresIn!)
      const deltaSeconds = Math.trunc((expiresIn.getTime() - now) / 1000)
      console.log(deltaSeconds)
      const minutes = Math.trunc(deltaSeconds / 60);
      const seconds = deltaSeconds - (minutes * 60)
      this.countDownText = `${minutes} Minutes ${seconds} Seconds`;
    },
  },
  mounted() {
    this.interval = setInterval(() => {
      this.minutesAndSeconds()
    }, 1000)
  },
  unmounted() {
    clearInterval(this.interval);
  }
});
</script>
<style>
.close {
  margin-bottom: 2rem;
}

#qr-container {
  background: white;
  padding: 1rem;
  border: 1px solid whitesmoke;
  /* float: left; */
  width: 100% !important;
  height: auto !important;
  margin-bottom: 1em;
}


#address {
  /* background: var(--muted-border-color); */
  width: 100% !important;
  color: var(--contrast);
  border-color: var(--muted);
  box-shadow: var(--button-box-shadow, 0 0 0 rgba(0, 0, 0, 0));
  padding: var(--form-element-spacing-vertical) var(--form-element-spacing-horizontal);
  border: 1px solid var(--contrast);
  border-radius: var(--border-radius);
  min-height: 4rem !important;
  /* height: 100% !important; */
}

.warning {
  color: var(--del-color)
}
</style>
<template>
  <dialog open>
    <article style="max-height: 95%;!important">
      <header style="min-height: 4em;">
        <a href="#" @click="$emit('close')" aria-label="Close" class="close"></a>
        <strong :aria-busy="!countDownText">Time to deposit</strong>: {{ countDownText }}
      </header>
      <div>
        Instructions:
        <ol>
          <li>In a <mark>single transaction</mark> , send <mark :data-tooltip="`${(total! * 0.00000001).toFixed(8)} BTC`" data-placement="bottom">exactly {{ total }} SATS</mark> to the address below; use this address to check the status of the order.</li>
          <li>The system will pick up the order and mint your file.</li>
        </ol>
        <div class="grid">
          <div>
            QR Deposit Address:
            <qrcode-vue id="qr-container" :value="depositAddress" level="H" />
          </div>
          <div>
            Text Deposit Address:
            <div contentEditable id="address" class="contrast outline">{{ depositAddress }}</div>
            <ins v-if="addressCopied">Copied!</ins>
            <br />
            <p :data-tooltip="`${(total! * 0.00000001).toFixed(8)} BTC`" data-placement="bottom">
              Amount to deposit in SATS: <input readonly :value="total">
              <ins v-if="addressCopied">Copied!</ins>
            </p>
          </div>
        </div>
        <div>
          <hr />
          <p>
            🤔Information:
          <ul>
            <li>
              Make sure to copy the deposit address and keep it in a safe location. You can use this address to check the status of your order and we may ask you for this address if you contact support.
            </li>
            <li>
              After the deposit has been made, it is safe to close this window.
            </li>
          </ul>
          </p>
          <strong class="warning">⚠️ Warning:</strong><br />
          Do not make more than one deposit to the above address. Failure to follow these instructions may result in loss of your NFT and/or funds.

        </div>
      </div>
      <footer>
        <a href="#" role="button" class="contrast outline" @click="$emit('close')">
          Close
        </a>
      </footer>
    </article>
  </dialog>
</template>
