import { Controller, Get } from '@nestjs/common';
import { CronService } from './cron.service';
import { SkipAuth } from 'src/common/decorators/skip-auth.decorator';

@Controller('cron')
@SkipAuth()
export class CronController {
  constructor(private readonly cronService: CronService) {
  }
    @Get('/sync-property-images')
    async syncPropertyImages() {
      return this.cronService.syncPropertyImages()
    }
  }
