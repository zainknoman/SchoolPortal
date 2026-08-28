import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import AppIcon from './AppIcon.vue';

const ICON_NAMES = [
  'home',
  'calendar',
  'notebook',
  'clock',
  'chat',
  'users',
  'user-circle',
  'chalkboard',
  'grid',
  'megaphone',
  'receipt',
  'logout',
  'bell',
  'warning',
] as const;

describe('AppIcon', () => {
  it.each(ICON_NAMES)('renders an svg for "%s"', (name) => {
    const wrapper = mount(AppIcon, { props: { name } });
    expect(wrapper.find('svg').exists()).toBe(true);
  });

  it('defaults to a 20px square icon and applies a custom size', () => {
    const wrapper = mount(AppIcon, { props: { name: 'bell' } });
    expect(wrapper.attributes('width')).toBe('20');

    const sized = mount(AppIcon, { props: { name: 'bell', size: 32 } });
    expect(sized.attributes('width')).toBe('32');
  });
});
