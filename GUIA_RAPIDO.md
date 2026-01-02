# 🚀 Guia Rápido - CRM para Fotógrafos

## ⚡ Início Rápido (5 minutos)

### 1. Instalar Dependências
```bash
pnpm install
```

### 2. Configurar Banco de Dados

**Opção A: MySQL Local (Recomendado para desenvolvimento)**
```bash
# Iniciar MySQL
sudo service mysql start

# Criar banco e usuário
sudo mysql -e "CREATE DATABASE IF NOT EXISTS photographer_crm;"
sudo mysql -e "CREATE USER IF NOT EXISTS 'crm_user'@'localhost' IDENTIFIED BY 'crm_password_2026';"
sudo mysql -e "GRANT ALL PRIVILEGES ON photographer_crm.* TO 'crm_user'@'localhost';"
sudo mysql -e "FLUSH PRIVILEGES;"
```

**Opção B: Usar o banco já configurado**
O arquivo `.env.local` já está configurado com as credenciais corretas.

### 3. Executar Migrações
```bash
pnpm db:push
```

### 4. Iniciar o Servidor
```bash
pnpm dev
```

### 5. Acessar o Sistema
Abra o navegador em: **http://localhost:3000**

O sistema fará login automático em modo de desenvolvimento! 🎉

---

## 📱 Funcionalidades Principais

### Dashboard
- Visão geral com métricas em tempo real
- Acesse: `http://localhost:3000/`

### Clientes
- Cadastre e gerencie seus clientes
- Acesse: `http://localhost:3000/clients`

### Kanban
- Visualize e mova negociações entre etapas
- Acesse: `http://localhost:3000/kanban`

### Produtos
- Gerencie seu catálogo de serviços
- Acesse: `http://localhost:3000/products`

### Agendamentos
- Controle seus compromissos
- Acesse: `http://localhost:3000/appointments`

### Analytics
- Veja métricas e relatórios
- Acesse: `http://localhost:3000/analytics`

---

## 🎯 Primeiros Passos

### 1. Cadastrar um Cliente
1. Vá para **Clientes**
2. Clique em **"Novo Cliente"**
3. Preencha os dados:
   - Nome
   - Telefone
   - Email
   - Categoria (Mãe com Criança, Gestante ou Outro)
4. Clique em **"Cadastrar"**

### 2. Criar um Produto
1. Vá para **Produtos**
2. Clique em **"Novo Produto"**
3. Preencha:
   - Nome do serviço (ex: "Ensaio Newborn")
   - Descrição
   - Preço padrão
4. Clique em **"Cadastrar"**

### 3. Criar uma Negociação
1. Vá para **Kanban**
2. Clique em **"Nova Negociação"**
3. Preencha:
   - Cliente
   - Produto
   - Valor negociado
   - Data prevista
4. A negociação aparecerá na coluna "Novo Lead"

### 4. Mover Negociação no Kanban
1. Arraste o card da negociação
2. Solte na coluna desejada
3. O histórico é registrado automaticamente

### 5. Criar um Agendamento
1. Vá para **Agendamentos**
2. Clique em **"Novo Agendamento"**
3. Preencha:
   - Título
   - Descrição
   - Data e hora
   - Tipo (Follow-up, Sessão, Entrega, etc.)
4. Clique em **"Agendar"**

---

## 🎨 Personalização

### Customizar Etapas do Kanban
1. Vá para **Kanban**
2. Clique em **"Gerenciar Etapas"**
3. Você pode:
   - Adicionar novas etapas
   - Editar nomes e cores
   - Excluir etapas não utilizadas

### Etapas Padrão
O sistema vem com 8 etapas pré-configuradas:
1. Novo Lead
2. Contato Inicial
3. Proposta Enviada
4. Negociação
5. Sessão Agendada
6. Sessão Realizada
7. Edição
8. Entrega

---

## 🔧 Comandos Úteis

### Desenvolvimento
```bash
pnpm dev          # Iniciar servidor de desenvolvimento
pnpm check        # Verificar tipos TypeScript
pnpm format       # Formatar código
pnpm test         # Executar testes
```

### Banco de Dados
```bash
pnpm db:push      # Aplicar migrações
```

### Produção
```bash
pnpm build        # Build para produção
pnpm start        # Iniciar em produção
```

---

## 🐛 Solução de Problemas

### Erro: "Cannot connect to database"
**Solução**: Verifique se o MySQL está rodando
```bash
sudo service mysql status
sudo service mysql start
```

### Erro: "Port 3000 is already in use"
**Solução**: Mate o processo que está usando a porta
```bash
killall -9 node
pnpm dev
```

### Erro: "Module not found"
**Solução**: Reinstale as dependências
```bash
rm -rf node_modules
pnpm install
```

### Página em branco ou erro de autenticação
**Solução**: Verifique se `.env.local` está configurado corretamente
```bash
cat .env.local
```

Certifique-se de que `OAUTH_SERVER_URL` está vazio para modo de desenvolvimento:
```env
OAUTH_SERVER_URL=
```

---

## 📊 Estrutura de Dados

### Categorias de Clientes
- **Mãe com Criança**: Ideal para acompanhamento de aniversários
- **Gestante**: Perfeito para ensaios gestante e newborn
- **Outro**: Categoria genérica para outros tipos de cliente

### Status de Negociação
- **Oportunidade**: Negociação em andamento
- **Fechada**: Venda concretizada
- **Perdida**: Venda não concretizada (com motivo)

### Tipos de Agendamento
- **Follow-up**: Retorno com cliente
- **Session**: Sessão fotográfica
- **Delivery**: Entrega de fotos
- **Birthday**: Aniversário de cliente
- **Other**: Outros compromissos

---

## 🎓 Dicas de Uso

### Gestão Eficiente
1. **Cadastre todos os clientes** mesmo os que não fecharam negócio
2. **Use o Kanban diariamente** para visualizar o pipeline
3. **Agende follow-ups** para não perder oportunidades
4. **Registre motivos de perda** para melhorar sua taxa de conversão
5. **Acompanhe o Analytics** para identificar gargalos

### Workflow Recomendado
1. Cliente entra em contato → Cadastrar no CRM
2. Criar negociação → Coluna "Novo Lead"
3. Fazer contato inicial → Mover para "Contato Inicial"
4. Enviar proposta → Mover para "Proposta Enviada"
5. Negociar valores → Mover para "Negociação"
6. Agendar sessão → Mover para "Sessão Agendada"
7. Realizar sessão → Mover para "Sessão Realizada"
8. Editar fotos → Mover para "Edição"
9. Entregar fotos → Mover para "Entrega"
10. Marcar como "Fechada" ou "Perdida"

---

## 📞 Suporte

### Documentação Completa
Consulte `README_FINAL.md` para documentação detalhada.

### Arquivos de Referência
- `todo.md` - Lista de tarefas e status
- `move_business_brand_analysis.md` - Identidade visual
- `analise_pendencias.md` - Análise de pendências

---

## 🎉 Pronto para Usar!

Seu CRM está 100% funcional e pronto para gerenciar seu negócio fotográfico.

**Boas vendas! 📸💰**
