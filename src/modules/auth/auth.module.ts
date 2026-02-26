import { Module } from '@nestjs/common';
import { JwtModule, JwtModuleOptions, JwtSignOptions } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { UserService } from './services/user.service';
import { JwtStrategy } from './strategies/jwt.strategy';

// Módulo encargado de toda la lógica de autenticación de Nivel 0
@Module({
  imports: [
    ConfigModule,
    // Habilita integración con Passport (estrategias como JWT)
    PassportModule,
    // Configura el módulo JWT leyendo secretos desde variables de entorno
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService): JwtModuleOptions => {
        // Clave secreta obligatoria para firmar los tokens
        const secret = configService.getOrThrow<string>('JWT_SECRET');
        // Tiempo de expiración configurable del token
        const expiresIn = configService.get<string>('JWT_EXPIRES_IN') ?? '3600s';

        return {
          secret,
          signOptions: {
            expiresIn: expiresIn as JwtSignOptions['expiresIn'],
          },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, UserService, JwtStrategy],
})
export class AuthModule {}

