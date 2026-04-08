<script lang="ts" setup>
import { computed, inject, useTemplateRef, ref, onMounted, watch } from "vue"
import type { Ref } from "vue"

import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome"
import { Tippy } from "vue-tippy"
import { directive as vTippy } from "vue-tippy"
import { useDropZone } from "@vueuse/core"

import { time_ago } from "../utils"
import MainLayout from "../layouts/MainLayout.vue"
import VersionCheck from "../components/VersionCheck.vue"
import {
  faEdit,
  faInfoCircle,
  faTrash,
  faDownload,
  faUpload,
} from "@fortawesome/free-solid-svg-icons"
import samples from "../samples.ts"

import idb from "../idb"
import { t } from "@/i18n"

type StoredPlan = [string, string, string, string?] & { id: number }

const setPlanData = inject("setPlanData")

const planInput = ref<string>("")
const queryInput = ref<string>("")
const planName = ref<string>("")
const savedPlans = ref<StoredPlan[]>([])
const pageSize = 11
const maxVisiblePages = 5
const currentPage = ref<number>(1)
const totalPages = computed(() => {
  return Math.ceil(savedPlans.value.length / pageSize)
})
const hovered = ref<number | null>(null)
const selectionMode = ref(false)
const selection = ref<number[]>([])
const messages = ref<{ id: number; text: string }[]>([])

const paginatedPlans = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return savedPlans.value.slice(start, end)
})

const visiblePages = computed(() => {
  const total = totalPages.value
  const half = Math.floor(maxVisiblePages / 2)
  let start = currentPage.value - half
  let end = currentPage.value + half

  if (start < 1) {
    start = 1
    end = Math.min(maxVisiblePages, total)
  }
  if (end > total) {
    end = total
    start = Math.max(1, total - maxVisiblePages + 1)
  }

  const pages = []
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})

const planDropZoneRef = useTemplateRef("planDropZoneRef")
const { isOverDropZone: isOverPlanDropZone } = useDropZone(
  planDropZoneRef,
  (files) => onDrop(files, planInput),
)
const queryDropZoneRef = useTemplateRef("queryDropZoneRef")
const { isOverDropZone: isOverQueryDropZone } = useDropZone(
  queryDropZoneRef,
  (files) => onDrop(files, queryInput),
)

const savedPlansDropZoneRef = useTemplateRef("savedPlansDropZoneRef")
const { isOverDropZone: isOverSavedPlansDropZone } = useDropZone(
  savedPlansDropZoneRef,
  {
    onDrop: (files) => onImport(files),
    dataTypes: ["json"],
    multiple: false,
  },
)

function submitPlan() {
  const newPlan: StoredPlan = ["", "", ""] as StoredPlan
  newPlan[0] =
    planName.value ||
    t("demo.defaultPlanName", {
      date: new Date().toLocaleString("zh-CN", {
        dateStyle: "medium",
        timeStyle: "medium",
      }),
    })
  newPlan[1] = planInput.value
  newPlan[2] = queryInput.value
  newPlan[3] = new Date().toISOString()
  savePlanData(newPlan)

  setPlanData(...newPlan)
}

async function savePlanData(sample: Plan) {
  await idb.savePlan(sample)
}

onMounted(() => {
  const textAreas = document.getElementsByTagName("textarea")
  Array.prototype.forEach.call(textAreas, (elem: HTMLInputElement) => {
    elem.placeholder = elem.placeholder.replace(/\\n/g, "\n")
  })
  const noHashURL = window.location.href.replace(/#.*$/, "")
  window.history.replaceState("", document.title, noHashURL)
  loadPlans()
})

async function loadPlans() {
  const plans = await idb.getPlans()
  savedPlans.value = plans
    .slice()
    .sort((a, b) => new Date(a[3]) - new Date(b[3]))
    .reverse()
}

function loadPlan(plan?: StoredPlan) {
  if (!plan) {
    return
  }

  planName.value = plan[0]
  planInput.value = plan[1]
  queryInput.value = plan[2]
}

function openOrSelectPlan(plan: StoredPlan) {
  if (!selectionMode.value) {
    openPlan(plan)
  } else {
    togglePlanSelection(plan)
  }
}

function openPlan(plan: StoredPlan) {
  setPlanData(plan[0], plan[1], plan[2])
}

function isSelected(id: number) {
  return selection.value.includes(id)
}

function togglePlanSelection(plan: StoredPlan) {
  const index = selection.value.indexOf(plan.id)
  if (index === -1) {
    selection.value.push(plan.id)
  } else {
    selection.value.splice(index, 1)
  }
}

function editPlan(plan: StoredPlan) {
  loadPlan(plan)
}

function plansFromSelection() {
  return selection.value.length > 0
    ? savedPlans.value.filter((p) => selection.value.includes(p.id))
    : savedPlans.value
}

function deletePlans() {
  if (confirm(t("demo.confirmDeletePlans"))) {
    const plans = plansFromSelection()
    plans.forEach(async (plan) => {
      await idb.deletePlan(plan)
    })
    loadPlans()
    selectionMode.value = false
    addMessage(t("demo.deletedPlans", { count: plans.length }))
  }
  // reset page
  currentPage.value = 1
}

async function deletePlan(plan: StoredPlan) {
  await idb.deletePlan(plan)
  loadPlans()
}

function onDrop(files: File[] | null, input: Ref) {
  if (files) {
    const reader = new FileReader()
    reader.onload = () => {
      if (reader.result instanceof ArrayBuffer) {
        return
      }
      input.value = reader.result || ""
    }
    reader.readAsText(files[0])
  }
}

function nextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}
function prevPage() {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}
function goToPage(page: number) {
  currentPage.value = page
}

watch(
  () => selectionMode.value,
  () => {
    selection.value = []
  },
)

const fileInput = ref<HTMLInputElement | null>(null)

function triggerImport() {
  fileInput.value?.click()
}

async function handleImportFile(event: Event) {
  const input = event.target as HTMLInputElement
  if (!input.files?.length) return
  onImport(input.files)
}

function onImport(files: File[]) {
  const file = files[0]
  const reader = new FileReader()
  reader.onload = async () => {
    try {
      const plans = JSON.parse(reader.result as string)
      const counts = await idb.importPlans(plans)
      let message = t("demo.importedPlans", { count: counts[0] })
      if (counts[1]) {
        message += ` <i>(${t("demo.duplicatesFound", { count: counts[1] })})</i>`
      }
      addMessage(message)
      loadPlans()
    } catch (error: unknown) {
      console.error("Invalid file format", error)
      alert(t("demo.invalidFileFormat"))
    }
  }
  reader.readAsText(file)
}

async function exportPlans(plans) {
  if (!plans) {
    plans = plansFromSelection()
  }
  const blob = new Blob([JSON.stringify(plans, null, 2)], {
    type: "application/json",
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = "plans.json"
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  addMessage(t("demo.exportedPlans", { count: plans.length }))
}

function addMessage(text) {
  const id = Date.now() + Math.random()

  messages.value.push({ id, text })
  setTimeout(() => {
    messages.value = messages.value.filter((m) => m.id !== id)
  }, 3000)
}
</script>

<template>
  <MainLayout>
    <div class="container">
      <VersionCheck />
      <div class="alert alert-warning">
        {{ t("demo.serverlessNotice") }}
        <br />
        {{ t("demo.shareSuggestion") }}
      </div>
      <div class="row">
        <div class="col-sm-7">
          <div class="row mb-3">
            <div class="col d-flex">
              <div class="text-body-secondary">
                {{ t("demo.bestResults") }}
                <code>
                  EXPLAIN (ANALYZE, COSTS, VERBOSE, BUFFERS, FORMAT JSON)
                </code>
                <br />
                {{ t("demo.psqlTip") }}
                <code class="text-nowrap"
                  >psql -XqAt -f explain.sql > analyze.json</code
                >
              </div>
            </div>
          </div>
          <form v-on:submit.prevent="submitPlan">
            <div class="mb-3">
              <div class="d-flex align-items-center mb-2">
                  <label for="planInput" class="form-label">
                  {{ t("demo.plan") }}
                  <span class="small text-body-tertiary">({{ t("demo.textOrJson") }})</span>
                </label>
                <div class="dropdown ms-auto">
                  <button
                    class="btn btn-secondary dropdown-toggle btn-sm"
                    type="button"
                    id="dropdownMenuButton"
                    data-bs-toggle="dropdown"
                    aria-haspopup="true"
                    aria-expanded="false"
                  >
                    {{ t("demo.samplePlans") }}
                  </button>
                  <div
                    class="dropdown-menu"
                    aria-labelledby="dropdownMenuButton"
                  >
                    <a
                      v-for="(sample, index) in samples"
                      :key="index"
                      class="dropdown-item"
                      v-on:click.prevent="loadPlan(sample)"
                      href=""
                    >
                      {{ sample[0] }}
                    </a>
                  </div>
                </div>
              </div>
              <textarea
                ref="planDropZoneRef"
                :class="[
                  'form-control',
                  isOverPlanDropZone ? 'dropzone-over' : '',
                ]"
                id="planInput"
                rows="8"
                v-model="planInput"
                :placeholder="t('demo.planPlaceholder')"
              >
              </textarea>
            </div>
            <div class="mb-3">
              <label for="queryInput" class="form-label">
                {{ t("demo.query") }} <span class="small text-body-tertiary">({{ t("demo.optional") }})</span>
              </label>
              <textarea
                ref="queryDropZoneRef"
                :class="[
                  'form-control',
                  isOverQueryDropZone ? 'dropzone-over' : '',
                ]"
                id="queryInput"
                rows="8"
                v-model="queryInput"
                :placeholder="t('demo.queryPlaceholder')"
              >
              </textarea>
            </div>
            <div class="mb-3">
              <label for="planName" class="form-label">
                {{ t("demo.planName") }}
                <span class="small text-body-tertiary">({{ t("demo.optional") }})</span>
              </label>
              <input
                type="text"
                class="form-control"
                id="planName"
                v-model="planName"
                :placeholder="t('demo.planNamePlaceholder')"
              />
            </div>
            <button type="submit" class="btn btn-primary">{{ t("demo.submit") }}</button>
          </form>
        </div>
        <div
          class="col-sm-5 position-relative"
          ref="savedPlansDropZoneRef"
          :class="{ 'dropzone-over': isOverSavedPlansDropZone }"
        >
          <div class="d-flex flex-row align-items-center mb-2">
            <div>
              {{ t("demo.savedPlans") }}
              <div class="badge text-bg-light">
                {{ savedPlans?.length }}
              </div>
              <Tippy>
                <FontAwesomeIcon
                  :icon="faInfoCircle"
                  class="text-body-tertiary"
                ></FontAwesomeIcon>
                <template #content>{{ t("demo.savedPlansTip") }}</template>
              </Tippy>
            </div>
            <div class="ms-auto">
              <Tippy>
                <button class="btn btn-sm btn-primary" @click="triggerImport">
                  <FontAwesomeIcon
                    :icon="faDownload"
                    class="me-2"
                  ></FontAwesomeIcon>
                  {{ t("demo.import") }}
                </button>
                <template #content>{{ t("demo.importTip") }}</template>
              </Tippy>
              <input
                type="file"
                accept=".json"
                ref="fileInput"
                class="d-none"
                @change="handleImportFile"
              />
              <button
                class="btn btn-sm ms-1 btn-light"
                :class="{ active: selectionMode }"
                @click="selectionMode = !selectionMode"
              >
                {{ t("demo.select") }}
              </button>
            </div>
          </div>
          <nav>
            <ul class="pagination pagination-sm justify-content-end mb-2">
              <li class="page-item" :class="{ disabled: currentPage === 1 }">
                <a
                  class="page-link"
                  href="#"
                  @click="prevPage"
                  :aria-label="t('demo.previous')"
                >
                  <span aria-hidden="true">&laquo;</span>
                  <span class="sr-only">{{ t("demo.previous") }}</span>
                </a>
              </li>
              <li
                class="page-item"
                v-if="visiblePages[0] > 1"
                @click="goToPage(1)"
              >
                <a class="page-link" href="#">1</a>
              </li>
              <li class="page-item" v-if="visiblePages[0] > 2">
                <a class="page-link"> … </a>
              </li>
              <li
                class="page-item"
                v-for="page in visiblePages"
                :key="page"
                @click="goToPage(page)"
                :class="{ active: page === currentPage }"
              >
                <a class="page-link" href="#">{{ page }}</a>
              </li>
              <li
                class="page-item"
                v-if="visiblePages[visiblePages.length - 1] < totalPages - 1"
              >
                <a class="page-link"> … </a>
              </li>
              <li
                class="page-item"
                v-if="visiblePages[visiblePages.length - 1] < totalPages"
                @click="goToPage(totalPages)"
              >
                <a class="page-link" href="#">{{ totalPages }}</a>
              </li>
              <li
                class="page-item"
                :class="{ disabled: currentPage === totalPages }"
              >
                <a
                  class="page-link"
                  href="#"
                  @click="nextPage"
                  :aria-label="t('demo.next')"
                >
                  <span aria-hidden="true">&raquo;</span>
                  <span class="sr-only">{{ t("demo.next") }}</span>
                </a>
              </li>
            </ul>
          </nav>
          <div>
            <div
              class="alert alert-success py-1"
              v-for="message in messages"
              :key="message.id"
            >
              <span v-html="message.text"></span>
            </div>
          </div>

          <div class="list-group" v-cloak>
            <a
              class="list-group-item list-group-item-action px-2 py-1 flex-column"
              :class="{ active: isSelected(plan.id) }"
              v-for="(plan, index) in paginatedPlans"
              :key="plan.id"
              href="#"
              @click.prevent="openOrSelectPlan(plan)"
              @mouseenter="hovered = index"
              @mouseleave="hovered = null"
            >
              <div class="d-flex w-100 align-items-center">
                <input
                  class="form-check-input me-3"
                  type="checkbox"
                  v-if="selectionMode"
                  :value="plan.id"
                  v-model="selection"
                  @click.stop
                />
                <div>
                  <p class="mb-0">
                    {{ plan[0] }}
                  </p>
                  <small
                    :class="{
                      'text-body-tertiary': !isSelected(plan.id),
                    }"
                  >
                    {{ t("demo.created") }}
                    <span :title="plan[3]?.toString()">
                      {{ time_ago(plan[3]) }}
                    </span>
                  </small>
                </div>
                <div
                  class="end-0 text-nowrap position-absolute z-1 p-2"
                  v-if="hovered === index && !selectionMode"
                >
                  <button
                    class="btn btn-sm btn-outline-secondary py-0 me-1"
                    v-tippy="t('demo.exportPlan')"
                    v-on:click.stop="exportPlans([plan])"
                  >
                    <FontAwesomeIcon :icon="faUpload"></FontAwesomeIcon>
                  </button>
                  <button
                    class="btn btn-sm btn-outline-secondary py-0 me-1"
                    v-tippy="t('demo.deletePlan')"
                    v-on:click.stop="deletePlan(plan)"
                  >
                    <FontAwesomeIcon :icon="faTrash"></FontAwesomeIcon>
                  </button>
                  <button
                    class="btn btn-sm btn-outline-secondary py-0"
                    v-tippy="t('demo.editPlanDetails')"
                    v-on:click.stop="editPlan(plan)"
                  >
                    <FontAwesomeIcon :icon="faEdit"></FontAwesomeIcon>
                  </button>
                </div>
              </div>
            </a>
          </div>
          <div v-if="selectionMode" class="mt-2 d-flex">
            <button class="btn btn-sm btn-primary" @click="exportPlans()">
              <FontAwesomeIcon :icon="faUpload" class="me-2"></FontAwesomeIcon>
              {{
                selection.length < 1
                  ? t("demo.exportAllPlans")
                  : t("demo.exportSelectedPlans")
              }}<template v-if="selection.length >= 1">
                ({{ selection.length }})
              </template>
            </button>
            <button class="btn btn-sm ms-auto btn-danger" @click="deletePlans">
              <FontAwesomeIcon :icon="faTrash" class="me-2"></FontAwesomeIcon>
              {{
                selection.length < 1
                  ? t("demo.deleteAllPlans")
                  : t("demo.deleteSelectedPlans")
              }}<template v-if="selection.length >= 1">
                ({{ selection.length }})
              </template>
            </button>
          </div>
          <p
            class="text-body-tertiary text-center"
            v-if="!savedPlans?.length"
            v-cloak
          >
            <em>{{ t("demo.noSavedPlans") }}</em>
          </p>
          <div
            class="position-absolute top-50 start-50 alert alert-primary translate-middle mb-0 z-3 opacity-100 text-center"
            v-if="isOverSavedPlansDropZone"
          >
            <FontAwesomeIcon
              :icon="faDownload"
              class="mb-2"
              size="2x"
            ></FontAwesomeIcon>
            <br />
            {{ t("demo.dropJsonHere") }}
          </div>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<style scoped lang="scss">
.dropzone-over {
  box-shadow: 0 0 5px rgba(81, 203, 238, 1);
  background-color: rgba(81, 203, 238, 0.05);
  > * {
    opacity: 50%;
  }
}
</style>
