<script lang="ts" setup>
import MainLayout from "../layouts/MainLayout.vue"
import { t } from "@/i18n"
</script>

<template>
  <MainLayout>
    <div class="container">
      <h2>{{ t("demo.disclaimer") }}</h2>
      <p>
        {{ t("demo.disclaimerBody1") }}
        <a href="https://github.com/AlexTatiyants/pev"
          >Postgres Explain Visualizer (pev)</a
        >。
      </p>

      <p>
        {{ t("demo.disclaimerBody2") }}
        <a href="https://github.com/AlexTatiyants/pev/issues/42"
          >3 年以上</a
        >
        ，不过仍然有
        <a href="https://github.com/AlexTatiyants/pev/issues"
          >多个未关闭的 issue</a
        >
        和待处理的相关 pull request。
      </p>

      <h2>{{ t("demo.usageTips") }}</h2>
      <p>
        {{ t("demo.usageBody1") }}
        <code>EXPLAIN (ANALYZE, COSTS, VERBOSE, BUFFERS, FORMAT JSON)</code>. It
        {{ t("demo.usageBody2") }}
      </p>
      <p>
        {{ t("demo.usageBody3") }}
      </p>

      <h2>{{ t("demo.helpImprove") }}</h2>
      <p>{{ t("demo.helpUs") }}</p>

      <p>
        {{ t("demo.helpUsBody") }}
        <a href="https://github.com/dalibo/pev2">GitHub</a>。
      </p>

      <hr />
      <div class="text-center text-body-tertiary">
        <b>pev2</b> {{ t("demo.broughtBy") }}
        <a href="https://dalibo.com">Dalibo</a>
      </div>
    </div>
  </MainLayout>
</template>
