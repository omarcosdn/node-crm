import 'reflect-metadata';
import {HealthCheckController} from '@/infrastructure/http/controllers/health-check.controller';
import {HttpStatus, RestRequest} from '@/infrastructure/http/types';

describe('HealthCheckController', () => {
  let sut: HealthCheckController;

  beforeEach(() => {
    sut = new HealthCheckController();
  });

  it('should return a OK status', async () => {
    // Arrange
    const req: RestRequest = {} as Partial<RestRequest> as RestRequest;

    // Act
    const res = await sut.handle(req);

    // Assert
    expect(res.status).toBe(HttpStatus.OK);
    expect(res.content).toBe('everything is fine');
  });
});
