import {injectable} from 'tsyringe';
import {DashboardMetrics} from '@/core/entities/crm';
import {CrmService} from '@/core/services/crm.service';
import {HttpStatus, RestController, RestRequest, RestResponse} from '@/infrastructure/http/types';

@injectable()
export class MetricsController implements RestController<DashboardMetrics> {
  constructor(private readonly crmService: CrmService) {}

  async handle(_req: RestRequest): Promise<RestResponse<DashboardMetrics>> {
    return {status: HttpStatus.OK, content: this.crmService.getDashboardMetrics()};
  }
}
