# SkillLink

Plataforma gamificada de colaboración estudiantil. Los usuarios crean equipos, se organizan en proyectos, completan misiones y ganan XP, niveles e insignias por su progreso.

## Estado del proyecto

En desarrollo — Sprint 1

## Sprint 1 — Objetivo

Sentar las bases técnicas del proyecto: repositorio, CI/CD, seguridad y el flujo de registro/login de usuarios. Sin esto no se puede avanzar con equipos, proyectos ni el sistema de XP.

**Features incluidas:**

| # | Feature | Resumen |
|---|---------|---------|
| 1 | Configuración del Proyecto | Repositorio, estructura de carpetas, `.env.example`, README |
| 2 | CI/CD | Pipeline en Azure Pipelines que compila y corre pruebas en cada push |
| 3 | Seguridad | Hash de contraseñas con BCrypt, generación/validación de JWT, middleware de autorización |
| 4 | Registro y Autenticación | Registro de usuario, login, y protección de rutas |

**Criterio de "Sprint 1 terminado":**
- El pipeline corre automáticamente en cada push a la rama principal y muestra su estado (éxito/fallo).
- Un usuario nuevo puede registrarse (email + contraseña) y quedar creado con nivel 1 y 0 XP.
- Un usuario registrado puede iniciar sesión y recibir un JWT válido.
- Las rutas protegidas rechazan peticiones sin token o con token expirado.
- Las contraseñas nunca se guardan en texto plano.

## Estructura del repositorio

```
/backend      → API, lógica de negocio, acceso a datos
/frontend     → cliente web
/docs         → documentación adicional (diagramas, decisiones técnicas)
.env.example  → variables de entorno de referencia
azure-pipelines.yml → definición del pipeline CI/CD
```

## Cómo levantar el proyecto localmente

> Ajusta estos comandos al stack real una vez definido (Node, .NET, etc.).

1. Clonar el repositorio:
```bash
   git clone <url-del-repositorio>
   cd skilllink
```
2. Copiar las variables de entorno:
```bash
   cp .env.example .env
```
   y completar los valores (conexión a base de datos, secreto JWT, etc.).
3. Backend:
```bash
   cd backend
   # instalar dependencias y levantar el servicio
```
4. Frontend:
```bash
   cd frontend
   # instalar dependencias y levantar el cliente
```
5. Verificar que el backend expone `POST /api/auth/register` y `POST /api/auth/login`.

## Autenticación

- Contraseñas: hash con **BCrypt**, nunca texto plano.
- Sesión: **JWT** con expiración configurable.
- Rutas protegidas: requieren header `Authorization: Bearer <token>`; tokens inválidos o expirados se rechazan con 401.

## CI/CD

El pipeline (`azure-pipelines.yml`) se dispara en cada push a la rama principal y ejecuta:
1. Restauración de dependencias
2. Compilación
3. Pruebas automáticas

El resultado (éxito/fallo) queda visible en la pestaña **Pipelines** de Azure DevOps.

## Convenciones de trabajo

- **Ramas:** `feature/<nombre-corto>` a partir de `main`/`develop`.
- **Commits:** mensajes breves y descriptivos, en español, en modo imperativo (ej. `Agrega endpoint de login`).
- **Pull Requests:** vinculados al PBI/Task correspondiente en Azure Boards; requieren pipeline en verde antes de mergear.

## Próximos sprints

Una vez cerrado el Sprint 1, el siguiente bloque de trabajo cubre perfil de usuario, equipos y gestión de proyectos (Features 5 a 7 del backlog).

## Licencia

Pendiente de definir.