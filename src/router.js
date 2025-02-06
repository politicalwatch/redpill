import { createRouter, createWebHistory } from "vue-router";
  const routes = [
    {
      path: '/',
      name: 'RedirectToAppScript',
      beforeEnter() {
        window.location.href = process.env.VUE_APP_GOOGLE_SHEET_URL;
      }
    }
  ];

const router = createRouter({
    history: createWebHistory(),
    routes
  });
  
  export default router;
