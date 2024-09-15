import { Injectable } from '@nestjs/common';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import dataSource from '../../database/datasource';

@Injectable()
export class TypeormConfigService implements TypeOrmOptionsFactory {
    createTypeOrmOptions():
        | Promise<TypeOrmModuleOptions>
        | TypeOrmModuleOptions {
            console.log(dataSource?.options)
        return {
            logging: true,
            ...dataSource?.options,
        } as TypeOrmModuleOptions;
    }
}