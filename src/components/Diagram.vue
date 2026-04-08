<script lang="ts" setup>
import _ from "lodash"
import {
  computed,
  inject,
  onBeforeMount,
  provide,
  reactive,
  ref,
  watch,
} from "vue"
import { BufferLocation, NodeProp, Metric } from "../enums"
import { HelpService, scrollChildIntoParentView } from "@/services/help-service"
import type { Node } from "@/interfaces"
import { SelectNodeKey } from "@/symbols"
import DiagramRow from "@/components/DiagramRow.vue"
import LevelDivider from "@/components/LevelDivider.vue"
import { Tippy } from "vue-tippy"
import { store } from "@/store"
import { t } from "@/i18n"

const helpService = new HelpService()
const getHelpMessage = helpService.getHelpMessage

const container = ref(null) // The container element

const selectNode = inject(SelectNodeKey)
if (!selectNode) {
  throw new Error(`Could not resolve ${SelectNodeKey.description}`)
}

const viewOptions = reactive({
  metric: Metric.time,
  buffersMetric: BufferLocation.shared,
})

onBeforeMount((): void => {
  const savedOptions = localStorage.getItem("diagramViewOptions")
  if (savedOptions) {
    _.assignIn(viewOptions, JSON.parse(savedOptions))
  }

  // switch to the first buffers tab if data not available for the currently
  // chosen one
  const planBufferLocation = _.keys(store.stats.maxBlocks)
  if (_.indexOf(planBufferLocation, viewOptions.buffersMetric) === -1) {
    viewOptions.buffersMetric = _.min(planBufferLocation) as BufferLocation
  }
})

watch(viewOptions, onViewOptionsChanged)

function onViewOptionsChanged() {
  localStorage.setItem("diagramViewOptions", JSON.stringify(viewOptions))
}

const dataAvailable = computed((): boolean => {
  if (viewOptions.metric === Metric.buffers) {
    // if current Metric is buffers, view options for buffers should be
    // undefined if there's no buffer data
    return !!viewOptions.buffersMetric
  }
  return true
})

function isCTE(node: Node): boolean {
  return _.startsWith(node[NodeProp.SUBPLAN_NAME], "CTE")
}

function scrollTo(el: Element) {
  if (!container.value) {
    return
  }
  scrollChildIntoParentView(container.value, el, false)
}

provide("scrollTo", scrollTo)
</script>

<template>
  <div class="diagram">
    <div class="flex-shrink-0">
      <div class="text-center my-1">
        <div class="btn-group btn-group-xs">
          <button
            class="btn btn-outline-secondary"
            :class="{ active: viewOptions.metric === Metric.time }"
            v-on:click="viewOptions.metric = Metric.time"
          >
            {{ t("app.time") }}
          </button>
          <button
            class="btn btn-outline-secondary"
            :class="{ active: viewOptions.metric === Metric.rows }"
            v-on:click="viewOptions.metric = Metric.rows"
          >
            {{ t("app.rows") }}
          </button>
          <button
            class="btn btn-outline-secondary"
            :class="{ active: viewOptions.metric === Metric.estimate_factor }"
            v-on:click="viewOptions.metric = Metric.estimate_factor"
          >
            估算
          </button>
          <button
            class="btn btn-outline-secondary"
            :class="{ active: viewOptions.metric === Metric.cost }"
            v-on:click="viewOptions.metric = Metric.cost"
          >
            {{ t("app.cost") }}
          </button>
          <button
            class="btn btn-outline-secondary"
            :class="{ active: viewOptions.metric === Metric.buffers }"
            v-on:click="viewOptions.metric = Metric.buffers"
          >
            {{ t("app.buffers") }}
          </button>
          <Tippy
            :content="
              !store.stats.maxIo
                ? getHelpMessage('hint track_io_timing')
                : undefined
            "
            :allowHTML="true"
            class="btn-tooltip-wrapper"
          >
            <button
              class="btn btn-outline-secondary"
              :class="{ active: viewOptions.metric === Metric.io }"
              v-on:click="viewOptions.metric = Metric.io"
              :disabled="!store.stats.maxIo"
            >
              IO
            </button>
          </Tippy>
        </div>
      </div>
      <div class="text-center my-1" v-if="viewOptions.metric == Metric.buffers">
        <div class="btn-group btn-group-xs">
          <button
            class="btn btn-outline-secondary"
            :class="{
              active: viewOptions.buffersMetric === BufferLocation.shared,
            }"
            v-on:click="viewOptions.buffersMetric = BufferLocation.shared"
            :disabled="!store.stats.maxBlocks?.[BufferLocation.shared]"
          >
            {{ t("app.shared") }}
          </button>
          <button
            class="btn btn-outline-secondary"
            :class="{
              active: viewOptions.buffersMetric === BufferLocation.temp,
            }"
            v-on:click="viewOptions.buffersMetric = BufferLocation.temp"
            :disabled="!store.stats.maxBlocks?.[BufferLocation.temp]"
          >
            {{ t("app.temp") }}
          </button>
          <button
            class="btn btn-outline-secondary"
            :class="{
              active: viewOptions.buffersMetric === BufferLocation.local,
            }"
            v-on:click="viewOptions.buffersMetric = BufferLocation.local"
            :disabled="!store.stats.maxBlocks?.[BufferLocation.local]"
          >
            {{ t("app.local") }}
          </button>
        </div>
      </div>
      <div class="legend text-center">
        <ul
          class="list-unstyled list-inline mb-0"
          v-if="viewOptions.metric == Metric.buffers"
        >
          <li
            class="list-inline-item"
            v-if="viewOptions.buffersMetric != BufferLocation.temp"
          >
            <span class="bg-hit rounded"></span>
            {{ t("app.hit") }}
          </li>
          <li class="list-inline-item">
            <span class="bg-read"></span>
            {{ t("app.read") }}
          </li>
          <li
            class="list-inline-item"
            v-if="viewOptions.buffersMetric != BufferLocation.temp"
          >
            <span class="bg-dirtied"></span>
            {{ t("app.dirtied") }}
          </li>
          <li class="list-inline-item">
            <span class="bg-written"></span>
            {{ t("app.written") }}
          </li>
        </ul>
        <template v-if="viewOptions.metric == Metric.io">
          <ul class="list-unstyled list-inline mb-0 d-inline-block">
            <li class="list-inline-item">
              <span class="bg-read"></span>
              {{ t("app.read") }}
            </li>
            <li class="list-inline-item">
              <span class="bg-written"></span>
              {{ t("app.write") }}
            </li>
          </ul>
        </template>
      </div>
    </div>
    <div class="overflow-auto flex-grow-1" ref="container">
      <table class="m-1" v-if="dataAvailable">
        <tbody v-for="(flat, index) in store.flat" :key="index">
          <tr v-if="index === 0 && store.flat.length > 1">
            <th colspan="3" class="subplan">{{ t("app.mainQueryPlan") }}</th>
          </tr>
          <template v-for="row in flat" :key="row">
            <tr v-if="row.node[NodeProp.SUBPLAN_NAME]">
              <td></td>
              <td
                :class="{ 'fw-bold': isCTE(row.node) }"
                :colspan="isCTE(row.node) ? 3 : 2"
              >
                <LevelDivider :row="row" dense></LevelDivider>
                <a
                  class="fst-italic text-reset"
                  href=""
                  @click.prevent="selectNode(row.node.nodeId, true)"
                >
                  {{ row.node[NodeProp.SUBPLAN_NAME] }}
                </a>
              </td>
            </tr>
            <DiagramRow :row="row" :viewOptions="viewOptions"></DiagramRow>
          </template>
        </tbody>
      </table>
      <div class="p-2 text-center text-body-tertiary" v-else>
        <em>{{ t("app.noDataAvailable") }}</em>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
/* Ensure wrapper looks and behaves like a button for layout consistency */
.btn-group > .btn-tooltip-wrapper {
  &:not(:last-child) {
    margin-right: -1px;
  }

  & > .btn {
    border-radius: 0;
  }

  &:first-child > .btn {
    border-top-left-radius: 0.375rem;
    border-bottom-left-radius: 0.375rem;
  }
  &:last-child > .btn {
    border-top-right-radius: 0.375rem;
    border-bottom-right-radius: 0.375rem;
  }
}
</style>
