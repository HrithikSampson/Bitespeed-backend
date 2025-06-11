# Bitespeed Backend Assignment

Steps to run this project:

1. Run `npm i` command
2. Setup database settings inside `data-source.ts` file
3. Run `npm start` command

### To run a migration use:

```sh
npx typeorm-ts-node-commonjs migration:run -d ./src/data-source.ts
```

### To revert a migration use:

```sh
npx typeorm-ts-node-commonjs migration:revert -d ./src/data-source.ts
```

### How to access the docs

Use `/docs` endpoint to check the api docs

### Local Build using docker

```sh
docker-compose up -d --build
```
Access docs using this url
```
http://<server>:<port>/docs
```

### Filling .env file
```
POSTGRESQL_USERNAME=
POSTGRESQL_PASSWORD=
POSTGRESQL_DATABASE_NAME=
POSTGRES_HOST=
POSTGRES_PORT=5432

```

### HOSTED URL

https://bitespeed-backend-vgfb.onrender.com/docs/
