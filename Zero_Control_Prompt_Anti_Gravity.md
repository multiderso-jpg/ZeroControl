# Zero Control
## Prompt de implementação para o Anti Gravity

Versão 1 — 11 de novembro de 2026

Este arquivo contém um prompt pronto para copiar no Anti Gravity. Ele transforma as 12 vertentes do documento Zero Control em 12 páginas de produto, com a Guilda como início e mural central. Login e cadastro são telas de acesso adicionais; perfil e detalhes são painéis ou subrotas, sem aumentar o número de módulos principais. Os nomes abaixo são propostas de interface para as vertentes do documento, e não nomes confirmados dos outros sistemas do ecossistema.

---

## Início do prompt

Atue como desenvolvedor full stack responsável pela implementação do Zero Control. Crie uma aplicação web responsiva, em português do Brasil, para distribuir oportunidades de trabalho, serviços, missões e recompensas, conectando participantes, profissionais, a Phantom Troupe e parceiros.

Use este documento como especificação de produto. Antes de alterar arquivos, examine o repositório existente e suas instruções. Preserve o trabalho já existente e aproveite sua arquitetura. Se o projeto estiver vazio, use a arquitetura sugerida adiante. Registre escolhas, execute a implementação por etapas e entregue fluxos verificáveis. Não apresente funções demonstrativas como integrações reais.

### 1 Objetivo e prioridades

O centro do aplicativo é o mural da Guilda. A pessoa deve conseguir criar uma conta com usuário e senha, entrar, visualizar oportunidades, publicar um serviço com texto e foto, classificar a publicação e acompanhar suas atividades. A navegação também deve apresentar os serviços da Phantom Troupe, parcerias e as demais vertentes operacionais.

Mantenha esta prioridade: mural de serviços e trabalhos; serviços institucionais da Phantom Troupe; parcerias e benefícios. As outras áreas organizam a participação e a operação dessas três frentes.

Nesta primeira versão, implemente integralmente autenticação, perfil, mural, fotos, filtros e candidaturas. Construa as outras 11 páginas com navegação funcional, listagem e estado vazio, conectadas às entidades correspondentes. Funções posteriores devem aparecer identificadas como planejadas, sem botões que simulem sucesso. Faça cada etapa funcionar antes de ampliar o escopo.

### 2 As 12 páginas principais

| Nº | Nome | Rota | Correspondência e função |
|---|---|---|---|
| 1 | Guilda | /guilda | Início, seletor das 12 áreas e mural de serviços, trabalhos e contatos. |
| 2 | Forja | /forja | Serviços oferecidos pela Phantom Troupe, portfólio e solicitações de orçamento. |
| 3 | Aliança | /alianca | Parceiros, patrocínios, apoios e benefícios com condições e validade. |
| 4 | Missões | /missoes | Quests com objetivo, requisitos, prazo, recompensa e critérios de conclusão. |
| 5 | Companhia | /companhia | Formação de equipes, funções, disponibilidade e seleção para trabalhos. |
| 6 | Jornada | /jornada | Acompanhamento de compromissos, execução, entregas, revisão e aceite. |
| 7 | Mutirão | /mutirao | Voluntariado e ações coletivas com finalidade, condições e adesão livre. |
| 8 | Embaixada | /embaixada | Rede de contatos, apresentações e encaminhamentos autorizados. |
| 9 | Comando | /comando | Painel de operações, indicadores, notificações e estado das integrações. |
| 10 | Conselho | /conselho | Denúncias, moderação, avaliações vinculadas a serviços e resolução de divergências. |
| 11 | Tesouraria | /tesouraria | Orçamentos, recompensas, referências de pagamento e transparência permitida. |
| 12 | Fundação | /fundacao | Sustentação, acesso, suporte, documentação, melhorias e evolução da plataforma. |

O seletor inclui a Guilda como área atual e links para as outras 11. Não criar uma décima terceira página principal chamada início. Redirecionar / para /guilda após autenticação. O menu identifica a página ativa. Login e cadastro ficam fora desta contagem. As 12 áreas são módulos do Zero Control; não pressupor que cada uma seja um aplicativo externo independente.

### 3 Identidade visual e navegação

Use preto, branco, cinzas e detalhes prateados. O aspecto deve ser profissional, acessível e tecnológico, com ícones coerentes e cores discretas para estados. Não depender de cor para transmitir informação. Adote tipografia legível, espaçamentos consistentes e foco de teclado visível.

No computador, use cabeçalho superior com marca Zero Control à esquerda, busca contextual, botão Publicar trabalho e avatar à direita. Apresente navegação lateral para as 12 áreas. Na Guilda, reserve a maior largura útil ao mural central; use um painel complementar para minhas candidaturas e missões. A seleção das áreas deve estar visível em uma faixa compacta expansível, sem empurrar o mural para o fim da página.

No celular, transforme o menu em gaveta, mantenha o mural em uma coluna e disponibilize filtros em painel próprio. Verifique larguras de 360, 768 e 1440 pixels, evitando rolagem horizontal. Modais devem gerenciar foco, fechar por Escape e devolver foco ao elemento de origem. Todo botão de ícone precisa de nome acessível.

### 4 Login e cadastro

Criar /login e /cadastro com o mesmo layout, identidade visual e dimensões de formulário. O cadastro solicita apenas Usuário e Senha. Não exigir nome completo, e-mail, telefone, CPF ou foto. A senha deve permitir colar e usar gerenciadores; ofereça mostrar ou ocultar senha.

Fluxo: visitante entra no cadastro, escolhe usuário e senha, envia, recebe confirmação, inicia sessão e acessa a Guilda. Se o cadastro funcionar e o início automático de sessão falhar, orientar login sem criar uma segunda conta. Oferecer links entre login e cadastro.

Regras propostas: usuário com 3 a 30 caracteres ASCII, letras, números, ponto, hífen ou sublinhado; remover espaços externos e comparar sem distinguir maiúsculas e minúsculas. Preservar a grafia escolhida para exibição. Aplicar restrição única no banco para a forma normalizada, inclusive em cadastros simultâneos. Senha de 15 a 128 caracteres, sem obrigar combinações artificiais; não remover espaços da senha silenciosamente.

Validação ocorre no cliente e no servidor. Durante envio, bloquear submissão duplicada e mostrar progresso. Exibir erros úteis no cadastro e mensagem genérica no login para credenciais inválidas. Implementar limitação de tentativas no servidor, sem bloqueio permanente fácil de provocar contra terceiros.

Rotas do aplicativo e APIs exigem sessão válida. Ao sair, invalidar a sessão no servidor e limpar dados privados do cache. Uma URL protegida acessada sem sessão deve levar ao login e retornar ao destino após autenticar. Recarregar a página deve preservar sessão válida.

Como não há e-mail ou telefone, não criar recuperação de senha fictícia. Documentar esta limitação na V1. Permitir troca de senha autenticada com confirmação da senha atual e revogação das demais sessões. Um mecanismo futuro de recuperação por códigos deve ser especificado separadamente.

### 5 Perfil e fotografia

Ao criar a conta, gerar avatar padrão com as iniciais do usuário. No menu superior, o avatar abre opções Meu perfil, Alterar foto, Minhas publicações, Minhas candidaturas e Sair. Alterar foto também deve ser acessível ao clicar na fotografia dentro do painel de perfil.

Escolher arquivo, visualizar prévia, confirmar envio, apresentar progresso e atualizar o avatar em toda a interface após persistência bem-sucedida. Oferecer remoção da foto e retorno ao avatar padrão. A alteração precisa persistir após novo login e recarregamento.

Aceitar JPEG, PNG e WebP até 5 MB para avatar; validar conteúdo real, dimensões e arquivo decodificável no servidor. Limitar imagem de entrada a 20 megapixels, remover metadados e gerar versão de até 512 por 512 pixels. Não aceitar SVG ou executáveis. Usar identificadores aleatórios de armazenamento e verificar proprietário antes de substituir ou excluir. Em falha, preservar a foto anterior. Nunca tratar base64 em localStorage como persistência de produção.

### 6 Guilda e mural central

A Guilda é a primeira tela após entrar. O mural deve ocupar a região central com busca, filtros, ordenação, botão Publicar trabalho e lista paginada de anúncios. Separar intenções por abas ou filtro: Preciso de um serviço, Ofereço um serviço e Oportunidade de trabalho.

Cada cartão mostra fotografia de capa opcional, título, resumo, intenção, tipo de oportunidade, área profissional, modalidade, cidade quando pertinente, remuneração ou indicação de valor a combinar, autor, avatar, data e situação. Sem foto, usar composição discreta, sem imagem quebrada.

Mostrar detalhes em painel ou subrota /guilda/publicacoes/:id. Exibir descrição completa, imagens, requisitos, prazo, remuneração, autor e ações permitidas. Ações iniciais: Tenho interesse, Salvar, Denunciar e, para o autor, Editar ou Encerrar. Uma publicação encerrada permanece no histórico e deixa de aceitar candidaturas.

O formulário permite digitar o serviço e anexar de uma a cinco fotos opcionais, com prévia, remoção e escolha de capa. Texto descritivo é obrigatório mesmo com foto; foto não é obrigatória. Em anúncio textual, o cartão deve manter o mesmo padrão de leitura.

Campos obrigatórios: intenção, título de 5 a 120 caracteres, descrição de 30 a 5000 caracteres, um tipo principal de oportunidade, uma área profissional, modalidade e condição de remuneração. Exigir cidade e UF se presencial ou híbrido. Prazo é opcional e não pode estar no passado ao publicar. Mostrar apenas localização aproximada; endereço preciso deve ser compartilhado no contexto autorizado de contratação.

Campos opcionais: fotos, requisitos, valor ou faixa, unidade do valor, disponibilidade e sistema de origem. Localização remota dispensa cidade. Remuneração admite valor definido, faixa, a combinar ou voluntário. Valores monetários usam centavos inteiros e BRL; para faixas, máximo não pode ser menor que mínimo. Voluntário não deve aparecer como trabalho pago. Em Mutirão, permitir indicar reembolso separadamente de remuneração.

Para fotos do serviço, aceitar os mesmos três formatos até 8 MB por arquivo e 20 megapixels. Gerar miniaturas e versão otimizada no servidor, retirar metadados e manter uploads privados com acesso autorizado. Upload pendente pode ser descartado; remover arquivos órfãos. Se a publicação falhar, preservar o texto preenchido e permitir tentar novamente sem duplicar anúncio.

### 7 As 24 opções de tipo de oportunidade

Criar um seletor com exatamente estas 24 opções. Elas são rótulos práticos de descoberta: não constituem uma classificação jurídica mutuamente exclusiva. Por isso, cada publicação escolhe um tipo principal e pode complementar suas condições na descrição. Área profissional e modalidade são campos independentes.

| Nº | Opção | Uso na interface |
|---|---|---|
| 1 | Autônomo | Prestação independente de serviço. |
| 2 | Freelancer | Entrega ou projeto pontual. |
| 3 | CLT | Vaga anunciada como emprego CLT. |
| 4 | Pessoa jurídica | Prestação contratada por empresa ou MEI. |
| 5 | Temporário | Oportunidade com duração delimitada. |
| 6 | Intermitente | Oportunidade anunciada nessa modalidade. |
| 7 | Estágio | Oportunidade de estágio. |
| 8 | Aprendiz | Oportunidade de aprendizagem profissional. |
| 9 | Diária | Serviço remunerado por dia. |
| 10 | Por hora | Serviço remunerado por hora. |
| 11 | Por tarefa | Entrega delimitada com valor por tarefa. |
| 12 | Empreitada | Execução de um conjunto de serviços. |
| 13 | Serviço recorrente | Atendimento com frequência combinada. |
| 14 | Plantão | Cobertura de um período específico. |
| 15 | Substituição | Cobertura temporária de um profissional. |
| 16 | Evento | Trabalho relacionado a evento. |
| 17 | Urgente | Oportunidade com necessidade imediata. |
| 18 | Sazonal | Trabalho vinculado a uma época ou temporada. |
| 19 | Comissionado | Remuneração associada a resultado descrito. |
| 20 | Consultoria | Análise e orientação especializada. |
| 21 | Mentoria e aulas | Ensino, orientação ou acompanhamento. |
| 22 | Voluntariado | Participação sem remuneração pelo trabalho. |
| 23 | Permuta | Troca com condições e itens descritos. |
| 24 | Missão com recompensa | Quest com entrega e recompensa explícitas. |

Não apresentar esta lista como ranking estatístico. Urgente, por exemplo, também pode ser registrado como sinalizador adicional em outros tipos. A classificação não valida automaticamente os termos anunciados.

### 8 Áreas profissionais e filtros

Para classificar o serviço por atividade, criar também estas 24 áreas, independentes do tipo de oportunidade: Tecnologia e programação; Design e criação; Marketing e redes sociais; Audiovisual e fotografia; Redação e tradução; Administração e atendimento; Vendas e comércio; Educação e aulas; Saúde e bem-estar; Cuidados com pessoas; Beleza e estética; Limpeza e organização; Serviços domésticos; Construção e reformas; Elétrica; Hidráulica; Marcenaria e montagem; Pintura; Jardinagem; Transporte e entregas; Alimentação e cozinha; Eventos e entretenimento; Serviços para animais; Manutenção e reparos.

Exemplo: uma publicação pode ser do tipo Evento, da área Audiovisual e fotografia e da modalidade Presencial. Outra pode ser Autônomo, da área Hidráulica e da modalidade Presencial.

Permitir filtrar por texto, intenção, tipo, área, modalidade, cidade, remuneração e situação. Ordenação inicial por publicações abertas mais recentes; oferecer proximidade do prazo quando houver prazo. Não prometer busca por distância sem geolocalização implementada. Sincronizar filtros com a URL, oferecer Limpar filtros e tratar estados de carregamento, erro e nenhum resultado. Usar paginação ou cursor, sem carregar todo o banco no navegador.

### 9 Candidaturas e estados

O usuário autenticado pode enviar interesse com mensagem e proposta de valor opcional. Impedir candidatura na própria publicação e candidatura ativa duplicada com restrição no banco. Autor visualiza suas candidaturas recebidas; candidato visualiza as próprias. A lista de candidatos não é pública.

Estados da publicação: rascunho, aberta, em andamento, concluída, encerrada e suspensa. Rascunho é privado; suspensa é controlada pela moderação. Encerrada não significa serviço concluído. Transições devem ser autorizadas e registradas no servidor.

Estados da candidatura: enviada, retirada, selecionada e recusada. O autor seleciona um candidato na V1; outras composições são tratadas em Companhia. Seleção deve ser transacional para evitar duas escolhas simultâneas incompatíveis. Candidato pode retirar candidatura antes da seleção. Seleção não equivale a contrato aceito, entrega concluída ou pagamento confirmado; a confirmação do compromisso pertence à Jornada.

### 10 Conteúdo das outras páginas

Forja: catálogo institucional com entrega, fornecedor responsável, prazo estimado, portfólio autorizado e pedido de orçamento persistido. Somente perfil institucional autorizado publica serviços em nome da Phantom Troupe.

Aliança: apresentar parceiro, benefício, elegibilidade, condições, validade e estado de verificação real. Somente gestão autorizada cadastra ou aprova parceria. Não usar selo verificado em cadastros ainda não analisados.

Missões: associar missão ao anúncio quando pertinente, sem duplicar o mesmo trabalho no banco. Mostrar objetivo, entrega, requisitos, prazo, origem e recompensa. Aceite de conclusão precisa de responsável definido.

Companhia: listar equipes e convites, com função e disponibilidade. Convites dependem de aceitação; não adicionar pessoas sem sua concordância.

Jornada: mostrar somente compromissos em que a pessoa participa e painel administrativo permitido. Organizar preparação, execução, entrega, revisão e aceite. Mudanças de escopo preservam histórico.

Mutirão: listar ações coletivas e voluntárias, com entidade, finalidade, horário, recursos, despesas e opção de participação. Não condicionar acesso ao mural à participação voluntária.

Embaixada: catálogo de perfis com visibilidade escolhida, solicitações de apresentação e contatos institucionais. Não revelar dados de terceiros sem autorização. Sem telefone obrigatório no cadastro, privilegiar a interação interna.

Comando: indicadores calculados a partir de dados reais e estado das integrações. Usuários comuns veem seus próprios números; gestão vê agregados autorizados. Integração ainda inexistente aparece como não conectada.

Conselho: formulário de denúncia funcional desde a V1, com categoria, relato e referência à publicação. Fila restrita a moderadores, com decisão e histórico. Avaliações só devem ser habilitadas com vínculo a compromisso real e regras implementadas.

Tesouraria: distinguir orçamento, recompensa prometida, cobrança, pagamento confirmado e repasse. Na V1, mostrar valores propostos e estados registrados com sua origem, sem carteira, custódia ou transferência simulada. Integração financeira posterior exige confirmação pelo provedor; um clique no cliente não confirma dinheiro recebido.

Fundação: conteúdo de ajuda, suporte, condições de uso, acessibilidade e sugestões de melhoria. Formulário de suporte deve persistir solicitação e permitir ao usuário consultar o estado. Configurações administrativas são restritas.

Para esta primeira entrega, as listagens destas áreas podem estar vazias até haver registros reais. Pedidos de orçamento, denúncias e suporte devem persistir. Não gerar números ou depoimentos fictícios no ambiente de produção.

### 11 Arquitetura sugerida

Se não houver stack definida, usar React com TypeScript e Vite no frontend, roteamento por páginas e componentes reutilizáveis. No backend, usar Node.js com TypeScript e PostgreSQL, validação de entrada por schemas e armazenamento de objetos compatível com S3. Supabase pode fornecer PostgreSQL e armazenamento, mas não criar dependência de cadastro por e-mail: o requisito é usuário e senha.

Implemente autenticação de usuário e senha no servidor com biblioteca mantida ou serviço que suporte esse fluxo. Evite inventar e-mails ocultos como atalho. Antes de instalar dependências, verificar a documentação oficial da versão efetivamente escolhida e registrar versões no lockfile. Não reescrever stack existente apenas para seguir esta sugestão.

Armazenar senha somente como hash Argon2id produzido no servidor. Sessões devem usar tokens aleatórios com representação protegida no banco e cookie HttpOnly, Secure em produção e SameSite adequado. Definir expiração e revogação. Implementar proteção CSRF nas mutações, política de origem e autorização para cada recurso. Nunca armazenar senha em texto, no navegador ou nos logs. Nunca expor credenciais administrativas, segredos de armazenamento ou conexão do banco no frontend.

Organizar o projeto por módulos, separando apresentação, regras, acesso a dados e contratos da API. Criar componentes compartilhados para cabeçalho, navegação, avatar, formulário, cartões, filtros, paginação, diálogos e estados de carregamento. Validar mensagens e descrições como texto; não renderizar HTML arbitrário.

### 12 Modelo de dados

Usar identificadores UUID, chaves estrangeiras, índices, timestamps UTC e migrations versionadas. Converter datas para apresentação local em pt-BR. Autoria e permissões são determinadas pela sessão do servidor, nunca por um user_id enviado livremente pelo cliente.

| Entidade | Dados e relações essenciais |
|---|---|
| users | ID, usuário exibido e normalizado único, hash de senha, papel, estado, criação. |
| profiles | user_id único, caminho do avatar, apresentação opcional, preferências de visibilidade. |
| sessions | Usuário, identificador protegido, expiração, revogação. |
| modules | Os 12 nomes e slugs estáveis desta especificação. |
| opportunity_types | As 24 opções de tipo, com slug único e ordem. |
| service_categories | As 24 áreas profissionais, com slug único e ordem. |
| posts | Autor, módulo de origem, intenção, título, texto, tipo, área, modalidade, local, remuneração, prazo, estado e versão. |
| post_images | Anúncio, proprietário, chave de objeto, ordem, capa e estado do processamento. |
| applications | Anúncio, candidato, mensagem, valor opcional, estado; unicidade da candidatura ativa. |
| saved_posts | Usuário e anúncio, combinação única. |
| service_offerings e quote_requests | Serviço institucional, fornecedor, descrição e pedido com solicitante e estado. |
| partnerships | Entidade, condições, validade, aprovador e estado da parceria. |
| quests | Anúncio relacionado opcional, objetivo, entrega, recompensa e responsável pelo aceite. |
| teams e team_members | Equipe, pessoa, função, convite e aceite. |
| engagements e deliveries | Compromisso, partes, condições versionadas, marcos, entregas e aceite. |
| volunteer_actions e participations | Entidade, finalidade, condições e adesões. |
| contact_requests | Solicitante, destinatário, finalidade, permissão e estado. |
| reports e moderation_actions | Denúncia, alvo, relator, decisão e responsável autorizado. |
| financial_records | Compromisso, tipo, centavos, moeda, origem e referência de confirmação. |
| support_requests | Solicitante, assunto, mensagem e estado de atendimento. |
| notifications e audit_events | Destinatário e leitura; ator, ação, objeto e instante, sem segredos. |

As entidades avançadas podem ser adicionadas em migrations das etapas correspondentes. O núcleo inicial precisa conter contas, sessões, perfis, catálogo de tipos e áreas, anúncios, imagens, candidaturas, favoritos, denúncias, pedidos de orçamento e suporte.

### 13 API e permissões

Documentar contratos de entrada, saída, validação e erros. Rotas mínimas sugeridas: POST /api/auth/register, POST /api/auth/login, POST /api/auth/logout, GET /api/auth/me, POST /api/auth/change-password; GET e PATCH /api/profile; POST e DELETE /api/profile/avatar; GET e POST /api/posts; GET e PATCH /api/posts/:id; POST /api/posts/:id/close; upload e remoção autorizada de fotos; criação e retirada de candidatura; seleção pelo autor; salvar e remover favorito; envio de denúncia, orçamento e suporte.

Preferir recursos específicos a um PATCH genérico que aceite alterar qualquer campo. Validar os filtros e limitar paginação. Operações repetidas por retry devem evitar duplicação com chave de idempotência ou restrição apropriada. Usar controle de versão para edição concorrente. Uploads precisam de limites de tamanho na entrada e associação verificada ao recurso.

Papéis iniciais: membro, moderador e administrador. Membro administra o próprio perfil e anúncios; candidatura recebida é visível ao autor e aos responsáveis autorizados. Moderador trata denúncias e suspensões conforme permissão, sem acesso automático irrestrito a dados financeiros. Administrador gerencia conteúdo institucional, configuração e permissões. Cadastro público sempre cria membro; nenhum campo enviado pelo cliente pode promover papel. Registrar ações administrativas relevantes.

### 14 Plano de implementação

Etapa 1: inspecionar projeto, criar README, mapa de rotas, arquitetura, modelo inicial e lista de tarefas com critérios de aceite. Implementar shell responsivo e navegação para as 12 páginas.

Etapa 2: conectar banco, migrations, cadastro por usuário e senha, login, sessão, logout e guardas. Implementar perfil, upload e remoção de avatar com persistência.

Etapa 3: implementar Guilda, CRUD autorizado de anúncios, fotos, detalhes, busca, filtros, paginação e estados vazios ou de erro. Inserir os 24 tipos e as 24 áreas por seed idempotente.

Etapa 4: implementar candidaturas, retirada, seleção transacional, favoritos e denúncia. Disponibilizar fila de moderação restrita e histórico de decisões.

Etapa 5: conectar as outras 11 áreas às suas listagens reais e persistir pedidos de orçamento e suporte. Documentar claramente quais fluxos avançados estão planejados.

Etapa 6: executar testes, revisão de acessibilidade e verificação responsiva, corrigir falhas e fornecer instruções de execução. Não publicar em produção nem conectar pagamentos reais como consequência automática deste prompt.

Não parar após escrever o plano: continuar até concluir o núcleo desta versão, salvo dependência externa indisponível. Se faltarem credenciais, preparar código, migrations e configuração; informar precisamente a dependência, sem inventar conexão ou declarar testes externos aprovados.

### 15 Critérios de aceite e testes

1. Cadastrar usando somente usuário e senha e acessar a Guilda. Rejeitar duplicação de usuário normalizado inclusive por concorrência.
2. Entrar, recarregar, sair e confirmar que sessão encerrada não acessa rotas ou APIs privadas.
3. Abrir o menu do avatar, enviar foto válida, recarregar e verificar persistência; remover a foto e recuperar avatar padrão. Recusar arquivo inválido ou excessivo.
4. Publicar anúncio somente com texto e outro com fotos; recarregar e verificar os mesmos registros, autoria e classificação.
5. Confirmar que o seletor contém exatamente os 24 tipos e que área profissional e modalidade continuam independentes.
6. Filtrar e paginar usando o servidor; apresentar estado vazio quando a combinação não retornar resultados.
7. Tentar editar anúncio ou avatar de outro usuário por API e comprovar recusa. Tentar promover o próprio papel no cadastro ou perfil e comprovar recusa.
8. Candidatar-se a anúncio de outro usuário, impedir duplicidade, retirar candidatura e listar recebidos apenas para o autor autorizado.
9. Testar seleção concorrente: a V1 não pode confirmar dois selecionados para a mesma oportunidade de vaga única.
10. Encerrar publicação, retirar da busca padrão e impedir novas candidaturas, preservando histórico.
11. Percorrer as 12 páginas e conferir nomes, rotas, conteúdo ou estado vazio. Login, cadastro e perfil não entram na contagem dos módulos.
12. Enviar denúncia, pedido de orçamento e suporte; confirmar persistência e acesso restrito conforme o papel.
13. Simular falha de rede na publicação e no upload: preservar formulário, evitar registros duplicados e não perder avatar anterior.
14. Verificar navegação por teclado e interface em celular, tablet e computador, sem cortes ou rolagem horizontal.

Usar testes de integração para autenticação, autorização, persistência e concorrência; testes de ponta a ponta para cadastro até publicação e alteração de avatar. Verificar upload por conteúdo real. Executar build, lint e checagem de tipos. Registrar o que foi executado e o resultado, distinguindo testes com banco real de testes com dependências simuladas.

### 16 Documentação e entrega

Entregar README com requisitos e comandos; .env.example sem segredos; migrations e seeds; docs/arquitetura.md; docs/paginas.md; docs/modelo-de-dados.md; docs/api.md; docs/autenticacao.md; docs/testes.md; e docs/proximas-etapas.md. Não versionar credenciais nem dados pessoais de usuários reais.

No resumo final da implementação, informar arquivos alterados, fluxos funcionando, comandos executados, resultados de testes e dependências pendentes. Informar separadamente o que está implementado e o que foi apenas preparado. Se usar dados de demonstração, mantê-los em seed de desenvolvimento, com identificação explícita e fora de produção.

Comece pela inspeção do projeto e avance seguindo este plano até entregar o núcleo funcional do Zero Control.

## Fim do prompt
