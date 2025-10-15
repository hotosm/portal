# HOTOSM Auth Packages

Esta carpeta contiene las librerías listas para usar en tus proyectos.

## 📦 Contenido

### 1. Python Library (`python/`)

**Librería Python** para integración con FastAPI y Django.

```bash
# Para desarrollo local (desde esta carpeta)
pip install -e ./python

# O copiar la carpeta python/ a tu proyecto
cp -r packages/python /path/to/your/project/hotosm-auth
pip install -e ./hotosm-auth
```

**Uso**:
```python
# FastAPI
from hotosm_auth.fastapi import setup_auth, Auth
app = FastAPI()
setup_auth(app)

# Django
# settings.py
MIDDLEWARE = [
    'hotosm_auth.integrations.django.HankoAuthMiddleware',
]
```

📚 **Documentación completa**: [python/README.md](./python/README.md)

---

### 2. Web Component (`web-component/`)

**Componente web** para el frontend (HTML/JS).

```bash
# Para desarrollo local
cd web-component/
npm install
npm run build

# Los archivos built están en dist/
# Copiar dist/ a tu proyecto estático
```

**Uso**:
```html
<!DOCTYPE html>
<html>
<head>
    <meta name="hanko-url" content="https://login.hotosm.org">
    <script src="dist/hanko-auth.iife.js"></script>
</head>
<body>
    <hotosm-auth></hotosm-auth>
</body>
</html>
```

📚 **Documentación completa**: [web-component/README.md](./web-component/README.md)

---

## 🚀 Quick Start para un Nuevo Proyecto

### Opción 1: Copiar la Carpeta Completa

```bash
# Copiar todo packages/ a tu proyecto
cp -r /path/to/login/packages /path/to/your-project/

# Instalar dependencias
cd /path/to/your-project/packages/python
pip install -e .

cd /path/to/your-project/packages/web-component
npm install
npm run build
```

### Opción 2: Instalar desde PyPI/npm (cuando estén publicados)

```bash
# Python
pip install hotosm-auth[fastapi]  # o [django]

# Web Component
npm install @hotosm/hanko-auth
```

---

## 📋 Configuración Mínima

### Backend (.env)
```bash
HANKO_API_URL=https://login.hotosm.org
COOKIE_SECRET=your-secret-key-min-32-bytes

# Optional - OSM OAuth
OSM_CLIENT_ID=your-osm-client-id
OSM_CLIENT_SECRET=your-osm-client-secret
```

### Frontend (HTML)
```html
<meta name="hanko-url" content="https://login.hotosm.org">
<script src="dist/hanko-auth.iife.js"></script>
<hotosm-auth></hotosm-auth>
```

---

## 🎯 Arquitectura Recomendada para Producción

```
Subdominios (recomendado):
├── login.hotosm.org          → Hanko (auth service)
├── api.yourapp.com           → Tu backend (FastAPI/Django)
└── app.yourapp.com           → Tu frontend

Configuración:
- Backend corre en root path /
- Frontend corre en root path /
- No se necesita stripPrefix ni base-path
- Cookies se comparten con domain=.yourapp.com
```

---

## 📚 Ejemplos Completos

Ver la carpeta `../playgrounds/` en este repo para ejemplos funcionando de:
- FastAPI + hotosm-auth
- Django + hotosm-auth
- Frontend puro JS

---

## 🔧 Desarrollo

Si necesitás modificar las librerías:

1. Hacé cambios en `python/` o `web-component/`
2. Probá en los playgrounds (`../playgrounds/`)
3. Rebuild:
   ```bash
   # Python
   cd python/
   python3 -m build

   # Web Component
   cd web-component/
   npm run build
   ```

---

## 📦 Publicación (para maintainers)

Ver [../PUBLISHING.md](../PUBLISHING.md) para instrucciones completas de cómo publicar a PyPI y npm.

---

## 📄 Licencias

- **Python library** (`python/`): GPL-3.0-or-later
- **Web component** (`web-component/`): AGPL-3.0

Ver archivos LICENSE en cada carpeta.
