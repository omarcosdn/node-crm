import {UUID} from '@/shared/utils';

export type TicketPriority = 'low' | 'medium' | 'high';
export type TicketStatus = 'open' | 'pending' | 'resolved';

export interface Customer {
  id: UUID;
  name: string;
  company: string;
  email: string;
  segment: 'enterprise' | 'scale-up' | 'smb';
  status: 'active' | 'churn-risk' | 'onboarding';
  satisfaction: number;
  lastContact: string;
  notes?: string;
}

export interface Ticket {
  id: UUID;
  customerId: UUID;
  subject: string;
  priority: TicketPriority;
  status: TicketStatus;
  slaHours: number;
  channel: 'email' | 'chat' | 'phone';
  createdAt: string;
  resolvedAt?: string;
}

export interface MetricSlice {
  label: string;
  value: number;
}

export interface DashboardMetrics {
  kpis: {
    averageSatisfaction: number;
    openTickets: number;
    delayedTickets: number;
    resolutionRate: number;
  };
  satisfactionBreakdown: MetricSlice[];
  slaPerformance: MetricSlice[];
  backlog: MetricSlice[];
}
