import {NextFunction, Request, Response} from 'express';
import {HttpStatus} from '@/infrastructure/http/types';
import {DomainException, NotFoundException, WebException} from '@/shared/exceptions';
import {logger} from '@/shared/logger';

export function logRequest(req: Request, res: Response, next: NextFunction): void {
  const headers = {...req.headers};
  if ('authorization' in headers) {
    headers.authorization = '***';
  }

  const start = process.hrtime.bigint();
  logger.info({method: req.method, url: req.originalUrl, headers}, `Entering: ${req.method} ${req.originalUrl}`);

  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - start) / 1_000_000;
    logger.info(
      {
        method: req.method,
        url: req.originalUrl,
        status: res.statusCode,
        durationMs: durationMs.toFixed(2),
      },
      `Exiting: ${req.method} ${req.originalUrl} ${res.statusCode} ${durationMs.toFixed(2)}ms`
    );
  });

  next();
}

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof DomainException) {
    logger.warn(err, `${err.name} - Message: ${err.message}`);

    res.status(HttpStatus.BAD_REQUEST).json(err.toResponse());
    return;
  }

  if (err instanceof NotFoundException) {
    logger.warn(err, `${err.name} - Message: ${err.message}`);

    res.status(HttpStatus.NOT_FOUND).json(err.toResponse());
    return;
  }

  if (err instanceof WebException) {
    logger.warn(`${err.name} - Error: ${err.message}`);

    res.status(err.getStatusCode()).json(err.toResponse());
    return;
  }

  logger.error(`An unknown server error has occurred. Message: ${err.message}`);

  res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    content: {
      message: 'An unknown server error has occurred.',
    },
  });
}

export function routeNotFound(req: Request, _res: Response, next: NextFunction): void {
  return next(new NotFoundException(`Cannot ${req.method} ${req.originalUrl}`));
}
