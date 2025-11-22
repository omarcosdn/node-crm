import {HttpMethod, HttpRoute, RestRequest} from '@/infrastructure/http/types';
import {NextFunction, Request, Response, Router} from 'express';
import {container} from 'tsyringe';
import {HealthCheckController} from '@/infrastructure/http/controllers/health-check.controller';
import {
  CreateCustomerController,
  ListCustomersController,
} from '@/infrastructure/http/controllers/customers.controller';
import {CreateTicketController, ListTicketsController} from '@/infrastructure/http/controllers/tickets.controller';
import {MetricsController} from '@/infrastructure/http/controllers/metrics.controller';

const routes: HttpRoute[] = [
  {
    method: HttpMethod.GET,
    path: '/health',
    controller: HealthCheckController,
    middlewares: [],
  },
  {
    method: HttpMethod.GET,
    path: '/crm/customers',
    controller: ListCustomersController,
    middlewares: [],
  },
  {
    method: HttpMethod.POST,
    path: '/crm/customers',
    controller: CreateCustomerController,
    middlewares: [],
  },
  {
    method: HttpMethod.GET,
    path: '/crm/tickets',
    controller: ListTicketsController,
    middlewares: [],
  },
  {
    method: HttpMethod.POST,
    path: '/crm/tickets',
    controller: CreateTicketController,
    middlewares: [],
  },
  {
    method: HttpMethod.GET,
    path: '/crm/metrics',
    controller: MetricsController,
    middlewares: [],
  },
];

export function initializeRoutes(): Router {
  const router = Router();

  routes.forEach((route: HttpRoute) => {
    const controller = container.resolve(route.controller);

    const handler = async (req: Request, res: Response, next: NextFunction) => {
      try {
        const restRequest: RestRequest = {
          params: req.params,
          body: req.body,
        };
        const result = await controller.handle(restRequest);

        res.status(result.status).json(result);
      } catch (err) {
        next(err);
      }
    };

    router[route.method](route.path, ...route.middlewares, handler);
  });

  return router;
}
