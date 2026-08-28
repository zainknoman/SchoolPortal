<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import AppShell from '../components/AppShell.vue';
import {
  getMockReconciliationQueue,
  getSuggestedMatch,
  type ReconciliationTransaction,
} from '../lib/mockFees';
import { formatPkrFull } from '../lib/format';

const transactions = ref<ReconciliationTransaction[]>([]);
const errorMessage = ref<string | null>(null);
const searchQuery = ref('');
const railFilter = ref('ALL');
const statusFilter = ref<'ALL' | 'AUTO_MATCHED' | 'EXCEPTION'>('EXCEPTION');
const selectedId = ref<string | null>(null);
const manualSearch = ref('');

onMounted(async () => {
  try {
    transactions.value = await getMockReconciliationQueue();
  } catch (err) {
    errorMessage.value = err instanceof Error ? err.message : 'Could not load reconciliation queue.';
  }
});

const rails = computed(() => ['ALL', ...new Set(transactions.value.map((t) => t.rail))]);

const filtered = computed(() =>
  transactions.value.filter((t) => {
    if (railFilter.value !== 'ALL' && t.rail !== railFilter.value) return false;
    if (statusFilter.value !== 'ALL' && t.status !== statusFilter.value) return false;
    if (
      searchQuery.value &&
      !t.transactionId.toLowerCase().includes(searchQuery.value.toLowerCase())
    ) {
      return false;
    }
    return true;
  }),
);

const totalCount = computed(() => transactions.value.length);
const autoMatchedCount = computed(
  () => transactions.value.filter((t) => t.status === 'AUTO_MATCHED').length,
);
const exceptionCount = computed(
  () => transactions.value.filter((t) => t.status === 'EXCEPTION').length,
);

const selected = computed(() => transactions.value.find((t) => t.id === selectedId.value) ?? null);
const suggestion = computed(() => (selectedId.value ? getSuggestedMatch(selectedId.value) : null));

function selectRow(transaction: ReconciliationTransaction) {
  if (transaction.status !== 'EXCEPTION') return;
  selectedId.value = transaction.id;
  manualSearch.value = suggestion.value?.studentName ?? '';
}

function closePanel() {
  selectedId.value = null;
}

function confirmResolution() {
  const target = transactions.value.find((t) => t.id === selectedId.value);
  if (!target) return;
  target.status = 'AUTO_MATCHED';
  target.exceptionReason = null;
  closePanel();
}
</script>

<template>
  <AppShell>
    <div class="fees">
      <h1>Fee Reconciliation Queue</h1>
      <p v-if="errorMessage" class="error" role="alert">{{ errorMessage }}</p>

      <section class="filters-card">
        <div class="filters-row">
          <input
            v-model="searchQuery"
            data-testid="search-transaction"
            type="text"
            placeholder="Search Transaction ID"
          />
          <select v-model="railFilter" data-testid="rail-filter">
            <option v-for="rail in rails" :key="rail" :value="rail">
              {{ rail === 'ALL' ? 'All Rails' : rail }}
            </option>
          </select>
          <select v-model="statusFilter" data-testid="status-filter">
            <option value="EXCEPTION">Status: Exception</option>
            <option value="AUTO_MATCHED">Status: Auto-Matched</option>
            <option value="ALL">Status: All</option>
          </select>
        </div>

        <div class="stats-row">
          <div class="stat">
            <div class="stat-label">Total Transactions (Today)</div>
            <div class="stat-value">{{ totalCount }}</div>
          </div>
          <div class="stat stat-success">
            <div class="stat-label">Auto-Matched</div>
            <div class="stat-value">{{ autoMatchedCount }}</div>
          </div>
          <div class="stat stat-danger">
            <div class="stat-label">Exceptions (Requires Action)</div>
            <div class="stat-value">{{ exceptionCount }}</div>
          </div>
        </div>
      </section>

      <div class="fees-body">
        <section class="table-card">
          <table>
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Rail</th>
                <th>Transaction ID</th>
                <th class="num">Amount (PKR)</th>
                <th>Status</th>
                <th>Exception Reason</th>
                <th class="num">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="t in filtered"
                :key="t.id"
                :data-testid="`row-${t.id}`"
                :class="{ selected: t.id === selectedId, clickable: t.status === 'EXCEPTION' }"
                @click="selectRow(t)"
              >
                <td>{{ t.timestamp }}</td>
                <td>{{ t.rail }}</td>
                <td>{{ t.transactionId }}</td>
                <td class="num">{{ formatPkrFull(t.amountPkr) }}</td>
                <td>
                  <span class="badge" :class="t.status === 'EXCEPTION' ? 'badge-danger' : 'badge-success'">
                    {{ t.status === 'EXCEPTION' ? 'Exception' : 'Auto-Matched' }}
                  </span>
                </td>
                <td>{{ t.exceptionReason ?? '-' }}</td>
                <td class="num">
                  <button
                    v-if="t.status === 'EXCEPTION'"
                    type="button"
                    :data-testid="`resolve-${t.id}`"
                    class="link-button"
                    @click.stop="selectRow(t)"
                  >
                    Resolve
                  </button>
                  <span v-else class="muted">View</span>
                </td>
              </tr>
            </tbody>
          </table>
        </section>

        <aside v-if="selected" class="resolve-panel" data-testid="resolve-panel">
          <div class="resolve-header">
            <h2>Resolve Exception</h2>
            <button type="button" data-testid="close-resolve" aria-label="Close" @click="closePanel">
              ×
            </button>
          </div>

          <div class="resolve-section">
            <h3>Bank Transaction Details</h3>
            <dl class="detail-list">
              <div><dt>Transaction ID</dt><dd>{{ selected.transactionId }}</dd></div>
              <div><dt>Rail</dt><dd>{{ selected.rail }}</dd></div>
              <div><dt>Amount Received</dt><dd>PKR {{ formatPkrFull(selected.amountPkr) }}</dd></div>
              <div class="issue"><dt>Issue</dt><dd>{{ selected.exceptionReason }}</dd></div>
            </dl>
          </div>

          <div class="resolve-section">
            <h3>Manual Resolution</h3>
            <label class="field">
              <span>Search Student or Correct Challan</span>
              <input v-model="manualSearch" data-testid="manual-search" type="text" />
            </label>

            <div v-if="suggestion" class="suggestion-card" data-testid="suggestion-card">
              <div class="suggestion-row">
                <span class="suggestion-invoice">{{ suggestion.invoiceNo }}</span>
                <span class="suggestion-amount">PKR {{ formatPkrFull(suggestion.amountPkr) }}</span>
              </div>
              <div class="suggestion-name">{{ suggestion.studentName }}</div>
            </div>

            <button
              type="button"
              data-testid="confirm-resolution"
              class="confirm-button"
              @click="confirmResolution"
            >
              Confirm Match
            </button>
          </div>
        </aside>
      </div>
    </div>
  </AppShell>
</template>

<style scoped>
.fees {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.filters-card,
.table-card,
.resolve-panel {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
}

.filters-card {
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}
.filters-row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}
.filters-row input,
.filters-row select {
  padding: 0.5rem 0.7rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font: inherit;
  font-size: var(--font-size-sm);
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-3);
}
@media (max-width: 768px) {
  .stats-row {
    grid-template-columns: 1fr;
  }
}
.stat {
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: var(--space-3);
}
.stat-success {
  background: color-mix(in srgb, var(--color-present) 10%, white);
  border-color: color-mix(in srgb, var(--color-present) 30%, white);
}
.stat-danger {
  background: color-mix(in srgb, var(--color-destructive) 8%, white);
  border-color: color-mix(in srgb, var(--color-destructive) 25%, white);
}
.stat-label {
  color: var(--color-muted);
  font-weight: 500;
}
.stat-value {
  font-size: var(--font-size-xl);
  font-weight: 700;
  margin-top: var(--space-1);
}

.fees-body {
  display: flex;
  gap: var(--space-4);
  align-items: flex-start;
}
.table-card {
  flex: 1;
  overflow-x: auto;
}
table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--font-size-sm);
}
th {
  text-align: left;
  padding: var(--space-2) var(--space-3);
  color: var(--color-muted);
  font-size: var(--font-size-xs);
  text-transform: uppercase;
  border-bottom: 1px solid var(--color-border);
}
td {
  padding: var(--space-2) var(--space-3);
  border-bottom: 1px solid var(--color-border);
}
.num {
  text-align: right;
}
tr.clickable {
  cursor: pointer;
}
tr.selected {
  background: var(--color-muted-bg);
}
tr.clickable:hover {
  background: var(--color-background);
}

.badge {
  display: inline-block;
  padding: 0.15rem 0.6rem;
  border-radius: 999px;
  font-size: var(--font-size-xs);
  font-weight: 700;
}
.badge-danger {
  background: color-mix(in srgb, var(--color-destructive) 15%, white);
  color: var(--color-destructive);
}
.badge-success {
  background: color-mix(in srgb, var(--color-present) 15%, white);
  color: var(--color-present);
}

.link-button {
  border: none;
  background: none;
  color: var(--color-accent);
  font-weight: 600;
  cursor: pointer;
}
.muted {
  color: var(--color-muted);
}
.error {
  color: var(--color-destructive);
}

.resolve-panel {
  width: 22rem;
  flex-shrink: 0;
}
.resolve-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--color-border);
}
.resolve-header button {
  border: none;
  background: none;
  font-size: var(--font-size-lg);
  cursor: pointer;
  color: var(--color-muted);
}
.resolve-section {
  padding: var(--space-4);
  border-bottom: 1px solid var(--color-border);
}
.resolve-section h3 {
  font-size: var(--font-size-xs);
  text-transform: uppercase;
  color: var(--color-muted);
  margin-bottom: var(--space-2);
}
.detail-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  font-size: var(--font-size-sm);
}
.detail-list > div {
  display: flex;
  justify-content: space-between;
  gap: var(--space-2);
}
.detail-list dt {
  color: var(--color-muted);
}
.detail-list dd {
  font-weight: 500;
  text-align: right;
}
.detail-list .issue dd {
  color: var(--color-destructive);
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  font-size: var(--font-size-sm);
  margin-bottom: var(--space-3);
}
.field input {
  padding: 0.5rem 0.7rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font: inherit;
}

.suggestion-card {
  border: 1px solid var(--color-accent);
  background: color-mix(in srgb, var(--color-accent) 8%, white);
  border-radius: var(--radius-sm);
  padding: var(--space-2) var(--space-3);
  margin-bottom: var(--space-3);
  font-size: var(--font-size-sm);
}
.suggestion-row {
  display: flex;
  justify-content: space-between;
  font-weight: 600;
}

.confirm-button {
  width: 100%;
  padding: 0.6rem;
  border: none;
  border-radius: var(--radius-sm);
  background: var(--color-accent);
  color: var(--color-on-primary);
  font-weight: 700;
  cursor: pointer;
}
</style>
