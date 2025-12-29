const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// Senhas geradas aleatoriamente para cada sócio
const socios = [
  { username: 'juan', nome: 'Juan Minni', email: 'juan@starkentecnologia.com.br', senha: 'Juan@Fin2025' },
  { username: 'dante', nome: 'Dante Martins', email: 'dante@starkentecnologia.com.br', senha: 'Dante@Fin2025' },
  { username: 'gabriel', nome: 'Gabriel Anibelli', email: 'gabriel@starkentecnologia.com.br', senha: 'Gabriel@Fin2025' },
  { username: 'victor', nome: 'Victor Lapegna', email: 'victor@starkentecnologia.com.br', senha: 'Victor@Fin2025' }
];

async function main() {
  console.log('Criando sócios com senhas...\n');

  for (const socio of socios) {
    const senhaHash = await bcrypt.hash(socio.senha, 10);

    const created = await prisma.socio.upsert({
      where: { username: socio.username },
      update: {
        nome: socio.nome,
        email: socio.email,
        senhaHash: senhaHash
      },
      create: {
        username: socio.username,
        nome: socio.nome,
        email: socio.email,
        senhaHash: senhaHash
      }
    });

    console.log(`Sócio criado/atualizado: ${created.nome}`);
    console.log(`  Username: ${socio.username}`);
    console.log(`  Senha: ${socio.senha}`);
    console.log('');
  }

  console.log('========================================');
  console.log('SENHAS GERADAS (guarde em local seguro):');
  console.log('========================================\n');

  socios.forEach(s => {
    console.log(`${s.nome.padEnd(20)} | ${s.username.padEnd(10)} | ${s.senha}`);
  });

  console.log('\n========================================');
  console.log('Seed concluído com sucesso!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
