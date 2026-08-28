import { describe, it, expect } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { createRouter, createMemoryHistory } from 'vue-router';
import FeesView from './FeesView.vue';
import { useAuthStore } from '../stores/auth';

function makeRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/login', name: 'login', component: { template: '<div>login</div>' } },
      { path: '/admin', name: 'admin-home', component: { template: '<div>admin</div>' } },
      { path: '/admin/fees', name: 'admin-fees', component: FeesView },
    ],
  });
}

async function mountView() {
  setActivePinia(createPinia());
  const auth = useAuthStore();
  auth.role = 'ACCOUNTS';
  const router = makeRouter();
  await router.push('/admin/fees');
  await router.isReady();
  const wrapper = mount(FeesView, { global: { plugins: [router] } });
  await flushPromises();
  return wrapper;
}

describe('FeesView', () => {
  it('defaults to the Exception filter and shows the three summary counts', async () => {
    const wrapper = await mountView();

    expect((wrapper.find('[data-testid="status-filter"]').element as HTMLSelectElement).value).toBe(
      'EXCEPTION',
    );
    expect(wrapper.text()).toContain('Total Transactions (Today)');
    expect(wrapper.text()).toContain('Auto-Matched');
    expect(wrapper.text()).toContain('Exceptions (Requires Action)');
    expect(wrapper.find('[data-testid="row-t3"]').exists()).toBe(false);
    expect(wrapper.find('[data-testid="row-t1"]').exists()).toBe(true);
  });

  it('filters by transaction ID search', async () => {
    const wrapper = await mountView();
    await wrapper.find('[data-testid="status-filter"]').setValue('ALL');
    await wrapper.find('[data-testid="search-transaction"]').setValue('JC-554129-X');

    expect(wrapper.find('[data-testid="row-t2"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="row-t1"]').exists()).toBe(false);
  });

  it('opens the resolve panel for an exception row, shows the suggested match, and resolves it', async () => {
    const wrapper = await mountView();

    await wrapper.find('[data-testid="resolve-t1"]').trigger('click');

    expect(wrapper.find('[data-testid="resolve-panel"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="suggestion-card"]').text()).toContain('INV-2026-000123');
    expect(wrapper.find('[data-testid="suggestion-card"]').text()).toContain('Hassan Ahmed');

    await wrapper.find('[data-testid="confirm-resolution"]').trigger('click');

    expect(wrapper.find('[data-testid="resolve-panel"]').exists()).toBe(false);
    await wrapper.find('[data-testid="status-filter"]').setValue('ALL');
    expect(wrapper.find('[data-testid="row-t1"] .badge').text()).toBe('Auto-Matched');
  });
});
