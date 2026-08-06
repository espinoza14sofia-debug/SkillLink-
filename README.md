# SkillLink

## Descripción

SkillLink es una plataforma web desarrollada para optimizar la gestión colaborativa de equipos de trabajo, facilitando la administración de usuarios, proyectos, equipos, actividades y comunicación entre sus integrantes. La aplicación implementa una arquitectura desacoplada basada en una API REST y un cliente web moderno, priorizando la seguridad, escalabilidad y mantenibilidad del sistema.

---

# Tabla de Contenidos

- Descripción
- Objetivos
- Características
- Arquitectura
- Tecnologías
- Estructura del Proyecto
- Requisitos
- Instalación
- Configuración
- Ejecución
- Seguridad
- API REST
- Funcionalidades
- Pruebas
- Futuras Mejoras
- Autor
- Licencia

---

# Objetivos

## Objetivo General

Desarrollar una plataforma web que permita gestionar equipos de trabajo de forma eficiente mediante herramientas para la administración de usuarios, proyectos, actividades y comunicación colaborativa.

## Objetivos Específicos

- Administrar usuarios y autenticación.
- Gestionar proyectos y equipos.
- Organizar actividades y misiones.
- Implementar un sistema de mensajería.
- Gestionar notificaciones.
- Garantizar la seguridad mediante JWT.
- Mantener una arquitectura escalable y modular.

---

# Características

- Autenticación mediante JWT.
- Gestión de usuarios.
- Administración de proyectos.
- Gestión de equipos.
- Gestión de actividades.
- Administración de misiones.
- Sistema de habilidades.
- Sistema de logros.
- Sistema de niveles y experiencia (XP).
- Sistema de ranking.
- Gestión de rachas.
- Mensajería entre usuarios.
- Mensajes privados.
- Sistema de invitaciones.
- Notificaciones.
- Notificaciones Push.
- Recuperación de contraseña mediante correo electrónico.
- Documentación automática con Swagger.
- API REST.
- Arquitectura en capas.

---

# Arquitectura

SkillLink implementa una arquitectura basada en Clean Architecture, separando las responsabilidades de cada capa para facilitar el mantenimiento y la escalabilidad.

```text
Frontend (React + Vite)
        │
        ▼
Axios
        │
        ▼
ASP.NET Core Web API
        │
        ▼
Controllers
        │
        ▼
Application
        │
        ▼
Domain
        │
        ▼
Infrastructure
        │
        ▼
SQL Server
```

---

# Tecnologías

## Frontend

- React
- Vite
- JavaScript
- Tailwind CSS
- Axios
- React Router DOM
- ESLint
- pnpm

## Backend

- ASP.NET Core Web API
- C#
- Entity Framework Core
- SQL Server
- JWT Authentication
- Swagger / OpenAPI
- Dependency Injection
- CORS

## Base de Datos

- SQL Server

## Herramientas

- Visual Studio 2022
- Visual Studio Code
- Git
- GitHub
- Postman

---

# Estructura del Proyecto

```text
SkillLink
│
├── Frontend
│   ├── public
│   ├── src
│   │   ├── assets
│   │   ├── components
│   │   ├── pages
│   │   ├── services
│   │   ├── hooks
│   │   └── styles
│   ├── package.json
│   └── vite.config.js
│
├── src
│   ├── SkillLink.Api
│   ├── SkillLink.Application
│   ├── SkillLink.Domain
│   └── SkillLink.Infrastructure
│
├── tests
│   └── SkillLink.Tests
│
└── SkillLink.sln
```

---

# Requisitos

Antes de ejecutar el proyecto es necesario contar con:

- .NET SDK 8.0 o superior
- Node.js
- pnpm
- SQL Server
- Git

---

# Instalación

## Clonar el repositorio

### GitHub


https://github.com/espinoza14sofia-debug/SkillLink-.git

### Azure DevOps

Repositorio utilizado para la gestión del desarrollo mediante Azure DevOps:

https://sofiavargas11@dev.azure.com/sofiavargas11/SkillLink/_git/SkillLink.Api

## Backend

```bash
cd src/SkillLink.Api

dotnet restore

dotnet ef database update

dotnet run
```

## Frontend

```bash
cd Frontend

pnpm install

pnpm dev
```

---

# Configuración

## Variables de entorno del Backend

```env
ConnectionStrings__DefaultConnection=

Jwt__Key=

Jwt__Issuer=

Jwt__Audience=
```

## Variables de entorno del Frontend

```env
VITE_API_URL=http://localhost:5000/api
```

---

# Ejecución

Backend

```bash
dotnet run
```

Frontend

```bash
pnpm dev
```

Compilar Frontend

```bash
pnpm build
```

Vista previa

```bash
pnpm preview
```

---

# Seguridad

El sistema implementa mecanismos de seguridad como:

- Autenticación mediante JSON Web Token (JWT).
- Hash de contraseñas mediante Password Hasher de ASP.NET Identity.
- Control de acceso mediante autorización.
- Configuración de CORS.
- Protección de endpoints.
- Validación de tokens.
- Documentación segura mediante Swagger.

---

# API REST

La aplicación expone una API REST para la comunicación entre el frontend y el backend.

Algunos módulos disponibles son:

- Auth
- Usuarios
- Equipos
- Proyectos
- Actividades
- Misiones
- Habilidades
- Logros
- Niveles
- Ranking
- Rachas
- Invitaciones
- Mensajes
- Mensajes Privados
- Notificaciones

---

# Funcionalidades

- Registro e inicio de sesión.
- Gestión de usuarios.
- Administración de proyectos.
- Gestión de equipos.
- Gestión de actividades.
- Administración de misiones.
- Sistema de experiencia (XP).
- Sistema de niveles.
- Sistema de logros.
- Ranking de usuarios.
- Rachas de actividad.
- Mensajería.
- Mensajes privados.
- Invitaciones.
- Recuperación de contraseña.
- Envío de correos electrónicos.
- Notificaciones Push.
- Panel administrativo.

---

# Pruebas

El proyecto cuenta con un proyecto de pruebas independiente.

```text
tests
└── SkillLink.Tests
```

Para ejecutarlas:

```bash
dotnet test
```

---

# Futuras Mejoras

- Dashboard analítico.
- Calendario colaborativo.
- Reportes en PDF y Excel.
- Integración con servicios externos.
- Aplicación móvil.
- Mayor cobertura de pruebas automatizadas.

---

# Autor

**Sofía Espinoza**

GitHub: https://github.com/espinoza14sofia-debug

---

# Licencia

Este proyecto fue desarrollado con fines académicos y de aprendizaje. Su distribución y utilización deben respetar los créditos correspondientes a la autora.