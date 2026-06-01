import { Controller, Get, Param } from '@nestjs/common';
import { StandardsService } from './standards.service';

@Controller('standards')
export class StandardsController {
  constructor(private readonly standardsService: StandardsService) {}

  @Get()
  findAll() {
    return this.standardsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.standardsService.findOne(id);
  }

  @Get(':id/controls')
  getControls(@Param('id') id: string) {
    return this.standardsService.getControls(id);
  }
}
