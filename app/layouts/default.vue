<template>
  <div>
    <header>
      <UContainer class="py-4">
        <ul class="w-full flex items-center justify-end gap-x-8">
          <li>
            <NuxtLink
              to="/questions/new"
            >
              Créer une question
            </NuxtLink>
          </li>
          <li>
            <ClientOnly v-if="!colorMode?.forced">
              <UButton
                :icon="isDark ? 'i-lucide-moon' : 'i-lucide-sun'"
                color="neutral"
                variant="ghost"
                @click="isDark = !isDark"
              />

              <template #fallback>
                <div class="size-8" />
              </template>
            </ClientOnly>
          </li>
        </ul>
      </UContainer>
    </header>
    <main>
      <slot />
    </main>
  </div>
</template>

<script lang="ts" setup>
const colorMode = useColorMode()

const isDark = computed({
  get() {
    return colorMode.value === 'dark'
  },
  set() {
    colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
  },
})
</script>
