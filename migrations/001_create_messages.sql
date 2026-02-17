create table if not exists messages (
  id bigserial primary key,
  text text not null,
  created_at timestamptz not null default now()
);
