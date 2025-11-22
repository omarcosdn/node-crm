export type ErrorOptions = {
  cause?: Error;
  metadata?: Record<string, unknown>;
};

export type ErrorResponse = {
  content: {
    message: string;
    metadata?: unknown;
  };
};

export abstract class BaseException extends Error {
  public readonly cause?: Error;
  public readonly metadata?: Record<string, unknown>;

  protected constructor(message: string, options: ErrorOptions) {
    super(message);
    this.name = this.constructor.name;
    this.cause = options.cause;
    this.metadata = options.metadata;
    Error.captureStackTrace(this, this.constructor);
  }

  public toResponse(): ErrorResponse {
    return {
      content: {
        message: this.message,
        metadata: this.metadata,
      },
    };
  }
}

export class DomainException extends BaseException {
  constructor(message: string = 'BusinessError', options: ErrorOptions = {}) {
    super(message, {
      ...options,
    });
    this.name = this.constructor.name;
  }
}

export class NotFoundException extends BaseException {
  constructor(message: string = 'NotFound', options: ErrorOptions = {}) {
    super(message, {
      ...options,
    });
    this.name = this.constructor.name;
  }
}

export class WebException extends BaseException {
  private readonly statusCode: number;

  constructor(message: string = 'InternalServerError', statusCode: number = 500, options: ErrorOptions = {}) {
    super(message, {
      ...options,
    });
    this.name = this.constructor.name;
    this.statusCode = statusCode;
  }

  public getStatusCode(): number {
    return this.statusCode;
  }

  public toResponse(): ErrorResponse {
    return {
      content: {
        message: this.message,
        metadata: this.metadata,
      },
    };
  }
}
