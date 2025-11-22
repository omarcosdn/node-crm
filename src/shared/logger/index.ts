import pino, {Logger, LoggerOptions} from 'pino';
import {Env} from '@/shared/utils';

function createLogger(options: LoggerOptions = {}): Logger {
  const isDev = Env.NODE_ENV !== 'production';

  if (isDev) {
    options.transport = {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'yyyy-mm-dd HH:MM:ss',
        ignore: 'pid,hostname',
      },
    };
  }

  return pino({
    level: Env.LOG_LEVEL,
    timestamp: pino.stdTimeFunctions.isoTime,
    ...options,
  });
}

export const logger = createLogger();
