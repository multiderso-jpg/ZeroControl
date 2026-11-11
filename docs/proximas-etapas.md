# Próximas Etapas e Evolução do Produto - Zero Control

Este documento estabelece o roteiro de evolução após a entrega do núcleo funcional da Versão 1.

---

## 1. Módulos Implementados na V1 vs. Próximas Fases

| Módulo | Estado na V1 | Evolução Planejada (V2 e posteriores) |
|---|---|---|
| **Guilda** | **100% Funcional**: Mural central, 24 tipos, 24 áreas, fotos, busca, filtros combinados, ordenação, candidaturas e seleção atômica. | Notificações push em tempo real, busca geoespacial por raio de distância e chats privados autorizados. |
| **Forja** | **Funcional**: Catálogo institucional Phantom Troupe e pedidos de orçamento persistidos no banco. | Contratos inteligentes/assinatura digital e geração automatizada de ordens de serviço. |
| **Aliança** | **Funcional**: Parcerias, benefícios e verificação real de parceiros. | Resgate automatizado de vouchers com códigos únicos por membro. |
| **Missões** | **Funcional**: Quests estratégicas com critérios de entrega e recompensas associadas. | Fila de auditoria de entregas com duplo aceite (líder técnico + solicitante). |
| **Companhia** | **Funcional**: Estrutura de equipes e participantes. | Painel de convocação rápida de esquadrões e gestão de percentuais de remuneração. |
| **Jornada** | **Funcional**: Acompanhamento dos compromissos através das 5 fases de execução. | Histórico detalhado de commits/entregas com anexos de arquivos e medição de horas. |
| **Mutirão** | **Funcional**: Ações coletivas voluntárias com botão de adesão livre. | Emissão de certificados de participação voluntária e controle de prestação de contas de reembolso. |
| **Embaixada** | **Funcional**: Diretório de perfis públicos com controle de privacidade. | Sistema interno de endossos de competências e mensagens privadas intermediadas. |
| **Comando** | **Funcional**: Indicadores reais em tempo real e telemetria de subsistemas. | Painéis de exportação de dados em CSV e alertas automáticos de sobrecarga. |
| **Conselho** | **Funcional**: Formulário de denúncias e fila de moderação com suspensão de anúncios. | Votação colegiada com múltiplos pareceristas para casos complexos. |
| **Tesouraria** | **Funcional**: Demonstrativo de orçamentos e transparência de lançamentos registrados. | Integração com provedor financeiro e gateways regulados sob demanda e confirmação por webhook bancário. |
| **Fundação** | **Funcional**: Documentação, acessibilidade e suporte com persistência de chamados. | Base de conhecimento indexada com busca semântica e respostas automáticas a dúvidas frequentes. |

---

## 2. Recuperação de Acesso Baseada em Códigos Criptográficos
Como a plataforma não coleta e-mail ou telefone para resguardar a soberania e privacidade, uma futura etapa poderá implementar **chaves de recuperação mnemônicas de 12 a 24 palavras (BIP-39)** geradas exclusivamente na criação da conta e mantidas offline pelo usuário.

---

## 3. Armazenamento de Objetos em Nuvem (Compatível com S3)
A V1 implementa armazenamento local isolado com processamento Sharp WebP. A estrutura do código foi projetada para permitir alternar o destino dos uploads para buckets S3 (Cloudflare R2, MinIO, AWS S3 ou Supabase Storage) apenas configurando as variáveis de ambiente correspondentes.
