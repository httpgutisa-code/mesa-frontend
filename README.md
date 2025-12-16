# 🛒 SmartSales365 - Frontend Cliente

Frontend moderno para el sistema de ecommerce SmartSales365, desarrollado con React + Vite.

## 🚀 Tecnologías

- **React 19** - Biblioteca de UI
- **Vite 7** - Build tool y dev server
- **React Router DOM 7** - Enrutamiento
- **Axios** - Cliente HTTP
- **TailwindCSS 4** - Framework CSS
- **Lucide React** - Iconos
- **Service Workers** - Notificaciones push

## 📦 Características

### ✅ Implementadas

- 🔐 **Autenticación completa** (registro, login, perfil)
- 🛍️ **Catálogo de productos** con búsqueda y filtros
- 🛒 **Carrito de compras** persistente (localStorage)
- 💳 **Sistema de pago** con Stripe y pago manual
- 🎁 **Promociones y cupones** de descuento
- 📦 **Gestión de pedidos** con historial
- 🔄 **Devoluciones y cambios** (30 días de garantía)
- 🔔 **Notificaciones push** (Service Workers)
- 🌙 **Tema oscuro/claro**
- 📱 **Diseño responsive**
- 📄 **Descarga de comprobantes PDF**

## 🔧 Instalación

### Prerrequisitos

- Node.js 18+ 
- npm o yarn

### Pasos

1. **Clonar el repositorio**
```bash
git clone <url-repositorio>
cd smartsales365
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**

Crea un archivo `.env` en la raíz del proyecto (usa `.env.example` como referencia):

```env
# URL del backend (sin /api al final)
VITE_API_URL=http://localhost:8000

# Clave pública de Stripe
VITE_STRIPE_PUBLIC_KEY=pk_test_...
```

4. **Iniciar servidor de desarrollo**
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## 📁 Estructura del Proyecto

```
src/
├── assets/          # Imágenes y recursos estáticos
├── components/      # Componentes reutilizables
│   ├── common/      # Componentes comunes (inputs, modales, etc.)
│   ├── navigation/  # Navbar, Footer
│   ├── product/     # Componentes de productos
│   └── ui/          # Componentes de UI base
├── constants/       # Constantes y configuración
├── hooks/           # Custom hooks (useAuth, useCart)
├── layouts/         # Layouts de página
├── pages/           # Páginas de la aplicación
├── routes/          # Configuración de rutas
├── services/        # Servicios API
│   ├── apiClient.js        # Cliente Axios configurado
│   ├── auth.js             # Autenticación
│   ├── products.js         # Productos
│   ├── orders.js           # Pedidos
│   ├── promociones.js      # Promociones
│   ├── devoluciones.js     # Devoluciones
│   └── notifications.js    # Notificaciones push
├── utils/           # Utilidades
├── App.jsx          # Componente principal
└── main.jsx         # Punto de entrada
```

## 🔌 Endpoints API

El frontend consume los siguientes endpoints del backend:

### Autenticación
- `POST /api/usuarios/register/` - Registro
- `POST /api/usuarios/token/` - Login
- `GET /api/usuarios/me/` - Perfil del usuario
- `PATCH /api/usuarios/me/` - Actualizar perfil

### Productos
- `GET /api/productos/` - Listar productos
- `GET /api/productos/:id/` - Detalle de producto
- `GET /api/productos/categorias/` - Listar categorías

### Compras
- `POST /api/compra/compras/checkout/` - Crear pedido
- `GET /api/compra/compras/` - Listar mis pedidos
- `GET /api/compra/compras/:id/` - Detalle de pedido
- `POST /api/compra/compras/:id/pay/` - Confirmar pago manual
- `POST /api/compra/compras/:id/stripe_session/` - Crear sesión de Stripe
- `GET /api/compra/compras/:id/receipt/` - Descargar comprobante PDF

### Promociones
- `GET /api/promociones/promociones/` - Listar promociones
- `GET /api/promociones/promociones/validar_codigo/` - Validar cupón

### Devoluciones
- `GET /api/promociones/devoluciones/` - Mis devoluciones
- `POST /api/promociones/devoluciones/` - Solicitar devolución
- `POST /api/promociones/devoluciones/:id/cancelar/` - Cancelar solicitud

### Notificaciones
- `GET /api/notificaciones/vapid-public-key/` - Obtener clave VAPID
- `POST /api/notificaciones/subscriptions/` - Suscribirse a push

## 🎨 Temas y Estilos

El proyecto utiliza TailwindCSS 4 con soporte para tema oscuro/claro.

**Variables CSS personalizadas:**
- `--primary` - Color principal
- `--bg` - Color de fondo
- `--fg` - Color de texto
- `--subtle` - Bordes sutiles

## 🔔 Notificaciones Push

Las notificaciones push se implementan mediante Service Workers:

1. **Registro automático:** Al iniciar sesión, se registra el Service Worker
2. **Solicitud de permiso:** Se solicita permiso al usuario
3. **Suscripción:** Se envía la suscripción al backend
4. **Recepción:** El usuario recibe notificaciones de:
   - Confirmación de pedidos
   - Actualización de pagos
   - Cambios en devoluciones

## 📱 Características Responsivas

- **Mobile first:** Diseño optimizado para móviles
- **Breakpoints:** sm, md, lg, xl
- **Touch friendly:** Botones y elementos táctiles optimizados

## 🚀 Despliegue en Vercel

### Configuración

1. **Instalar Vercel CLI**
```bash
npm i -g vercel
```

2. **Desplegar**
```bash
vercel
```

3. **Configurar variables de entorno en Vercel:**
   - `VITE_API_URL` - URL del backend en producción
   - `VITE_STRIPE_PUBLIC_KEY` - Clave pública de Stripe

### Archivo vercel.json

Ya está incluido en el proyecto con:
- Reescrituras para SPA
- Headers de seguridad
- Configuración de Service Worker

## 📝 Scripts Disponibles

```bash
# Desarrollo
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview

# Linter
npm run lint
```

## 🔒 Seguridad

- **Tokens JWT:** Autenticación mediante tokens
- **HTTPS:** Requerido en producción para Service Workers
- **Validación:** Validación de formularios en cliente y servidor
- **Stripe:** Integración segura de pagos

## 📚 Documentación Adicional

Para más información sobre la implementación, consulta:
- `FRONTEND_CLIENTE_COMPLETO.md` - Guía completa de implementación
- `PROMOCIONES_DEVOLUCIONES.md` - Documentación de promociones y devoluciones

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es privado y confidencial.

## 🐛 Reporte de Bugs

Para reportar bugs, por favor crea un issue en el repositorio con:
- Descripción del problema
- Pasos para reproducir
- Comportamiento esperado
- Screenshots (si aplica)

## ✨ Autor

SmartSales365 Team

---

**Hecho con ❤️ usando React + Vite**
