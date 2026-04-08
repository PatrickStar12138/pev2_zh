<script lang="ts" setup>
import { inject, reactive } from "vue"
import { directive as vTippy } from "vue-tippy"
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome"
import {
  faClock,
  faDollarSign,
  faThumbsDown,
  faFilter,
  faExchangeAlt,
} from "@fortawesome/free-solid-svg-icons"
import useNode from "@/node"
import type { Node, ViewOptions } from "@/interfaces"
import { ViewOptionsKey } from "@/symbols"
import { t } from "@/i18n"
interface Props {
  node: Node
}
const props = defineProps<Props>()
const node = reactive<Node>(props.node)
const viewOptions = inject(ViewOptionsKey) as ViewOptions

const {
  rowsRemoved,
  costClass,
  durationClass,
  estimationClass,
  rowsRemovedClass,
  heapFetchesClass,
  filterTooltip,
} = useNode(node, viewOptions)
</script>
<template>
  <span
    v-if="durationClass"
    :class="'p-0  d-inline-block mb-0 ms-1 text-nowrap alert ' + durationClass"
    v-tippy="t('app.slow')"
    ><FontAwesomeIcon fixed-width :icon="faClock"></FontAwesomeIcon>
  </span>
  <span
    v-if="costClass"
    :class="'p-0  d-inline-block mb-0 ms-1 text-nowrap alert ' + costClass"
    v-tippy="t('app.highCost')"
    ><FontAwesomeIcon fixed-width :icon="faDollarSign"></FontAwesomeIcon
  ></span>
  <span
    v-if="estimationClass"
    :class="
      'p-0  d-inline-block mb-0 ms-1 text-nowrap alert ' + estimationClass
    "
    v-tippy="t('app.badRowEstimate')"
    ><FontAwesomeIcon fixed-width :icon="faThumbsDown"></FontAwesomeIcon
  ></span>
  <span
    v-if="rowsRemovedClass"
    :class="
      'p-0  d-inline-block mb-0 ms-1 text-nowrap alert ' + rowsRemovedClass
    "
    v-tippy="filterTooltip"
  >
    <FontAwesomeIcon fixed-width :icon="faFilter"></FontAwesomeIcon>
  </span>
  <span
    v-if="heapFetchesClass"
    :class="
      'p-0  d-inline-block mb-0 ms-1 text-nowrap alert ' + heapFetchesClass
    "
    v-tippy="{
      arrow: true,
      content: t('app.heapFetchesHigh'),
    }"
  >
    <FontAwesomeIcon fixed-width :icon="faExchangeAlt"></FontAwesomeIcon>
  </span>
  <span
    v-if="rowsRemoved && !rowsRemovedClass"
    class="p-0 d-inline-block mb-0 ms-1 text-nowrap"
    v-tippy="filterTooltip"
  >
    <FontAwesomeIcon
      fixed-width
      :icon="faFilter"
      class="text-body-tertiary"
    ></FontAwesomeIcon>
  </span>
</template>
