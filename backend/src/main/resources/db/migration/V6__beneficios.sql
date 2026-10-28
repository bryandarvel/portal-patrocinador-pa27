create table portal_cota_beneficios (
    id uuid primary key, cota_id uuid not null references portal_cotas(id),
    natureza varchar(20) not null check(natureza in ('CORTESIA','CREDENCIAL')),
    tipo varchar(120) not null, setor varchar(120) not null, publico varchar(120) not null,
    quantidade integer not null check(quantidade>=0),
    unique(cota_id,natureza,tipo,setor,publico)
);
create table portal_beneficios (
    id uuid primary key, parceria_id uuid not null references portal_parcerias(id),
    natureza varchar(20) not null check(natureza in ('CORTESIA','CREDENCIAL')),
    tipo varchar(120) not null, setor varchar(120) not null, publico varchar(120) not null,
    quantidade integer not null check(quantidade>=0), versao bigint not null default 0,
    unique(parceria_id,natureza,tipo,setor,publico)
);
alter table portal_cortesias add column beneficio_id uuid references portal_beneficios(id);
alter table portal_credenciamento add column beneficio_id uuid references portal_beneficios(id);
create index portal_cortesias_beneficio on portal_cortesias(beneficio_id,dia_evento);
