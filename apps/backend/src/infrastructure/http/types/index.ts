import {RequestHandler} from 'express';

export enum HttpStatus {
  OK = 200,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  NOT_FOUND = 404,
  UNPROCESSABLE_ENTITY = 422,
  INTERNAL_SERVER_ERROR = 500,
}

export enum HttpMethod {
  GET = 'get',
  POST = 'post',
  DELETE = 'delete',
  PUT = 'put',
}

export interface RestRequest<TBody = unknown, TParams = Record<string, string>> {
  params: TParams;
  body: TBody;
}

export interface RestResponse<T> {
  status: HttpStatus;
  content: T;
}

export interface RestController<T> {
  handle(req: RestRequest): Promise<RestResponse<T>>;
}

export interface HttpRoute {
  method: HttpMethod.GET | HttpMethod.POST | HttpMethod.DELETE | HttpMethod.PUT;
  path: string;
  controller: new (...args: any[]) => RestController<unknown>;
  middlewares: RequestHandler[];
}
