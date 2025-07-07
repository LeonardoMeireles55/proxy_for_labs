# Implementação de Mapeamento de Nomes de Testes para cobas®pure

## Problema Identificado

Na mensagem HL7 fornecida, os testes eram identificados apenas por códigos numéricos (como `20990`, `20340`, etc.) sem nomes descritivos, dificultando a interpretação dos resultados de controle de qualidade.

## Solução Implementada

### 1. Função de Agrupamento de Resultados

Criada a função `groupResultsByTestCode()` que:

- Agrupa resultados por timestamp para associar valores QC aos testes
- Identifica testes principais (códigos de 5 dígitos com unidades)
- Extrai automaticamente `QC_TARGET` e `QC_SD_RANGE` associados
- Filtra observações não relacionadas a testes (Pipetting_Time, CalibrationID)

### 2. Mapeamento de Códigos para Nomes

Implementada a função `getTestNameMapping()` com mapeamento dos códigos cobas®pure:

```javascript
{
  '20340': 'Total Protein',
  '20411': 'Glucose',
  '20420': 'ALT (Alanine Aminotransferase)',
  '20600': 'AST (Aspartate Aminotransferase)',
  '20710': 'Albumin',
  '20810': 'Alkaline Phosphatase',
  '20990': 'Creatinine',
  '21130': 'Cholesterol',
  '21191': 'Triglycerides',
  '29070': 'Sodium',
  '29080': 'Potassium',
  '29090': 'Chloride'
}
```

### 3. Cálculo Estatístico Aprimorado

Criada a função `calculateStatisticsFromQC()` que:

- Usa valores `QC_TARGET` e `QC_SD_RANGE` do equipamento
- Fornece estatísticas mais precisas baseadas na calibração do equipamento
- Mantém fallback para cálculo tradicional se valores QC não estiverem disponíveis

### 4. Transformação de Dados Especializada

Implementada a função `transformResultCobas()` que:

- Inclui código do teste (`test_code`) e nome (`name`)
- Adiciona valores QC originais (`qc_target`, `qc_sd_range`)
- Usa timestamp específico de cada observação
- Calcula estatísticas a partir dos valores QC do equipamento

## Estrutura de Saída

Cada resultado QC agora contém:

```json
{
  "date": "2025-07-01 19:24:46",
  "test_lot": "-",
  "level_lot": "20391&CONTROL",
  "name": "Total Protein",
  "test_code": "20340",
  "level": "unknown",
  "value": 9.02,
  "mean": 8.78,
  "sd": 0.361,
  "unit_value": "mg/dL",
  "qc_target": 8.78,
  "qc_sd_range": 0.361
}
```

## Principais Melhorias

1. **Identificação Clara**: Cada teste agora tem nome descritivo além do código
2. **Precisão Estatística**: Usa valores QC calibrados do equipamento
3. **Agrupamento Inteligente**: Associa automaticamente valores QC aos testes corretos
4. **Timestamps Específicos**: Usa o timestamp de cada observação individual
5. **Filtragem Inteligente**: Remove automaticamente observações não relacionadas a testes
6. **Compatibilidade**: Mantém compatibilidade com dados de outros equipamentos

## Uso

```javascript
const {
  extractQcValuesAndConvertToJsonCobas
} = require('./src/handlers/hl7/helpers/convert-to-qc-json-cobas');

// Processar dados HL7 do cobas®pure
const qcResults = extractQcValuesAndConvertToJsonCobas(hl7Data);

// Resultado: array de objetos QC com nomes de testes e estatísticas precisas
```

## Benefícios

- **Rastreabilidade**: Códigos e nomes de testes claramente identificados
- **Precisão**: Estatísticas baseadas em calibração do equipamento
- **Usabilidade**: Dados mais legíveis para análise e relatórios
- **Manutenibilidade**: Mapeamento centralizando e facilmente extensível
- **Qualidade**: Melhor controle de qualidade com dados mais precisos

## Expansão Futura

O mapeamento pode ser facilmente expandido para incluir:

- Novos códigos de teste do cobas®pure
- Mapeamentos específicos por modelo de equipamento
- Configuração externa via arquivo JSON/base de dados
- Integração com sistemas LIMS existentes
