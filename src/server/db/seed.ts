import { getDb } from './index';
import { runMigrations } from './migrate';
import { MODULES, OPPORTUNITY_TYPES, SERVICE_CATEGORIES } from '../../shared/constants';
import { v4 as uuidv4 } from 'uuid';

export async function runSeeds() {
  await runMigrations();
  const db = await getDb();
  console.log('[SEED] Inserindo módulos, tipos e categorias...');

  // 1. Modules
  for (const m of MODULES) {
    await db.query(
      `INSERT INTO modules (id, slug, name, route, subtitle, description)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (slug) DO UPDATE
       SET name = EXCLUDED.name,
           route = EXCLUDED.route,
           subtitle = EXCLUDED.subtitle,
           description = EXCLUDED.description;`,
      [m.id, m.slug, m.name, m.route, m.subtitle, m.description]
    );
  }

  // 2. Opportunity Types (Os 24 tipos)
  for (const t of OPPORTUNITY_TYPES) {
    await db.query(
      `INSERT INTO opportunity_types (id, slug, name, description, sort_order)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (slug) DO UPDATE
       SET name = EXCLUDED.name,
           description = EXCLUDED.description,
           sort_order = EXCLUDED.sort_order;`,
      [t.id, t.slug, t.name, t.description, t.id]
    );
  }

  // 3. Service Categories (As 24 áreas profissionais)
  for (const c of SERVICE_CATEGORIES) {
    await db.query(
      `INSERT INTO service_categories (id, slug, name, sort_order)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (slug) DO UPDATE
       SET name = EXCLUDED.name,
           sort_order = EXCLUDED.sort_order;`,
      [c.id, c.slug, c.name, c.id]
    );
  }

  // 4. Catálogo Institucional Forja (Phantom Troupe)
  const offeringsCount = await db.query(`SELECT count(*) as count FROM service_offerings`);
  if (parseInt(offeringsCount.rows[0].count, 10) === 0) {
    const initialOfferings = [
      {
        title: 'Engenharia de Software e Plataformas Customizadas',
        description: 'Desenvolvimento arquitetural e implementação full-stack de sistemas distribuídos de alta resiliência, com TypeScript, Go e bancos modernos.',
        delivery: '15 a 45 dias úteis por ciclo',
        sample: 'Arquitetura Zero Control, APIs de alta vazão, sincronização em tempo real.',
      },
      {
        title: 'Design de Interfaces e Sistemas Visuais (UI/UX)',
        description: 'Projetos completos de interfaces acessíveis, paleta monocromática, protótipos de alta fidelidade e design systems escaláveis.',
        delivery: '10 a 20 dias úteis',
        sample: 'Design System Phantom Dark, padrões de acessibilidade WCAG AAA.',
      },
      {
        title: 'Auditoria de Segurança e Infraestrutura Criptográfica',
        description: 'Análise minuciosa de vetores de vulnerabilidade, armazenamento de credenciais com Argon2id, mitigação de CSRF/XSS e isolamento de banco de dados.',
        delivery: '7 a 15 dias úteis',
        sample: 'Relatório estruturado de vulnerabilidades e plano de remediação imediata.',
      },
    ];

    for (const off of initialOfferings) {
      await db.query(
        `INSERT INTO service_offerings (id, title, description, estimated_delivery, portfolio_sample)
         VALUES ($1, $2, $3, $4, $5)`,
        [uuidv4(), off.title, off.description, off.delivery, off.sample]
      );
    }
  }

  // 5. Parcerias Aliança
  const partnersCount = await db.query(`SELECT count(*) as count FROM partnerships`);
  if (parseInt(partnersCount.rows[0].count, 10) === 0) {
    const initialPartners = [
      {
        partner: 'Hospedagem & Infraestrutura Nexus Cloud',
        benefit: 'Crédito de R$ 500 para servidores dedicados e banco PostgreSQL para membros da Guilda',
        description: 'Infraestrutura de nuvem com baixa latência nacional e tráfego ilimitado para projetos autônomos.',
        eligibility: 'Membros ativos com pelo menos 1 serviço ou candidatura realizada',
        conditions: 'Válido para novas contas corporativas ou individuais por 12 meses',
        is_verified: true,
      },
      {
        partner: 'Espaço Coworking Hub Central',
        benefit: '15% de desconto em diárias e salas de reunião compartilhadas',
        description: 'Ambiente profissional com internet de alta velocidade e salas para atendimento a clientes.',
        eligibility: 'Profissionais autônomos e freelancers com perfil ativo na plataforma',
        conditions: 'Apresentar o identificador de usuário Zero Control na recepção',
        is_verified: true,
      },
    ];

    for (const p of initialPartners) {
      await db.query(
        `INSERT INTO partnerships (id, partner_name, benefit_title, description, eligibility, conditions, is_verified)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [uuidv4(), p.partner, p.benefit, p.description, p.eligibility, p.conditions, p.is_verified]
      );
    }
  }

  // 6. Garantir permissões de administrador para a conta PhantomTroupe
  await db.query(`UPDATE users SET role = 'administrador' WHERE LOWER(username) = 'phantomtroupe'`);

  console.log('[SEED] Seeds aplicados com sucesso!');
}

import { fileURLToPath } from 'url';
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runSeeds()
    .then(async () => {
      const db = await getDb();
      await db.close();
      process.exit(0);
    })
    .catch((err) => {
      console.error('[SEED] Erro ao aplicar seeds:', err);
      process.exit(1);
    });
}
