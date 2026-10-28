CREATE TABLE portal_midia_veiculacoes_revisoes (
    parceria_id uuid PRIMARY KEY REFERENCES portal_parcerias(id) ON DELETE CASCADE,
    versao integer NOT NULL DEFAULT 0 CHECK (versao >= 0),
    atualizado_por uuid NOT NULL REFERENCES usuarios(id),
    atualizado_em timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE portal_midia_veiculacoes_historico (
    parceria_id uuid NOT NULL REFERENCES portal_parcerias(id) ON DELETE CASCADE,
    versao integer NOT NULL CHECK (versao >= 0),
    ordem integer NOT NULL CHECK (ordem >= 0),
    item_id uuid,
    canal varchar(120),
    descricao text,
    url varchar(2048),
    veiculado_em timestamptz,
    item_criado_por uuid,
    item_criado_em timestamptz,
    snapshot_por uuid NOT NULL REFERENCES usuarios(id),
    snapshot_em timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (parceria_id, versao, ordem)
);

CREATE TABLE portal_credenciamento_revisoes (
    parceria_id uuid PRIMARY KEY REFERENCES portal_parcerias(id) ON DELETE CASCADE,
    versao integer NOT NULL DEFAULT 0 CHECK (versao >= 0),
    atualizado_por uuid NOT NULL REFERENCES usuarios(id),
    atualizado_em timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE portal_credenciamento_historico (
    parceria_id uuid NOT NULL REFERENCES portal_parcerias(id) ON DELETE CASCADE,
    versao integer NOT NULL CHECK (versao >= 0),
    ordem integer NOT NULL CHECK (ordem >= 0),
    setor varchar(120),
    tipo varchar(120),
    publico varchar(120),
    beneficio_id uuid,
    quantidade integer,
    url_open_staff varchar(2048),
    snapshot_por uuid NOT NULL REFERENCES usuarios(id),
    snapshot_em timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (parceria_id, versao, ordem)
);
