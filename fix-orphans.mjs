import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const orphaned = await prisma.\(
  "SELECT cl.id, cl.session_id FROM chatbot_logs cl LEFT JOIN chatbot_sessions cs ON cl.session_id = cs.id WHERE cs.id IS NULL AND cl.session_id IS NOT NULL"
);
console.log('Orphaned rows:', orphaned.length);
for (const row of orphaned) {
  await prisma.chatbotLog.update({ where: { id: row.id }, data: { sessionId: null } });
}
console.log('Fixed');
await prisma.\();
