import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// Guard que protege rutas usando la estrategia JWT (Bearer token)
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}

