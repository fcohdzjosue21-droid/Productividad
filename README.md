# 🌿 ZenFlow - Tu Sistema de Productividad Zen

![ZenFlow Mascot](https://img.shields.io/badge/Mascota-Evolutiva-orange)
![Resend Notifications](https://img.shields.io/badge/Notificaciones-Email-blue)
![Vite + React](https://img.shields.io/badge/Built%20with-Vite%20%2B%20React-blueviolet)

**ZenFlow** es una aplicación de gestión de tareas diseñada para transformar la productividad en una experiencia fluida, estética y gamificada. Olvida las listas de tareas aburridas; con ZenFlow, cada actividad completada es un paso más en la evolución de tu cuenta y de tu mascota virtual.

## ✨ Características Principales

### 🐺 Sistema de Gamificación (Mascota Virtual)
Tu productividad tiene cara. Al completar tareas, ganas puntos que hacen evolucionar a tu mascota:
- **Nivel 1-2**: Un curioso Zorro (`🦊`)
- **Nivel 3-4**: Zorro con destellos (`🦊✨`)
- **Nivel 5-9**: Transformación a Lobo (`🐺`)
- **Nivel 10+**: Lobo Real (`👑🐺`) (Estatus Legendario)

### 📧 Recordatorios por Gmail (Integración con Resend)
No pierdas el rastro de tus objetivos. ZenFlow utiliza **Supabase Edge Functions** junto con **Resend** para enviarte notificaciones automáticas directamente a tu correo cuando llegue la hora de una tarea programada.

### ⏱️ Enfoque Profundo (Pomodoro & Zen)
- **Temporizador Pomodoro**: Integrado directamente para sesiones de trabajo concentrado.
- **Diseño Estético**: Una interfaz minimalista con tipografía moderna, efectos de vidrio (glassmorphism) y animaciones suaves para reducir el estrés visual.
- **Modo Oscuro Premium**: Paleta de colores cuidada para trabajar a cualquier hora.

### 📊 Organización y Visualización
- **Vista de Calendario**: Planifica tus días de forma visual.
- **Estadísticas**: Gráficos de barras para analizar tu progreso semanal y picos de actividad.
- **Categorías e Iconos**: Personaliza tus tareas con una amplia gama de iconos y niveles de urgencia.

### 📱 Experiencia Móvil & PWA
Totalmente responsiva. Incluye soporte para **PWA (Progressive Web App)**, permitiéndote instalar ZenFlow en tu dispositivo móvil como una aplicación nativa.

## 🛠️ Tecnologías Utilizadas

- **Frontend**: React, Vite, Framer Motion (animaciones), Lucide React (iconos).
- **Backend/Base de Datos**: Supabase (PostgreSQL, Edge Functions, Auth).
- **Notificaciones**: Resend API.
- **Estilos**: Vanilla CSS con diseño adaptativo.

## 🚀 Instalación y Desarrollo

1. Clona el repositorio.
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Configura tus variables de entorno en un archivo `.env`:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

---

*Creado para fluir, diseñado para cumplir.* 🌊
