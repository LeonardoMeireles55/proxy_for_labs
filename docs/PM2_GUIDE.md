# PM2 Setup and Usage Guide

Este guia explica como usar o PM2 para gerenciar o sistema de laboratório.

## Pré-requisitos

1. Instalar o PM2 globalmente:

```bash
npm install -g pm2
```

## Comandos Disponíveis

### Usando PM2 (Recomendado para Produção)

```bash
# Iniciar todos os serviços (emulador + proxy)
npm run pm2:start

# Verificar status dos processos
npm run pm2:status

# Ver logs em tempo real
npm run pm2:logs

# Monitorar processos (interface interativa)
npm run pm2:monit

# Parar todos os serviços
npm run pm2:stop

# Reiniciar todos os serviços
npm run pm2:restart

# Remover todos os processos do PM2
npm run pm2:delete
```

### Usando Node.js Diretamente

```bash
# Iniciar sistema completo com sequência automática
npm run start:system

# Iniciar apenas o emulador
npm run start:emu

# Iniciar apenas o proxy
npm run start
```

## Estrutura do PM2

O arquivo `ecosystem.config.js` define dois processos:

1. **lab-emulator** (`start-emu-environment.js`)

   - Inicia primeiro
   - Simula equipamentos de laboratório

2. **lab-proxy** (`app.js`)
   - Inicia depois do emulador
   - Proxy TCP para comunicação

## Configuração Automática no Boot

Para iniciar automaticamente no boot do sistema:

```bash
# Configurar startup (apenas uma vez)
npm run pm2:startup

# Salvar configuração atual
npm run pm2:save
```

## Logs

Os logs são automaticamente organizados em:

- `./logs/emulator.log` - Log combinado do emulador
- `./logs/proxy.log` - Log combinado do proxy
- `./logs/*-out.log` - Saída padrão
- `./logs/*-error.log` - Erros

## Monitoramento

```bash
# Ver status detalhado
pm2 status

# Ver logs específicos
pm2 logs lab-emulator
pm2 logs lab-proxy

# Interface de monitoramento
pm2 monit
```

## Troubleshooting

### Processos não iniciam

```bash
# Verificar logs de erro
npm run pm2:logs

# Reiniciar processos específicos
pm2 restart lab-emulator
pm2 restart lab-proxy
```

### Conflitos de porta

```bash
# Verificar portas em uso
npm run check:ports

# Parar todos os processos Node.js
npm run stop:all
```

### Reset completo

```bash
# Parar e remover todos os processos
npm run pm2:delete

# Reiniciar do zero
npm run pm2:start
```

## Produção vs Desenvolvimento

### Desenvolvimento

```bash
# Uso normal com logs no console
npm run start:system
```

### Produção

```bash
# Com PM2 para monitoramento e auto-restart
npm run pm2:start
pm2 startup
pm2 save
```

## Comandos PM2 Avançados

```bash
# Recarregar sem downtime (zero-downtime reload)
pm2 reload ecosystem.config.js

# Parar processo específico
pm2 stop lab-emulator

# Reiniciar com variáveis de ambiente de produção
pm2 start ecosystem.config.js --env production

# Ver métricas de performance
pm2 show lab-proxy
```
