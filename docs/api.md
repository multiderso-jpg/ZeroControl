# Especificação da API REST do Zero Control

Todas as rotas de mutação (`POST`, `PUT`, `PATCH`, `DELETE`) requerem o cabeçalho `X-CSRF-Token` correspondente ao valor do cookie `zc_csrf`.

---

## 1. Autenticação (`/api/auth`)

### `POST /api/auth/register`
- **Descrição**: Cria uma nova conta de membro utilizando apenas Usuário e Senha.
- **Entrada**:
  ```json
  {
    "username": "operador_phantom",
    "password": "SenhaSeguraComMaisDe15Caracteres!"
  }
  ```
- **Validação**: Usuário de 3 a 30 caracteres ASCII; senha de 15 a 128 caracteres.
- **Resposta**: `201 Created` com cookie de sessão `zc_session` (HttpOnly).

### `POST /api/auth/login`
- **Descrição**: Autentica o usuário e inicia uma sessão protegida.
- **Entrada**:
  ```json
  {
    "username": "operador_phantom",
    "password": "SenhaSeguraComMaisDe15Caracteres!"
  }
  ```
- **Resposta**: `200 OK` com dados do usuário e cookie `zc_session`.

### `GET /api/auth/me`
- **Descrição**: Retorna o usuário autenticado da sessão atual.
- **Resposta**: `200 OK` com `{ user: { id, username, role, avatar_url, created_at } }` ou `401 Unauthorized`.

### `POST /api/auth/logout`
- **Descrição**: Revoga o token de sessão no banco de dados e limpa os cookies.
- **Resposta**: `200 OK`.

### `POST /api/auth/change-password`
- **Descrição**: Altera a senha do usuário autenticado após validar a senha atual, revogando todas as demais sessões ativas.
- **Entrada**: `{ "currentPassword": "...", "newPassword": "..." }`
- **Resposta**: `200 OK`.

---

## 2. Perfil & Avatar (`/api/profile`)

### `GET /api/profile`
- **Descrição**: Retorna os detalhes do perfil do usuário autenticado.

### `PATCH /api/profile`
- **Descrição**: Atualiza dados de bio e preferências de visibilidade (`public`, `members_only`, `private`).

### `POST /api/profile/avatar`
- **Descrição**: Upload e processamento de fotografia de perfil.
- **Entrada**: `multipart/form-data` com campo `avatar` (JPEG, PNG ou WebP até 5 MB).
- **Processamento**: Sharp decodifica, valida resolução (<= 20 MP), remove metadados EXIF e converte para WebP 512x512.
- **Resposta**: `200 OK` com `{ avatar_url: "/uploads/avatars/uuid.webp" }`.

### `DELETE /api/profile/avatar`
- **Descrição**: Remove a foto do perfil e restaura o avatar padrão com iniciais.

---

## 3. Publicações e Mural da Guilda (`/api/posts`)

### `GET /api/posts`
- **Descrição**: Lista publicações com filtros combinados e paginação.
- **Parâmetros de Consulta**:
  - `search` (texto livre)
  - `intention` (Preciso de um serviço, Ofereço um serviço, Oportunidade de trabalho)
  - `opportunity_type_slug` (um dos 24 tipos)
  - `service_category_slug` (uma das 24 categorias)
  - `modality` (Remoto, Presencial, Híbrido)
  - `city`, `state`
  - `min_cents`, `max_cents`
  - `sort` (`recent` ou `deadline`)
  - `page`, `limit`

### `POST /api/posts`
- **Descrição**: Cria uma nova oportunidade no mural.
- **Entrada**:
  ```json
  {
    "intention": "Preciso de um serviço",
    "title": "Instalação de Quadro de Força",
    "description": "Necessito de eletricista qualificado para instalação de novo disjuntor...",
    "opportunity_type_slug": "autonomo",
    "service_category_slug": "eletrica",
    "modality": "Presencial",
    "city": "Campinas",
    "state": "SP",
    "compensation_type": "valor_fixo",
    "amount_cents": 80000,
    "amount_unit": "serviço total"
  }
  ```

### `GET /api/posts/:id`
- **Descrição**: Obtém os detalhes completos da publicação, imagens, autor e status de candidatura do usuário logado.

### `PATCH /api/posts/:id`
- **Descrição**: Edição restrita ao autor da publicação (com controle de versão otimista).

### `POST /api/posts/:id/close`
- **Descrição**: Encerra a publicação, retirando-a do mural ativo e impedindo novas candidaturas.

### `POST /api/posts/:id/save`
- **Descrição**: Alterna salvar/remover dos itens favoritados do usuário.

### `POST /api/posts/:id/images`
- **Descrição**: Anexa de 1 a 5 fotos ao anúncio (JPEG, PNG ou WebP até 8 MB cada). Gera versão principal otimizada e miniatura.

---

## 4. Candidaturas (`/api/applications`)

### `POST /api/applications/posts/:postId/apply`
- **Descrição**: Envia manifestação de interesse em uma oportunidade aberta.
- **Regras**:
  - O autor não pode se candidatar no próprio anúncio (`400 Bad Request`).
  - Não é permitida candidatura duplicada ativa para a mesma vaga (`409 Conflict`).
- **Entrada**: `{ "message": "...", "proposed_amount_cents": 150000 }`

### `POST /api/applications/:id/withdraw`
- **Descrição**: Retira a candidatura ativa do usuário.

### `POST /api/applications/:id/select`
- **Descrição**: Transacional / Atômico. O autor da oportunidade seleciona o candidato escolhido. A candidatura passa para `selecionada`, as demais candidaturas pendentes passam para `recusada` e o anúncio passa para `em_andamento`.

### `GET /api/applications/posts/:postId`
- **Descrição**: Lista candidaturas recebidas. Acesso restrito exclusivamente ao autor da publicação (`403 Forbidden` para terceiros).

---

## 5. Conselho e Moderação (`/api/council`)

### `POST /api/council/reports`
- **Descrição**: Registra denúncia fundamentada sobre uma publicação.
- **Entrada**: `{ "post_id": "...", "category": "termos", "description": "..." }`

### `GET /api/council/reports`
- **Descrição**: Fila de denúncias restrita a usuários com papel `moderador` ou `administrador`.

### `POST /api/council/reports/:id/decide`
- **Descrição**: Registra o julgamento da denúncia (`procedente` ou `improcedente`), parecer e suspensão facultativa da publicação denunciada.

---

## 6. Módulos Complementares (`/api/modules`)

- `GET /api/modules/meta`: Retorna os 12 módulos, 24 tipos de oportunidade e 24 categorias profissionais.
- `GET /api/modules/forja/offerings`: Catálogo de serviços da Phantom Troupe.
- `POST /api/modules/forja/quotes`: Solicitação persistida de orçamento institucional.
- `GET /api/modules/alianca/partners`: Parcerias e benefícios com selo de verificação.
- `GET /api/modules/missoes/quests`: Quests estratégicas com critérios de aceite e recompensas.
- `GET /api/modules/mutirao/actions`: Ações coletivas e voluntariado.
- `POST /api/modules/mutirao/actions/:id/join`: Adesão livre e espontânea de voluntário.
- `GET /api/modules/comando/indicators`: Métricas e indicadores em tempo real.
- `POST /api/modules/fundacao/support`: Abertura de chamado de suporte persistido.
