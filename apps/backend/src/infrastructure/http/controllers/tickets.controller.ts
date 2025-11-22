import {injectable} from 'tsyringe';
import {Ticket} from '@/core/entities/crm';
import {CreateTicketInput, CrmService} from '@/core/services/crm.service';
import {HttpStatus, RestController, RestRequest, RestResponse} from '@/infrastructure/http/types';
import {DomainException} from '@/shared/exceptions';

@injectable()
export class ListTicketsController implements RestController<Ticket[]> {
  constructor(private readonly crmService: CrmService) {}

  async handle(_req: RestRequest): Promise<RestResponse<Ticket[]>> {
    return {status: HttpStatus.OK, content: this.crmService.listTickets()};
  }
}

@injectable()
export class CreateTicketController implements RestController<Ticket> {
  constructor(private readonly crmService: CrmService) {}

  async handle(req: RestRequest<CreateTicketInput>): Promise<RestResponse<Ticket>> {
    const {customerId, subject, priority, channel, slaHours, status} = req.body;

    if (!customerId || !subject || !priority || !channel || !slaHours) {
      throw new DomainException('Campos obrigatórios ausentes ao abrir o ticket.');
    }

    const ticket = this.crmService.createTicket({
      customerId,
      subject,
      priority,
      channel,
      slaHours: Number(slaHours),
      status,
    });

    return {status: HttpStatus.OK, content: ticket};
  }
}
