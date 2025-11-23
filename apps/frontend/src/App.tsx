import React, {useEffect, useState} from 'react';
import './styles.css';

const API_BASE = '/api';

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

function Card({title, subtitle, children, id}: {title: string; subtitle?: string; children: React.ReactNode; id?: string}) {
  return (
    <article className="card" id={id}>
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

const App: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [error, setError] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(true);

  const loadData = async () => {
    try {
      setError('');
      const metricsResponse = await fetchFromApi<DashboardMetrics>('/crm/metrics');

      setMetrics(metricsResponse);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="layout">
      <aside className={`sidebar ${isMenuOpen ? 'is-open' : 'is-collapsed'}`}>
        <button
          className="hamburger"
          type="button"
          onClick={() => setIsMenuOpen((prev) => !prev)}
          aria-label={isMenuOpen ? 'Recolher menu' : 'Expandir menu'}
        >
          ☰
        </button>
        <div className="brand-mark" aria-hidden />
        <div className="menu">
          <a href="#dashboard">Principal</a>
        </div>
      </aside>

      <main className="page" id="dashboard">
        {error && <p className="error">{error}</p>}
        {metrics && (
          <section className="kpi-strip">
            <div>
              <p className="eyebrow">Satisfação média</p>
              <span className="kpi-value">{metrics.kpis.averageSatisfaction}</span>
            </div>
            <div>
              <p className="eyebrow">Tickets em aberto</p>
              <span className="kpi-value">{metrics.kpis.openTickets}%</span>
            </div>
            <div>
              <p className="eyebrow">Atrasos</p>
              <span className="kpi-value">{metrics.kpis.delayedTickets}</span>
            </div>
            <div>
              <p className="eyebrow">Taxa de resolução</p>
              <span className="kpi-value">{metrics.kpis.resolutionRate}%</span>
            </div>
          </section>
        )}

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
      </main>
    </div>
  );
};

export default App;
