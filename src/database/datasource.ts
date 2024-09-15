import { config } from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';

config({
    path: '.env.development.local',
});
const dataSource = new DataSource({
    type: process.env.DATABASE_TYPE,
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT, 10),
    username: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE,
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: false,
    migrations: [__dirname + '/migrations/*.{ts,js}'],
} as DataSourceOptions);

console.log(
    process.env.DATABASE,
    process.env.DATABASE_USER,
    process.env.DATABASE_PASSWORD,
);

dataSource.initialize();
export default dataSource;
