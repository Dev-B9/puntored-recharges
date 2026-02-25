import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module.js';
import { RechargesModule } from './modules/recharges/recharges.module';

// Módulo raíz de la aplicación
@Module({
  imports: [
    // Configuración global de variables de entorno (.env)
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // Módulo de autenticación (Nivel 0)
    AuthModule,
    // Módulo de recargas (Nivel 1)
    RechargesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
