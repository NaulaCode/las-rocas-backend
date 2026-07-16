import { PrismaClient } from '@prisma/client';
async function main() {
  const prisma = new PrismaClient();
  const orphaned: any[] = await prisma.\(
    'SELECT cl.id, cl.session_id FROM chatbot_logs cl LEFT JOIN chatbot_sessions cs ON cl.session_id = cs.id WHERE cs.id IS NULL AND cl.session_id IS NOT NULL'
  );
  console.log('Orphaned rows:', orphaned.length);
  for (const row of orphaned) {
    await prisma.chatbotLog.update({ where: { id: row.id }, data: { sessionId: null } });
  }
  console.log('Fixed');
  await prisma.\();
}
main().catch(e => { console.error(e); process.exit(1); });
