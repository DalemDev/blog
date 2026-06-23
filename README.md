# Capa Cero

Blog de tecnología moderno para estudiantes, desarrolladores y profesionales. Construido con Next.js 15, Supabase y Tailwind CSS.

## Características

- Grilla de posts responsive y paginada
- Categorías y tags con páginas filtradas
- Búsqueda full-text de artículos
- Dark/light mode con toggle persistente
- Sección de comentarios con moderación
- Panel administrativo completo:
  - Editor de posts con Markdown y vista previa en tiempo real
  - Upload de imágenes de portada (Supabase Storage)
  - CRUD de categorías y tags
  - Moderación de comentarios (aprobar / rechazar)

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Framework | Next.js 15 (App Router) |
| Lenguaje | TypeScript |
| Estilos | Tailwind CSS + shadcn/ui |
| Base de datos | Supabase (PostgreSQL) |
| Autenticación | Supabase Auth |
| Storage | Supabase Storage |
| Temas | next-themes |
| Editor | @uiw/react-md-editor |

## Estructura del proyecto

```
blog/
├── app/
│   ├── (public)/               # Rutas públicas del blog
│   │   ├── page.tsx            # Home: grilla paginada de posts
│   │   ├── posts/[slug]/       # Detalle de post
│   │   ├── categoria/[slug]/   # Posts por categoría
│   │   ├── tag/[slug]/         # Posts por tag
│   │   └── buscar/             # Búsqueda
│   ├── admin/                  # Panel administrativo (protegido)
│   │   ├── login/
│   │   ├── dashboard/
│   │   ├── posts/
│   │   ├── categorias/
│   │   ├── tags/
│   │   └── comentarios/
│   └── api/
│       └── comments/           # API para crear comentarios
├── components/
│   ├── blog/                   # PostCard, PostGrid, Pagination, etc.
│   ├── admin/                  # PostEditor, ImageUploader, AdminSidebar
│   └── layout/                 # Navbar, Footer, ThemeToggle, Providers
├── lib/
│   ├── supabase/               # Clientes browser y server
│   ├── queries.ts              # Todas las consultas a Supabase
│   └── utils.ts                # slugify, calcReadTime, formatDate
├── types/
│   └── index.ts                # Post, Category, Tag, Comment
└── supabase/
    └── schema.sql              # Schema completo de la base de datos
```

## Primeros pasos

### 1. Clonar e instalar dependencias

```bash
git clone <repo-url>
cd blog
npm install
```

### 2. Crear proyecto en Supabase

1. Crea un proyecto en [supabase.com](https://supabase.com)
2. Ve a **Project Settings → API** y copia la URL y las claves

### 3. Configurar variables de entorno

Crea el archivo `.env.local` en la raíz del proyecto:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
```

### 4. Crear la base de datos

En el **SQL Editor** de Supabase, ejecuta el contenido completo de [`supabase/schema.sql`](supabase/schema.sql).

Esto crea:
- Tablas: `categories`, `tags`, `posts`, `post_tags`, `comments`
- Índices y búsqueda full-text en español
- Row Level Security (RLS) policies
- Bucket de storage `post-images` para imágenes
- Datos de prueba: 6 categorías y 10 tags

### 5. Crear el usuario administrador

En Supabase ve a **Authentication → Users → Add user** y crea tu cuenta. Usa esas credenciales para ingresar al panel admin.

### 6. Iniciar el servidor de desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) para ver el blog y [http://localhost:3000/admin](http://localhost:3000/admin) para el panel de administración.

## Variables de entorno

| Variable | Descripción |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave pública (anon) de Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave de servicio (solo en servidor) |

## Base de datos

### Esquema de tablas

```
categories   → id, name, slug, description, color, icon
posts        → id, title, slug, excerpt, content, cover_image_url,
               category_id, status (draft|published), read_time, published_at
tags         → id, name, slug
post_tags    → post_id, tag_id  (relación many-to-many)
comments     → id, post_id, author_name, author_email, content,
               status (pending|approved|rejected)
```

### Políticas de seguridad (RLS)

- Posts públicos: solo los publicados (`status = 'published'`) son visibles sin autenticación
- Comentarios: cualquiera puede crear; solo los aprobados son públicos
- Escritura: solo usuarios autenticados pueden crear/editar/eliminar

## Licencia

MIT
