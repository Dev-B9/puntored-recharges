import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module.js';
import { RechargesModule } from './modules/recharges/recharges.module';
import { Transaction } from './modules/recharges/domain/transaction.entity';

// Módulo raíz de la aplicación
@Module({
  imports: [
    // Configuración global de variables de entorno (.env)
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // Configuración de TypeORM con SQLite para persistir transacciones
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService): TypeOrmModuleOptions => ({
        type: 'sqlite',
        database: configService.get<string>('DB_PATH') ?? 'puntored.sqlite',
        entities: [Transaction],
        // Para la prueba técnica, generamos el esquema automáticamente.
        // En producción se recomienda usar migraciones explícitas.
        synchronize: true,
      }),
    }),
    // Módulo de autenticación (Nivel 0)
    AuthModule,
    // Módulo de recargas (Nivel 1 y 2)
    RechargesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
