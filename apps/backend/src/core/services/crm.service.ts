import {injectable, singleton} from 'tsyringe';
import {v4 as uuid} from 'uuid';
import {Customer, DashboardMetrics, MetricSlice, Ticket, TicketPriority, TicketStatus} from '@/core/entities/crm';

export interface CreateCustomerInput {
  name: string;
  company: string;
  email: string;
  segment: Customer['segment'];
  status: Customer['status'];
  satisfaction: number;
  notes?: string;
}

export interface CreateTicketInput {
  customerId: string;
  subject: string;
  priority: TicketPriority;
  channel: Ticket['channel'];
  slaHours: number;
  status?: TicketStatus;
}

@singleton()
@injectable()
export class CrmService {
  private customers: Customer[] = [
    {
      id: uuid(),
      name: 'Ana Souza',
      company: 'TechGrow',
      email: 'ana.souza@techgrow.io',
      segment: 'scale-up',
      status: 'active',
      satisfaction: 4.7,
      lastContact: new Date().toISOString(),
      notes: 'Gosta de ser avisada sobre novas integrações.',
    },
    {
      id: uuid(),
      name: 'Carlos Pereira',
      company: 'Finvest',
      email: 'carlos.pereira@finvest.com',
      segment: 'enterprise',
      status: 'churn-risk',
      satisfaction: 3.1,
      lastContact: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(),
      notes: 'Solicitou revisão de contrato e ajuste de SLA.',
    },
    {
      id: uuid(),
      name: 'Julia Ramos',
      company: 'LogiX',
      email: 'julia.ramos@logix.com',
      segment: 'smb',
      status: 'onboarding',
      satisfaction: 4.2,
      lastContact: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
      notes: 'Precisa de playbook para o time comercial.',
    },
  ];

  private tickets: Ticket[] = [
    {
      id: uuid(),
      customerId: this.customers[0].id,
      subject: 'Integração com CRM legada',
      priority: 'high',
      status: 'pending',
      slaHours: 24,
      channel: 'email',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
    },
    {
      id: uuid(),
      customerId: this.customers[1].id,
      subject: 'Erro no relatório de leads',
      priority: 'medium',
      status: 'resolved',
      slaHours: 48,
      channel: 'chat',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
      resolvedAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    },
    {
      id: uuid(),
      customerId: this.customers[2].id,
      subject: 'Treinamento para novos usuários',
      priority: 'low',
      status: 'open',
      slaHours: 72,
      channel: 'phone',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    },
  ];

  listCustomers(): Customer[] {
    return this.customers;
  }

  listTickets(): Ticket[] {
    return this.tickets;
  }

  createCustomer(payload: CreateCustomerInput): Customer {
    const newCustomer: Customer = {
      ...payload,
      id: uuid(),
      lastContact: new Date().toISOString(),
    };

    this.customers = [newCustomer, ...this.customers];
    return newCustomer;
  }

  createTicket(payload: CreateTicketInput): Ticket {
    const newTicket: Ticket = {
      ...payload,
      id: uuid(),
      status: payload.status ?? 'open',
      createdAt: new Date().toISOString(),
    };

    this.tickets = [newTicket, ...this.tickets];
    return newTicket;
  }

  getDashboardMetrics(): DashboardMetrics {
    const totalCustomers = this.customers.length;
    const satisfactionBreakdown = this.buildSatisfactionSlices(totalCustomers);
    const {onTime, late} = this.calculateSlaPerformance();
    const backlog = this.calculateBacklog();

    const averageSatisfaction = Number(
      (
        this.customers.reduce((sum, customer) => sum + customer.satisfaction, 0) /
        (totalCustomers || 1)
      ).toFixed(2)
    );

    const openTickets = backlog.find((slice) => slice.label === 'Em aberto')?.value ?? 0;
    const delayedTickets = late.count;
    const resolutionRate = Number(((this.getResolvedTickets().length / (this.tickets.length || 1)) * 100).toFixed(1));

    return {
      kpis: {
        averageSatisfaction,
        openTickets,
        delayedTickets,
        resolutionRate,
      },
      satisfactionBreakdown,
      slaPerformance: [
        {label: 'Dentro do SLA', value: onTime.percentage},
        {label: 'Fora do SLA', value: late.percentage},
      ],
      backlog,
    };
  }

  private getResolvedTickets(): Ticket[] {
    return this.tickets.filter((ticket) => ticket.status === 'resolved');
  }

  private calculateBacklog(): MetricSlice[] {
    const total = this.tickets.length || 1;
    const open = this.tickets.filter((ticket) => ticket.status === 'open').length;
    const pending = this.tickets.filter((ticket) => ticket.status === 'pending').length;
    const resolved = this.getResolvedTickets().length;

    return [
      {label: 'Em aberto', value: Number(((open / total) * 100).toFixed(1))},
      {label: 'Em andamento', value: Number(((pending / total) * 100).toFixed(1))},
      {label: 'Resolvidos', value: Number(((resolved / total) * 100).toFixed(1))},
    ];
  }

  private buildSatisfactionSlices(totalCustomers: number): MetricSlice[] {
    const promoters = this.customers.filter((customer) => customer.satisfaction >= 4.5).length;
    const passives = this.customers.filter((customer) => customer.satisfaction >= 3.5 && customer.satisfaction < 4.5).length;
    const detractors = totalCustomers - promoters - passives;

    return [
      {label: 'Promotores', value: Number(((promoters / (totalCustomers || 1)) * 100).toFixed(1))},
      {label: 'Neutros', value: Number(((passives / (totalCustomers || 1)) * 100).toFixed(1))},
      {label: 'Detratores', value: Number(((detractors / (totalCustomers || 1)) * 100).toFixed(1))},
    ];
  }

  private calculateSlaPerformance(): {onTime: {percentage: number}; late: {count: number; percentage: number}} {
    const now = Date.now();
    const total = this.tickets.length || 1;

    const lateTickets = this.tickets.filter((ticket) => {
      const created = new Date(ticket.createdAt).getTime();
      const deadline = created + ticket.slaHours * 60 * 60 * 1000;
      const resolvedAt = ticket.resolvedAt ? new Date(ticket.resolvedAt).getTime() : now;

      return resolvedAt > deadline;
    });

    const onTimeCount = total - lateTickets.length;

    return {
      onTime: {percentage: Number(((onTimeCount / total) * 100).toFixed(1))},
      late: {count: lateTickets.length, percentage: Number(((lateTickets.length / total) * 100).toFixed(1))},
    };
  }
}
