<template>
  <div v-if="data.length">
    <Chart
      :class="highchartsClass"
      :options
    />
  </div>
</template>

<script lang="ts" setup>
import type { ChartProps } from 'highcharts-vue'
import { Chart } from 'highcharts-vue'

const props = defineProps<{
  data: Record<string, number>
}>()

const data = computed(() => {
  return Object.entries(props.data).map(([label, y]) => ({ label, y }))
})

const colorMode = useColorMode()

const highchartsClass = computed(() => {
  return colorMode.value === 'dark' ? 'highcharts-dark' : 'highcharts-light'
})

const options = computed<ChartProps['options']>(() => ({
  chart: {
    type: 'column',
    styledMode: true,
  },
  title: {
    text: '',
  },
  yAxis: {
    title: {
      text: '',
    },
    tickInterval: 1,
  },
  plotOptions: {
    column: {
      dataLabels: {
        enabled: true,
      },
    },
  },
  xAxis: {
    categories: data.value.map(({ label }) => label),
  },
  legend: {
    enabled: false,
  },
  credits: {
    enabled: false,
  },
  series: [
    {
      type: 'column',
      name: 'Votes',
      data: data.value.map(({ y }) => y),
    },
  ],
}))
</script>

<style>
@import url("https://code.highcharts.com/css/highcharts.css");
@import url("https://code.highcharts.com/dashboards/css/datagrid.css");
@import url("https://code.highcharts.com/dashboards/css/dashboards.css");
</style>
