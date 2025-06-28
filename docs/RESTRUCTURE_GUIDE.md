# Guia de Reestruturação do Projeto Proxy for Labs

## 📋 Visão Geral

Este projeto é um proxy TCP para comunicação com equipamentos laboratoriais que suportam protocolos ASTM e HL7. A reestruturação proposta visa melhorar a organização, manutenibilidade e escalabilidade do código.

## 🎯 Objetivos da Reestruturação

- **Separação clara de responsabilidades**
- **Melhor organização dos módulos por funcionalidade**
- **Facilitar testes e manutenção**
- **Seguir padrões de arquitetura Node.js**
- **Preparar para crescimento futuro do projeto**

## 📁 Estrutura Atual vs Proposta

### Estrutura Atual
```
proxy_for_labs/
├── config.js
├── index.js
├── mocks.js
├── package.json
├── debug/
├── docs/
├── helpers/
├── libs/
│   ├── astm/
│   ├── hl7/
│   └── shared/
├── proxy/
│   ├── forward.js
│   └── reverse.js
├── simulators/
│   ├── astm/
│   ├── hl-7/
│   └── lis/
└── trash/
```

### Estrutura Proposta
```
proxy_for_labs/
├── README.md
├── package.json
├── .env.example
├── .gitignore
├── .eslintrc.js
├── .prettierrc
├── lib/
│   ├── index.js
│   ├── config/
│   │   ├── index.js
│   │   ├── constants.js
│   │   └── env-validation.js
│   ├── core/
│   │   ├── proxy/
│   │   │   ├── index.js
│   │   │   ├── forward-proxy.js
│   │   │   ├── reverse-proxy.js
│   │   │   └── proxy-manager.js
│   │   ├── protocols/
│   │   │   ├── astm/
│   │   │   │   ├── index.js
│   │   │   │   ├── parser.js
│   │   │   │   ├── validator.js
│   │   │   │   └── utils/
│   │   │   │       ├── checksum.js
│   │   │   │       └── message-builder.js
│   │   │   ├── hl7/
│   │   │   │   ├── index.js
│   │   │   │   ├── parser.js
│   │   │   │   ├── validator.js
│   │   │   │   ├── segments/
│   │   │   │   │   ├── header.js
│   │   │   │   │   ├── patient.js
│   │   │   │   │   ├── order.js
│   │   │   │   │   ├── results.js
│   │   │   │   │   ├── equipment.js
│   │   │   │   │   ├── inventory.js
│   │   │   │   │   └── specimen.js
│   │   │   │   └── utils/
│   │   │   │       ├── mappers.js
│   │   │   │       ├── converters.js
│   │   │   │       └── core-functions.js
│   │   │   └── shared/
│   │   │       ├── buffer-manager.js
│   │   │       ├── message-queue.js
│   │   │       └── protocol-detector.js
│   │   ├── services/
│   │   │   ├── connection-manager.js
│   │   │   ├── message-processor.js
│   │   │   ├── logger.js
│   │   │   └── health-monitor.js
│   │   └── utils/
│   │       ├── network.js
│   │       ├── validation.js
│   │       └── helpers.js
│   ├── controllers/
│   │   ├── proxy-controller.js
│   │   ├── equipment-controller.js
│   │   └── health-controller.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── rate-limiter.js
│   │   ├── error-handler.js
│   │   └── request-logger.js
│   └── routes/
│       ├── index.js
│       ├── api/
│       │   ├── health.js
│       │   ├── proxy.js
│       │   └── equipment.js
│       └── webhook/
│           └── equipment-events.js
├── tests/
│   ├── unit/
│   │   ├── protocols/
│   │   │   ├── astm/
│   │   │   └── hl7/
│   │   ├── proxy/
│   │   └── services/
│   ├── integration/
│   │   ├── proxy-tests.js
│   │   └── protocol-tests.js
│   ├── e2e/
│   │   └── complete-flow.js
│   ├── fixtures/
│   │   ├── astm-messages/
│   │   ├── hl7-messages/
│   │   └── mock-data/
│   └── utils/
│       ├── test-helpers.js
│       └── mock-servers.js
├── tools/
│   ├── simulators/
│   │   ├── equipment/
│   │   │   ├── astm-simulator.js
│   │   │   └── hl7-simulator.js
│   │   ├── lis/
│   │   │   └── lis-simulator.js
│   │   └── shared/
│   │       ├── simulator-base.js
│   │       └── message-templates.js
│   ├── cli/
│   │   ├── proxy-cli.js
│   │   ├── simulator-cli.js
│   │   └── debug-cli.js
│   └── monitoring/
│       ├── performance-monitor.js
│       └── connection-analyzer.js
├── docs/
│   ├── README.md
│   ├── API.md
│   ├── PROTOCOLS.md
│   ├── DEPLOYMENT.md
│   ├── TROUBLESHOOTING.md
│   ├── protocols/
│   │   ├── hl7-guide.md
│   │   ├── astm-guide.md
│   │   └── protocol-comparison.md
│   └── examples/
│       ├── basic-usage.md
│       ├── advanced-configuration.md
│       └── custom-protocols.md
├── logs/
│   ├── .gitkeep
│   └── debug/
│       └── .gitkeep
├── config/
│   ├── development.env
│   ├── production.env
│   └── test.env
└── scripts/
    ├── setup.sh
    ├── start-dev.sh
    ├── build.sh
    └── deploy.sh
```

## 🔄 Plano de Migração

### Fase 1: Preparação (1-2 dias)
1. **Backup do projeto atual**
2. **Criar estrutura de pastas**
3. **Configurar ferramentas de desenvolvimento**

### Fase 2: Migração Core (3-4 dias)
1. **Mover e refatorar arquivos principais**
2. **Reorganizar bibliotecas de protocolos**
3. **Separar lógica de proxy**

### Fase 3: Testes e Validação (2-3 dias)
1. **Criar estrutura de testes**
2. **Migrar simuladores**
3. **Validar funcionalidades**

### Fase 4: Documentação e Limpeza (1-2 dias)
1. **Atualizar documentação**
2. **Remover arquivos desnecessários**
3. **Configurar CI/CD básico**

## 📝 Detalhamento da Reestruturação

### 1. Diretório `src/`
**Objetivo**: Conter todo o código fonte principal da aplicação.

#### `src/config/`
- **`index.js`**: Configuração principal consolidada
- **`constants.js`**: Constantes da aplicação (portas, timeouts, etc.)
- **`env-validation.js`**: Validação de variáveis de ambiente

#### `src/core/`
**Núcleo da aplicação com lógica de negócio principal.**

##### `src/core/proxy/`
- **`forward-proxy.js`**: Lógica específica do proxy direto
- **`reverse-proxy.js`**: Lógica específica do proxy reverso
- **`proxy-manager.js`**: Gerenciamento centralizado de proxies

##### `src/core/protocols/`
**Implementação dos protocolos de comunicação.**

###### `src/core/protocols/astm/`
- **`parser.js`**: Análise de mensagens ASTM
- **`validator.js`**: Validação de mensagens ASTM
- **`utils/`**: Utilitários específicos ASTM

###### `src/core/protocols/hl7/`
- **`parser.js`**: Análise de mensagens HL7
- **`validator.js`**: Validação de mensagens HL7
- **`segments/`**: Implementação de segmentos HL7
- **`utils/`**: Utilitários específicos HL7

##### `src/core/services/`
- **`connection-manager.js`**: Gerenciamento de conexões TCP
- **`message-processor.js`**: Processamento centralizado de mensagens
- **`logger.js`**: Sistema de logging
- **`health-monitor.js`**: Monitoramento de saúde do sistema

### 2. Diretório `tests/`
**Estrutura completa de testes organizados por tipo e escopo.**

#### `tests/unit/`
Testes unitários isolados para cada componente.

#### `tests/integration/`
Testes de integração entre componentes.

#### `tests/e2e/`
Testes end-to-end simulando fluxos completos.

#### `tests/fixtures/`
Dados de teste e mensagens de exemplo.

### 3. Diretório `tools/`
**Ferramentas de desenvolvimento e utilidades.**

#### `tools/simulators/`
Simuladores de equipamentos e sistemas.

#### `tools/cli/`
Interfaces de linha de comando para operações comuns.

#### `tools/monitoring/`
Ferramentas de monitoramento e análise.

### 4. Diretório `docs/`
**Documentação completa e organizada.**

#### Arquivos principais:
- **`API.md`**: Documentação da API REST
- **`PROTOCOLS.md`**: Documentação dos protocolos
- **`DEPLOYMENT.md`**: Guia de deployment
- **`TROUBLESHOOTING.md`**: Guia de solução de problemas

## 🛠️ Scripts de Migração

### Script 1: Criar Estrutura
```bash
#!/bin/bash
# create-structure.sh

# Criar diretórios principais
mkdir -p src/{config,core/{proxy,protocols/{astm/{utils},hl7/{segments,utils},shared},services,utils},controllers,middleware,routes/{api,webhook}}
mkdir -p tests/{unit/{protocols/{astm,hl7},proxy,services},integration,e2e,fixtures/{astm-messages,hl7-messages,mock-data},utils}
mkdir -p tools/{simulators/{equipment,lis,shared},cli,monitoring}
mkdir -p docs/{protocols,examples}
mkdir -p logs/debug
mkdir -p config
mkdir -p scripts

echo "Estrutura de diretórios criada!"
```

### Script 2: Migrar Arquivos Core
```bash
#!/bin/bash
# migrate-core.sh

# Migrar arquivo principal
mv index.js src/index.js

# Migrar configuração
mv config.js src/config/index.js

# Migrar proxy
mv proxy/* src/core/proxy/

# Migrar bibliotecas
mv libs/astm/* src/core/protocols/astm/
mv libs/hl7/* src/core/protocols/hl7/
mv libs/shared/* src/core/services/

# Migrar simuladores
mv simulators/* tools/simulators/

# Migrar documentação
mv docs/* docs/

echo "Migração core concluída!"
```

## 🔧 Configurações Recomendadas

### .eslintrc.js
```javascript
module.exports = {
  env: {
    node: true,
    es2021: true,
    jest: true
  },
  extends: ['eslint:recommended'],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module'
  },
  rules: {
    'no-console': 'warn',
    'prefer-const': 'error',
    'no-unused-vars': 'error'
  }
};
```

### .prettierrc
```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5"
}
```

### package.json (scripts atualizados)
```json
{
  "scripts": {
    "start": "node src/index.js",
    "dev": "NODE_ENV=development nodemon src/index.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "lint": "eslint src/**/*.js",
    "lint:fix": "eslint src/**/*.js --fix",
    "format": "prettier --write src/**/*.js",
    "simulate:equipment": "node tools/cli/simulator-cli.js equipment",
    "simulate:lis": "node tools/cli/simulator-cli.js lis",
    "proxy:forward": "IS_FORWARD_PROXY=true npm start",
    "proxy:reverse": "IS_REVERSE_PROXY=true npm start"
  }
}
```

## ✅ Checklist de Migração

### Antes da Migração
- [ ] Backup completo do projeto
- [ ] Documentar dependências atuais
- [ ] Testar funcionalidades existentes
- [ ] Criar branch para migração

### Durante a Migração
- [ ] Criar nova estrutura de pastas
- [ ] Migrar arquivos mantendo funcionalidade
- [ ] Atualizar imports/requires
- [ ] Validar cada módulo migrado
- [ ] Configurar ferramentas de desenvolvimento

### Após a Migração
- [ ] Executar todos os testes
- [ ] Validar simuladores
- [ ] Testar proxies (forward/reverse)
- [ ] Verificar logs e debugging
- [ ] Atualizar documentação
- [ ] Configurar CI/CD básico

## 🎯 Benefícios Esperados

### Organização
- **Separação clara** entre core, ferramentas e testes
- **Módulos bem definidos** com responsabilidades específicas
- **Facilita** localização e manutenção de código

### Escalabilidade
- **Estrutura preparada** para novos protocolos
- **Fácil adição** de novas funcionalidades
- **Suporte** a diferentes ambientes (dev, test, prod)

### Manutenibilidade
- **Testes organizados** por tipo e escopo
- **Documentação** centralizada e estruturada
- **Ferramentas** de desenvolvimento bem definidas

### Desenvolvimento
- **Simuladores** organizados e reutilizáveis
- **CLI tools** para operações comuns
- **Monitoramento** e debugging facilitados

## 🚀 Próximos Passos

1. **Revisar** esta proposta com a equipe
2. **Ajustar** estrutura conforme necessidades específicas
3. **Executar** migração em fases
4. **Testar** extensivamente após cada fase
5. **Documentar** lições aprendidas
6. **Implementar** melhorias contínuas

---

**Nota**: Este guia é uma proposta inicial. Ajuste conforme as necessidades específicas do seu projeto e equipe.
