<!-- BlogPost.vue -->
<script lang="ts">
import client from "@/client";
import { defineComponent } from "vue";
import md5 from 'js-md5';
const messageKey = (message: string) => `server-message-${md5(message)}`
export default defineComponent({
    data: () => {
        return {
            message_queue: [
                {
                    message: "1",
                    on: "always",
                    // every?: number
                },
                {
                    message: "2",
                    on: "once",
                    // every?: number
                },
                {
                    message: "3",
                    on: "every",
                    every: 10000
                }

            ] as { message: string, on: "always" | "once" | "every", every?: number }[],
            current_message: -1 as number
        }
    },
    components: {},
    // props: {},
    methods: {
        markedShowed(message: any) {
            localStorage.setItem(messageKey(message.message), `${new Date()}`);
        },
        lastShowed(message: any) {
            return localStorage.getItem(messageKey(message.message))
        },

        next() {
            const nextMessageIndex = this.current_message + 1;
            const nextMessage = this.message_queue[nextMessageIndex];
            if (this.message_queue && nextMessage) {
                this.showMessage(nextMessageIndex);
            } else {
                this.current_message = -1;
            }
        },

        showMessage(messageIndex: number) {
            const message = this.message_queue && this.message_queue[messageIndex];
            this.current_message = -1;
            if (!message) return;
            const lastShowedString = this.lastShowed(message);
            const lastShowed = lastShowedString && (new Date(lastShowedString)).getTime() || 0
            console.log("s")
            switch (message.on) {
                case "always":
                    this.current_message = messageIndex;
                    this.markedShowed(message)
                    break;
                case "once":
                    if (!lastShowedString) {
                        this.current_message = messageIndex;
                        this.markedShowed(message)
                    } else {
                        this.showMessage(messageIndex + 1);
                    }
                    break;
                case "every":
                    const delta = (Date.now() - lastShowed)
                    if (delta > message.every!) {
                        this.current_message = messageIndex;
                        debugger;
                        this.markedShowed(message)
                    } else {
                        this.showMessage(messageIndex + 1);
                    }
                    break;
            }
        },

        startShowing() {
            if (this.message_queue.length > 0)
                this.showMessage(0)
        },
    },
    mounted() {
        try {

            this.startShowing()
        } catch (e) {
            debugger;
        }
    },
    async beforeMounted() {
        // await client.getServerMessages();
    },
    unmounted() {

    }
});
</script>
<style>

</style>
<template>
    <dialog open v-if="current_message !== -1">
        <a @click="next">close</a>
        {{ message_queue[current_message].message }}
    </dialog>
</template>
