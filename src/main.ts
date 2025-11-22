import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import {errorHandler, logRequest, routeNotFound} from '@/infrastructure/http/middlewares';
import {initializeRoutes} from '@/infrastructure/http/routes';
import {Env} from '@/shared/utils';
import {logger} from '@/shared/logger';

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(logRequest);

app.use(Env.SERVER_BASE_ROUTE, initializeRoutes());
app.use(routeNotFound);
app.use(errorHandler);

app.listen(Env.SERVER_PORT, () => {
  logger.info(`Server started on port #${Env.SERVER_PORT}`);
});
