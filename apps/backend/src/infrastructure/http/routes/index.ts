import {HttpMethod, HttpRoute, RestRequest} from '@/infrastructure/http/types';
import {NextFunction, Request, Response, Router} from 'express';
import {container} from 'tsyringe';
import {HealthCheckController} from '@/infrastructure/http/controllers/health-check.controller';

const routes: HttpRoute[] = [
  {
    method: HttpMethod.GET,
    path: '/health',
    controller: HealthCheckController,
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
