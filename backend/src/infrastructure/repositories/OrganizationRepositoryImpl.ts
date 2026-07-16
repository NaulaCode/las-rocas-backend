import { OrganizationRepository } from '../../domain/repositories/OrganizationRepository';
import { Organization, UpdateOrganizationData } from '../../domain/entities/Organization';
import { getPrisma } from '../database/postgres/PrismaService';
import { Prisma } from '@prisma/client';

const FIXED_ID = '00000000-0000-0000-0000-000000000001';

export class OrganizationRepositoryImpl implements OrganizationRepository {

  async find(): Promise<Organization | null> {
    const prisma = getPrisma();
    const result = await prisma.organization.findFirst();
    return result as Organization | null;
  }

  async update(data: UpdateOrganizationData): Promise<Organization | null> {
    const prisma = getPrisma();
    const exists = await prisma.organization.findFirst();
    if (!exists) return null;

    const updateData: Prisma.OrganizationUpdateInput = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.legalName !== undefined) updateData.legalName = data.legalName;
    if (data.ruc !== undefined) updateData.ruc = data.ruc;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.history !== undefined) updateData.history = data.history;
    if (data.mission !== undefined) updateData.mission = data.mission;
    if (data.vision !== undefined) updateData.vision = data.vision;
    if (data.objectives !== undefined) updateData.objectives = data.objectives;
    if (data.address !== undefined) updateData.address = data.address;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.website !== undefined) updateData.website = data.website;
    if (data.logo !== undefined) updateData.logo = data.logo;
    if (data.coverImage !== undefined) updateData.coverImage = data.coverImage;
    if (data.pageContent !== undefined) {
      const existing = exists.pageContent as Record<string, any> | null;
      updateData.pageContent = { ...existing, ...data.pageContent } as any;
    }
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    if (Object.keys(updateData).length === 0) return exists as Organization;

    const result = await prisma.organization.update({
      where: { id: FIXED_ID },
      data: updateData,
    });
    return result as Organization;
  }
}
