<template>
  <UContainer
    class="py-8 space-y-16"
    :style="{ '--ui-container': 'var(--container-4xl)' }"
  >
    <section>
      <h1 class="text-2xl font-medium mb-6">
        {{ question?.question }}
      </h1>
      <p class="mb-6 font-medium text-gray-500 dark:text-gray-400">
        Une seule réponse possible.
      </p>
      <ul class="space-y-2">
        <li
          v-for="choice in choices"
          :key="choice.id"
          class="flex items-center gap-x-2"
          :class="{ 'opacity-50': userVote && userVote.answer !== choice.choice }"
        >
          <UButton
            variant="soft"
            :label="choice.choice"
            :disabled="userVote !== null"
            @click="submitVote(choice.choice)"
          />
          <UIcon
            v-if="userVote && userVote.answer === choice.choice"
            class="text-xl text-[var(--ui-primary)]"
            name="lucide:check"
          />
        </li>
        <li
          v-if="userVote && !choicesSet.has(userVote.answer)"
          class="flex items-center gap-x-2"
        >
          <UButton
            variant="soft"
            disabled
            :label="userVote.answer"
          />
          <UIcon
            class="text-xl text-[var(--ui-primary)]"
            name="lucide:check"
          />
        </li>
        <li v-if="question?.allow_extra_choice && !userVote">
          <UForm
            :state
            :schema
            :validate-on="[]"
            @submit="onSubmit"
          >
            <UFormField label="Autre:">
              <div class="flex items-center gap-x-2">
                <UInput
                  v-if="!userVote"
                  v-model="state.answer"
                />
                <UButton
                  type="submit"
                  icon="lucide:arrow-right"
                />
              </div>
            </UFormField>
          </UForm>
        </li>
      </ul>
    </section>
    <section>
      <QrCode
        :data="qrData"
        class="size-64 mx-auto hidden xl:block"
      />
    </section>
    <section>
      <BarChart
        v-if="results"
        :data="results"
      />
    </section>
  </UContainer>
</template>

<script lang="ts" setup>
import type { FormSubmitEvent } from '@nuxt/ui'
import type { z } from 'zod'
import type { Database } from '~~/database.types'
import { insertVoteSchema } from '~~/server/database/schema/zod'

const supabase = useSupabaseClient<Database>()
const user = useSupabaseUser()

const questionId = useRoute().params.id!.toString()
const qrData = computed(() => {
  return import.meta.client ? window.location.href : ''
})

const { data: question } = useAsyncData(`question-${questionId}`, async () => {
  const { data } = await supabase.from('questions').select().eq('id', questionId).maybeSingle()

  if (data === null) {
    throw showError(createError({
      message: 'Question not found',
      statusCode: 404,
    }))
  }

  return data
})

const { data: choices } = useAsyncData(async () => {
  const { data } = await supabase.from('question_choices').select().eq('question_id', questionId)

  return data ?? []
}, { default: () => [] })

const choicesSet = computed(() => new Set(choices.value.map(choice => choice.choice)))

const { data: userVote, refresh: getUserVote } = useAsyncData(async () => {
  const { data } = await supabase.from('votes').select().eq('question_id', questionId).maybeSingle()

  return data
}, { default: () => null })

const { data: results, refresh: refreshResults } = useFetch(`/api/questions/${questionId}/results`, {
  key: `question-${questionId}-results`,
})

useIntervalFn(refreshResults, 5_000)

const schema = insertVoteSchema.omit({ voterId: true })
type Schema = z.output<typeof schema>

const state = reactive<Schema>({
  answer: '',
  questionId,
})

async function submitVote(answer: string) {
  await supabase.from('votes').insert({ question_id: questionId, answer, voter_id: user.value!.id })
  await getUserVote()
  await refreshResults()
}

async function onSubmit(event: FormSubmitEvent<Schema>) {
  await submitVote(event.data.answer)
}
</script>
