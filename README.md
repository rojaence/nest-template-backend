## Description

Este es un proyecto de backend con nestjs.
Es solo un proyecto personal para aprender desarrollo de software fullstack.
La app tiene como concepto ser un pequeño template de backend con las siguientes funcionalidades:

- Authenticación con JWT
- Gestión de permisos por roles y perfiles (esquema básico)
- Implementación básica para códigos otp
- Servicio para envio de correos


**Característica destacada**
He pensado en aprender y aplicar buenas prácticas, por lo cual, este proyecto
incluye el desarrollo de pruebas unitarias y e2e con uso de mocks y seeders

## Project setup

```bash
$ npm install
```

## Env files

Configurar los archivos de entorno, .env para desarrollo, .env.test para testing  
utilizando de referencia el archivo .env.example, poner mucha atención a las variables  
de bases de datos.

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test setup
El proyecto usa prisma ORM para la conexión con base de datos.
Hay algunos comandos personalizados para la ejecución de los tests.

El archivo .env.example sirve de ejemplo para los archivos que se deben crear:
- .env (para development)
- .env.test (para testing)

Las pruebas unitarias crean algunos mocks para entidades como el servicio de prisma.

Las pruebas e2e hacen uso de una base de datos real configurada en local con el gestor
de bases de datos.

 ⚠️ **Advertencia:**
 El comando para pruebas e2e realiza un reinicio de la base de datos con las credenciales
 configuradas en el .env.test por lo que se debe precaución hacia donde apunta (DATABASE_URL).

### Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

