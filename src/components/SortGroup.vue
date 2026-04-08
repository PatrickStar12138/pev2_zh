<script lang="ts" setup>
import { keysToString, kilobytes } from "@/filters"
import type { SortGroups } from "@/interfaces"
import { t } from "@/i18n"

interface Props {
  sortGroup: SortGroups
}
defineProps<Props>()
</script>

<template>
  <div>
    {{ t("app.count") }}: {{ sortGroup["Group Count"] }}
    <br />
    <table class="table-borderless">
      <tbody>
        <tr>
          <td class="text-nowrap p-0">
            {{
              sortGroup["Sort Methods Used"].length > 1
                ? t("app.sortMethods")
                : t("app.sortMethod")
            }}:
          </td>
          <td class="p-0 ps-1">
            {{ keysToString(sortGroup["Sort Methods Used"]) }}
          </td>
        </tr>
      </tbody>
    </table>
    <table class="table-borderless">
      <tbody>
        <tr>
          <td class="p-0">{{ t("app.memory") }}:</td>
          <td class="p-0 ps-1">
            {{ t("app.average") }}:
            {{
              kilobytes(
                sortGroup["Sort Space Memory"]["Average Sort Space Used"],
              )
            }}
            <br />
            {{ t("app.peak") }}:
            {{
              kilobytes(sortGroup["Sort Space Memory"]["Peak Sort Space Used"])
            }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
