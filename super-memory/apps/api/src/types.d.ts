import "fastify";

declare module "fastify" {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest) => Promise<void>;
    requireAuthOrApiKey: (request: FastifyRequest) => Promise<void>;
    authenticateApiKey: (request: FastifyRequest) => Promise<void>;
  }

  interface FastifyRequest {
    authApiKeyId?: string;
  }
}
