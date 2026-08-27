<script setup lang="ts">
import AppShell from '../components/AppShell.vue';
</script>

<template>
  <AppShell>
    <h1>Admin / Accounts home</h1>
    <p class="lede">
      Student/parent/teacher management, timetable authoring, circulars, and fees land here in
      the next sprint. This screen confirms login + role-gated routing are wired end to end.
    </p>
  </AppShell>
</template>

<style scoped>
.lede {
  margin-top: var(--space-2);
  max-width: 60ch;
  color: var(--color-muted);
}
</style>
