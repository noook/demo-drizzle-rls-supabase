import { createInsertSchema } from 'drizzle-zod'
import { questionChoices, questions, votes } from '.'

export const insertQuestionSchema = createInsertSchema(questions, {
  question: schema => schema.question.min(3, 'La question doit contenir au moins 3 caractères'),
})

export const insertQuestionChoiceSchema = createInsertSchema(questionChoices)

export const insertVoteSchema = createInsertSchema(votes, {
  answer: schema => schema.answer.min(1, 'La réponse ne peut pas être vide.'),
})
