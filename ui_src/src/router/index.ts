import { createRouter, createWebHistory } from "vue-router";
import CreateView from "../views/CreateView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "create",
      component: CreateView,
    },
    {
      path: "/status",
      name: "order_status",
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import("../views/OrderStatus.vue"),
    },
    {
      path: "/bulk",
      name: "bulk_order",
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import("../views/BulkOrder.vue"),
    },
  ],
  linkActiveClass: "active",
  linkExactActiveClass: "active",
});

export default router;
