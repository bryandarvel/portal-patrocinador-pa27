create table portal_signatarios (
    id uuid primary key, parceria_id uuid not null references portal_parcerias(id),
    nome varchar(200) not null, email varchar(255) not null, cargo varchar(150) not null
);
create table portal_contrato_versoes (
    id uuid primary key, parceria_id uuid not null references portal_parcerias(id),
    numero integer not null, arquivo_id uuid not null references portal_arquivos(id),
    signatarios text not null, criado_por uuid not null references usuarios(id),
    criado_em timestamp with time zone not null default current_timestamp,
    unique(parceria_id, numero)
);
create table portal_contrato_decisoes (
    id uuid primary key, versao_id uuid not null unique references portal_contrato_versoes(id),
    decisao varchar(30) not null check(decisao in ('APROVADO','AJUSTES')),
    comentario varchar(2000) not null, criado_por uuid not null references usuarios(id),
    criado_em timestamp with time zone not null default current_timestamp
);
create table portal_contrato_assinado (
    parceria_id uuid primary key references portal_parcerias(id),
    versao_id uuid not null references portal_contrato_versoes(id),
    arquivo_id uuid not null references portal_arquivos(id),
    criado_por uuid not null references usuarios(id),
    criado_em timestamp with time zone not null default current_timestamp
);
create table portal_entregas (
    id uuid primary key, parceria_id uuid not null references portal_parcerias(id),
    area varchar(40) not null, titulo varchar(200) not null, descricao varchar(2000) not null,
    responsavel_id uuid references usuarios(id), execucao varchar(30) not null default 'PROGRAMADA',
    versao bigint not null default 0, criado_em timestamp with time zone not null default current_timestamp,
    check(execucao in ('PROGRAMADA','EM_EXECUCAO','REALIZADA'))
);
create index portal_entregas_parceria on portal_entregas(parceria_id);
create table portal_entrega_materiais (
    id uuid primary key, entrega_id uuid not null references portal_entregas(id),
    numero integer not null, arquivo_id uuid not null references portal_arquivos(id),
    estado varchar(30) not null default 'RECEBIDO', correcao varchar(2000) not null default '',
    avaliado_por uuid references usuarios(id), avaliado_em timestamp with time zone,
    unique(entrega_id, numero), check(estado in ('RECEBIDO','EM_ANALISE','AJUSTES','APROVADO'))
);
create table portal_comprovacoes (
    id uuid primary key, entrega_id uuid not null references portal_entregas(id),
    material_id uuid not null references portal_entrega_materiais(id),
    descricao varchar(2000) not null, arquivo_id uuid references portal_arquivos(id),
    criado_por uuid not null references usuarios(id),
    criado_em timestamp with time zone not null default current_timestamp
);
