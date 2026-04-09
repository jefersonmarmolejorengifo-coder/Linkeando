-- ============================================================
-- LINKEANDO – Schema completo
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- 1. USUARIOS
-- ─────────────────────────────────────────────────────────────
create table public.usuarios (
  id            uuid primary key references auth.users(id) on delete cascade,
  tipo          text not null check (tipo in ('cliente', 'profesional')),
  nombre        text not null,
  telefono      text,
  avatar_url    text,
  -- Solo profesionales
  categoria     text check (categoria in (
                  'plomeria','electricidad','carpinteria',
                  'pintura','limpieza','jardineria','cerrajeria','otros'
                )),
  descripcion   text,
  barrio        text,
  lat           double precision,
  lng           double precision,
  tarifa          numeric(10,2),
  rating_promedio numeric(3,2) default 0,
  total_servicios integer default 0,
  created_at    timestamptz default now()
);

-- Los profesionales deben tener categoría
alter table public.usuarios
  add constraint profesional_requiere_categoria
  check (tipo = 'cliente' or (tipo = 'profesional' and categoria is not null));

-- ─────────────────────────────────────────────────────────────
-- 2. SOLICITUDES DE SERVICIO
-- ─────────────────────────────────────────────────────────────
create table public.solicitudes (
  id              uuid primary key default gen_random_uuid(),
  cliente_id      uuid not null references public.usuarios(id) on delete cascade,
  categoria       text not null check (categoria in (
                    'plomeria','electricidad','carpinteria',
                    'pintura','limpieza','jardineria','cerrajeria','otros'
                  )),
  titulo          text not null,
  descripcion     text not null,
  direccion       text not null,
  barrio          text,
  lat             double precision,
  lng             double precision,
  presupuesto_max numeric(12,2),
  estado          text not null default 'abierta'
                    check (estado in ('abierta','en_proceso','completada','cancelada')),
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- ─────────────────────────────────────────────────────────────
-- 3. POSTULACIONES
-- ─────────────────────────────────────────────────────────────
create table public.postulaciones (
  id                  uuid primary key default gen_random_uuid(),
  solicitud_id        uuid not null references public.solicitudes(id) on delete cascade,
  profesional_id      uuid not null references public.usuarios(id) on delete cascade,
  mensaje             text not null,
  precio_propuesto    numeric(12,2),
  estado              text not null default 'pendiente'
                        check (estado in ('pendiente','aceptada','rechazada')),
  created_at          timestamptz default now(),
  -- Un profesional solo puede postularse una vez por solicitud
  unique (solicitud_id, profesional_id)
);

-- ─────────────────────────────────────────────────────────────
-- 4. MENSAJES DE CHAT
-- El chat está ligado a una solicitud entre cliente y profesional
-- ─────────────────────────────────────────────────────────────
create table public.mensajes (
  id              uuid primary key default gen_random_uuid(),
  solicitud_id    uuid not null references public.solicitudes(id) on delete cascade,
  remitente_id    uuid not null references public.usuarios(id) on delete cascade,
  destinatario_id uuid not null references public.usuarios(id) on delete cascade,
  contenido       text not null,
  leido           boolean not null default false,
  created_at      timestamptz default now()
);

-- ─────────────────────────────────────────────────────────────
-- 5. SERVICIOS COMPLETADOS
-- Se crea cuando el cliente marca la solicitud como completada
-- ─────────────────────────────────────────────────────────────
create table public.servicios_completados (
  id              uuid primary key default gen_random_uuid(),
  solicitud_id    uuid not null references public.solicitudes(id) on delete cascade,
  postulacion_id  uuid not null references public.postulaciones(id) on delete cascade,
  cliente_id      uuid not null references public.usuarios(id),
  profesional_id  uuid not null references public.usuarios(id),
  monto_final     numeric(12,2),
  fecha_completado timestamptz default now(),
  created_at      timestamptz default now(),
  unique (solicitud_id)
);

-- ─────────────────────────────────────────────────────────────
-- 6. CALIFICACIONES
-- Cliente califica al profesional y viceversa (una vez cada uno)
-- ─────────────────────────────────────────────────────────────
create table public.calificaciones (
  id                      uuid primary key default gen_random_uuid(),
  servicio_completado_id  uuid not null references public.servicios_completados(id) on delete cascade,
  calificador_id          uuid not null references public.usuarios(id),
  calificado_id           uuid not null references public.usuarios(id),
  puntuacion              smallint not null check (puntuacion between 1 and 5),
  comentario              text,
  created_at              timestamptz default now(),
  -- Cada participante califica una sola vez por servicio
  unique (servicio_completado_id, calificador_id)
);

-- ─────────────────────────────────────────────────────────────
-- TRIGGERS
-- ─────────────────────────────────────────────────────────────

-- Actualiza updated_at en solicitudes
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger solicitudes_updated_at
  before update on public.solicitudes
  for each row execute function public.set_updated_at();

-- Al aceptar una postulación, cambia el estado de la solicitud a 'en_proceso'
-- y rechaza las demás postulaciones
create or replace function public.handle_postulacion_aceptada()
returns trigger language plpgsql as $$
begin
  if new.estado = 'aceptada' and old.estado = 'pendiente' then
    update public.solicitudes
      set estado = 'en_proceso'
      where id = new.solicitud_id;

    update public.postulaciones
      set estado = 'rechazada'
      where solicitud_id = new.solicitud_id
        and id <> new.id
        and estado = 'pendiente';
  end if;
  return new;
end;
$$;

create trigger postulacion_aceptada
  after update on public.postulaciones
  for each row execute function public.handle_postulacion_aceptada();

-- Al crear una calificación, recalcula el rating_promedio del calificado
create or replace function public.actualizar_rating()
returns trigger language plpgsql as $$
begin
  update public.usuarios
    set rating_promedio = (
      select round(avg(puntuacion)::numeric, 2)
      from public.calificaciones
      where calificado_id = new.calificado_id
    ),
    total_servicios = (
      select count(*)
      from public.servicios_completados
      where profesional_id = new.calificado_id
    )
    where id = new.calificado_id;
  return new;
end;
$$;

create trigger calificacion_creada
  after insert on public.calificaciones
  for each row execute function public.actualizar_rating();

-- ─────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY (RLS)
-- ─────────────────────────────────────────────────────────────
alter table public.usuarios             enable row level security;
alter table public.solicitudes          enable row level security;
alter table public.postulaciones        enable row level security;
alter table public.mensajes             enable row level security;
alter table public.servicios_completados enable row level security;
alter table public.calificaciones       enable row level security;

-- USUARIOS: perfil público visible para todos, edición solo propia
create policy "Perfiles públicos"
  on public.usuarios for select using (true);

create policy "Usuario edita su propio perfil"
  on public.usuarios for update
  using (auth.uid() = id);

create policy "Usuario crea su propio perfil"
  on public.usuarios for insert
  with check (auth.uid() = id);

-- SOLICITUDES: visibles para todos, solo el cliente crea/edita las suyas
create policy "Solicitudes visibles"
  on public.solicitudes for select using (true);

create policy "Cliente crea solicitudes"
  on public.solicitudes for insert
  with check (auth.uid() = cliente_id);

create policy "Cliente edita sus solicitudes"
  on public.solicitudes for update
  using (auth.uid() = cliente_id);

-- POSTULACIONES: visibles para el cliente dueño y el profesional postulante
create policy "Postulaciones visibles para involucrados"
  on public.postulaciones for select
  using (
    auth.uid() = profesional_id or
    auth.uid() = (select cliente_id from public.solicitudes where id = solicitud_id)
  );

create policy "Profesional crea postulaciones"
  on public.postulaciones for insert
  with check (auth.uid() = profesional_id);

create policy "Cliente acepta/rechaza postulaciones"
  on public.postulaciones for update
  using (
    auth.uid() = (select cliente_id from public.solicitudes where id = solicitud_id)
  );

-- MENSAJES: solo el remitente y destinatario
create policy "Mensajes visibles para participantes"
  on public.mensajes for select
  using (auth.uid() = remitente_id or auth.uid() = destinatario_id);

create policy "Remitente envía mensajes"
  on public.mensajes for insert
  with check (auth.uid() = remitente_id);

create policy "Destinatario marca como leído"
  on public.mensajes for update
  using (auth.uid() = destinatario_id);

-- SERVICIOS COMPLETADOS: visibles para cliente y profesional involucrados
create policy "Servicio visible para involucrados"
  on public.servicios_completados for select
  using (auth.uid() = cliente_id or auth.uid() = profesional_id);

create policy "Cliente registra servicio completado"
  on public.servicios_completados for insert
  with check (auth.uid() = cliente_id);

-- CALIFICACIONES: públicas para consulta, privadas para creación
create policy "Calificaciones públicas"
  on public.calificaciones for select using (true);

create policy "Usuario califica una vez"
  on public.calificaciones for insert
  with check (auth.uid() = calificador_id);

-- ─────────────────────────────────────────────────────────────
-- ÍNDICES para rendimiento
-- ─────────────────────────────────────────────────────────────
create index on public.solicitudes (cliente_id);
create index on public.solicitudes (categoria);
create index on public.solicitudes (estado);
create index on public.postulaciones (solicitud_id);
create index on public.postulaciones (profesional_id);
create index on public.mensajes (solicitud_id);
create index on public.mensajes (remitente_id, destinatario_id);
create index on public.calificaciones (calificado_id);
create index on public.usuarios (tipo, categoria);
