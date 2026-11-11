# Arquitetura do Zero Control

## Visão Geral
O **Zero Control** é uma aplicação web full-stack, responsiva, em português do Brasil, voltada à distribuição e organização de oportunidades de trabalho, serviços profissionais, missões e parcerias, articulando a comunidade com a Phantom Troupe e parceiros estratégicos.

O sistema foi arquitetado visando **soberania de dados, robustez criptográfica, concorrência segura e portabilidade**.

---

## Diagrama da Arquitetura

```
+------------------------------------------------------------------------+
|                                Cliente                                 |
|  React 19 + TypeScript + Vite + Tailwind CSS v4 + Lucide Icons         |
|  - Layout Responsivo (Mobile 360px, Tablet 768px, Desktop 1440px)      |
|  - Roteamento SPA com React Router v7                                  |
|  - Modais Acessíveis (Escape, Foco preso, Aria-labels)                 |
+-----------------------------------+------------------------------------+
                                    | HTTPS / Fetch com Credentials
                                    v
+------------------------------------------------------------------------+
|                             Servidor API                               |
|  Node.js (v26) + TypeScript (v7) + Express 5                           |
|  - Middlewares: CSRF Token (Double-Submit), Rate Limit, Cookie-Parser   |
|  - Autenticação por Sessão HttpOnly (Token SHA-256 no banco)           |
|  - Hashing de Senhas: Argon2id (OWASP: 64MB memória, 3 iterações)      |
|  - Processamento de Imagens: Sharp (strip de EXIF, WebP, 512x512)       |
|  - Validação estrita por Schemas: Zod                                  |
+-----------------------------------+------------------------------------+
                                    | SQL Nativo / Transações ACID
                                    v
+------------------------------------------------------------------------+
|                            Banco de Dados                              |
|  PostgreSQL 16+ / PGlite (WASM embutido para ambiente autônomo)        |
|  - Esquema Relacional com UUIDs, FKs, Índices e Constraints Únicas     |
|  - Lock de Linha (SELECT ... FOR UPDATE) para Seleção de Candidatos    |
+------------------------------------------------------------------------+
```

---

## Decisões Arquiteturais e Escolhas Técnicas

### 1. Banco de Dados Duplo: PostgreSQL Externo e PGlite Embutido
- **Produção / Supabase / Docker**: Configurado via variável de ambiente `DATABASE_URL`. Utiliza `pg.Pool` com pool de conexões otimizado.
- **Desenvolvimento Local Autônomo**: Quando `DATABASE_URL` não for fornecida, o sistema inicia automaticamente o **PGlite** (`@electric-sql/pglite`) persistido em `data/pglite`. Trata-se do motor oficial do PostgreSQL compilado para WebAssembly/Node.js. Não simula SQL; executa PostgreSQL nativo, suportando transações ACID, constraints de unicidade, locking de linhas e tipos UUID nativos.

### 2. Autenticação por Usuário e Senha (Sem e-mail / Sem Telefone)
- Atendendo aos requisitos de soberania e privacidade da especificação, não são exigidos nem armazenados dados pessoais invasivos (como CPF, telefone ou e-mail).
- Senhas são armazenadas **exclusivamente como hash Argon2id** produzido no servidor com parâmetros recomendados pelo OWASP.
- Sessões usam tokens criptográficos de 256 bits (`crypto.randomBytes(32)`). Apenas a representação hash SHA-256 do token é persistida no banco (`sessions.token_hash`), prevenindo sequestro de sessão mesmo em caso de vazamento de dump do banco de dados.
- O token trafega em cookie `HttpOnly`, `SameSite=Lax`, e `Secure` em ambiente de produção.

### 3. Proteção CSRF e Rate Limiting
- Cookie `zc_csrf` com verificação de cabeçalho `X-CSRF-Token` em todos os métodos que alteram estado (`POST`, `PUT`, `PATCH`, `DELETE`).
- Rate limiting baseado em janela deslizante em endpoints sensíveis (`/api/auth/login` e `/api/auth/register`) para prevenir força bruta.

### 4. Processamento Seguro de Imagens com Sharp
- Aceitação estrita de JPEG, PNG e WebP até 5 MB (avatar) e 8 MB (anúncios).
- Limite máximo de resolução de 20 megapixels.
- Metadados EXIF e dados de geolocalização são purgados do buffer da imagem.
- Avatares são convertidos para WebP redimensionados em até 512x512 pixels.
- Anúncios geram versão de visualização (1600x1200) e miniatura (400x300).

### 5. Camadas do Código
- **`src/shared/`**: Contratos, tipos TypeScript, constantes imutáveis (as 12 áreas, os 24 tipos de oportunidade, as 24 categorias profissionais) e schemas Zod compartilhados.
- **`src/server/db/`**: Adaptador de banco de dados, migrations versionadas em SQL puro e seeds idempotentes.
- **`src/server/services/`**: Regras de negócio, autorização e orquestração de transações.
- **`src/server/routes/`**: Endpoints RESTful expressos e documentados.
- **`src/client/`**: Aplicação React com componentes acessíveis e páginas das 12 vertentes operacionais.
