# 🚀 Guía de Despliegue en Vercel

## ✅ No afecta tu proyecto existente

Cada proyecto en Vercel es **completamente independiente**. Crear un nuevo proyecto NO afecta para nada a tu otro proyecto. Los dos convivirán sin problemas, cada uno con su propia URL.

---

## 📋 Pasos para desplegar

### Paso 1: Subir el código a GitHub

1. Crea un **nuevo repositorio** en GitHub (ej: `ftp-digital-plus-tarjetas`)
2. No lo inicialices con README (ya tenemos uno)
3. En tu computadora, clona este proyecto o descarga todos los archivos
4. Ejecuta estos comandos:

```bash
cd ftp-digital-plus-tarjetas
git init
git add .
git commit -m "FTP Digital Plus - Tarjetas de Presentación Digitales"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/ftp-digital-plus-tarjetas.git
git push -u origin main
```

### Paso 2: Crear proyecto en Vercel

1. Ve a **[vercel.com](https://vercel.com)** e inicia sesión
2. Haz clic en **"Add New"** → **"Project"**
3. Busca y selecciona tu repositorio `ftp-digital-plus-tarjetas`
4. Vercel detectará automáticamente que es Next.js

### Paso 3: Configurar (opcional)

Vercel auto-detecta Next.js, así que la configuración por defecto funciona:

- **Framework Preset**: Next.js (auto-detectado)
- **Build Command**: `next build` (auto-detectado)
- **Output Directory**: `.next` (auto-detectado)
- **Install Command**: `npm install` (auto-detectado)

**NO necesitas agregar variables de entorno** — la demo funciona con datos en memoria.

### Paso 4: Deploy

5. Haz clic en **"Deploy"**
6. Espera 2-3 minutos a que compile
7. ¡Listo! Tu URL será: `ftp-digital-plus-tarjetas.vercel.app` (o similar)

---

## 🔑 Credenciales de la demo

Una vez desplegado, usa estas cuentas para probar:

| Plan | Email | Contraseña |
|------|-------|------------|
| Gratis | `demo@gratis.com` | `demo123` |
| Básico | `demo@basico.com` | `demo123` |
| Pro | `demo@pro.com` | `demo123` |

O simplemente haz clic en **"Usar esta cuenta"** en la página de login.

---

## ⚙️ Configuración técnica

- **Framework**: Next.js 16 con App Router
- **Lenguaje**: TypeScript 5
- **Estilos**: Tailwind CSS 4 + shadcn/ui
- **Estado**: Zustand (datos en memoria + localStorage)
- **Gráficas**: Recharts
- **Animaciones**: Framer Motion
- **QR**: qrcode.react

La app NO requiere base de datos para la demo — todos los datos se guardan en localStorage del navegador.

---

## 🔄 Actualizaciones futuras

Cada vez que hagas `git push` a la rama `main`, Vercel hará un deploy automático. También puedes hacer deploy manual desde el dashboard.

---

## ❓ Preguntas frecuentes

**¿Afecta a mi otro proyecto?**
No. Cada proyecto de Vercel es independiente con su propia URL, builds y configuración.

**¿Necesito plan de pago?**
No. El plan gratuito de Vercel es suficiente para esta demo.

**¿Los datos se pierden al recargar?**
No, los datos se guardan en localStorage del navegador. Pero sí se pierden si limpias el caché del navegador o usas modo incógnito.

**¿Puedo usar mi dominio personalizado?**
Sí, en Settings → Domains del proyecto en Vercel puedes agregar `tarjetas.ftpdigitalplus.com` o el que prefieras.
