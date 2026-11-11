# Modelo de Dados do Zero Control

O banco de dados utiliza PostgreSQL relacional com identificadores UUIDv4, integridade referencial por chaves estrangeiras com ações `ON DELETE CASCADE` ou `SET NULL`, índices para aceleração de consultas e constraints de unicidade para proteção concorrente.

---

## Tabelas Principais

### 1. `users`
Armazena as contas do sistema.
- `id` (UUID PRIMARY KEY): Identificador único imutável.
- `username` (VARCHAR(30) NOT NULL): Nome exibido, preservando grafia e maiúsculas/minúsculas originais.
- `username_normalized` (VARCHAR(30) NOT NULL UNIQUE): Nome em minúsculas e sem espaços externos para garantir unicidade estrita contra cadastros simultâneos.
- `password_hash` (TEXT NOT NULL): Hash Argon2id produzido no servidor.
- `role` (VARCHAR(20) NOT NULL DEFAULT 'membro'): Papel de permissão (`membro`, `moderador`, `administrador`).
- `status` (VARCHAR(20) NOT NULL DEFAULT 'ativo'): Estado da conta (`ativo`, `suspenso`, `inativo`).
- `created_at` (TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP).

### 2. `profiles`
Dados complementares do participante.
- `user_id` (UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE).
- `avatar_path` (TEXT): Nome do arquivo WebP processado em `uploads/avatars/`.
- `bio` (TEXT): Apresentação textual opcional (até 500 caracteres).
- `visibility` (VARCHAR(20) NOT NULL DEFAULT 'public'): `public`, `members_only`, `private`.
- `created_at`, `updated_at` (TIMESTAMPTZ).

### 3. `sessions`
Sessões de autenticação ativas com representação protegida.
- `id` (UUID PRIMARY KEY).
- `user_id` (UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE).
- `token_hash` (TEXT NOT NULL UNIQUE): Hash SHA-256 do token aleatório de 256 bits gerado pelo servidor.
- `expires_at` (TIMESTAMPTZ NOT NULL): Data limite de expiração.
- `is_revoked` (BOOLEAN NOT NULL DEFAULT FALSE): Flag de revogação.
- `created_at` (TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP).

### 4. `modules`
As 12 áreas fixas do produto:
`guilda`, `forja`, `alianca`, `missoes`, `companhia`, `jornada`, `mutirao`, `embaixada`, `comando`, `conselho`, `tesouraria`, `fundacao`.

### 5. `opportunity_types`
Os 24 tipos de oportunidade oficiais:
1. Autônomo
2. Freelancer
3. CLT
4. Pessoa jurídica
5. Temporário
6. Intermitente
7. Estágio
8. Aprendiz
9. Diária
10. Por hora
11. Por tarefa
12. Empreitada
13. Serviço recorrente
14. Plantão
15. Substituição
16. Evento
17. Urgente
18. Sazonal
19. Comissionado
20. Consultoria
21. Mentoria e aulas
22. Voluntariado
23. Permuta
24. Missão com recompensa

### 6. `service_categories`
As 24 áreas profissionais independentes:
1. Tecnologia e programação
2. Design e criação
3. Marketing e redes sociais
4. Audiovisual e fotografia
5. Redação e tradução
6. Administração e atendimento
7. Vendas e comércio
8. Educação e aulas
9. Saúde e bem-estar
10. Cuidados com pessoas
11. Beleza e estética
12. Limpeza e organização
13. Serviços domésticos
14. Construção e reformas
15. Elétrica
16. Hidráulica
17. Marcenaria e montagem
18. Pintura
19. Jardinagem
20. Transporte e entregas
21. Alimentação e cozinha
22. Eventos e entretenimento
23. Serviços para animais
24. Manutenção e reparos

### 7. `posts`
Anúncios e publicações de trabalho no Mural da Guilda e outras vertentes.
- `id` (UUID PRIMARY KEY).
- `author_id` (UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE).
- `origin_module` (VARCHAR(50) NOT NULL DEFAULT 'guilda').
- `intention` (VARCHAR(50) NOT NULL): 'Preciso de um serviço', 'Ofereço um serviço', 'Oportunidade de trabalho'.
- `title` (VARCHAR(120) NOT NULL).
- `description` (TEXT NOT NULL).
- `opportunity_type_slug` (VARCHAR(50) NOT NULL REFERENCES opportunity_types(slug)).
- `service_category_slug` (VARCHAR(50) NOT NULL REFERENCES service_categories(slug)).
- `modality` (VARCHAR(30) NOT NULL): 'Remoto', 'Presencial', 'Híbrido'.
- `city` (VARCHAR(100)), `state` (VARCHAR(2)): Obrigatórios para modalidades presenciais ou híbridas.
- `compensation_type` (VARCHAR(30) NOT NULL): 'a_combinar', 'valor_fixo', 'faixa', 'voluntario'.
- `amount_cents` (INTEGER), `amount_min_cents` (INTEGER), `amount_max_cents` (INTEGER): Valores inteiros em centavos BRL.
- `amount_unit` (VARCHAR(50)): 'hora', 'projeto', etc.
- `deadline` (TIMESTAMPTZ): Prazo de conclusão opcional.
- `status` (VARCHAR(20) NOT NULL DEFAULT 'aberta'): 'rascunho', 'aberta', 'em_andamento', 'concluida', 'encerrada', 'suspensa'.
- `version` (INTEGER NOT NULL DEFAULT 1): Controle de concorrência otimista.
- `created_at`, `updated_at` (TIMESTAMPTZ).

### 8. `post_images`
Imagens associadas às publicações.
- `id` (UUID PRIMARY KEY).
- `post_id` (UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE).
- `owner_id` (UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE).
- `object_key` (TEXT NOT NULL).
- `image_path` (TEXT NOT NULL): Caminho da versão principal (1600x1200 WebP).
- `thumbnail_path` (TEXT NOT NULL): Caminho da miniatura (400x300 WebP).
- `is_cover` (BOOLEAN NOT NULL DEFAULT FALSE).
- `order_index` (INTEGER NOT NULL DEFAULT 0).

### 9. `applications`
Manifestações de interesse e candidaturas para oportunidades.
- `id` (UUID PRIMARY KEY).
- `post_id` (UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE).
- `applicant_id` (UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE).
- `message` (TEXT NOT NULL): Apresentação do candidato (5 a 1000 caracteres).
- `proposed_amount_cents` (INTEGER): Proposta financeira opcional.
- `status` (VARCHAR(20) NOT NULL DEFAULT 'enviada'): 'enviada', 'retirada', 'selecionada', 'recusada'.
- `CONSTRAINT uq_post_applicant UNIQUE (post_id, applicant_id)`: Garante no banco que o mesmo usuário não pode ter mais de uma candidatura ativa simultânea.

### 10. `saved_posts`
Favoritos de oportunidades por usuário (`UNIQUE (user_id, post_id)`).

### 11. `reports`
Denúncias de publicações recebidas pelo Conselho.
- `id` (UUID PRIMARY KEY).
- `reporter_id` (UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE).
- `post_id` (UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE).
- `category` (VARCHAR(50) NOT NULL).
- `description` (TEXT NOT NULL).
- `status` (VARCHAR(20) NOT NULL DEFAULT 'pendente'): 'pendente', 'em_analise', 'procedente', 'improcedente'.
- `decision_notes` (TEXT).
- `decided_by` (UUID REFERENCES users(id)).

### 12. Tabelas Operacionais Complementares
- `quote_requests` (Forja: solicitações de orçamento)
- `service_offerings` (Forja: catálogo Phantom Troupe)
- `partnerships` (Aliança: parcerias e convênios)
- `quests` (Missões: quests estratégicas)
- `teams` e `team_members` (Companhia: equipes)
- `engagements` (Jornada: compromissos e etapas)
- `volunteer_actions` e `volunteer_participations` (Mutirão: ações coletivas e adesão)
- `financial_records` (Tesouraria: registros e transparência)
- `support_requests` (Fundação: solicitações de suporte persistidas)
