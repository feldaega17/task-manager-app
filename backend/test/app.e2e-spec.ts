import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
const request = require('supertest');
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';

describe('App E2E', () => {
  let app: INestApplication;
  let server: any;
  let accessToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

    await app.init();
    await app.listen(0);
    server = app.getHttpServer();
  });

  beforeEach(async () => {
    const dataSource = app.get(DataSource);

    for (const entity of dataSource.entityMetadatas) {
      const repository = dataSource.getRepository(entity.name);
      await repository.query(`DELETE FROM ${entity.tableName}`);
    }
  });

  afterAll(async () => {
    await app.close();
  });

  it('Register user → 201', async () => {
    const res = await request(server).post('/auth/register').send({
      email: 'test@example.com',
      password: 'password',
      name: 'Test User',
    });
    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe('test@example.com');
  });

  it('Login user → 200 & get token', async () => {
    // Register user first
    await request(server).post('/auth/register').send({
      email: 'test@example.com',
      password: 'password',
      name: 'Test User',
    });

    const res = await request(server).post('/auth/login').send({
      email: 'test@example.com',
      password: 'password',
    });
    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeDefined();
    accessToken = res.body.accessToken;
  });

  it('Create task with auth → 201', async () => {
    // Register and login first
    await request(server).post('/auth/register').send({
      email: 'test@example.com',
      password: 'password',
      name: 'Test User',
    });

    const loginRes = await request(server).post('/auth/login').send({
      email: 'test@example.com',
      password: 'password',
    });

    const res = await request(server)
      .post('/tasks')
      .set('Authorization', `Bearer ${loginRes.body.accessToken}`)
      .send({
        title: 'My first task',
        priority: 'HIGH',
      });
    expect(res.status).toBe(201);
    expect(res.body.title).toBe('My first task');
  });

  it('Create task without auth → 401', async () => {
    const res = await request(server).post('/tasks').send({
      title: 'Should fail',
    });
    expect(res.status).toBe(401);
  });
});
