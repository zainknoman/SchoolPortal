import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import AttendanceView from './AttendanceView.vue';
import { useAuthStore } from '../stores/auth';
import { api } from '../lib/api';

vi.mock('../lib/api', () => ({
  api: {
    listSections: vi.fn(),
    sectionStudents: vi.fn(),
    markAttendance: vi.fn(),
  },
}));

describe('AttendanceView', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    const auth = useAuthStore();
    auth.accessToken = 'token-1';
    vi.mocked(api.listSections).mockReset();
    vi.mocked(api.sectionStudents).mockReset();
    vi.mocked(api.markAttendance).mockReset();
  });

  it('loads sections, then students once a section is picked, and marks attendance on save', async () => {
    vi.mocked(api.listSections).mockResolvedValue([
      { id: 'sec-1', name: '3A', className: 'Grade 3', campusName: 'Gulistan-e-Jauhar' },
    ]);
    vi.mocked(api.sectionStudents).mockResolvedValue([
      { id: 's1', name: 'Eshaal', grNumber: 'GR-1001' },
    ]);
    vi.mocked(api.markAttendance).mockResolvedValue(undefined);

    const wrapper = mount(AttendanceView);
    await flushPromises();

    expect(wrapper.find('option[value="sec-1"]').exists()).toBe(true);

    await wrapper.find('select[data-testid="section-select"]').setValue('sec-1');
    await flushPromises();

    expect(wrapper.text()).toContain('Eshaal');
    expect(wrapper.find('.roster-avatar').text()).toBe('ES');

    await wrapper.find('[data-testid="status-s1-present"]').trigger('click');
    await wrapper.find('[data-testid="save-attendance"]').trigger('click');
    await flushPromises();

    expect(api.markAttendance).toHaveBeenCalledWith(
      'token-1',
      expect.objectContaining({ studentId: 's1', status: 'PRESENT' }),
    );
    expect(wrapper.text()).toContain('Saved');
  });

  it('shows an error message if marking attendance fails', async () => {
    vi.mocked(api.listSections).mockResolvedValue([
      { id: 'sec-1', name: '3A', className: 'Grade 3', campusName: 'Gulistan-e-Jauhar' },
    ]);
    vi.mocked(api.sectionStudents).mockResolvedValue([
      { id: 's1', name: 'Eshaal', grNumber: 'GR-1001' },
    ]);
    vi.mocked(api.markAttendance).mockRejectedValue(
      new Error('Something went wrong. Please try again.'),
    );

    const wrapper = mount(AttendanceView);
    await flushPromises();
    await wrapper.find('select[data-testid="section-select"]').setValue('sec-1');
    await flushPromises();
    await wrapper.find('[data-testid="status-s1-absent"]').trigger('click');
    await wrapper.find('[data-testid="save-attendance"]').trigger('click');
    await flushPromises();

    expect(wrapper.text()).toContain('Something went wrong');
  });

  it('"Default all present" sets every visible student to Present and updates the submit count', async () => {
    vi.mocked(api.listSections).mockResolvedValue([
      { id: 'sec-1', name: '3A', className: 'Grade 3', campusName: 'Gulistan-e-Jauhar' },
    ]);
    vi.mocked(api.sectionStudents).mockResolvedValue([
      { id: 's1', name: 'Ali Khan', grNumber: 'GR-1001' },
      { id: 's2', name: 'Ayesha Noor', grNumber: 'GR-1002' },
    ]);

    const wrapper = mount(AttendanceView);
    await flushPromises();
    await wrapper.find('select[data-testid="section-select"]').setValue('sec-1');
    await flushPromises();

    await wrapper.find('[data-testid="default-all-present"]').trigger('click');

    expect(wrapper.find('[data-testid="status-s1-present"]').classes()).toContain('active');
    expect(wrapper.find('[data-testid="status-s2-present"]').classes()).toContain('active');
    expect(wrapper.text()).toContain('Submit Attendance (2/2)');
  });

  it('marks a student Leave via the overflow menu', async () => {
    vi.mocked(api.listSections).mockResolvedValue([
      { id: 'sec-1', name: '3A', className: 'Grade 3', campusName: 'Gulistan-e-Jauhar' },
    ]);
    vi.mocked(api.sectionStudents).mockResolvedValue([
      { id: 's1', name: 'Ali Khan', grNumber: 'GR-1001' },
    ]);

    const wrapper = mount(AttendanceView);
    await flushPromises();
    await wrapper.find('select[data-testid="section-select"]').setValue('sec-1');
    await flushPromises();

    await wrapper.find('[data-testid="status-s1-more"]').trigger('click');
    await wrapper.find('[data-testid="status-s1-leave"]').trigger('click');
    await wrapper.find('[data-testid="save-attendance"]').trigger('click');
    await flushPromises();

    expect(api.markAttendance).toHaveBeenCalledWith(
      'token-1',
      expect.objectContaining({ studentId: 's1', status: 'LEAVE' }),
    );
  });
});
