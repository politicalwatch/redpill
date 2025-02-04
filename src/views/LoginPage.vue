<script setup>
    import { ref, onMounted } from "vue";
    import axios from "axios";
    import { useRouter } from "vue-router";

    const router = useRouter();
    const username = ref("");
    const password = ref("");
    const error = ref("");

    onMounted(() => {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        router.push("/interventions"); // Redirigir automáticamente
      }
    });
    
    const login = async () => {
      const heroku_url = 'https://cors-anywhere.herokuapp.com/'
      const google_sheet_url = process.env.VUE_APP_GOOGLE_SHEET_URL
      const scriptURL = heroku_url + google_sheet_url

        try {
            const response = await axios.post(scriptURL, {
            password: password.value,
            });

            if (response.status === 200) {
              localStorage.setItem("user", username.value);
              router.push("/interventions"); 
            } else {
              error.value = "Credenciales incorrectas";
            }
        } catch (err) {
            error.value = "Error al conectar con el servidor";
        }
    };
</script>

<template>
  <div class="container d-flex justify-content-center align-items-center vh-100">
    <div class="card shadow p-4" style="max-width: 400px; width: 100%">
      <h2 class="text-center mb-4">Iniciar Sesión</h2>
      <div class="mb-3">
        <label class="form-label">Usuario</label>
        <input v-model="username" type="text" class="form-control" placeholder="Ingresa tu usuario" />
      </div>
      <div class="mb-3">
        <label class="form-label">Contraseña</label>
        <input v-model="password" type="password" class="form-control" placeholder="Ingresa tu contraseña" />
      </div>
      <button @click="login" class="btn btn-primary w-100">Ingresar</button>
      <p v-if="error" class="text-danger text-center mt-3">{{ error }}</p>
    </div>
  </div>
</template>

<style>
/* Opcional: Estilos personalizados */
</style>

