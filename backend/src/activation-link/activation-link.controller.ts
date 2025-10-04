import { Controller, Get, Logger, Param } from '@nestjs/common';
import { ActivationLinkService } from './activation-link.service';

@Controller('activate')
export class ActivationLinkController {
  constructor(private readonly activationLinkService: ActivationLinkService) {}

  private readonly logger = new Logger(ActivationLinkController.name);

  @Get(':link')
  activate(@Param('link') link: string) {
    this.logger.log(`Activating link: ${link}`);
    return this.activationLinkService.activate(link);
  }
}
