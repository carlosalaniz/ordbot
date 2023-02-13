
<script lang="ts">
import client from "@/client";
import { defineComponent } from "vue";
import DepositView from "../components/DepositView.vue";

export default defineComponent({
    data :()=> {
        return {
            orders: [] as any[],
            toggle_view: false,
            selectedOrder: {
                depositAddress: null,
                total: null,
                expiresIn: null
            }
        }
    },
    components: {
        DepositView
    },
    methods: {
        imageAddress(a: string) {
            return client.imageAddress(a)
        },
        minutesAndSeconds(order: any) {
            const now = Date.now();
            const expiresIn = new Date(order.expiresIn)
            const deltaSeconds = Math.trunc((expiresIn.getTime() - now) / 1000)
            console.log(deltaSeconds)
            const minutes = Math.trunc(deltaSeconds / 60);
            const seconds = deltaSeconds - (minutes * 60)
            order.countdown = `${minutes}M ${seconds}S`;
        },
        selectOrderAndShow(o: any) {
            this.selectedOrder = {
                depositAddress: o.deposit_address,
                total: o.total_fee,
                expiresIn: o.expiresIn
            }
            this.toggle_view = true;
        }
    },
    async beforeMount() {
        this.orders = await client.getOrders();
        this.orders.forEach(o => {
            o.interval = setInterval(() => {
                this.minutesAndSeconds(o)
            }, 1000)
        })
    },
    mounted() {

    },
    unmounted() {
        this.orders.forEach(o => clearInterval(o.interval))
    }
});
</script>
<style>
#orders {
    /* background: var(--primary-focus); */
}

.t {
    display: table;
}

.image_container {
    min-height: 16em;
    max-height: 20em;
    display: flex;
    justify-content: space-between;
    flex-direction: column;
}

.tcell {
    display: table-cell;
    min-width: 8em;
    max-width: 10em;
    padding: 0 5px;
    color: unset;
    justify-content: space-between;
}

.tcell:hover {
    /* padding: 10px; */
    border: 1px solid var(--secondary);
    text-decoration: none;
    background: var(--primary-focus);
}

.tcell:active,
.tcell:visited,
.tcell:visited,
.tcell:focus {
    /* padding: 10px; */
    text-decoration: none;
}

.index_indicator {
    position: relative;
    text-shadow: 0px 0px 2px black;
    color: whitesmoke;
}

.index_indicator>span {
    background-color: var(--primary);
    padding: 1em .25em;
    position: absolute;
}
</style>
<template>
    <DepositView v-if="toggle_view" :depositAddress="selectedOrder.depositAddress!" :total="selectedOrder.total!" :expiresIn="selectedOrder.expiresIn!" @close="toggle_view = false" />
    <strong>Orders:</strong> Click on your orders to see the deposit information.
    <hr />
    <figure id="orders">
        <div class="t">
            <a href="#orders" v-for="(order, i) in orders" class="tcell" @click="selectOrderAndShow(order)">
                <div class="">
                    <div>
                        <div class="index_indicator">
                            <span>{{ i + 1 }}</span>
                        </div>
                        <img :src="imageAddress(order.deposit_address)" />
                    </div>
                    <div>
                        <b>Status:</b> {{ order.state }}<br />
                        <div v-if="order.state === 'PENDING_PAYMENT'">
                            <b >Time to pay:</b> {{ order.countdown }}
                        </div>
                    </div>
                </div>
            </a>
        </div>
    </figure>

</template>
