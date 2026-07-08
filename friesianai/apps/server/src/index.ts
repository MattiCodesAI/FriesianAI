import { buildApp } from './app.js';
import { loadEnv } from './config/env.js';
import { prisma } from './lib/prisma.js';

async function main(): Promise<void> {
  const env = loadEnv();
  const app = await buildApp(env);

  const shutdown = async (signal: string) => {
    app.log.info(`Received ${signal}, shutting down…`);
    await app.close();
    await prisma.$disconnect();
    process.exit(0);
  };
  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));

  await app.listen({ port: env.PORT, host: env.HOST });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
