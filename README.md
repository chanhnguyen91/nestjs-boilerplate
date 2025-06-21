# NestJS Boilerplate (Final)

A complete NestJS backend boilerplate with final adjustments, using a monolithic architecture and Domain-Driven Design (DDD).

## Features
- **NestJS**: Monolith with Domain-Driven Design (DDD), organized into domains: `auth`, `user`, `role`.
- **Database**: MySQL with TypeORM, supporting migrations for schema changes and seeding for initial data.
- **Cache**: Redis for caching GET endpoints to improve performance.
- **Authentication**: 
  - JWT-based authentication with access and refresh tokens.
  - Google OAuth2 for social login.
  - Apple Sign-in for iOS integration.
  - Email verification for new users.
  - Password reset functionality with secure token-based flow.
- **Authorization**: Role-based access control (RBAC) with permissions managed via a junction table.
- **API Documentation**: Swagger (OpenAPI) for interactive API docs at `/api/doc`.
- **Testing**: Jest for unit and end-to-end (e2e) tests.
- **Code Quality**: ESLint and Prettier for consistent code style and linting.
- **Containerization**: Docker with `docker-compose.yml` for local development.

## Prerequisites
- Node.js (>=18.x)
- Docker and Docker Compose
- MySQL (>=8.0)
- Redis (>=6.0)
- Google and Apple developer accounts for OAuth2 and Sign-in

## Setup
1. Clone the repository or run this script:
   ```bash
   chmod +x generate-full-boilerplate-final.sh && ./generate-full-boilerplate-final.sh
   ```
2. Copy `.env.example` to `.env` and fill in the required environment variables:
   ```bash
   cp .env.example .env
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start services with Docker Compose:
   ```bash
   docker-compose up -d
   ```
5. Run database migrations:
   ```bash
   npm run migration:run
   ```
6. Seed initial data:
   ```bash
   npm run seed
   ```
7. Start the application:
   ```bash
   npm run start:dev
   ```
8. Access the API documentation at: `http://localhost:3000/api/doc`

## Project Structure
```
nestjs-boilerplate-final/
├── src/
│   ├── common/              # Shared utilities, decorators, guards, etc.
│   ├── config/              # Configuration files (database, redis, etc.)
│   ├── domains/             # DDD domains (auth, user, role)
│   ├── migrations/          # TypeORM migrations
│   ├── scripts/             # Database seeding scripts
├── test/                    # Jest tests (unit and e2e)
├── i18n/                    # Language files (en.json, vi.json)
├── Dockerfile               # Docker configuration for the app
├── docker-compose.yml       # Docker Compose for local development
├── .env.example             # Example environment variables
├── .eslintrc.js             # ESLint configuration
├── .prettierrc              # Prettier configuration
├── tsconfig.json            # TypeScript configuration
├── jest.config.js           # Jest configuration
├── README.md                # Project documentation
```

## Contributing
Feel free to submit issues or pull requests to improve the boilerplate.

## License
MIT
