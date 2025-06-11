import "reflect-metadata"
import { DataSource } from "typeorm"
import { Contact } from "./entity/Contact"
import "dotenv/config";


export const AppDataSource = new DataSource({
    type: "postgres",
    host: "localhost",
    port: 5442,
    username: process.env.POSTGRESQL_USERNAME,
    password: process.env.POSTGRESQL_PASSWORD,
    database: "bitespeed",
    synchronize: false,
    logging: false,
    entities: [Contact],
    migrations: ['src/migration/**/*.ts'],
    subscribers: [],
})
