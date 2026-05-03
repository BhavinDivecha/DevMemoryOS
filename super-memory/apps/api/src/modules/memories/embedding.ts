import OpenAI from "openai";
import { env } from "../../config/env";

export interface EmbeddingProvider {
  generateEmbedding(text: string): Promise<number[]>;
}

class OpenAIEmbeddingProvider implements EmbeddingProvider {
  private client = new OpenAI({ apiKey: env.OPENAI_API_KEY });

  async generateEmbedding(text: string): Promise<number[]> {
    const response = await this.client.embeddings.create({
      model: env.EMBEDDING_MODEL,
      input: text
    });
    return response.data[0].embedding;
  }
}

export function getEmbeddingProvider(): EmbeddingProvider | null {
  if (env.EMBEDDINGS_ENABLED !== "true") return null;
  if (env.EMBEDDING_PROVIDER === "openai" && env.OPENAI_API_KEY) return new OpenAIEmbeddingProvider();
  return null;
}
