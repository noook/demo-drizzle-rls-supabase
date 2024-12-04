import { sql } from 'drizzle-orm'
import { boolean, integer, pgPolicy, pgTable, text, timestamp, unique, uuid } from 'drizzle-orm/pg-core'
import { authenticatedRole, authUsers, authUid } from 'drizzle-orm/supabase'

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

export const questionChoices = pgTable('question_choices', {
  id: uuid('id').primaryKey().defaultRandom(),
  choice: text('choice').notNull(),
  questionId: uuid('question_id').notNull().references(() => questions.id, { onDelete: 'cascade' }),
}, table => [
  pgPolicy('users can create choices for their question', {
    for: 'insert',
    to: authenticatedRole,
    withCheck: sql`${authUid} = (select author_id from questions where id = ${table.questionId})`,
  }),
  pgPolicy('users can read choices', {
    for: 'select',
    to: authenticatedRole,
    using: sql`true`,
  }),
])

export const votes = pgTable('votes', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  answer: text('answer').notNull(),
  questionId: uuid('question_id').notNull().references(() => questions.id, { onDelete: 'cascade' }),
  voterId: uuid('voter_id').notNull().references(() => authUsers.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { mode: 'string' }).notNull().defaultNow(),
}, table => [
  pgPolicy('users can vote', {
    for: 'insert',
    to: authenticatedRole,
    withCheck: sql`${authUid} = ${table.voterId}`,
  }),
  pgPolicy('users can read their votes', {
    for: 'select',
    to: authenticatedRole,
    using: sql`${authUid} = ${table.voterId}`,
  }),
  unique('unique_vote_per_user_per_question').on(table.questionId, table.voterId),
]).enableRLS()
