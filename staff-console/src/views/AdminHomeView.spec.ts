import { describe, it, expect } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { createRouter, createMemoryHistory } from 'vue-router';
import AdminHomeView from './AdminHomeView.vue';
import { useAuthStore } from '../stores/auth';

function makeRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/login', name: 'login', component: { template: '<div>login</div>' } },
      { path: '/admin', name: 'admin-home', component: AdminHomeView },
      { path: '/admin/fees', name: 'admin-fees', component: { template: '<div>fees</div>' } },
    ],
  });
}

async function mountView() {
  setActivePinia(createPinia());
  const auth = useAuthStore();
  auth.role = 'SCHOOL_ADMIN';
  const router = makeRouter();
  await router.push('/admin');
  await router.isReady();
  const wrapper = mount(AdminHomeView, { global: { plugins: [router] } });
  await flushPromises();
  return wrapper;
}

describe('AdminHomeView (Dashboard)', () => {
  it('renders the primary and secondary KPI figures', async () => {
    const wrapper = await mountView();
    const text = wrapper.text();

    expect(text).toContain('1,284');
    expect(text).toContain('93.5%');
    expect(text).toContain('2.4M');
    expect(text).toContain('680K');
    expect(wrapper.findAll('.secondary-value').map((n) => n.text())).toEqual(['37', '84', '6']);
  });

  it('renders the trends chart and the recent alerts list', async () => {
    const wrapper = await mountView();

    expect(wrapper.findComponent({ name: 'TrendsSparkline' }).exists()).toBe(true);
    expect(wrapper.text()).toContain('12 students absent 3+ days');
    expect(wrapper.text()).toContain('Fee reminder failed for 18 parents');
  });
});
