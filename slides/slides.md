---
# You can also start simply with 'default'
theme: seriph
# random image from a curated Unsplash collection by Anthony
# like them? see https://unsplash.com/collections/94734566/slidev
background: https://cover.sli.dev
# some information about your slides (markdown enabled)
title: Welcome to Slidev
info: |
  ## Slidev Starter Template
  Presentation slides for developers.

  Learn more at [Sli.dev](https://sli.dev)
# apply unocss classes to the current slide
class: text-center
# https://sli.dev/features/drawing
drawings:
  persist: false
# slide transition: https://sli.dev/guide/animations.html#slide-transitions
transition: slide-left
# enable MDC Syntax: https://sli.dev/features/mdc
mdc: true
---

# Supabase et Drizzle ORM dans un projet Nuxt

\- Neil Richter -

<div class="abs-br m-6 text-xl">
  <a href="https://github.com/slidevjs/slidev" target="_blank" class="slidev-icon-btn inline-flex gap-x-2 items-center">
    <simple-icons:bluesky />
    <span>@nook.sh</span>
  </a>
</div>

---

# Quel est votre outil préféré pour interagir avec votre base de données ?

<div class="flex justify-center my-16">
  <QrCode class="size-60" data="https://demo-drizzle-rls.nook.sh/questions/5ed21978-1292-45c6-923c-d11475f25d9e" />
</div>

---

# Drizzle ORM

Drizzle ORM est un ORM écrit en Typescript compatibles avec la plupart des bases de données SQL et environnements serverless.


<v-clicks>

- ⚡️ **Performant**: Drizzle a été conçu pour être une très fine couche d'abstraction entre votre application et votre base de données.
- 🚀 **Intuitif**: Simple à utiliser et à comprendre. Vous savez faire du SQL, vous savez utiliser Drizzle.
- 🪶 **Léger**: 0 dépendance !
- 🔏 **Typesafe**: Déclarez vos schémas avec du Javascript, et tous les types sont inferrés automatiquement !
- 🕊️ **Migrations**: Générations des migrations automatiques

</v-clicks>

---

# Définition des schémas avec Drizzle

````md magic-move
```ts
export const questions = pgTable('questions', {
  id: uuid('id').primaryKey().defaultRandom(),
  question: text('question').notNull(),
  authorId: uuid('author_id').notNull(),
  allowExtraChoice: boolean('allow_extra_choice').notNull().default(false),
  createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
})
```

```ts
export const questions = pgTable('questions', {
  id: uuid('id').primaryKey().defaultRandom(),
  question: text('question').notNull(),
  authorId: uuid('author_id').notNull(),
  allowExtraChoice: boolean('allow_extra_choice').notNull().default(false),
  createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
}).enableRLS()
```

```ts
import { authUsers } from 'drizzle-orm/supabase'

export const questions = pgTable('questions', {
  id: uuid('id').primaryKey().defaultRandom(),
  question: text('question').notNull(),
  authorId: uuid('author_id').notNull().references(() => authUsers.id, { onDelete: 'cascade' }),
  allowExtraChoice: boolean('allow_extra_choice').notNull().default(false),
  createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
}).enableRLS()
```

```ts
import { authUsers, authenticatedRole, authUid } from 'drizzle-orm/supabase'

export const questions = pgTable('questions', {
  id: uuid('id').primaryKey().defaultRandom(),
  question: text('question').notNull(),
  authorId: uuid('author_id').notNull().references(() => authUsers.id, { onDelete: 'cascade' }),
  allowExtraChoice: boolean('allow_extra_choice').notNull().default(false),
  createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
}, t => [
  pgPolicy('users can create questions', {
    for: 'insert',
    to: authenticatedRole,
    withCheck: sql`${authUid} = ${t.authorId}`,
  }),
  pgPolicy('users can read questions', {
    for: 'select',
    to: authenticatedRole,
    using: sql`true`,
  }),
]).enableRLS()
```
````

---

# Utilisez-vous toujours les RLS avec Supabase ?

<div class="flex justify-center my-16">
  <QrCode class="size-60" data="https://demo-drizzle-rls.nook.sh/questions/9c1b83c0-d657-41b8-94ce-d368799e9e21" />
</div>

---

# Génération des migrations

```sh
# Compare le schéma actuel et génère les migrations
npx drizzle-kit generate
```

<v-switch>

<template #1>

```sql
CREATE TABLE IF NOT EXISTS "questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"question" text NOT NULL,
	"author_id" uuid NOT NULL,
	"allow_extra_choice" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "questions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "questions" ADD CONSTRAINT "questions_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "auth"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
```

</template>

<template #2>
  
```sql
CREATE POLICY "users can create questions" ON "questions"
  AS PERMISSIVE
  FOR INSERT
  TO "authenticated"
  WITH CHECK (
    (select auth.uid()) = "questions"."author_id"
  );

CREATE POLICY "users can read questions" ON "questions"
  AS PERMISSIVE
  FOR SELECT
  TO "authenticated"
  USING (
    true
  );
```

</template>

<template #3>

```sh
# Applique les migrations
npx drizzle-kit migrate
```

</template>

</v-switch>

---

# Retour vers Supabase

Utilisation de Supabase client-side

<v-clicks>

- Possibilité de générer les types de la base de données avec Supabase
  ```sh
  npx supabase gen types typescript > database.types.ts
  ```

- Requêtes directes vers Supabase
  ```ts
  const supabase = useSupabaseClient<Database>()
  const user = useSupabaseUser()

  const { data } = await supabase.from('questions').insert({
    question: state.question,
    author_id: user.value.id,
    allow_extra_choice: state.allowExtraChoice,
  })
    // Retourne la ligne insérée
    .select().single()
  ```

</v-clicks>

---

# Pourquoi faire cohabiter Drizzle et Supabase ?

<v-clicks>

- ✏️ Drizzle pour les migrations et les définitions de schémas
- 🔐 Supabase pour authentifier un utilisateur
- 😮‍💨 Supabase pour les requêtes client-side afin de soulager l'API
- 🤯 Drizzle pour des requêtes plus complexes côté serveur + Type Safety
- 😶‍🌫️ Drizzle pour faire de l'aggrégation de données (configuration RLS trop compliquée)
- 🥷 Drizzle pour bypass les RLS (des fois on a la flemme, ça arrive.)

</v-clicks>

---
layout: two-cols-header
---

# Drizzle vs Supabase

Supabase propose également un SDK pour interagir avec votre base de données, mais malgré beaucoup de similarités, les deux outils ne conviennent pas à tous les usages.

## Récupération des résultats

::left::

<div mr-4>

### Supabase 

```ts
const { data, error } = await supabase
  .from('votes')
  .select(`
    answer,
    votes:answer.count()
  `)
  .eq('question_id', 'id')
  .order('votes', { ascending: false });
```

Problèmes de RLS, les utilisateurs ne sont pas censés pouvoir lire les réponses des autres participants.

</div>

::right::

### Drizzle

```ts
const countAlias = count(votes.answer).as('votes')
const data = await drizzle.select({
  answer: votes.answer,
  votes: countAlias,
})
  .from(votes)
  .where(eq(votes.questionId, id))
  .groupBy(votes.answer)
  .orderBy(desc(countAlias))
```

Les données sont agrégées côté serveur, et sont totalement anonymisées.

---
layout: center
---

# Demo !

---

# Liens utiles

- RLS avec Drizzle: <https://orm.drizzle.team/docs/rls#using-with-supabase>
- Anonymous sign-ins sur Supabase: <https://supabase.com/docs/guides/auth/auth-anonymous>
- `drizzle-supabase-rls` par Raphaël Moreau: <https://github.com/rphlmr/drizzle-supabase-rls/>