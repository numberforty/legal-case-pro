import { getWhatsAppService } from '../src/lib/whatsapp-service';

async function main() {
  const service = getWhatsAppService();
  await service.initialize();
  console.log('WhatsApp worker started');
}

main().catch((err) => {
  console.error('Failed to start WhatsApp worker:', err);
  process.exit(1);
});

// Keep the process alive and handle shutdown signals
const keepAlive = setInterval(() => {}, 1000);

const shutdown = () => {
  clearInterval(keepAlive);
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
