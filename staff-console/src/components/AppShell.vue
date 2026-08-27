<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const auth = useAuthStore();
const router = useRouter();

const isTeacher = computed(() => auth.role === 'TEACHER');
const isAdmin = computed(() => ['SCHOOL_ADMIN', 'ACCOUNTS', 'SUPER_ADMIN'].includes(auth.role ?? ''));

async function onLogout() {
  auth.logout();
  await router.push({ name: 'login' });
}
</script>

<template>
  <div class="shell">
    <header class="topbar">
      <span class="brand">SEEDS Staff Console</span>
      <button data-testid="logout" class="logout" @click="onLogout">Log out</button>
    </header>

    <div class="body">
      <nav class="sidenav">
        <template v-if="isTeacher">
          <a data-testid="nav-attendance" href="#">Attendance</a>
          <a data-testid="nav-diary" href="#">Diary</a>
          <a data-testid="nav-timetable" href="#">Timetable</a>
          <a data-testid="nav-messages" href="#">Messages</a>
        </template>
        <template v-else-if="isAdmin">
          <a data-testid="nav-students" href="#">Students</a>
          <a data-testid="nav-parents" href="#">Parents</a>
          <a data-testid="nav-teachers" href="#">Teachers</a>
          <a data-testid="nav-classes" href="#">Classes</a>
          <a data-testid="nav-timetable" href="#">Timetable</a>
          <a data-testid="nav-circulars" href="#">Circulars</a>
          <a data-testid="nav-fees" href="#">Fees</a>
        </template>
      </nav>

      <main class="content">
        <slot />
      </main>
    </div>
  </div>
</template>

<style scoped>
.shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f6f1;
}
.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.9rem 1.5rem;
  background: #ffffff;
  border-bottom: 1px solid #dcdfd5;
}
.brand {
  font-weight: 600;
  color: #1b2420;
}
.logout {
  border: 1px solid #dcdfd5;
  background: transparent;
  border-radius: 6px;
  padding: 0.4rem 0.8rem;
  cursor: pointer;
}
.body {
  flex: 1;
  display: flex;
}
.sidenav {
  width: 200px;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  padding: 1rem;
  border-right: 1px solid #dcdfd5;
  background: #ffffff;
}
.sidenav a {
  padding: 0.5rem 0.6rem;
  border-radius: 6px;
  color: #333b34;
  text-decoration: none;
}
.sidenav a:hover {
  background: #eef0e9;
}
.content {
  flex: 1;
  padding: 2rem;
}
</style>
