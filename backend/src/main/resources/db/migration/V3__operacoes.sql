CREATE TABLE portal_arquivos (
    id uuid PRIMARY KEY,
    parceria_id uuid NOT NULL REFERENCES portal_parcerias(id) ON DELETE CASCADE,
    area varchar(40) NOT NULL,
    tipo varchar(80) NOT NULL,
    interno boolean NOT NULL DEFAULT false,
    nome varchar(255) NOT NULL,
    tamanho bigint NOT NULL CHECK (tamanho > 0),
    content_type varchar(120) NOT NULL,
    storage_key varchar(36) NOT NULL UNIQUE,
    versao integer NOT NULL CHECK (versao > 0),
    criado_por uuid NOT NULL,
    criado_em timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ix_portal_arquivos_parceria_area_tipo ON portal_arquivos(parceria_id, area, tipo, versao DESC);
CREATE UNIQUE INDEX uq_portal_arquivos_versao ON portal_arquivos(parceria_id, area, tipo, versao);

CREATE TABLE portal_operacao_publicacoes (
    id uuid PRIMARY KEY,
    parceria_id uuid NOT NULL REFERENCES portal_parcerias(id) ON DELETE CASCADE,
    area varchar(40) NOT NULL,
    tipo varchar(80) NOT NULL,
    arquivo_id uuid REFERENCES portal_arquivos(id),
    url varchar(2048),
    titulo varchar(255) NOT NULL,
    texto text,
    criado_por uuid NOT NULL,
    criado_em timestamptz NOT NULL DEFAULT now(),
    CHECK (arquivo_id IS NOT NULL OR url IS NOT NULL OR texto IS NOT NULL)
);
CREATE INDEX ix_portal_publicacoes_parceria_area ON portal_operacao_publicacoes(parceria_id, area, criado_em DESC);

CREATE TABLE portal_miv_versoes (
    id uuid PRIMARY KEY,
    parceria_id uuid NOT NULL REFERENCES portal_parcerias(id) ON DELETE CASCADE,
    arquivo_id uuid NOT NULL REFERENCES portal_arquivos(id),
    versao integer NOT NULL CHECK (versao > 0),
    criado_por uuid NOT NULL,
    criado_em timestamptz NOT NULL DEFAULT now(),
    UNIQUE (parceria_id, versao)
);

CREATE TABLE portal_midia_versoes (
    id uuid PRIMARY KEY,
    parceria_id uuid NOT NULL REFERENCES portal_parcerias(id) ON DELETE CASCADE,
    arquivo_id uuid REFERENCES portal_arquivos(id),
    texto text,
    versao integer NOT NULL CHECK (versao > 0),
    criado_por uuid NOT NULL,
    criado_em timestamptz NOT NULL DEFAULT now(),
    CHECK (arquivo_id IS NOT NULL OR (texto IS NOT NULL AND length(trim(texto)) > 0)),
    UNIQUE (parceria_id, versao)
);

CREATE TABLE portal_midia_briefing (
    parceria_id uuid PRIMARY KEY REFERENCES portal_parcerias(id) ON DELETE CASCADE,
    texto text NOT NULL,
    versao integer NOT NULL DEFAULT 1 CHECK (versao > 0),
    atualizado_por uuid NOT NULL,
    atualizado_em timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE portal_midia_veiculacoes (
    id uuid PRIMARY KEY,
    parceria_id uuid NOT NULL REFERENCES portal_parcerias(id) ON DELETE CASCADE,
    canal varchar(120) NOT NULL,
    descricao text NOT NULL,
    url varchar(2048),
    veiculado_em timestamptz,
    criado_por uuid NOT NULL,
    criado_em timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE portal_cortesias (
    id uuid PRIMARY KEY,
    parceria_id uuid NOT NULL REFERENCES portal_parcerias(id) ON DELETE CASCADE,
    quantidade integer NOT NULL CHECK (quantidade >= 0),
    tipo varchar(20) NOT NULL CHECK (tipo IN ('passaporte', 'sexta', 'sabado')),
    setor varchar(120) NOT NULL,
    periodo_inicio date,
    periodo_fim date,
    dia_evento date,
    versao integer NOT NULL DEFAULT 1 CHECK (versao > 0),
    criado_por uuid NOT NULL,
    criado_em timestamptz NOT NULL DEFAULT now(),
    CHECK (periodo_inicio IS NULL OR periodo_fim IS NULL OR periodo_inicio <= periodo_fim)
);
CREATE INDEX ix_portal_cortesias_parceria ON portal_cortesias(parceria_id);

CREATE TABLE portal_cortesias_destinacoes (
    id uuid PRIMARY KEY,
    cortesia_id uuid NOT NULL REFERENCES portal_cortesias(id) ON DELETE CASCADE,
    quantidade integer NOT NULL CHECK (quantidade > 0),
    destinacao varchar(500) NOT NULL,
    criado_por uuid NOT NULL,
    criado_em timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE portal_credenciamento (
    parceria_id uuid NOT NULL REFERENCES portal_parcerias(id) ON DELETE CASCADE,
    setor varchar(120) NOT NULL,
    tipo varchar(120) NOT NULL,
    publico varchar(120) NOT NULL,
    quantidade integer NOT NULL CHECK (quantidade >= 0),
    criado_por uuid NOT NULL,
    atualizado_em timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (parceria_id, setor, tipo, publico)
);

CREATE TABLE portal_credenciamento_links (
    parceria_id uuid PRIMARY KEY REFERENCES portal_parcerias(id) ON DELETE CASCADE,
    url varchar(2048) NOT NULL,
    atualizado_por uuid NOT NULL,
    atualizado_em timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE portal_pesquisa_versoes (
    id uuid PRIMARY KEY,
    parceria_id uuid NOT NULL REFERENCES portal_parcerias(id) ON DELETE CASCADE,
    versao integer NOT NULL CHECK (versao > 0),
    criado_por uuid NOT NULL,
    criado_em timestamptz NOT NULL DEFAULT now(),
    UNIQUE (parceria_id, versao)
);

CREATE TABLE portal_pesquisa_perguntas (
    id uuid PRIMARY KEY,
    versao_id uuid NOT NULL REFERENCES portal_pesquisa_versoes(id) ON DELETE CASCADE,
    ordem smallint NOT NULL CHECK (ordem BETWEEN 1 AND 3),
    pergunta varchar(1000) NOT NULL,
    UNIQUE (versao_id, ordem)
);

CREATE TABLE portal_faq (
    id uuid PRIMARY KEY,
    parceria_id uuid NOT NULL REFERENCES portal_parcerias(id) ON DELETE CASCADE,
    categoria varchar(120) NOT NULL,
    pergunta varchar(500) NOT NULL,
    resposta text NOT NULL,
    versao integer NOT NULL DEFAULT 1 CHECK (versao > 0),
    atualizado_por uuid NOT NULL,
    atualizado_em timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ix_portal_faq_parceria ON portal_faq(parceria_id, categoria);
