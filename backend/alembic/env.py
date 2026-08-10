"""
Alembic environment configuration.

Two important customizations here:
1. We build the engine directly from settings.DATABASE_URL (not via
   config.set_main_option) because the password is URL-encoded and
   contains "%", which conflicts with configparser's interpolation syntax.
2. include_name() + include_object() both tell Alembic to IGNORE the
   "profiles" table entirely during autogenerate. That table is owned
   and managed by Supabase (created via a trigger on auth.users, includes
   a FK we don't declare in our model) — Alembic must never try to
   create/alter/drop it. include_name() alone is not fully reliable for
   "added table" detection, so include_object() is used as the definitive
   filter — see Alembic docs on include_object vs include_name.
"""

from logging.config import fileConfig

from sqlalchemy import create_engine, pool
from alembic import context

from app.config import settings
from app.db.base import Base  # imports ALL models as a side effect

config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


def include_name(name, type_, parent_names):
    if type_ == "table" and name == "profiles":
        return False
    return True


def include_object(object, name, type_, reflected, compare_to):
    if type_ == "table" and name == "profiles":
        return False
    return True


def run_migrations_offline() -> None:
    context.configure(
        url=settings.DATABASE_URL,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        include_name=include_name,
        include_object=include_object,
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    connectable = create_engine(settings.DATABASE_URL, poolclass=pool.NullPool)

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            include_name=include_name,
            include_object=include_object,
        )
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()