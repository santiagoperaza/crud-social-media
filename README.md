## Descripción

Servicio REST creado con Node.js + TypeScript utilizando el framework Nest.js que permite realizar operaciones CRUD sobre usuarios de una red social.

La estructura inicial del proyecto fue creada con [Nest CLI](https://github.com/nestjs/nest).

Para la persistencia de datos se optó por utilizar la base de datos MySQL y TypeORM para manipular la entidades.

## Pasos para desplegar el servicio

La forma más sencilla es utilizando [Docker Compose](https://docs.docker.com/compose/), ejecutando `docker-compose up` desde el directorio raíz del proyecto.

Por defecto, va a levantar el servicio en el puerto `3000` pero se puede modificar seteando la variable de entorno `PORT`.

Una vez que el servicio haya levantado la documentación de los endpoints estará disponible en http://localhost:3000/api, provista a través de [OpenAPI (Swagger)](https://swagger.io/specification/).

## Sin utilizar Docker Compose

Si se quiere levantar el servicio sin utilizar docker compose entonces es necesario levantar una instancia de MySQL de forma local, teniendo en cuenta los valores de conexión en el archivo [.env](./.env).

Luego procedemos con los siguientes pasos:

## Instalar dependencias npm

```bash
$ npm install
```

## Levantar el servicio

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

Pruebas unitarias:

```bash
# tests unitarios
$ npm run test

# cobertura
$ npm run test:cov
```

## Comandos adicionales

```bash
# formatear el código usando prettier
$ npm run format

# analizar código con ESLint
$ npm run lint
```
