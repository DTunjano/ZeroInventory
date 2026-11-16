import 'reflect-metadata';
import { DataSource, DataSourceOptions } from 'typeorm';
import { loadEnvironment } from './environment';
import { getDatabaseOptions } from './database.config';

loadEnvironment();
export default new DataSource(getDatabaseOptions() as DataSourceOptions);
