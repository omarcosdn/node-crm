import {injectable} from 'tsyringe';
import {Customer} from '@/core/entities/crm';
import {CreateCustomerInput, CrmService} from '@/core/services/crm.service';
import {HttpStatus, RestController, RestRequest, RestResponse} from '@/infrastructure/http/types';
import {DomainException} from '@/shared/exceptions';

@injectable()
export class ListCustomersController implements RestController<Customer[]> {
  constructor(private readonly crmService: CrmService) {}

  async handle(_req: RestRequest): Promise<RestResponse<Customer[]>> {
    return {status: HttpStatus.OK, content: this.crmService.listCustomers()};
  }
}

@injectable()
export class CreateCustomerController implements RestController<Customer> {
  constructor(private readonly crmService: CrmService) {}

  async handle(req: RestRequest<CreateCustomerInput>): Promise<RestResponse<Customer>> {
    const {name, company, email, segment, satisfaction, status, notes} = req.body;

    if (!name || !company || !email || !segment || !status) {
      throw new DomainException('Campos obrigatórios ausentes ao cadastrar cliente.');
    }

    const normalizedSatisfaction = Math.min(Math.max(Number(satisfaction ?? 0), 0), 5);

    const customer = this.crmService.createCustomer({
      name,
      company,
      email,
      segment,
      status,
      satisfaction: normalizedSatisfaction,
      notes,
    });

    return {status: HttpStatus.OK, content: customer};
  }
}
