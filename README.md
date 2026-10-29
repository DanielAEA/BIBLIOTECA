# CiberBook

Sistema de gestión de biblioteca y préstamos de libros digitales y físicos.

## Despliegue en Railway

### Backend (Spring Boot)
Configurar las siguientes variables de entorno en el servicio de backend en Railway:
- `SPRING_DATA_MONGODB_URI`: Cadena de conexión a la base de datos MongoDB.
- `GOOGLE_CLIENT_ID`: Client ID de Google OAuth 2.0 (obligatorio para arrancar el backend).
- `MICROSOFT_CLIENT_ID`: Client ID de Microsoft Entra ID (opcional).
- `ALLOWED_ORIGINS`: Orígenes permitidos por CORS separados por comas (ejemplo: `https://tu-frontend.up.railway.app,http://localhost:4200`).
- `PORT`: Puerto HTTP asignado automáticamente por Railway (valor por defecto `8080`).

### Frontend (Angular + Nginx)
Configurar las siguientes variables de entorno en el servicio de frontend en Railway:
- `API_URL`: URL base del backend accesible desde el navegador (ejemplo: `https://tu-backend.up.railway.app`).
- `GOOGLE_CLIENT_ID`: Client ID de Google OAuth 2.0 para Google Identity Services.
- `MICROSOFT_CLIENT_ID`: Client ID de Microsoft Entra ID para MSAL.
- `PORT`: Puerto asignado automáticamente por Railway (Nginx se adapta automáticamente en el arranque).
