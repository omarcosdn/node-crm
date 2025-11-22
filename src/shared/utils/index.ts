import env from 'env-var';
import packageJson from '../../../package.json'

export const Env = {
  APP_NAME: packageJson.name,
  APP_VERSION: packageJson.version,
  SERVER_BASE_ROUTE: '/api/template-service',
  NODE_ENV: env.get('NODE_ENV').required().asString(),
  OTEL_EXPORTER_OTLP_TRACES_ENDPOINT: env.get('OTEL_EXPORTER_OTLP_TRACES_ENDPOINT').required().asString(),
  OTEL_EXPORTER_OTLP_METRICS_ENDPOINT: env.get('OTEL_EXPORTER_OTLP_METRICS_ENDPOINT').required().asString(),
  OTEL_EXPORTER_OTLP_LOGS_ENDPOINT: env.get('OTEL_EXPORTER_OTLP_LOGS_ENDPOINT').required().asString(),
  LOG_LEVEL: env.get('LOG_LEVEL').default('info').asString(),
  SERVER_PORT: env.get('SERVER_PORT').default(3000).asInt(),
};

export type UUID = string;

export abstract class Entity {
  private readonly id: UUID;

  protected constructor(id: UUID) {
    this.id = id;
  }

  public getIdentity(): UUID {
    return this.id;
  }

  abstract serialize(): unknown;
}
