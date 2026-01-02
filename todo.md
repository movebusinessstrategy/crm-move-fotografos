# CRM para Fotógrafos - TODO

## Fase 1: Estrutura do Banco de Dados
- [x] Definir schema completo do banco de dados
- [x] Criar tabela de usuários com planos de assinatura
- [x] Criar tabela de clientes com campos customizados
- [x] Criar tabela de produtos
- [x] Criar tabela de negociações
- [x] Criar tabela de etapas do Kanban customizáveis
- [x] Criar tabela de cards do Kanban
- [x] Criar tabela de agendamentos e lembretes
- [x] Criar tabela de histórico de atividades
- [x] Executar migração do banco de dados

## Fase 2: Design System e Layout Base
- [x] Definir paleta de cores elegante
- [x] Configurar tipografia sofisticada
- [x] Criar DashboardLayout com sidebar elegante
- [x] Implementar navegação principal
- [x] Adicionar componentes de UI customizados
- [x] Configurar tema dark/light

## Fase 3: Cadastro de Clientes
- [x] Criar página de listagem de clientes
- [x] Implementar formulário de cadastro de cliente
- [x] Adicionar campos: nome, telefone, categoria
- [x] Adicionar campos condicionais: data aniversário criança, semanas gestação
- [x] Criar visualização detalhada do cliente
- [x] Implementar edição de cliente
- [x] Adicionar busca e filtros

## Fase 4: Sistema Kanban
- [x] Criar estrutura de Kanban customizável
- [x] Implementar drag-and-drop de cards
- [x] Permitir criação de etapas personalizadas
- [x] Vincular clientes aos cards do Kanban
- [x] Adicionar visualização de detalhes do card
- [x] Implementar movimentação entre etapas
- [x] Registrar histórico de movimentações

## Fase 5: Produtos e Negociações
- [x] Criar página de cadastro de produtos
- [x] Implementar listagem de produtos
- [x] Criar sistema de negociação vinculado ao cliente
- [x] Adicionar campos: produto, valor negociado, data prevista
- [x] Implementar status: Oportunidade, Venda Fechada, Venda Perdida
- [x] Criar visualização de negociações por cliente

## Fase 6: Dashboard de Análise
- [x] Criar dashboard principal com métricas
- [ ] Implementar gráfico de tempo médio por etapa
- [x] Adicionar gráfico de taxa de conversão
- [x] Mostrar vendas fechadas vs perdidas vs oportunidades
- [ ] Implementar comparação de períodos
- [ ] Adicionar filtros por data
- [x] Criar cards de resumo com KPIs

## Fase 7: Sistema de Agendamento e Lembretes
- [x] Criar página de agendamentos
- [x] Implementar calendário de agendamentos
- [x] Adicionar sistema de avisos de retorno
- [ ] Configurar lembretes automáticos por email
- [ ] Implementar notificações de aniversários de clientes
- [ ] Adicionar alertas de prazos de negociação
- [ ] Criar sistema de follow-ups pendentes

## Fase 8: Integração WhatsApp Business API
- [ ] Configurar credenciais da API do WhatsApp
- [ ] Implementar importação de contatos
- [ ] Criar mapeamento automático de dados
- [ ] Adicionar sincronização periódica
- [ ] Implementar interface de configuração

## Fase 9: Extensão Google Chrome
- [ ] Criar estrutura da extensão Chrome
- [ ] Implementar popup de acesso rápido
- [ ] Adicionar atalhos para funcionalidades principais
- [ ] Configurar autenticação na extensão
- [ ] Testar integração com o CRM web

## Fase 10: Testes e Finalização
- [ ] Testar todos os fluxos principais
- [ ] Verificar responsividade
- [ ] Validar integrações
- [ ] Corrigir bugs encontrados
- [ ] Otimizar performance
- [ ] Criar checkpoint final


## BUGS CRÍTICOS REPORTADOS
- [ ] Kanban não está aparecendo corretamente
- [ ] Botões não estão aparecendo na interface
- [ ] Page 2 está dando erro
- [ ] Sistema está muito simples e não funcional
- [ ] Revisar e corrigir navegação do DashboardLayout
- [ ] Implementar Kanban drag-and-drop funcional
- [ ] Testar todos os formulários e operações CRUD


## NOVA FUNCIONALIDADE: Kanban Customizável
- [x] Implementar drag-and-drop funcional entre colunas
- [x] Criar interface para adicionar novas colunas/etapas
- [x] Permitir editar nome das colunas
- [x] Permitir deletar colunas
- [ ] Permitir reordenar colunas
- [x] Salvar configuração de colunas por usuário
- [x] Mover cards entre etapas com histórico


## REDESIGN: Identidade Visual Move Business
- [x] Analisar paleta de cores do site movebusiness.com.br
- [x] Capturar tipografia e estilo visual
- [x] Aplicar nova paleta de cores no index.css (dourado + preto + verde neon)
- [x] Atualizar fontes para match com Move Business
- [x] Alterar tema padrão para dark
- [ ] Renomear aplicação para "CRM - MOVE FOTÓGRAFO" (requer alteração manual nas Configurações)
- [ ] Atualizar logo Move Business
- [x] Ajustar componentes com novo design system
- [ ] Testar visual em todas as páginas
