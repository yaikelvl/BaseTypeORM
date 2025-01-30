import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/auth.entity';

@Module({
  controllers: [AuthController],
  imports: [TypeOrmModule.forFeature([User])],
  exports: [AuthService, TypeOrmModule],
  providers: [AuthService],
})
export class AuthModule {}
