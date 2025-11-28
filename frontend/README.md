# 💍 Wedding Planner App

Aplicación móvil desarrollada en **React Native** para la gestión integral de eventos. Permite a los usuarios organizar bodas, cumpleaños y eventos corporativos, gestionando invitados, presupuestos, proveedores y tareas en tiempo real.

## 📋 Características Principales

* **Gestión de Eventos:** Creación y visualización de eventos con fecha, presupuesto y tipo.
* **Tiempo Real (Firebase):** Sincronización instantánea de datos entre dispositivos.
* **Agenda de Tareas:** Lista de pendientes interactiva para cada evento.
* **Control de Gastos:** Visualización gráfica del presupuesto y contratación de proveedores.
* **Invitados:** Gestión de lista de invitados con estados (Pendiente, Confirmado, Rechazado).
* **Notas Privadas (SQLite):** Persistencia de datos local para guardar apuntes personales en el dispositivo.
* **Perfil de Usuario:** Gestión de cuenta y foto de perfil usando la cámara del dispositivo.

## 🛠️ Tecnologías Utilizadas

El proyecto cumple con la siguiente arquitectura tecnológica:

* **Frontend:** React Native (Expo Framework).
* **Navegación:** React Navigation (Stack Navigator).
* **Manejo de Estado:** Redux Toolkit (`authSlice`, `eventSlice`).
* **Backend as a Service (BaaS):** Firebase (Google).
    * *Authentication:* Registro y Login.
    * *Firestore Database:* Base de datos NoSQL en la nube.
* **Persistencia Local:** Expo SQLite (para notas offline).
* **Interfaces de Dispositivo:** Expo Image Picker (Cámara y Galería).

## 🚀 Requisitos Previos

* Node.js (v14 o superior)
* npm o yarn
* Dispositivo móvil con **Expo Go** instalado / Emulador (Android Studio).

## 🔧 Instalación y Configuración

1.  **Clonar el repositorio:**
    ```bash
    git clone <URL_DE_TU_REPOSITORIO>
    cd frontend
    ```

2.  **Instalar dependencias:**
    ```bash
    npm install
    ```

3.  **Configurar Firebase:**
    * Crea un archivo `src/config/firebase.js`.
    * Agrega tus credenciales de Firebase Console:
    ```javascript
    const firebaseConfig = {
  apiKey: "AIzaSyAmzOawANDteeSmfcfCy61JNu9Cf0XIiJ8",
  authDomain: "eventplannerapp-cc3ac.firebaseapp.com",
   projectId: "eventplannerapp-cc3ac",
  storageBucket: "eventplannerapp-cc3ac.firebasestorage.app",
  messagingSenderId: "337733046898",
  appId: "1:337733046898:web:a316c6facc6dba0cc368eb",
  measurementId: "G-YGQPM8NMRR"
    };
    ```

4.  **Ejecutar la aplicación:**
    ```bash
    npx expo start --clear
    ```

## 📂 Estructura del Proyecto