<script lang="ts" setup>
import type { JIT } from "@/interfaces"
import { t } from "@/i18n"
interface Props {
  jit: JIT
}
const props = defineProps<Props>()
</script>

<template>
  <table class="table table-sm table-borderless">
    <tbody>
      <tr>
        <th>{{ t("app.functions") }}</th>
        <td class="text-end">{{ props.jit.Functions }}</td>
      </tr>
      <tr>
        <th colspan="2">{{ t("app.options") }}</th>
      </tr>
      <tr v-for="(option, index) in props.jit.Options" :key="index">
        <td>&nbsp;&nbsp;{{ index }}</td>
        <td class="text-end">
          {{ option ? "✓" : "✗" }} <small>({{ option }})</small>
        </td>
      </tr>
      <tr>
        <th colspan="2">{{ t("app.timing") }}</th>
      </tr>
      <tr v-for="(timing, index) in props.jit.Timing" :key="index">
        <td>&nbsp;&nbsp;{{ index }}</td>
        <td class="text-end">{{ timing }} ms</td>
      </tr>
    </tbody>
  </table>
</template>
