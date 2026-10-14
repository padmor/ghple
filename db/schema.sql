-- GBHPL database (Neon / PostgreSQL). Safe to run more than once.

create table if not exists products (
  id           text primary key,
  name         text not null,
  size         text not null,
  volume_ml    integer not null,
  price        numeric(10, 2) not null check (price >= 0),
  description  text not null default '',
  badge        text,
  image        text,
  in_stock     boolean not null default true,
  sort         integer not null default 0,
  created_at   timestamptz not null default now()
);

-- One row each: the store's contact details and the founder profile
create table if not exists settings (
  id               integer primary key default 1 check (id = 1),
  trade_email      text not null default '',
  whatsapp_number  text not null default '',
  phone            text not null default '',
  address          text not null default ''
);

create table if not exists founder (
  id          integer primary key default 1 check (id = 1),
  name        text not null default '',
  title       text not null default '',
  bio         text not null default '',
  quote       text not null default '',
  photo_path  text not null default ''
);

-- Every customer order. Items are copied in at purchase time so later price
-- changes never rewrite history.
create table if not exists orders (
  id                text primary key,
  customer_name     text not null default '',
  phone             text not null default '',
  region            text not null default '',
  delivery_address  text not null default '',
  payment_method    text not null check (payment_method in ('momo_mtn', 'momo_telecel', 'momo_at', 'cash')),
  items             jsonb not null,
  subtotal          numeric(10, 2) not null,
  delivery_fee      numeric(10, 2) not null,
  total             numeric(10, 2) not null,
  status            text not null default 'pending_payment'
                      check (status in ('pending_payment', 'confirmed', 'out_for_delivery', 'delivered')),
  refund            jsonb,
  created_at        timestamptz not null default now()
);

create index if not exists orders_created_idx on orders (created_at desc);
create index if not exists orders_phone_idx on orders (phone);

-- The audit trail: every action on an order, oldest first. Rows are only ever added.
create table if not exists order_log (
  id        bigserial primary key,
  order_id  text not null references orders (id) on delete cascade,
  at        timestamptz not null default now(),
  action    text not null,
  note      text
);

create index if not exists order_log_order_idx on order_log (order_id, at);

-- Storefront activity for the live dashboard (visits, carts, checkouts)
create table if not exists events (
  id     bigserial primary key,
  type   text not null check (type in ('visit', 'add_to_cart', 'checkout', 'order')),
  label  text,
  at     timestamptz not null default now()
);

create index if not exists events_at_idx on events (at desc);

-- Feedback and job applications
create table if not exists form_submissions (
  id          bigserial primary key,
  kind        text not null check (kind in ('feedback', 'application')),
  fields      jsonb not null,
  created_at  timestamptz not null default now()
);

-- People who can sign in to the manager area. Passwords are stored only as
-- salted scrypt hashes, never as text. Create staff with: npm run manager:create
create table if not exists manager_users (
  id             bigserial primary key,
  email          text not null unique,
  name           text not null default '',
  password_hash  text not null,
  created_at     timestamptz not null default now(),
  last_login_at  timestamptz
);
