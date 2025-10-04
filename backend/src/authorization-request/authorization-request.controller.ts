import { Controller } from '@nestjs/common';
import { AuthorizationRequestService } from './authorization-request.service';

@Controller('authorization-request')
export class AuthorizationRequestController {
  constructor(private readonly authorizationRequestService: AuthorizationRequestService) {}
  
}
