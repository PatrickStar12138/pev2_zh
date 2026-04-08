<script lang="ts" setup>
import { inject } from "vue"
import VLink from "../components/VLink.vue"
import { useTheme } from "../composables/useTheme"
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome"
import { faSun, faMoon } from "@fortawesome/free-solid-svg-icons"
import { t } from "@/i18n"

interface Props {
  title?: string
}

const props = defineProps<Props>()
const currentPath = inject("currentPath")
const { theme, toggleTheme } = useTheme()
</script>

<template>
  <div class="d-flex flex-column vh-100">
    <nav class="navbar">
      <div :class="[currentPath == '/plan' ? 'container-fluid' : 'container']">
        <VLink class="btn btn-link" to="/">
          <img src="../assets/logo_pev2.svg" alt="" style="height: 1.5rem" />
        </VLink>
        <div v-if="props?.title" class="text-center ms-auto">
          {{ props?.title }}
        </div>
        <VLink class="btn btn-secondary ms-auto" to="/">{{ t("app.newPlan") }}</VLink>
        <button
          class="btn btn-link"
          @click="toggleTheme"
          :title="theme === 'dark' ? t('app.switchToLightMode') : t('app.switchToDarkMode')"
        >
          <FontAwesomeIcon :icon="theme === 'dark' ? faMoon : faSun" />
        </button>
        <VLink class="btn btn-link" to="/about">{{ t("app.about") }}</VLink>
      </div>
    </nav>
    <slot></slot>
  </div>
</template>
