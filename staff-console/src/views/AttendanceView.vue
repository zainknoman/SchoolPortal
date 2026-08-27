<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth';
import { api, type SectionSummary, type StudentSummary, type AttendanceStatus } from '../lib/api';

const STATUSES: AttendanceStatus[] = ['PRESENT', 'ABSENT', 'LATE', 'LEAVE', 'HOLIDAY'];

const auth = useAuthStore();
const today = new Date().toISOString().slice(0, 10);

const sections = ref<SectionSummary[]>([]);
const selectedSectionId = ref('');
const students = ref<StudentSummary[]>([]);
const statuses = ref<Record<string, AttendanceStatus | ''>>({});
const isSaving = ref(false);
const message = ref<string | null>(null);
const errorMessage = ref<string | null>(null);

async function loadSections() {
  if (!auth.accessToken) return;
  try {
    sections.value = await api.listSections(auth.accessToken);
  } catch (err) {
    errorMessage.value = err instanceof Error ? err.message : 'Could not load sections.';
  }
}
loadSections();

async function onSectionChange() {
  message.value = null;
  errorMessage.value = null;
  students.value = [];
  statuses.value = {};
  if (!selectedSectionId.value || !auth.accessToken) return;
  try {
    students.value = await api.sectionStudents(auth.accessToken, selectedSectionId.value);
  } catch (err) {
    errorMessage.value = err instanceof Error ? err.message : 'Could not load students.';
  }
}

async function onSave() {
  if (!auth.accessToken) return;
  message.value = null;
  errorMessage.value = null;
  isSaving.value = true;

  try {
    const entries = Object.entries(statuses.value).filter(([, status]) => status !== '');
    for (const [studentId, status] of entries) {
      await api.markAttendance(auth.accessToken, {
        studentId,
        date: today,
        status: status as AttendanceStatus,
      });
    }
    message.value = `Saved attendance for ${entries.length} student(s).`;
  } catch (err) {
    errorMessage.value = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
  } finally {
    isSaving.value = false;
  }
}
</script>

<template>
  <div class="attendance">
    <h1>Attendance</h1>
    <p class="subtitle">{{ today }}</p>

    <label class="field">
      <span>Section</span>
      <select data-testid="section-select" v-model="selectedSectionId" @change="onSectionChange">
        <option value="" disabled>Choose a section</option>
        <option v-for="s in sections" :key="s.id" :value="s.id">
          {{ s.className }} {{ s.name }} — {{ s.campusName }}
        </option>
      </select>
    </label>

    <table v-if="students.length" class="roster">
      <thead>
        <tr>
          <th>Student</th>
          <th>GR #</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="student in students" :key="student.id">
          <td>{{ student.name }}</td>
          <td>{{ student.grNumber }}</td>
          <td>
            <select :data-testid="`status-${student.id}`" v-model="statuses[student.id]">
              <option value="">—</option>
              <option v-for="s in STATUSES" :key="s" :value="s">{{ s }}</option>
            </select>
          </td>
        </tr>
      </tbody>
    </table>

    <p v-if="message" class="success" data-testid="success">{{ message }}</p>
    <p v-if="errorMessage" class="error" role="alert">{{ errorMessage }}</p>

    <button
      v-if="students.length"
      data-testid="save-attendance"
      :disabled="isSaving"
      @click="onSave"
    >
      {{ isSaving ? 'Saving…' : 'Save attendance' }}
    </button>
  </div>
</template>

<style scoped>
.attendance {
  max-width: 640px;
}
.subtitle {
  color: var(--color-muted);
  margin-bottom: var(--space-4);
}
.field {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  font-size: var(--font-size-sm);
  margin-bottom: var(--space-4);
  max-width: 320px;
}
select {
  padding: 0.5rem 0.6rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font: inherit;
}
.roster {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: var(--space-3);
}
.roster th,
.roster td {
  text-align: left;
  padding: 0.5rem 0.6rem;
  border-bottom: 1px solid var(--color-border);
  font-size: var(--font-size-sm);
}
.success {
  color: var(--color-accent);
}
.error {
  color: var(--color-destructive);
}
button {
  padding: 0.6rem 1.1rem;
  border: none;
  border-radius: var(--radius-sm);
  background: var(--color-accent);
  color: var(--color-on-primary);
  font-weight: 700;
  cursor: pointer;
}
button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
