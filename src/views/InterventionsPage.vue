<script setup>
  import axios from 'axios';
  import { onMounted, onUnmounted, reactive, ref } from 'vue';
  import { useRouter } from "vue-router";

  // URL del Google Apps Script
  const url = process.env.VUE_APP_GOOGLE_SHEET_URL

  const initiative = reactive({ values: null });
  const showReasonInput = ref(false);
  const koReason = ref("");
  const message = ref("");
  const loading = ref(false);
  const router = useRouter();
  const user = ref("");

  const fetchNextInitiative = async () => {
    user.value = localStorage.getItem("user");
    let userUrl = url + "?username=" + user.value;

    try {
      const { data } = await axios.get(userUrl, {
        redirect: 'follow'
      });

      if (data.message) {
        message.value = "No hay más iniciativas para revisar. ¡Buen trabajo!";
        initiative.values = null;
        loading.value = false;
      } else {
        initiative.values = data.data;
        initiative.row = data.row;
        message.value = "";
        loading.value = false;
      }
    } catch (error) {
      message.value = "Error al obtener los datos.";
      loading.value = false;
    }
  };

    const unlockIntervention = async () => {
      user.value = localStorage.getItem("user");
        if (!user.value) return; // Si no hay usuario, no hacemos nada

      // 🔹 Convertir los datos en FormData (obligatorio para sendBeacon)
      const payload = new FormData();
      payload.append("row", initiative.row);
      payload.append("status", "UNLOCK");
      payload.append("reason", "");
      payload.append("user", "");

      const payloadObject = Object.fromEntries(payload.entries());
      const a = JSON.stringify(payloadObject);

      
      try {
        let response = navigator.sendBeacon(url, payload); // Enviar petición sin bloquear la salida
        localStorage.removeItem("user");
      } catch (error) {
        console.error("Error al liberar registro:", error);
      }
    };

  const showKoReason = () => {
    showReasonInput.value = true;
  };

  const markResult = async (status) => {
    if (status === "KO" && !koReason.value) {
      message.value = "Por favor, introduce un motivo.";
      return;
    }

    // Obtenemos el nombre del usuario
    user.value = localStorage.getItem("user");

    const payload = {
      row: initiative.row,
      status,
      reason: status === "KO" ? koReason.value : "",
      user: status !== "UNLOCK" ? user.value  : "",
    };

    console.log(payload);

    loading.value = true; // Activar pantalla de carga

    try {
      const { data } = await axios.post(url, payload);
      if (data.status === "success") {
        if (status === "UNLOCK") {
          localStorage.removeItem("user"); // Borrar usuario guardado
          router.push("/");
        }else {
          message.value = "Actualizado correctamente.";
          showReasonInput.value = false;
          koReason.value = "";
          fetchNextInitiative(); // Obtener la siguiente fila
        }
      } else {
        message.value = "Error al actualizar.";
        loading.value = false;
      }
    } catch (error) {
      message.value = "Error de conexión.";
      loading.value = false;
    }
  };

  onMounted(() => {
    // fetchNextInitiative();
    window.addEventListener("beforeunload", unlockIntervention);
  });

  onUnmounted(() => {
    window.removeEventListener("beforeunload", unlockIntervention);
  });
  
</script>

<template>
    <!-- Mostrar mensaje cuando no hay más filas -->
    <p v-if="message" class="text-center">{{ message }}</p>

  <div v-if="initiative.values" class="p-4">
    <div class="centered">
      <h2 class="text-xl font-bold mb-2"><b>Sesión: </b>L{{ initiative.values.legislature }} - {{ initiative.values.initiative_id }}</h2>
      <h2 class="text-xl font-bold mb-2"><b>Orador: </b>{{ initiative.values.speaker }}</h2>
    </div>

    <div v-if="initiative.values" class="grid grid-cols-2 gap-4 mt-6">
      <!-- Columna izquierda: texto completo -->
      <div class="col-span-1">
        <p class="mb-4">{{ initiative.values.speech }}</p>
      </div>

      <!-- Columna derecha: video embebido -->
      <div class="col-span-2">
        <video
          controls
          class="w-full h-auto rounded shadow mb-4"
          :src="initiative.values.video_link"
        ></video>
      </div>
    </div>

    <div class="mt-4 flex justify-center space-x-4 centered">
      <button type="button" class="btn btn-success mx-2" @click="markResult('OK')" :disabled="loading">
        Transcripción correcta
      </button>
      <button type="button" class="btn btn-danger mx-2" @click="showKoReason" :disabled="loading">
        Error en transcripción
      </button>
      <button type="button" class="btn btn-secondary mx-2" @click="markResult('UNLOCK')" :disabled="loading">
        Salir
      </button>
    </div>

    <!-- Pantalla de carga -->
    <div v-if="loading" class="loading-overlay">
      <div class="spinner"></div>
      <p>Cargando...</p>
    </div>

    <!-- Input para el motivo si se marca como Incorrecto -->
    <div v-if="showReasonInput" class="mt-4">
      <input v-model="koReason" type="text" placeholder="Especifica el motivo:" class="form-control">
      <button type="button" class="btn btn-primary mt-2 w-100" @click="markResult('KO')">Enviar</button>
    </div>
  </div>
</template>

<style>
/* Estilos para la pantalla de carga */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.spinner {
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top: 4px solid #fff;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
.app {
  max-width: 400px;
  margin: 0 auto;
  font-family: Arial, sans-serif;
}
form {
  display: flex;
  flex-direction: column;
}
form > div {
  margin-bottom: 1rem;
}

/* Estilos generales */
body {
  font-family: 'Arial', sans-serif;
  background-color: #f9f9f9;
  color: #333;
  margin: 0;
  padding: 0;
}

h2 {
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 1rem;
}

/* Barra de búsqueda */
input[type="text"] {
  font-size: 1rem;
  padding: 0.75rem 1rem;
  border: 1px solid #ddd;
  border-radius: 0.375rem;
  width: 100%;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

input[type="text"]:focus {
  border-color: #4CAF50;
  outline: none;
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
}

/* Dropdown de resultados */
ul {
  list-style: none;
  padding-left: 0;
}

li {
  padding: 1rem;
  background-color: #fff;
  border-bottom: 1px solid #ddd;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

li:hover {
  background-color: #f1f1f1;
}

/* Contenido dividido en dos columnas */
.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  margin-top: 1rem;
}

.col-span-1 {
  grid-column: span 1;
}

video {
  width: 90%;
  height: auto;
  border-radius: 0.375rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.col-span-1 {
  grid-column: span 1;
  display: flex;
  flex-direction: column;
  height: 60vh; /* Ocupa toda la altura de la ventana */
  max-height: 75vh;
  overflow: scroll;
}

textarea {
  height: 100%; /* 75% de la ventana */
  width: 90%; /* 100% del ancho de la columna */
  padding: 1rem; /* Espaciado interno */
  border: 1px solid #ddd; /* Borde */
  border-radius: 0.375rem; /* Bordes redondeados */
  resize: none; /* Desactivar redimensionamiento manual */
  font-family: 'Arial', sans-serif; /* Fuente */
  font-size: 1rem;
  line-height: 1.5;
}

.centered{
  text-align: center;
}

/* Estilos responsive */
@media (max-width: 768px) {
  .grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
}
</style>
