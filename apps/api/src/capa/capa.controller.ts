import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { UserRole } from '@audit/database';
import { AuthUser, CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { CapaService } from './capa.service';
import { CreateCapaDto } from './dto/create-capa.dto';
import { UpdateCapaDto, VerifyCapaDto } from './dto/update-capa.dto';

@Controller()
export class CapaController {
  constructor(private readonly service: CapaService) {}

  @Get('nonconformities/:ncId/capa')
  findByNc(@Param('ncId') ncId: string, @CurrentUser() user: AuthUser) {
    return this.service.findByNc(ncId, user);
  }

  // Залруулах арга хэмжээ нэмэх — аудитор болон байгууллагын төлөөлөгч хоёулаа
  @Post('nonconformities/:ncId/capa')
  create(
    @Param('ncId') ncId: string,
    @Body() dto: CreateCapaDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.create(ncId, dto, user);
  }

  // Шинэчлэх — бүх роль (Байгууллагын төлөөлөгч CAPA-аа шинэчилнэ)
  @Patch('capa/:id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCapaDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.update(id, dto, user);
  }

  // Баталгаажуулалт — зөвхөн аудитор/админ
  @Post('capa/:id/verify')
  @Roles(UserRole.ADMIN, UserRole.AUDITOR)
  verify(
    @Param('id') id: string,
    @Body() dto: VerifyCapaDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.verify(id, dto, user);
  }

  @Delete('capa/:id')
  @Roles(UserRole.ADMIN, UserRole.AUDITOR)
  remove(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.service.remove(id, user);
  }
}
