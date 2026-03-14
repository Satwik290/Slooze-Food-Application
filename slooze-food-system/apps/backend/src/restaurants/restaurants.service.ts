import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RestaurantsService {
  constructor(private prisma: PrismaService) {}

  async findAll(regionId: string, role: string) {
    if (role === 'ADMIN') {
      return this.prisma.restaurant.findMany({ include: { region: true } });
    }
    return this.prisma.restaurant.findMany({
      where: { regionId },
      include: { region: true },
    });
  }

  async findOne(id: string, regionId: string, role: string) {
    const whereClause: Record<string, unknown> = { id };
    if (role !== 'ADMIN') {
      whereClause.regionId = regionId;
    }

    const restaurant = await this.prisma.restaurant.findFirst({
      where: whereClause,
      include: { region: true, menuItems: true },
    });

    if (!restaurant) {
      throw new NotFoundException(`Restaurant with ID ${id} not found in your region.`);
    }

    return restaurant;
  }

  async getMenu(id: string, regionId: string, role: string) {
    const restaurant = await this.findOne(id, regionId, role);
    return restaurant.menuItems;
  }
}
