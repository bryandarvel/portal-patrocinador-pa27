create table if not exists usuarios (
    id uuid primary key, nome varchar(255), email varchar(255) unique not null,
    senha varchar(255), ativo boolean not null default false,
    token_verificacao varchar(255), mfa_enabled boolean not null default false,
    mfa_secret varchar(255), role varchar(255) not null
);
create table if not exists login_history (
    id uuid primary key, usuario_id uuid references usuarios(id), ip_address varchar(255),
    latitude double precision, longitude double precision, timestamp timestamp
);
create table portal_cotas (
    id uuid primary key, nome varchar(120) not null unique, versao bigint not null default 0
);
create table portal_cota_areas (
    cota_id uuid not null references portal_cotas(id), area varchar(40) not null,
    primary key(cota_id, area)
);
create table portal_modelos_entrega (
    id uuid primary key, cota_id uuid not null references portal_cotas(id),
    area varchar(40) not null, titulo varchar(200) not null, descricao varchar(2000) not null
);
create table portal_parcerias (
    id uuid primary key, nome varchar(200) not null, edicao varchar(80) not null,
    cota_id uuid not null references portal_cotas(id), versao bigint not null default 0,
    criado_em timestamp with time zone not null default current_timestamp
);
create table portal_acessos (
    parceria_id uuid not null references portal_parcerias(id), usuario_id uuid not null references usuarios(id),
    primary key(parceria_id, usuario_id)
);
create index portal_acessos_usuario on portal_acessos(usuario_id, parceria_id);
create table portal_areas (
    parceria_id uuid not null references portal_parcerias(id), area varchar(40) not null,
    habilitada boolean not null default true, recebimento_aberto boolean not null default true,
    prazo timestamp with time zone, primary key(parceria_id, area)
);
create table portal_historico (
    id uuid primary key, parceria_id uuid not null references portal_parcerias(id),
    usuario_id uuid not null references usuarios(id), area varchar(40) not null,
    acao varchar(80) not null, descricao varchar(1000) not null,
    criado_em timestamp with time zone not null default current_timestamp
);
create index portal_historico_parceria on portal_historico(parceria_id, criado_em);
