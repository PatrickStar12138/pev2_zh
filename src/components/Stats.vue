<script lang="ts" setup>
import _ from "lodash"
import { computed } from "vue"
import type { Node, StatsTableItemType } from "@/interfaces"
import { NodeProp, SortDirection } from "@/enums"
import SortedTable from "@/components/SortedTable.vue"
import SortLink from "@/components/SortLink.vue"
import StatsTableItem from "@/components/StatsTableItem.vue"
import { store } from "@/store"
import { t } from "@/i18n"

const executionTime = computed(
  () =>
    store.stats.executionTime ||
    (store.plan?.content.Plan?.[NodeProp.ACTUAL_TOTAL_TIME] as number),
)

const nodes = computed(() => _.flatten(store.flat).map((row) => row.node))

function durationPercent(nodes: Node[]) {
  return _.sumBy(nodes, NodeProp.EXCLUSIVE_DURATION) / executionTime.value
}

const perTable = computed(() => {
  const tables: { [key: string]: Node[] } = _.groupBy(
    _.filter(nodes.value, (n) => n[NodeProp.RELATION_NAME] !== undefined),
    NodeProp.RELATION_NAME,
  )
  const values: StatsTableItemType[] = []
  _.each(tables, (nodes, tableName) => {
    values.push({
      name: tableName,
      count: nodes.length,
      time: _.sumBy(nodes, NodeProp.EXCLUSIVE_DURATION),
      timePercent: durationPercent(nodes),
      nodes,
    })
  })
  return values
})

const perFunction = computed(() => {
  const functions: { [key: string]: Node[] } = _.groupBy(
    _.filter(nodes.value, (n) => n[NodeProp.FUNCTION_NAME] !== undefined),
    NodeProp.FUNCTION_NAME,
  )
  const values: StatsTableItemType[] = []
  _.each(functions, (nodes, functionName) => {
    values.push({
      name: functionName,
      count: nodes.length,
      time: _.sumBy(nodes, NodeProp.EXCLUSIVE_DURATION),
      timePercent: durationPercent(nodes),
      nodes,
    })
  })
  return values
})

const perNodeType = computed(() => {
  const nodeTypes: { [key: string]: Node[] } = _.groupBy(
    nodes.value,
    NodeProp.NODE_TYPE,
  )
  const values: StatsTableItemType[] = []
  _.each(nodeTypes, (nodes, nodeType) => {
    values.push({
      name: nodeType,
      count: nodes.length,
      time: _.sumBy(nodes, NodeProp.EXCLUSIVE_DURATION),
      timePercent: durationPercent(nodes),
      nodes,
    })
  })
  return values
})

const perIndex = computed(() => {
  const indexes: { [key: string]: Node[] } = _.groupBy(
    _.filter(nodes.value, (n) => n[NodeProp.INDEX_NAME] !== undefined),
    NodeProp.INDEX_NAME,
  )
  const values: StatsTableItemType[] = []
  _.each(indexes, (nodes, indexName) => {
    values.push({
      name: indexName,
      count: nodes.length,
      time: _.sumBy(nodes, NodeProp.EXCLUSIVE_DURATION),
      timePercent: durationPercent(nodes),
      nodes,
    })
  })
  return values
})
</script>

<template>
  <div class="small stats container-fluid mt-2">
    <div class="row row-cols-1 row-cols-lg-2 row-cols-xxl-3 g-4">
      <div class="col">
        <div class="card">
          <div class="card-body">
            <SortedTable
              class="table table-sm mb-0"
              :values="perTable"
              sort="time"
              :dir="SortDirection.desc"
            >
              <thead>
                <tr>
                  <th scope="col">
                    <SortLink name="name">{{ t("app.table") }}</SortLink>
                  </th>
                  <th scope="col" class="text-end">
                    <SortLink name="count">{{ t("app.count") }}</SortLink>
                  </th>
                  <th scope="col" colspan="2" class="text-end">
                    <SortLink name="time">{{ t("app.time") }}</SortLink>
                  </th>
                </tr>
              </thead>
              <template v-slot:body="sort">
                <template v-for="value in sort.values" :key="value">
                  <StatsTableItem
                    :value="value as StatsTableItemType"
                    :executionTime="executionTime"
                    :translateName="true"
                  ></StatsTableItem>
                </template>
              </template>
              <tbody v-if="!perTable.length">
                <tr>
                  <td colspan="3" class="text-center fst-italic">
                    {{ t("app.noTablesUsed") }}
                  </td>
                </tr>
              </tbody>
            </SortedTable>
          </div>
        </div>
      </div>
      <div class="col">
        <div class="card">
          <div class="card-body">
            <SortedTable
              class="table table-sm mb-0"
              :values="perFunction"
              sort="time"
              :dir="SortDirection.desc"
            >
              <thead>
                <tr>
                  <th scope="col">
                    <SortLink name="name">{{ t("app.function") }}</SortLink>
                  </th>
                  <th scope="col" class="text-end">
                    <SortLink name="count">{{ t("app.count") }}</SortLink>
                  </th>
                  <th scope="col" colspan="2" class="text-end">
                    <SortLink name="time">{{ t("app.time") }}</SortLink>
                  </th>
                </tr>
              </thead>
              <template v-slot:body="sort">
                <template v-for="value in sort.values" :key="value">
                  <StatsTableItem
                    :value="value as StatsTableItemType"
                    :executionTime="executionTime"
                  ></StatsTableItem>
                </template>
              </template>
              <tbody v-if="!perFunction.length">
                <tr>
                  <td colspan="3" class="text-center fst-italic">
                    {{ t("app.noFunctionUsed") }}
                  </td>
                </tr>
              </tbody>
            </SortedTable>
          </div>
        </div>
      </div>
      <div class="col">
        <div class="card">
          <div class="card-body">
            <SortedTable
              class="table table-sm mb-0"
              :values="perNodeType"
              sort="time"
              :dir="SortDirection.desc"
            >
              <thead>
                <tr>
                  <th scope="col">
                    <SortLink name="name">{{ t("app.nodeType") }}</SortLink>
                  </th>
                  <th scope="col" class="text-end">
                    <SortLink name="count">{{ t("app.count") }}</SortLink>
                  </th>
                  <th scope="col" colspan="2" class="text-end">
                    <SortLink name="time">{{ t("app.time") }}</SortLink>
                  </th>
                </tr>
              </thead>
              <template v-slot:body="sort">
                <template v-for="value in sort.values" :key="value">
                  <StatsTableItem
                    :value="value as StatsTableItemType"
                    :executionTime="executionTime"
                  ></StatsTableItem>
                </template>
              </template>
            </SortedTable>
          </div>
        </div>
      </div>
      <div class="col">
        <div class="card">
          <div class="card-body">
            <SortedTable
              class="table table-sm mb-0"
              :values="perIndex"
              sort="time"
              :dir="SortDirection.desc"
            >
              <thead>
                <tr>
                  <th scope="col">
                    <SortLink name="name">{{ t("app.index") }}</SortLink>
                  </th>
                  <th scope="col" class="text-end">
                    <SortLink name="count">{{ t("app.count") }}</SortLink>
                  </th>
                  <th scope="col" colspan="2" class="text-end">
                    <SortLink name="time">{{ t("app.time") }}</SortLink>
                  </th>
                </tr>
              </thead>
              <template v-slot:body="sort">
                <template v-for="value in sort.values" :key="value">
                  <StatsTableItem
                    :value="value as StatsTableItemType"
                    :executionTime="executionTime"
                  ></StatsTableItem>
                </template>
              </template>
              <tbody v-if="!perIndex.length">
                <tr>
                  <td colspan="3" class="text-center fst-italic">
                    {{ t("app.noIndexUsed") }}
                  </td>
                </tr>
              </tbody>
            </SortedTable>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
