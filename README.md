# 🏥 Medika

Plataforma SaaS Híbrida Web + Mobile para Gestión de Consultorios de Salud.

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Frontend Web | React + Vite + TypeScript + Tailwind CSS + Shadcn UI |
| App Móvil | React Native + Expo |
| Backend | Supabase (PostgreSQL + Auth + Storage + Edge Functions) |
| Hosting | Vercel |
| Monorepo | pnpm + Turborepo |

## Estructura del monorepo

```
medika/
├── apps/
│   ├── web/          # React + Vite (frontend web)
│   └── mobile/       # React Native + Expo (app móvil)
├── packages/
│   ├── shared/       # Tipos y utilidades compartidas
│   └── supabase/     # Migraciones, Edge Functions, config
└── ...
```

## Requisitos previos

- Node.js >= 20
- pnpm >= 9
- Supabase CLI
- Expo CLI

## Instalación

```bash
# Instalar dependencias
pnpm install

# Copiar variables de entorno
cp .env.example apps/web/.env.local
cp .env.example apps/mobile/.env

# Iniciar en desarrollo
pnpm dev
```

## Modelo SaaS Multi-Tenant

Cada consultorio es una **organización** independiente. Los datos están aislados mediante `organization_id` + Row Level Security (RLS) en PostgreSQL.

## Roles

| Rol | Descripción |
|---|---|
| `super_admin` | Administrador de la plataforma |
| `org_admin` | Administrador del consultorio |
| `professional` | Profesional de salud |
| `receptionist` | Recepcionista |
| `patient` | Paciente |

## Fases de desarrollo

- **Fase 1** — Fundaciones (Auth, Multi-tenant, Roles, RLS, Layout)
- **Fase 2** — Operación (Pacientes, Profesionales, Servicios, Agenda)
- **Fase 3** — Atención (Consulta, Historia clínica)
- **Fase 4** — Documentos (Plantillas, PDF, Storage)
- **Fase 5** — Administración (Facturación, Dashboard)
- **Fase 6** — Mobile completo
- **Fase 7** — Automatizaciones (WhatsApp, Email)
