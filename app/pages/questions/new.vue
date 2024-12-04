<script lang="ts" setup>
import type { z } from 'zod'
import { v4 } from 'uuid'
import type { FormSubmitEvent } from '#ui/types'
import { UInput } from '#components'
import { insertQuestionSchema, insertQuestionChoiceSchema } from '~~/server/database/schema/zod'
import type { Database } from '~~/database.types'

const choiceInputRef = useTemplateRef<InstanceType<(typeof UInput)>[]>('choiceInputRef')

const supabase = useSupabaseClient<Database>()
const user = useSupabaseUser()

const schema = insertQuestionSchema.omit({ authorId: true }).extend({
  choices: insertQuestionChoiceSchema
    .pick({ choice: true, id: true })
    .array()
    .transform(choices => choices.filter(choice => choice.choice.trim() !== '')),
})

type Schema = z.output<typeof schema>

const state = reactive<Schema>({
  question: '',
  allowExtraChoice: false,
  choices: [
    { id: v4(), choice: '' },
  ],
})

async function addNewChoice() {
  const choices = state.choices.filter(choice => choice.choice.trim() !== '')
  choices.push({ id: v4(), choice: '' })
  state.choices = choices
  await nextTick()
  choiceInputRef.value?.at(-1)?.inputRef?.focus()
}

const toast = useToast()
async function onSubmit(event: FormSubmitEvent<Schema>) {
  if (!user.value) {
    toast.add({
      color: 'error',
      title: 'Erreur',
      description: 'Vous devez être connecté pour créer une question',
    })
    return
  }

  const { data } = await supabase.from('questions').insert({
    question: event.data.question,
    author_id: user.value.id,
    allow_extra_choice: event.data.allowExtraChoice,
  }).select().single()

  if (!data) {
    toast.add({
      color: 'error',
      title: 'Erreur',
      description: 'Une erreur est survenue lors de la création de la question',
    })
    return
  }
  await supabase.from('question_choices').insert(
    event.data.choices.map(choice => ({ choice: choice.choice, question_id: data.id })),
  )

  toast.add({ title: 'Succès', description: 'La question a bien été enregistrée.', color: 'success' })
  navigateTo(`/questions/${data.id}`)
}
</script>

<template>
  <UContainer
    class="py-8"
    :style="{ '--ui-container': 'var(--container-2xl)' }"
  >
    <h1 class="text-2xl font-medium mb-6">
      Créer une question
    </h1>

    <UForm
      :schema="schema"
      :state="state"
      class="space-y-4"
      @submit="onSubmit"
      @error="console.error"
    >
      <UFormField
        label="Question :"
        name="question"
        size="xl"
      >
        <UInput v-model="state.question" />
      </UFormField>

      <UFormField
        name="choices"
        size="xl"
      >
        <ul class="space-y-2">
          <li
            v-for="(choice, idx) in state.choices"
            :key="choice.id"
          >
            <UFormField
              :label="`Choix ${idx + 1}`"
              :name="`choices.[${idx}].choice`"
            >
              <UInput
                ref="choiceInputRef"
                v-model="choice.choice"
                size="xl"
                @keydown.enter.prevent="addNewChoice"
              />
            </UFormField>
          </li>
          <li class="mt-4">
            <UButton
              icon="lucide:plus"
              label="Ajouter un choix"
              size="xl"
              @click="addNewChoice"
            />
          </li>
          <li v-if="state.allowExtraChoice">
            <UFormField
              label="Autre:"
              name="choices"
              size="xl"
            >
              <div class="flex items-center gap-x-2">
                <UInput
                  class="flex-1"
                  placeholder="Entrez votre réponse"
                  size="xl"
                  disabled
                />
                <UButton
                  disabled
                  size="xl"
                  icon="lucide:arrow-right"
                />
              </div>
            </UFormField>
          </li>
        </ul>
        <UCheckbox
          v-model="state.allowExtraChoice"
          class="mt-4"
          label="Autoriser une autre réponse"
        />
      </UFormField>

      <UButton
        size="xl"
        type="submit"
      >
        Créer
      </UButton>
    </UForm>
  </UContainer>
</template>
