import {injectable} from 'tsyringe';
import {HttpStatus, RestController, RestRequest, RestResponse} from '@/infrastructure/http/types';

@injectable()
export class HealthCheckController implements RestController<string> {
  async handle(req: RestRequest): Promise<RestResponse<string>> {
    return {
      status: HttpStatus.OK,
      content: 'everything is fine',
    };
  }
}
