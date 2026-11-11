# Relatório de Testes Automatizados - Zero Control

O Zero Control possui uma suíte abrangente de testes de integração executados com o framework **Vitest** e **Supertest**, cobrindo o ciclo completo de autenticação, persistência, concorrência, autorização e moderação.

---

## Como Executar os Testes

```bash
# Executa todos os testes automatizados
npm test

# Executa em modo interativo / watch
npm run test:watch
```

---

## Resultados da Suíte de Testes

Os 23 testes automatizados foram executados e aprovados com 100% de sucesso:

```
 RUN  v5.1.0 ZeroControl

 ✓ tests/applications.test.ts (7 tests)
 ✓ tests/auth.test.ts (7 tests)
 ✓ tests/council.test.ts (4 tests)
 ✓ tests/posts.test.ts (5 tests)

 Test Files  4 passed (4)
      Tests  23 passed (23)
```

---

## Detalhamento das Validações

### 1. Autenticação e Perfil (`tests/auth.test.ts` - 7 testes)
1. **Cadastro por Usuário e Senha**: Validação de registro sem exigir e-mail, gerando cookie `zc_session`.
2. **Unicidade Case-Insensitive**: Rejeição de tentativa de cadastro com a mesma forma normalizada (`operador_zero` vs `OPERADOR_ZERO`), retornando `409 Conflict`.
3. **Validação de Tamanho de Senha**: Rejeição de senhas menores que 15 caracteres via Zod (`400 Bad Request`).
4. **Login e Cookie HttpOnly**: Confirmação de credenciais válidas com Argon2id e geração de token seguro.
5. **Proteção de Resposta em Login**: Mensagem genérica para credenciais inválidas contra timing attacks.
6. **Preservação de Sessão**: Acesso a rotas autenticadas (`/api/auth/me`) com cookie mantido.
7. **Logout e Revogação**: Invalidação imediata da sessão no servidor e bloqueio de novos acessos privados com o mesmo cookie.

### 2. Mural da Guilda e Publicações (`tests/posts.test.ts` - 5 testes)
1. **Publicação Apenas com Texto**: Criação de oportunidade com classificação em um dos 24 tipos e 24 áreas profissionais.
2. **Validação de Modalidade e Localização**: Rejeição de publicação Presencial sem cidade e estado.
3. **Filtros e Busca no Servidor**: Consulta combinando busca textual, slug de oportunidade e categoria profissional.
4. **Proteção de Autoria**: Tentativa de edição de anúncio por outro usuário rejeitada com `403 Forbidden`.
5. **Encerramento de Publicação**: Autor encerra anúncio com sucesso, alterando o status para `encerrada`.

### 3. Candidaturas e Seleção Transacional (`tests/applications.test.ts` - 7 testes)
1. **Impedir Candidatura no Próprio Anúncio**: Autor bloqueado de se candidatar na própria publicação (`400 Bad Request`).
2. **Manifestação de Interesse com Proposta**: Candidato envia mensagem e proposta em centavos com sucesso (`201 Created`).
3. **Prevenção de Candidatura Duplicada**: Bloqueio de segunda candidatura para o mesmo anúncio com `409 Conflict`.
4. **Múltiplos Candidatos Distintos**: Segundo candidato aceito e registrado.
5. **Restrição de Visualização da Lista**: Usuários não-autores recebem `403 Forbidden` ao tentar listar candidatos; autor autorizado visualiza a lista completa.
6. **Seleção Atômica / Transacional**: Autor seleciona um candidato; a transação marca o candidato como `selecionada`, recusa automaticamente as demais candidaturas e muda o status do post para `em_andamento`.
7. **Prevenção de Dupla Seleção**: Rejeição de tentativa de selecionar segundo candidato em oportunidade já preenchida.

### 4. Conselho e Moderação (`tests/council.test.ts` - 4 testes)
1. **Envio de Denúncia por Membro**: Usuário autenticado encaminha denúncia fundamentada referenciando um anúncio.
2. **Controle de Acesso à Fila**: Membro comum recebe `403 Forbidden` ao tentar inspecionar a fila de denúncias.
3. **Acesso por Moderador**: Usuário com papel `moderador` visualiza as denúncias pendentes.
4. **Decisão e Suspensão da Publicação**: Julgamento de denúncia como procedente, suspendendo imediatamente o anúncio violador (`status = 'suspensa'`).
