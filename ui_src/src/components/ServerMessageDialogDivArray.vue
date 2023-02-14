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
                    // message_extended: "hey",
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
            messages: [] as any[]
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
        dismiss(index: number) {
            this.messages.splice(index, 1);
        }
    },
    async mounted() {
        this.message_queue = await client.getServerMessages();
        this.messages = this.message_queue.filter((message) => {
            const lastShowedString = this.lastShowed(message);
            const lastShowed = lastShowedString && (new Date(lastShowedString)).getTime() || 0
            switch (message.on) {
                case "always":
                    this.markedShowed(message);
                    return true;
                case "once":
                    if (!lastShowedString) {
                        this.markedShowed(message)
                        return true;
                    }
                    break;
                case "every":
                    const delta = (Date.now() - lastShowed)
                    if (delta > message.every!) {
                        this.markedShowed(message)
                        return true;
                    }
                    break;
            }
        });
    },
    async beforeMounted() {

    },
    unmounted() {

    }
});
</script>
<style>
.dismiss{
    float:right
}
</style>

<template>
    <article v-for="(message, i) in messages">
        <div>
            <div dir="rtl" class="dismiss">
                <a href="#" @click="dismiss(i)">Dismiss</a>
            </div>
            {{ message.message }}
        </div>
    </article>
</template>
