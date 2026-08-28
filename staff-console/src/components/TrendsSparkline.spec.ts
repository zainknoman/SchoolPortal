import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import TrendsSparkline from './TrendsSparkline.vue';

describe('TrendsSparkline', () => {
  it('draws one polyline per series and a legend entry per series', () => {
    const wrapper = mount(TrendsSparkline, {
      props: {
        labels: ['Mon', 'Tue', 'Wed'],
        series: [
          { label: 'Attendance %', color: '#0f172a', values: [0, 50, 100] },
          { label: 'Fees Collected (PKR)', color: '#64748b', dashed: true, values: [100, 0, 50] },
        ],
      },
    });

    const polylines = wrapper.findAll('polyline');
    expect(polylines).toHaveLength(2);
    // y is inverted (0 -> bottom/100, 100 -> top/0) so a chart reads bottom-to-top like the wireframe
    expect(polylines[0].attributes('points')).toBe('0,100 50,50 100,0');

    expect(wrapper.text()).toContain('Attendance %');
    expect(wrapper.text()).toContain('Fees Collected (PKR)');
    expect(wrapper.findAll('.sparkline-x-label').map((n) => n.text())).toEqual(['Mon', 'Tue', 'Wed']);
  });
});
