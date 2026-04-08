<script lang="ts" setup>
import type { Node } from "@/interfaces"
import { NodeProp } from "@/enums"
import { duration } from "@/filters"
import { t } from "@/i18n"
interface Props {
  node: Node
}
defineProps<Props>()
</script>

<template>
  {{ t("app.durationLabel") }}:
  <br />{{ t("app.exclusive") }}: {{ duration(node[NodeProp.EXCLUSIVE_DURATION]) }}, {{ t("app.totalLabel") }}:
  {{ duration(node[NodeProp.ACTUAL_TOTAL_TIME]) }}
</template>
