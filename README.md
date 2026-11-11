# Zero Control

> **Plataforma de distribuição de oportunidades de trabalho, serviços, missões e recompensas, conectando participantes, profissionais, a Phantom Troupe e parceiros.**

Construído de acordo com a especificação técnica integral descrita em `Zero_Control_Prompt_Anti_Gravity.md`.

---

## Destaques da Implementação

- **Mural da Guilda Central**: Descoberta ágil de oportunidades com filtros combinados em tempo real (intenção, os 24 tipos de oportunidade, as 24 áreas profissionais, modalidade presencial/remota/híbrida, cidade/UF, remuneração em BRL).
- **As 12 Páginas Principais**: Navegação completa pelas 12 vertentes do produto:
  1. `Guilda` (`/guilda`)
  2. `Forja` (`/forja`)
  3. `Aliança` (`/alianca`)
  4. `Missões` (`/missoes`)
  5. `Companhia` (`/companhia`)
  6. `Jornada` (`/jornada`)
  7. `Mutirão` (`/mutirao`)
  8. `Embaixada` (`/embaixada`)
  9. `Comando` (`/comando`)
  10. `Conselho` (`/conselho`)
  11. `Tesouraria` (`/tesouraria`)
  12. `Fundação` (`/fundacao`)
- **Privacidade e Soberania**: Cadastro com apenas **Usuário** (3-30 chars) e **Senha** (15-128 chars). Não exige nem armazena e-mail, telefone ou CPF.
- **Segurança Criptográfica**:
  - Hashing de senhas no servidor com **Argon2id** (64MB memória, 3 iterações).
  - Sessões protegidas com tokens aleatórios de 256 bits (`crypto.randomBytes(32)`), armazenando apenas o hash SHA-256 no banco e trafegando em cookie `HttpOnly` com proteção CSRF via `X-CSRF-Token`.
  - Rate limiting contra ataques de força bruta.
- **Processamento Seguro de Imagens com Sharp**:
  - Purga de metadados EXIF e dados sensíveis.
  - Avatares otimizados em WebP até 512x512 pixels.
  - Anúncios com 1 a 5 fotos, versão de alta resolução (1600x1200) e miniatura (400x300).
- **Candidaturas e Seleção Transacional**:
  - Unicidade garantida por constraint no banco (`uq_post_applicant`).
  - Seleção atômica pelo autor com lock de linha (`FOR UPDATE`), alterando o candidato escolhido para `selecionada`, recusando automaticamente as demais e avançando o status do anúncio para `em_andamento`.
- **Banco de Dados Duplo e Portátil**:
  - Funciona imediatamente sem depender de serviços externos usando **PGlite** (PostgreSQL compilado em WebAssembly rodando localmente).
  - Suporta conexão direta com instâncias externas de **PostgreSQL** ou **Supabase** via `DATABASE_URL`.

---

## Tecnologias Utilizadas

- **Frontend**: React 19, TypeScript, Vite 8, Tailwind CSS v4, Lucide Icons, React Router v7.
- **Backend**: Node.js, Express 5, TypeScript, Zod, Argon2id (`@node-rs/argon2`), Sharp, Multer, Cookie-Parser, CORS.
- **Banco de Dados**: PostgreSQL / PGlite (`@electric-sql/pglite`) com DDL e migrações SQL nativas.
- **Testes Automatizados**: Vitest 5, Supertest 7.

---

## Requisitos do Sistema

- **Node.js**: versão 20.x ou superior (testado e verificado no Node v26).
- **npm**: versão 10.x ou superior.

---

## Instalação e Execução

### 1. Clonar e Instalar Dependências
```bash
npm install
```

### 2. Configurar Variáveis de Ambiente
Copie o arquivo de exemplo:
```bash
cp .env.example .env
```
*(Se `DATABASE_URL` permanecer vazia, o sistema utilizará automaticamente o PGlite embutido no diretório `data/pglite`).*

### 3. Migrações e Seeds Idempotentes
Para inicializar o banco com os 12 módulos, os 24 tipos de oportunidade e as 24 áreas profissionais:
```bash
npm run seed
```

### 4. Executar em Desenvolvimento
Inicia tanto o servidor de API (porta 3001) quanto o Vite (porta 3000):
```bash
npm run dev
```
Acesse a aplicação no seu navegador: `http://localhost:3000`

### 5. Compilar para Produção
```bash
npm run build
```

---

## Testes Automatizados

A suíte de testes de integração valida autenticação, persistência, autorização, concorrência atômica e moderação:

```bash
npm test
```

Resultado dos testes: **23 testes aprovados (100% de sucesso)**.

---

## Estrutura de Diretórios

```
ZeroControl/
├── docs/                      # Documentação detalhada da plataforma
│   ├── arquitetura.md         # Diagrama e decisões arquiteturais
│   ├── paginas.md             # As 12 páginas principais e subrotas
│   ├── modelo-de-dados.md     # Esquema relacional e dicionário de dados
│   ├── api.md                 # Especificação dos endpoints REST
│   ├── autenticacao.md        # Diretrizes de segurança, Argon2id e sessões
│   ├── testes.md              # Relatório e cobertura dos testes
│   └── proximas-etapas.md     # Roteiro de evolução para as próximas fases
├── src/
│   ├── shared/                # Tipos, constantes (12 módulos, 24 tipos, 24 áreas) e validações Zod
│   ├── server/                # Backend Express, banco, serviços e rotas
│   │   ├── db/                # Schema DDL, migrations e seeds
│   │   ├── middleware/        # Auth, CSRF, Rate Limiting e Error Handler
│   │   ├── services/          # Regras de negócio, transações e Sharp
│   │   └── routes/            # Rotas REST da API
│   └── client/                # Frontend React 19, componentes acessíveis e páginas
├── tests/                     # Testes de integração automatizados
├── uploads/                   # Armazenamento seguro de fotos processadas
├── data/                      # Dados do banco embutido PGlite
├── .env.example               # Modelo de variáveis de ambiente sem segredos
├── tsconfig.json              # Configuração TypeScript
├── vite.config.ts             # Configuração Vite e proxy de desenvolvimento
└── package.json
```

---

## Licença

Desenvolvido para o ecossistema Phantom Troupe • Zero Control.
