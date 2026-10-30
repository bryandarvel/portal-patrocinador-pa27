# Spec Delta

## Purpose

Permite popular e limpar a base local do portal com dados de demonstração criados pela API, sem dados fixos no frontend.

## ADDED Requirements

### Requirement: Carga de demonstração pela API
O comando de carga SHALL criar, somente pela API autenticada, três parcerias de demonstração, uma por cota (Master, Subcota G e Subcota), com nomes marcados como demonstração, e preencher todas as áreas habilitadas de pelo menos uma delas.

#### Scenario: Base vazia
- **WHEN** o comando roda com backend e Mailpit ativos e credenciais do bootstrap válidas
- **THEN** existem as três parcerias, um patrocinador ativado por parceria, um segundo Admin RBS e dados em perfil, marca, mídia, cortesias, credenciamento, pesquisa, contrato, entregas e FAQ

#### Scenario: Execução repetida
- **WHEN** o comando roda de novo
- **THEN** nenhuma parceria, cota ou usuário de demonstração é duplicado

### Requirement: Limpeza com backup
O comando de limpeza SHALL recusar a execução sem confirmação explícita e, quando confirmado, salvar backup do banco e dos arquivos antes de apagar os dados, preservando o schema e o histórico de migrações.

#### Scenario: Sem confirmação
- **WHEN** o comando roda sem `--confirmar`
- **THEN** nada é alterado e a mensagem explica como confirmar

#### Scenario: Confirmado
- **WHEN** o comando roda com `--confirmar`
- **THEN** existe um backup novo em `backups/`, as tabelas de dados estão vazias, os arquivos enviados foram removidos e as migrações continuam aplicadas

### Requirement: Frontend sem dados fixos
O frontend SHALL obter dados de parceria, patrocinador e operação somente da API.

#### Scenario: Prévias antigas
- **WHEN** o código do frontend é inspecionado
- **THEN** não há serviços ou telas com dados de exemplo embutidos
