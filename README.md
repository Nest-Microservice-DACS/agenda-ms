

## Microservicio de Gestión de Personal

Este módulo es un microservicio NestJS que utiliza comunicación TCP para gestionar la agenda hospitalaria, permitiendo la administración y consulta de turnos del area de quirófano.

### Tabla de Contenidos

- [Estado](#Estado)
- [Descripción](#descripción)
- [Tech Stack del proyecto](#tech-stack-del-proyecto)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Instalación](#instalación)
- [Ejecución](#ejecución)
- [Mensajes TCP Principales](#mensajes-tcp-principales)
- [Ejemplo de uso TCP](#ejemplo-de-uso-tcp)
- [Configuración](#configuración)

---

# Documentación

## Estado

Proyecto en **fase de desarrollo** - Funcionalidades core implementadas. Mejoras y optimizaciones en progreso.

## Descripción

Este microservicio administra y expone operaciones para la gestión de la agenda hospitalaria (turnos en formatos de slots) mediante comunicación TCP, permitiendo su integración con otros módulos del sistema y facilitando el acceso seguro y eficiente a la información de disponibilidad y asignación de turnos.

## Diagrama de clases simplificado

![Diagrama de clases](assets/diagrama.png)

## Tech Stack del proyecto

- Framework: NestJS v11 (Microservicio TCP con TypeScript)
- Comunicación: @nestjs/microservices (protocolo TCP)
- Bases de datos: PostgreSQL
- Prisma: ORM y toolkit para acceso y gestión de datos en bases de datos relacionales
- Validación: class-validator + class-transformer
- Configuración: dotenv + @nestjs/config
- Validación de esquemas: Joi
- Async: RxJS (Observables)
- Docker: Para levantar Keycloak localmente (ver docker-compose.yml) y bases de datos de los microservicios (ver en sus respectivos repositorios)
- Algunos patrones utilizados:
  - Client Pattern: Clientes dedicados para cada microservicio
  - DTO Pattern: Para validación de datos en entrada/salida
  - Singleton Pattern: Los servicios inyectados son singletons por defecto en NestJS
  - Exception Handling Pattern: Usa RpcException para capturar y lanzar errores de microservicios

## Estructura del Proyecto

```
src/
  common/         # Utilidades y excepciones comunes
  config/         # Configuración de entornos y servicios
  operating-room/ # Gestión de quirofanos hospitalarios
```

## Instalación

1. Clonar el repositorio:
   ```bash
   git clone <repo-url>
   cd servicios-ms
   ```
2. Instalar las dependencias:
   ```bash
   npm install
   ```

## Ejecución

### Local

```bash
npm run start:dev
```

### Docker

1. Tener Docker instalado.
2. Navegar a la raiz y ejecutar:
   ```bash
   docker-compose up --build
   ```
   Esto levanta el servidor de la Base de datos
   - Credenciales: admin@gmail.com / admin

## Mensajes TCP principales

Este microservicio responde a mensajes TCP con los siguientes patrones principales:

- `create_shift`: Crea un nuevo turno (shift) en un quirófano.
- `get_shifts`: Obtiene la lista de turnos (con paginación y filtros).
- `get_shift_by_surgery_id`: Obtiene un turno específico por el ID de la cirugía.
- `update_shift`: Actualiza los datos de un turno existente.
- `remove_shift`: Elimina un turno por ID de cirugía.

Consulta el código fuente para ver los payloads y DTOs utilizados en cada patrón.

## Configuración

Variables de entorno principales (ver `src/config/envs.ts`):

- `PORT`: Puerto del microservicio TCP
- `DATABASE_URL`: Cadena de conexión a la base de datos PostgreSQL utilizada por Prisma.
- `NODE_ENV`: Entorno de ejecución de la aplicación


## Script SQL para generación de slots

El siguiente script permite crear automáticamente turnos (slots) de 30 minutos para cada quirófano, desde las 08:00 hasta las 18:00, para todos los días de un mes, dejándolos como 'AVAILABLE' en la base de datos.

```sql
DO $$
DECLARE
  current_day DATE;
  month_start DATE := DATE '2026-01-01';
  month_end   DATE := DATE '2026-01-31';

  slot_start  TIMESTAMP;
  slot_end    TIMESTAMP;

  q_id        INT;
BEGIN
  current_day := month_start;

  WHILE current_day <= month_end LOOP

    FOREACH q_id IN ARRAY ARRAY[1,2,3] LOOP

      slot_start := current_day + TIME '08:00';
      slot_end   := current_day + TIME '18:00';

      WHILE slot_start < slot_end LOOP
        INSERT INTO "Agenda_slot" (
          "startTime",
          "endTime",
          status,
          "quirofanoId",
          version
        )
        VALUES (
          slot_start,
          slot_start + INTERVAL '30 minutes',
          'AVAILABLE',
          q_id,
          1
        );

        slot_start := slot_start + INTERVAL '30 minutes';
      END LOOP;

    END LOOP;

    current_day := current_day + INTERVAL '1 day';
  END LOOP;
END $$;
```
