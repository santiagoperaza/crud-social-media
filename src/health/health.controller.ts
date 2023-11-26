import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  HealthCheckService,
  TypeOrmHealthIndicator,
  HealthCheck,
  HttpHealthIndicator,
} from '@nestjs/terminus';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
    private http: HttpHealthIndicator,
  ) {}

  /**
   * Performs a health check to validate that the service is running OK.
   * @returns details about service connection
   */
  @Get('live')
  @HealthCheck()
  check() {
    const port = +process.env.PORT || 3000;
    return this.health.check([
      () =>
        this.http.pingCheck('Basic check', `http://localhost:${port}/users`),
    ]);
  }

  /**
   * Performs a health check to validate that the database connection is successful.
   */
  @Get('ready')
  @HealthCheck()
  checkDb() {
    return this.health.check([() => this.db.pingCheck('database')]);
  }
}
