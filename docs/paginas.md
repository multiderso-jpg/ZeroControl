# As 12 Páginas Principais do Zero Control

A navegação do Zero Control estrutura o produto nas 12 vertentes operacionais do documento original, com a Guilda atuando como início e mural central. Login e cadastro são telas de acesso adicionais.

| Nº | Nome | Rota | Função e Implementação na V1 |
|---|---|---|---|
| 1 | **Guilda** | `/guilda` | **Mural Central**: busca de oportunidades com filtros combinados por intenção, tipo (24 opções), área profissional (24 opções), modalidade, cidade, remuneração e ordenação. Publicação de anúncios com ou sem fotos (1 a 5), visualização de detalhes, candidaturas com proposta e painel de candidaturas ativas. |
| 2 | **Forja** | `/forja` | **Catálogo Phantom Troupe**: serviços institucionais especializados com entrega estimada, portfólio e formulário funcional de solicitação de orçamento com persistência no banco. |
| 3 | **Aliança** | `/alianca` | **Parcerias e Benefícios**: catálogo de parceiros verificados com descrição de benefícios, regras de elegibilidade, condições e prazos de validade. |
| 4 | **Missões** | `/missoes` | **Quests Estratégicas**: listagem de missões com objetivo explícito, critérios de entrega, responsável pelo aceite e recompensas definidas. |
| 5 | **Companhia** | `/companhia` | **Formação de Equipes**: visualização de times, funções técnicas e participantes, base para organização de trabalhos coletivos. |
| 6 | **Jornada** | `/jornada` | **Execução e Aceite**: rastreamento de compromissos acordados através das 5 fases: preparação, execução, entrega, revisão e aceite final. |
| 7 | **Mutirão** | `/mutirao` | **Voluntariado e Ações Coletivas**: ações comunitárias com horário, local, delimitação de despesas/reembolso e botão funcional de adesão livre de participantes. |
| 8 | **Embaixada** | `/embaixada` | **Rede de Contatos**: diretório interno de participantes com visibilidade pública ou restrita a membros, permitindo apresentações autorizadas. |
| 9 | **Comando** | `/comando` | **Painel de Operações**: indicadores calculados a partir de dados reais do banco (minhas publicações, candidaturas ativas, salvos), agregados operacionais para moderadores e telemetria de subsistemas. |
| 10 | **Conselho** | `/conselho` | **Moderação e Integridade**: formulário de denúncia funcional referenciando qualquer anúncio e fila de moderação restrita a moderadores/administradores com registro de pareceres. |
| 11 | **Tesouraria** | `/tesouraria` | **Transparência e Lançamentos**: demonstrativo de valores registrados, propostas acordadas e referências contábeis (sem simulação falsa de custódia). |
| 12 | **Fundação** | `/fundacao` | **Sustentação e Suporte**: documentação de arquitetura, acessibilidade, princípios de soberania e canal funcional de abertura de chamados de suporte persistidos no banco. |

---

## Telas de Acesso e Painéis Adicionais
- **`/login`**: Autenticação estrita por usuário e senha, sem exigir e-mail.
- **`/cadastro`**: Criação de conta solicitando apenas Usuário (3-30 chars) e Senha (15-128 chars).
- **`/guilda/publicacoes/:id`**: Subrota e modal de detalhes completos da oportunidade.
- **Meu Perfil / Fotografia**: Painel modal acessível via menu superior para edição de bio, visibilidade, alteração de foto (com processamento Sharp) e troca de senha.
