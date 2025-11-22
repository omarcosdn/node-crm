import 'tsarch/dist/jest';
import {filesOfProject} from 'tsarch';

// Architectural rules for the core module

describe('Core Module Architecture', () => {
  jest.setTimeout(60000);

  it('core should not depend on infrastructure', async () => {
    const rule = filesOfProject()
      .inFolder('src/core')
      .shouldNot()
      .dependOnFiles()
      .inFolder('src/infrastructure');
    expect(rule).toPassAsync();
  });

  describe('Naming Conventions', () => {
    it('entity files must end with .entity.ts', async () => {
    const rule = filesOfProject()
      .inFolder('src/core/entities')
        .should()
        .matchPattern('.*entity.ts');
      expect(rule).toPassAsync();
    });

    it('gateway files must end with .gateway.ts', async () => {
    const rule = filesOfProject()
      .inFolder('src/core/gateways')
        .should()
        .matchPattern('.*gateway.ts');
      expect(rule).toPassAsync();
    });

    it('repository files must end with .repository.ts', async () => {
    const rule = filesOfProject()
      .inFolder('src/core/repositories')
        .should()
        .matchPattern('.*repository.ts');
      expect(rule).toPassAsync();
    });

    it('service files must end with .service.ts', async () => {
    const rule = filesOfProject()
      .inFolder('src/core/services')
        .should()
        .matchPattern('.*service.ts');
      expect(rule).toPassAsync();
    });

    it('usecase files must end with .usecase.ts', async () => {
    const rule = filesOfProject()
      .inFolder('src/core/usecases')
        .should()
        .matchPattern('.*usecase.ts');
      expect(rule).toPassAsync();
    });
  });

  describe('Dependency Rules', () => {
    it('entities must not depend on repositories, services, or usecases', async () => {
      const rule = filesOfProject()
        .matchingPattern('.*entity.ts')
        .shouldNot()
        .dependOnFiles()
        .matchingPattern('.*service.ts|.*repository.ts|.*usecase.ts');
      expect(rule).toPassAsync();
    });

    it('gateways must not depend on repositories, services, or usecases', async () => {
      const rule = filesOfProject()
        .matchingPattern('.*gateway.ts')
        .shouldNot()
        .dependOnFiles()
        .matchingPattern('.*service.ts|.*usecase.ts|.*repository.ts');
      expect(rule).toPassAsync();
    });

    it('repositories must not depend on services, usecases, or gateways', async () => {
      const rule = filesOfProject()
        .matchingPattern('.*repository.ts')
        .shouldNot()
        .dependOnFiles()
        .matchingPattern('.*service.ts|.*usecase.ts|.*gateway.ts');
      expect(rule).toPassAsync();
    });

    it('services must not depend on usecases', async () => {
      const rule = filesOfProject()
        .matchingPattern('.*service.ts')
        .shouldNot()
        .dependOnFiles()
        .matchingPattern('.*usecase.ts');
      expect(rule).toPassAsync();
    });

    it('usecases must not depend on other usecases', async () => {
      const rule = filesOfProject()
        .matchingPattern('.*usecase.ts')
        .shouldNot()
        .dependOnFiles()
        .matchingPattern('.*usecase.ts');
      expect(rule).toPassAsync();
    });
  });
});
