import { count, desc, eq } from 'drizzle-orm'
import { z } from 'zod'
import { tables, useDrizzle } from '~~/server/utils/drizzle'

export default defineCachedEventHandler(async (event) => {
  const { id } = await getValidatedRouterParams(event, z.object({ id: z.string().uuid() }).parse)

  const drizzle = useDrizzle()
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
