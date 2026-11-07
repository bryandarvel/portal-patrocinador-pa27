create table portal_relatorio_importacoes (
    id bigint generated always as identity primary key,
    parceria_id uuid not null references portal_parcerias(id),
    arquivo_id uuid not null references portal_arquivos(id),
    hash char(64) not null,
    importado_em timestamp with time zone not null default current_timestamp,
    unique (parceria_id, hash)
);

create table portal_relatorio_linhas (
    importacao_id bigint not null references portal_relatorio_importacoes(id),
    linha integer not null,
    mes date not null,
    veiculo varchar(16) not null,
    formato varchar(180) not null,
    chave_formato varchar(180) not null,
    unidade varchar(60) not null,
    contratado bigint not null check (contratado >= 0),
    entregue bigint not null check (entregue >= 0),
    tipo_impacto varchar(60),
    impacto bigint check (impacto >= 0),
    check ((tipo_impacto is null) = (impacto is null)),
    primary key (importacao_id, linha),
    unique (importacao_id, mes, veiculo, chave_formato)
);
