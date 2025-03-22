import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.split(' ')[1];

    if (!token) {
      return false; // Токен отсутствует
    }

    try {
      const payload = await this.jwtService.verifyAsync(token);
      request.user = { userId: payload.id}; // Сохранение userId в объекте user
      return true; // Активация разрешена
    } catch (error) {
      return false; // Токен недействителен
    }
  }
}
