import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma/prisma.service';

@Injectable()
export class AuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findUserByUsername(username: string) {
    return await this.prisma.user.findUnique({
      where: { username },
      include: {
        userProfiles: true,
      },
    });
  }

  async findUserProfileByUsername(username: string) {
    return await this.prisma.user.findUnique({
      omit: { password: true },
      where: { username },
      include: {
        userProfiles: true,
      },
    });
  }

  async findUserById(id: string) {
    return await this.prisma.user.findUnique({
      omit: { password: true },
      where: { id },
    });
  }

  async updateUserPassword(userId: string, newPassword: string) {
    return await this.prisma.user.update({
      where: { id: userId },
      data: { password: newPassword },
    });
  }

  async findUserByEmail(email: string) {
    return await this.prisma.user.findUnique({
      where: { email },
    });
  }
}
