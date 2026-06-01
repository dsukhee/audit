import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserRole } from '@audit/database';
import { AuthUser, CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateEvidenceDto } from './dto/create-evidence.dto';
import { EvidenceService } from './evidence.service';

@Controller('audits/:auditId/evidence')
export class EvidenceController {
  constructor(private readonly evidenceService: EvidenceService) {}

  // Нотлох баримт оруулах — бүх роль (Байгууллагын төлөөлөгч ч оруулна)
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  create(
    @Param('auditId') auditId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: CreateEvidenceDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.evidenceService.create(auditId, file, dto, user);
  }

  @Get()
  findByAudit(@Param('auditId') auditId: string, @CurrentUser() user: AuthUser) {
    return this.evidenceService.findByAudit(auditId, user);
  }

  @Get(':id/download')
  download(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.evidenceService.getDownloadUrl(id, user);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.AUDITOR)
  remove(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.evidenceService.remove(id, user);
  }
}
