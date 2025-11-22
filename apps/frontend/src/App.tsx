import React, {useEffect, useMemo, useState} from 'react';
import './styles.css';

const API_BASE = '/api';

type Customer = {
  id: string;
  name: string;
  company: string;
  email: string;
  segment: 'enterprise' | 'scale-up' | 'smb';
  status: 'active' | 'churn-risk' | 'onboarding';
  satisfaction: number;
  lastContact: string;
  notes?: string;
};

type Ticket = {
  id: string;
  customerId: string;
  subject: string;
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'pending' | 'resolved';
  slaHours: number;
  channel: 'email' | 'chat' | 'phone';
  createdAt: string;
  resolvedAt?: string;
};

type MetricSlice = {
  label: string;
  value: number;
};

type DashboardMetrics = {
  kpis: {
    averageSatisfaction: number;
    openTickets: number;
    delayedTickets: number;
    resolutionRate: number;
  };
  satisfactionBreakdown: MetricSlice[];
  slaPerformance: MetricSlice[];
  backlog: MetricSlice[];
};

async function fetchFromApi<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {'Content-Type': 'application/json', ...(options?.headers ?? {})},
    ...options,
  });

  if (!response.ok) {
    throw new Error('Não foi possível comunicar com a API.');
  }

  const payload = await response.json();
  return payload.content as T;
}

const formatDate = (value: string) => new Date(value).toLocaleDateString('pt-BR');

function ProgressBar({label, value, highlight}: {label: string; value: number; highlight?: boolean}) {
  return (
    <div className="progress-row">
      <div className="progress-label">
        <span>{label}</span>
        <span className="progress-value">{value}%</span>
      </div>
      <div className="progress-track">
        <div className={`progress-fill ${highlight ? 'is-highlight' : ''}`} style={{width: `${value}%`}} aria-hidden />
      </div>
    </div>
  );
}

function Card({title, subtitle, children}: {title: string; subtitle?: string; children: React.ReactNode}) {
  return (
    <article className="card">
      <header className="card-header">
        <div>
          <p className="eyebrow">{subtitle}</p>
          <h3>{title}</h3>
        </div>
      </header>
      <div>{children}</div>
    </article>
  );
}

const initialCustomer = {
  name: '',
  company: '',
  email: '',
  segment: 'smb' as const,
  status: 'onboarding' as const,
  satisfaction: 4,
  notes: '',
};

const initialTicket = {
  customerId: '',
  subject: '',
  priority: 'medium' as const,
  channel: 'email' as const,
  slaHours: 24,
  status: 'open' as const,
};

const App: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [customerForm, setCustomerForm] = useState(initialCustomer);
  const [ticketForm, setTicketForm] = useState(initialTicket);

  const openTickets = useMemo(() => tickets.filter((ticket) => ticket.status !== 'resolved'), [tickets]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const [customerResponse, ticketResponse, metricsResponse] = await Promise.all([
        fetchFromApi<Customer[]>('/crm/customers'),
        fetchFromApi<Ticket[]>('/crm/tickets'),
        fetchFromApi<DashboardMetrics>('/crm/metrics'),
      ]);

      setCustomers(customerResponse);
      setTickets(ticketResponse);
      setMetrics(metricsResponse);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCustomerSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const created = await fetchFromApi<Customer>('/crm/customers', {
        method: 'POST',
        body: JSON.stringify(customerForm),
      });

      setCustomers((prev) => [created, ...prev]);
      setCustomerForm(initialCustomer);
      loadData();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleTicketSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const created = await fetchFromApi<Ticket>('/crm/tickets', {
        method: 'POST',
        body: JSON.stringify(ticketForm),
      });

      setTickets((prev) => [created, ...prev]);
      setTicketForm(initialTicket);
      loadData();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <main className="page">
      <header className="hero">
        <div>
          <p className="eyebrow">Node CRM</p>
          <h1>CRM full-stack pronto para pilotar relacionamento.</h1>
          <p className="lede">
            Monitore satisfação, atrasos de SLA e backlog de tickets em um painel unificado com API dedicada.
          </p>
          <div className="cta-group">
            <button className="button primary" onClick={loadData} disabled={loading}>
              {loading ? 'Sincronizando...' : 'Atualizar dados'}
            </button>
            <a className="button ghost" href="/api/health" target="_blank" rel="noreferrer">
              API Healthcheck
            </a>
          </div>
          {error && <p className="error">{error}</p>}
        </div>
        {metrics && (
          <div className="hero-panel">
            <p className="eyebrow">KPIs em destaque</p>
            <div className="kpi-grid">
              <div>
                <span className="kpi-value">{metrics.kpis.averageSatisfaction}</span>
                <p className="kpi-label">Satisfação média</p>
              </div>
              <div>
                <span className="kpi-value">{metrics.kpis.openTickets}%</span>
                <p className="kpi-label">Tickets em aberto</p>
              </div>
              <div>
                <span className="kpi-value">{metrics.kpis.delayedTickets}</span>
                <p className="kpi-label">Atrasos</p>
              </div>
              <div>
                <span className="kpi-value">{metrics.kpis.resolutionRate}%</span>
                <p className="kpi-label">Taxa de resolução</p>
              </div>
            </div>
          </div>
        )}
      </header>

      <section className="grid two-cols">
        <Card title="Clientes ativos" subtitle="Visão de relacionamento">
          <div className="table">
            <div className="table-head">
              <span>Cliente</span>
              <span>Status</span>
              <span>Satisfação</span>
              <span>Último contato</span>
            </div>
            {customers.map((customer) => (
              <div key={customer.id} className="table-row">
                <div>
                  <p className="strong">{customer.name}</p>
                  <p className="muted">{customer.company}</p>
                </div>
                <span className={`pill pill-${customer.status}`}>{customer.status}</span>
                <span className="strong">{customer.satisfaction.toFixed(1)}</span>
                <span className="muted">{formatDate(customer.lastContact)}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Tickets em atendimento" subtitle="Controle de SLA">
          <div className="table">
            <div className="table-head">
              <span>Assunto</span>
              <span>Prioridade</span>
              <span>Status</span>
              <span>Criado em</span>
            </div>
            {openTickets.map((ticket) => (
              <div key={ticket.id} className="table-row">
                <div>
                  <p className="strong">{ticket.subject}</p>
                  <p className="muted">{ticket.channel.toUpperCase()}</p>
                </div>
                <span className={`pill pill-${ticket.priority}`}>{ticket.priority}</span>
                <span className={`pill pill-${ticket.status}`}>{ticket.status}</span>
                <span className="muted">{formatDate(ticket.createdAt)}</span>
              </div>
            ))}
          </div>
        </Card>
      </section>

      {metrics && (
        <section className="grid three-cols">
          <Card title="Satisfação do cliente" subtitle="Distribuição de sentimento">
            {metrics.satisfactionBreakdown.map((slice) => (
              <ProgressBar key={slice.label} label={slice.label} value={slice.value} highlight={slice.label === 'Promotores'} />
            ))}
          </Card>

          <Card title="Performance de SLA" subtitle="Atrasos vs dentro do prazo">
            {metrics.slaPerformance.map((slice) => (
              <ProgressBar key={slice.label} label={slice.label} value={slice.value} highlight={slice.label === 'Dentro do SLA'} />
            ))}
          </Card>

          <Card title="Backlog" subtitle="Participação por estágio">
            {metrics.backlog.map((slice) => (
              <ProgressBar key={slice.label} label={slice.label} value={slice.value} highlight={slice.label === 'Resolvidos'} />
            ))}
          </Card>
        </section>
      )}

      <section className="grid two-cols">
        <Card title="Adicionar cliente" subtitle="Cadastro rápido">
          <form className="form" onSubmit={handleCustomerSubmit}>
            <label>
              Nome completo
              <input
                required
                value={customerForm.name}
                onChange={(e) => setCustomerForm({...customerForm, name: e.target.value})}
                placeholder="Ex: Ana Souza"
              />
            </label>
            <label>
              Empresa
              <input
                required
                value={customerForm.company}
                onChange={(e) => setCustomerForm({...customerForm, company: e.target.value})}
                placeholder="Ex: TechGrow"
              />
            </label>
            <label>
              Email
              <input
                required
                type="email"
                value={customerForm.email}
                onChange={(e) => setCustomerForm({...customerForm, email: e.target.value})}
                placeholder="cliente@empresa.com"
              />
            </label>
            <div className="form-grid">
              <label>
                Segmento
                <select
                  value={customerForm.segment}
                  onChange={(e) => setCustomerForm({...customerForm, segment: e.target.value as Customer['segment']})}
                >
                  <option value="smb">SMB</option>
                  <option value="scale-up">Scale-up</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </label>
              <label>
                Status
                <select
                  value={customerForm.status}
                  onChange={(e) => setCustomerForm({...customerForm, status: e.target.value as Customer['status']})}
                >
                  <option value="onboarding">Onboarding</option>
                  <option value="active">Ativo</option>
                  <option value="churn-risk">Risco de churn</option>
                </select>
              </label>
              <label>
                Satisfação
                <input
                  type="number"
                  min={0}
                  max={5}
                  step={0.1}
                  value={customerForm.satisfaction}
                  onChange={(e) => setCustomerForm({...customerForm, satisfaction: Number(e.target.value)})}
                />
              </label>
            </div>
            <label>
              Observações
              <textarea
                value={customerForm.notes}
                onChange={(e) => setCustomerForm({...customerForm, notes: e.target.value})}
                placeholder="Preferências, riscos, próximos passos"
              />
            </label>
            <button className="button primary" type="submit" disabled={loading}>
              Registrar cliente
            </button>
          </form>
        </Card>

        <Card title="Registrar ticket" subtitle="Controle imediato de demandas">
          <form className="form" onSubmit={handleTicketSubmit}>
            <label>
              Cliente
              <select
                required
                value={ticketForm.customerId}
                onChange={(e) => setTicketForm({...ticketForm, customerId: e.target.value})}
              >
                <option value="">Selecione um cliente</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name} — {customer.company}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Assunto
              <input
                required
                value={ticketForm.subject}
                onChange={(e) => setTicketForm({...ticketForm, subject: e.target.value})}
                placeholder="Descreva a demanda"
              />
            </label>
            <div className="form-grid">
              <label>
                Prioridade
                <select
                  value={ticketForm.priority}
                  onChange={(e) => setTicketForm({...ticketForm, priority: e.target.value as Ticket['priority']})}
                >
                  <option value="low">Baixa</option>
                  <option value="medium">Média</option>
                  <option value="high">Alta</option>
                </select>
              </label>
              <label>
                Canal
                <select
                  value={ticketForm.channel}
                  onChange={(e) => setTicketForm({...ticketForm, channel: e.target.value as Ticket['channel']})}
                >
                  <option value="email">Email</option>
                  <option value="chat">Chat</option>
                  <option value="phone">Telefone</option>
                </select>
              </label>
              <label>
                SLA (horas)
                <input
                  type="number"
                  min={1}
                  value={ticketForm.slaHours}
                  onChange={(e) => setTicketForm({...ticketForm, slaHours: Number(e.target.value)})}
                />
              </label>
            </div>
            <label>
              Status inicial
              <select value={ticketForm.status} onChange={(e) => setTicketForm({...ticketForm, status: e.target.value as Ticket['status']})}>
                <option value="open">Aberto</option>
                <option value="pending">Em andamento</option>
                <option value="resolved">Resolvido</option>
              </select>
            </label>
            <button className="button primary" type="submit" disabled={loading}>
              Criar ticket
            </button>
          </form>
        </Card>
      </section>
    </main>
  );
};

export default App;
