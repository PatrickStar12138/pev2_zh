<script lang="ts" setup>
import { onBeforeMount, reactive, ref } from "vue"
import _ from "lodash"
import type { Node } from "@/interfaces"
import { NodeProp } from "@/enums"
import { shouldShowProp } from "@/services/help-service"
import { formatNodeProp } from "@/filters"
import { t, tp } from "@/i18n"
const nodeProps = ref<
  {
    key: keyof typeof NodeProp
    value: unknown
  }[]
>()

interface Props {
  node: Node
}
const props = defineProps<Props>()

const node = reactive<Node>(props.node)

onBeforeMount(() => {
  calculateProps()
})

// create an array of node propeties so that they can be displayed in the view
function calculateProps() {
  nodeProps.value = _.chain(node)
    .omit(NodeProp.PLANS)
    .omit(NodeProp.WORKERS)
    .map((value, key) => {
      return { key: key as keyof typeof NodeProp, value }
    })
    .value()
}
</script>
<template>
  <table class="table table-sm prop-list mb-0">
    <template v-for="(prop, key) in nodeProps" :key="key">
      <tr v-if="shouldShowProp(prop.key, prop.value)">
        <td width="40%">{{ tp(prop.key as string) }}</td>
        <td v-html="formatNodeProp(prop.key, prop.value)"></td>
      </tr>
    </template>
  </table>

  <div class="text-body-tertiary text-end">
    <em>{{ t("app.calculatedValue") }}</em>
  </div>
</template>
