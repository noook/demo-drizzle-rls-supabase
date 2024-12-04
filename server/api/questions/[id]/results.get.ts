import { count, desc, eq } from 'drizzle-orm'
import { z } from 'zod'
import { tables, useDrizzle } from '~~/server/utils/drizzle'

export default defineCachedEventHandler(async (event) => {
  const { id } = await getValidatedRouterParams(event, z.object({ id: z.string().uuid() }).parse)

  const drizzle = useDrizzle()
  // Write a Drizzle query that count the number of votes for each choice of the question with the given ID
  // and return the result as an array of objects with the following shape:
  // { choice: string, votes: number }

  const countAlias = count(tables.votes.answer).as('votes')
  const result = await drizzle.select({
    answer: tables.votes.answer,
    votes: countAlias,
  })
    .from(tables.votes)
    .where(eq(tables.votes.questionId, id))
    .groupBy(tables.votes.answer)
    .orderBy(desc(countAlias))

  return result.reduce((acc, row) => ({
    ...acc,
    [row.answer]: row.votes,
  }), {})
}, {
  maxAge: 3,
})
