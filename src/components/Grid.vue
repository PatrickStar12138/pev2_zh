<script lang="ts" setup>
import _ from "lodash"
import { computed, onMounted } from "vue"
import type { Node } from "@/interfaces"
import GridRow from "@/components/GridRow.vue"
import { NodeProp } from "../enums"
import LevelDivider from "@/components/LevelDivider.vue"
import { store } from "@/store"
import type { FlattenedPlanNode } from "@/store"
import { t } from "@/i18n"

onMounted((): void => {
  localStorage.setItem("gridIsNotNew", "true")
})

function isCTE(node: Node): boolean {
  return _.startsWith(node[NodeProp.SUBPLAN_NAME], "CTE")
}

const hasTime = computed((): boolean => {
  return _.some(store.flat, (plan: FlattenedPlanNode[]) => {
    return _.some(plan, (row: FlattenedPlanNode) => {
      return row.node[NodeProp.EXCLUSIVE_DURATION] || 0 > 1
    })
  })
})

const hasIORead = computed((): boolean => {
  return _.some(store.flat, (plan: FlattenedPlanNode[]) => {
    return _.some(plan, (row: FlattenedPlanNode) => {
      return (
        row.node[NodeProp.IO_READ_TIME] ||
        row.node[NodeProp.SHARED_IO_READ_TIME] ||
        row.node[NodeProp.LOCAL_IO_READ_TIME] ||
        row.node[NodeProp.TEMP_IO_READ_TIME]
      )
    })
  })
})

const hasIOWrite = computed((): boolean => {
  return _.some(store.flat, (plan: FlattenedPlanNode[]) => {
    return _.some(plan, (row: FlattenedPlanNode) => {
      return (
        row.node[NodeProp.IO_WRITE_TIME] ||
        row.node[NodeProp.SHARED_IO_WRITE_TIME] ||
        row.node[NodeProp.LOCAL_IO_WRITE_TIME] ||
        row.node[NodeProp.TEMP_IO_WRITE_TIME]
      )
    })
  })
})

const hasIO = computed((): boolean => {
  return hasIORead.value || hasIOWrite.value
})

const ioColumns = computed((): number => {
  return _.filter([hasIORead.value, hasIOWrite.value], (v) => v).length
})

const hasRows = computed((): boolean => {
  return _.some(store.flat, (plan: FlattenedPlanNode[]) => {
    return _.some(plan, (row: FlattenedPlanNode) => {
      return row.node[NodeProp.ACTUAL_ROWS_REVISED] || 0 > 1
    })
  })
})

const hasEstimation = computed((): boolean => {
  return _.some(store.flat, (plan: FlattenedPlanNode[]) => {
    return _.some(plan, (row: FlattenedPlanNode) => {
      return row.node[NodeProp.PLANNER_ESTIMATE_FACTOR] || 0 > 1
    })
  })
})

const hasLoops = computed((): boolean => {
  return _.some(store.flat, (plan: FlattenedPlanNode[]) => {
    return _.some(plan, (row: FlattenedPlanNode) => {
      return row.node[NodeProp.ACTUAL_LOOPS] > 1
    })
  })
})

const hasCost = computed((): boolean => {
  return _.some(store.flat, (plan: FlattenedPlanNode[]) => {
    return _.some(plan, (row: FlattenedPlanNode) => {
      return row.node[NodeProp.EXCLUSIVE_COST] > 1
    })
  })
})

const hasFilter = computed((): boolean => {
  return _.some(store.flat, (plan: FlattenedPlanNode[]) => {
    return _.some(plan, (row: FlattenedPlanNode) => {
      return (
        row.node[NodeProp.ROWS_REMOVED_BY_FILTER] ||
        row.node[NodeProp.ROWS_REMOVED_BY_JOIN_FILTER] ||
        row.node[NodeProp.ROWS_REMOVED_BY_INDEX_RECHECK]
      )
    })
  })
})

const hasHeapFetches = computed((): boolean => {
  return _.some(store.flat, (plan: FlattenedPlanNode[]) => {
    return _.some(plan, (row: FlattenedPlanNode) => {
      return row.node[NodeProp.HEAP_FETCHES]
    })
  })
})

const sharedBlocksColumns = computed((): number => {
  return _.filter(
    [
      hasSharedHit.value,
      hasSharedRead.value,
      hasSharedDirtied.value,
      hasSharedWritten.value,
    ],
    (v) => v,
  ).length
})

const hasSharedHit = computed((): boolean => {
  return _.some(store.flat, (plan: FlattenedPlanNode[]) => {
    return _.some(plan, (row: FlattenedPlanNode) => {
      return row.node[NodeProp.EXCLUSIVE_SHARED_HIT_BLOCKS]
    })
  })
})

const hasSharedRead = computed((): boolean => {
  return _.some(store.flat, (plan: FlattenedPlanNode[]) => {
    return _.some(plan, (row: FlattenedPlanNode) => {
      return row.node[NodeProp.EXCLUSIVE_SHARED_READ_BLOCKS]
    })
  })
})

const hasSharedDirtied = computed((): boolean => {
  return _.some(store.flat, (plan: FlattenedPlanNode[]) => {
    return _.some(plan, (row: FlattenedPlanNode) => {
      return row.node[NodeProp.EXCLUSIVE_SHARED_DIRTIED_BLOCKS]
    })
  })
})

const hasSharedWritten = computed((): boolean => {
  return _.some(store.flat, (plan: FlattenedPlanNode[]) => {
    return _.some(plan, (row: FlattenedPlanNode) => {
      return row.node[NodeProp.EXCLUSIVE_SHARED_WRITTEN_BLOCKS]
    })
  })
})

const tempBlocksColumns = computed((): number => {
  return _.filter([hasTempRead.value, hasTempWritten.value], (v) => v).length
})

const hasTempRead = computed((): boolean => {
  return _.some(store.flat, (plan: FlattenedPlanNode[]) => {
    return _.some(plan, (row: FlattenedPlanNode) => {
      return row.node[NodeProp.EXCLUSIVE_TEMP_READ_BLOCKS]
    })
  })
})

const hasTempWritten = computed((): boolean => {
  return _.some(store.flat, (plan: FlattenedPlanNode[]) => {
    return _.some(plan, (row: FlattenedPlanNode) => {
      return row.node[NodeProp.EXCLUSIVE_TEMP_WRITTEN_BLOCKS]
    })
  })
})

const localBlocksColumns = computed((): number => {
  return _.filter(
    [
      hasLocalHit.value,
      hasLocalRead.value,
      hasLocalDirtied.value,
      hasLocalWritten.value,
    ],
    (v) => v,
  ).length
})

const hasLocalHit = computed((): boolean => {
  return _.some(store.flat, (plan: FlattenedPlanNode[]) => {
    return _.some(plan, (row: FlattenedPlanNode) => {
      return row.node[NodeProp.EXCLUSIVE_LOCAL_HIT_BLOCKS]
    })
  })
})

const hasLocalRead = computed((): boolean => {
  return _.some(store.flat, (plan: FlattenedPlanNode[]) => {
    return _.some(plan, (row: FlattenedPlanNode) => {
      return row.node[NodeProp.EXCLUSIVE_LOCAL_READ_BLOCKS]
    })
  })
})

const hasLocalDirtied = computed((): boolean => {
  return _.some(store.flat, (plan: FlattenedPlanNode[]) => {
    return _.some(plan, (row: FlattenedPlanNode) => {
      return row.node[NodeProp.EXCLUSIVE_LOCAL_DIRTIED_BLOCKS]
    })
  })
})

const hasLocalWritten = computed((): boolean => {
  return _.some(store.flat, (plan: FlattenedPlanNode[]) => {
    return _.some(plan, (row: FlattenedPlanNode) => {
      return row.node[NodeProp.EXCLUSIVE_LOCAL_WRITTEN_BLOCKS]
    })
  })
})

const columnsLeft = computed<string[]>(() => {
  const cols = []
  if (hasTime.value) {
    cols.push("time")
  }
  if (hasIORead.value) {
    cols.push("ioread")
  }
  if (hasIOWrite.value) {
    cols.push("iowrite")
  }
  if (hasRows.value) {
    cols.push("rows")
  }
  if (hasEstimation.value) {
    cols.push("estimation")
  }
  if (hasCost.value) {
    cols.push("cost")
  }
  if (hasLoops.value) {
    cols.push("loops")
  }
  if (hasFilter.value) {
    cols.push("filter")
  }
  if (hasHeapFetches.value) {
    cols.push("heapfetches")
  }
  return cols
})

const columnsRight = computed<string[]>(() => {
  const cols = []
  if (hasSharedHit.value) {
    cols.push("shared.hit")
  }
  if (hasSharedRead.value) {
    cols.push("shared.read")
  }
  if (hasSharedDirtied.value) {
    cols.push("shared.dirtied")
  }
  if (hasSharedWritten.value) {
    cols.push("shared.written")
  }
  if (hasTempRead.value) {
    cols.push("temp.read")
  }
  if (hasTempWritten.value) {
    cols.push("temp.written")
  }
  if (hasLocalHit.value) {
    cols.push("local.hit")
  }
  if (hasLocalRead.value) {
    cols.push("local.read")
  }
  if (hasLocalDirtied.value) {
    cols.push("local.dirtied")
  }
  if (hasLocalWritten.value) {
    cols.push("local.written")
  }
  return cols
})

const columns = computed(() => {
  return ([] as string[]).concat(columnsLeft.value, columnsRight.value)
})
</script>

<template>
  <div>
    <table class="table table-sm table-hover">
      <thead class="sticky-top" style="z-index: 2">
        <tr v-if="hasIO || columnsRight.length > 0" class="table-group">
          <th colspan="2">
            <!-- id & time -->
          </th>
          <th class="text-center" :colspan="ioColumns" v-if="hasIO">{{ t("app.io") }}</th>
          <th :colspan="columnsLeft.length - ioColumns"></th>
          <th
            class="text-center"
            :colspan="sharedBlocksColumns"
            v-if="sharedBlocksColumns > 0"
          >
            {{ t("app.shared") }}
          </th>
          <th
            class="text-center"
            :colspan="tempBlocksColumns"
            v-if="tempBlocksColumns > 0"
          >
            {{ t("app.temp") }}
          </th>
          <th
            class="text-center"
            :colspan="localBlocksColumns"
            v-if="localBlocksColumns > 0"
          >
            {{ t("app.local") }}
          </th>
        </tr>
        <tr>
          <th class="text-center"></th>
          <th class="text-center" v-if="hasTime">{{ t("app.time") }}</th>
          <th class="text-center" v-if="hasIORead">{{ t("app.read") }}</th>
          <th class="text-center" v-if="hasIOWrite">{{ t("app.write") }}</th>
          <th class="text-center" v-if="hasRows">{{ t("app.rows") }}</th>
          <th class="text-center" v-if="hasEstimation">估算</th>
          <th class="text-center" v-if="hasCost">{{ t("app.cost") }}</th>
          <th class="text-center" v-if="hasLoops">{{ t("app.loops") }}</th>
          <th class="text-center" v-if="hasFilter">{{ t("app.filter") }}</th>
          <th class="text-center" v-if="hasHeapFetches">{{ t("app.heap") }}</th>
          <th style="width: 100%"></th>
          <th class="text-center" v-if="hasSharedHit">{{ t("app.hit") }}</th>
          <th class="text-center" v-if="hasSharedRead">{{ t("app.read") }}</th>
          <th class="text-center" v-if="hasSharedDirtied">{{ t("app.dirtied") }}</th>
          <th class="text-center" v-if="hasSharedWritten">{{ t("app.written") }}</th>
          <th class="text-center" v-if="hasTempRead">{{ t("app.read") }}</th>
          <th class="text-center" v-if="hasTempWritten">{{ t("app.written") }}</th>
          <th class="text-center" v-if="hasLocalHit">{{ t("app.hit") }}</th>
          <th class="text-center" v-if="hasLocalRead">{{ t("app.read") }}</th>
          <th class="text-center" v-if="hasLocalDirtied">{{ t("app.dirtied") }}</th>
          <th class="text-center" v-if="hasLocalWritten">{{ t("app.written") }}</th>
        </tr>
      </thead>
      <tbody v-for="(flat, index) in store.flat" :key="index">
        <template v-for="row in flat" :key="row">
          <tr v-if="row.node[NodeProp.SUBPLAN_NAME]">
            <td class="bg-body-tertiary" :colspan="1 + columnsLeft.length"></td>
            <td
              class="plan pr-2 bg-body-tertiary"
              :class="{ 'font-weight-bold': isCTE(row.node) }"
              :colspan="columns.length + columnsRight.length"
            >
              <LevelDivider :row="row"></LevelDivider>
              <b class="fst-italic text-reset">
                {{ row.node[NodeProp.SUBPLAN_NAME] }}
              </b>
            </td>
          </tr>
          <GridRow :row="row" :columns="columns"></GridRow>
        </template>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
table {
  thead tr.table-group {
    th {
      border-left: 1px solid #b5b6b7;
      border-bottom: 0;
    }
    /*
     * This targets the second empty cell in a pair
     * and avoids border between 2 empty cells
     */
    th:empty + th:empty {
      border-left: 0;
    }
  }
}
</style>
