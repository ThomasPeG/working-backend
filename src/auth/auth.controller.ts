import { Controller, Post, Body, UseGuards, Request, Get, Req, UnauthorizedException, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CreateUserDto } from '../users/dto/user/create-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';

// Importa OAuth2Client al inicio del archivo
import { OAuth2Client } from 'google-auth-library';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService,
    private configService: ConfigService
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @Post('refresh-token')
  async refreshToken(@Body() data: any) {
    return this.authService.createToken(data);
  }

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }

  // Endpoints para autenticación con Google
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // Este endpoint redirige a Google para autenticación
  }

  
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req, @Res() res) {
    
    const authResult = await this.authService.googleLogin(req.user);

    const respuesta = JSON.stringify(authResult)
    return res.redirect(`http://localhost:8100/auth/google/callback?token=${respuesta}`);

    // Redirigir a la aplicación con el token
    // Se debe enviar solo el Token, por ahora no funciona y estoy enviando un objeto Response
  }

  // Endpoint para autenticación directa con token de Google (para móviles)
  // Actualizar solo el método googleMobileLogin
  @Post('google/mobile')
  async googleMobileLogin(@Body() body: { token: string }) {
    // Verificar el token de Google
    try {
      // Crear una instancia de OAuth2Client con tu ID de cliente de Google
      const client = new OAuth2Client(this.configService.get('GOOGLE_CLIENT_ID'));


      // Verificar el token ID
      //EL PROBLEMA ESTA EN LA VIRIFICACION DEL TOKEN
      const ticket = await client.verifyIdToken({
        idToken: body.token,
        audience: this.configService.get('GOOGLE_CLIENT_ID'),
      });
      //EL PROBLEMA ESTA EN LA VIRIFICACION DEL TOKEN
      
      
      // Obtener la información del usuario del payload del token
      const payload = ticket.getPayload();
      console.log("PAYLOAD:", payload);
      if (!payload) {
        throw new UnauthorizedException('Invalid token payload');
      }
      console.log("EMAIL:", payload);
      // Crear información del usuario a partir del payload
      const userInfo = {
        email: payload.email,
        firstName: payload.given_name,
        lastName: payload.family_name,
        picture: payload.picture,
        googleId: payload.sub, // El campo 'sub' es el ID único de Google
      };
      // Usar el servicio de autenticación para procesar el login
      return this.authService.googleLogin(userInfo);

    } catch (error) {
      console.error('Error en la autenticación con Google:', error);
      throw new UnauthorizedException('Invalid Google token');
    }
  }

}