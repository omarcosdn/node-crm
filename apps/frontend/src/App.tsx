import React from 'react';

const checklistItems = [
  'Domínio separado em camadas de Core e Infra no backend',
  'Frontend React isolado com build independente',
  'Scripts de workspaces para build, testes e formatação',
  'Bases para práticas de Clean Code, SOLID e DDD',
];

const App: React.FC = () => (
  <main className="page">
    <header className="hero">
      <p className="eyebrow">Node CRM</p>
      <h1>Monorepo pronto para um CRM com frontend e backend.</h1>
      <p className="lede">
        Estruturado para favorecer Clean Code, DDD e SOLID com responsabilidade clara entre aplicações.
      </p>
      <div className="cta-group">
        <a className="button primary" href="/api/template-service/health">
          API Healthcheck
        </a>
        <a className="button ghost" href="https://github.com/omarcosdn/node-crm" target="_blank" rel="noreferrer">
          Repositório
        </a>
      </div>
    </header>

    <section className="card">
      <h2>Princípios de engenharia já prontos</h2>
      <ul>
        {checklistItems.map((item) => (
          <li key={item}>
            <span aria-hidden>✓</span>
            {item}
          </li>
        ))}
      </ul>
    </section>

    <section className="grid">
      <article className="card">
        <h3>Backend focado em domínio</h3>
        <p>
          Serviços, casos de uso e contratos ficam em <code>apps/backend/src</code>, com testes automatizados de arquitetura para
          garantir isolamento entre camadas.
        </p>
      </article>
      <article className="card">
        <h3>Frontend desacoplado</h3>
        <p>
          SPA React compilada com Vite para consumir a API e escalar features visuais sem interferir no domínio.
        </p>
      </article>
      <article className="card">
        <h3>Observabilidade pronta</h3>
        <p>
          O backend mantém telemetria via OpenTelemetry, preservando rastreabilidade de ponta a ponta.
        </p>
      </article>
    </section>
  </main>
);

export default App;
