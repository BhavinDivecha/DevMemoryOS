import { FastifyInstance } from "fastify";
import { ZodError } from "zod";
import { AppError } from "../utils/errors";

export async function errorPlugin(app: FastifyInstance) {
  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof AppError) {
      return reply.status(error.statusCode).send({
        success: false,
        error: { code: error.code, message: error.message, details: error.details }
      });
    }

    if (error instanceof ZodError) {
      return reply.status(422).send({
        success: false,
        error: { code: "VALIDATION_ERROR", message: "Validation failed", details: error.flatten() }
      });
    }

    return reply.status(500).send({
      success: false,
      error: { code: "INTERNAL_ERROR", message: "Internal server error", details: {} }
    });
  });
}
