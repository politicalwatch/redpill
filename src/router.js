import { createRouter, createWebHistory } from "vue-router";
import LoginPage from "./views/LoginPage.vue";
import InterventionsPage from "./views/InterventionsPage.vue"

const isAuthenticated = () => !!localStorage.getItem("user");

const routes = [
    { path: "/", component: LoginPage },
    {
        path: "/interventions",
        component: InterventionsPage,
        beforeEnter: (to, from, next) => {
            if (isAuthenticated()) {
                next();
            } else {
                next("/");
            }
        },
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;
