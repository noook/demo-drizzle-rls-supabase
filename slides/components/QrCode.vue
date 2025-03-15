<template>
  <qr v-if="data" />
</template>

<script lang="ts" setup>
import { h } from 'vue'
import { renderSVG } from 'uqr'

const props = defineProps<{
  data: string
}>()

const qr = h('svg', {
  innerHTML: renderSVG(props.data),
})
</script>
