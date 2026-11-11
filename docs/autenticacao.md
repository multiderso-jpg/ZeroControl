# Diretrizes de Autenticação e Segurança - Zero Control

O modelo de autenticação do Zero Control foi desenvolvido para oferecer o mais alto nível de segurança sem comprometer a soberania e privacidade do usuário.

---

## 1. Princípios de Privacidade
- **Sem e-mail, sem telefone, sem CPF**: O cadastro público exige exclusivamente um **Nome de Usuário** e uma **Senha**.
- **Limitação documentada na V1**: Como não existem dados de contato vinculados à conta, não existe recuperação de senha por terceiros ou e-mail. A perda da senha inviabiliza o acesso à conta existente. A troca de senha requer confirmação da senha atual.

---

## 2. Requisitos de Credenciais
- **Nome de Usuário**:
  - Comprimento entre 3 e 30 caracteres.
  - Conjunto de caracteres ASCII: letras (`a-z`, `A-Z`), números (`0-9`), ponto (`.`), hífen (`-`) e sublinhado (`_`).
  - Espaços em branco nas extremidades são automaticamente removidos (`trim`).
  - **Normalização e Unicidade**: O banco mantém a coluna `username_normalized` com restrição única `UNIQUE`. O usuário `Operador_Zero` impede o cadastro de `operador_zero` ou `OPERADOR_ZERO`, evitando ataques de spoofing ou duplicações concorrentes.
  - A grafia original escolhida é preservada na coluna `username` para exibição na interface.

- **Senha**:
  - Comprimento entre 15 e 128 caracteres.
  - Suporte completo a colar (`paste`) e uso de gerenciadores de senha (1Password, Bitwarden, etc.).
  - Espaços em branco são permitidos e **nunca removidos silenciosamente**.

---

## 3. Armazenamento e Criptografia com Argon2id
As senhas nunca são armazenadas em texto simples nem trafegam em logs do sistema. O hash é gerado com a biblioteca nativa `@node-rs/argon2` utilizando as recomendações oficiais do OWASP:
- **Algoritmo**: Argon2id (versão 19)
- **Custo de memória**: 64 MB (65536 KB)
- **Iterações de tempo**: 3 passadas
- **Paralelismo**: 1 thread
- **Comprimento da saída**: 32 bytes

---

## 4. Gerenciamento de Sessão Seguro
- Tokens de sessão são gerados com 32 bytes aleatórios criptográficos (`crypto.randomBytes(32)`), resultando em 64 caracteres hexadecimais de alta entropia.
- **Proteção do Token no Banco**: Para mitigar riscos caso um dump do banco seja extraído, o token em si não é salvo na base de dados; armazena-se apenas o hash SHA-256 (`token_hash`).
- **Cookies HttpOnly**: O token é trafegado exclusivamente via cookie `zc_session`:
  - `HttpOnly: true`: inacessível via JavaScript (imunidade a XSS).
  - `SameSite: 'lax'`: previne envio indiscriminado em cross-site requests.
  - `Secure: true`: habilitado em produção sob conexões HTTPS.
  - Validade padrão: 30 dias.
- **Revogação Instantânea**: Ao efetuar logout ou alterar a senha, todas as sessões anteriores são marcadas como revogadas (`is_revoked = TRUE`).

---

## 5. Proteção CSRF
- Todas as requisições de alteração de estado (`POST`, `PUT`, `PATCH`, `DELETE`) exigem a correspondência do cookie `zc_csrf` com o cabeçalho `X-CSRF-Token` enviado pelo cliente.

---

## 6. Controle de Acesso Baseado em Papéis (RBAC)
- O cadastro público sempre cria contas com o papel `membro`.
- Nenhum parâmetro enviado pelo cliente pode alterar o papel do usuário.
- Papéis disponíveis:
  - `membro`: gerencia seu próprio perfil, cria oportunidades e envia candidaturas.
  - `moderador`: acesso à fila de denúncias do Conselho e julgamento de infrações.
  - `administrador`: gestão institucional e configurações de suporte.
