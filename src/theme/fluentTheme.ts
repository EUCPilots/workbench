import { createLightTheme, createDarkTheme, type BrandVariants } from '@fluentui/react-components';

const evergreenBrand: BrandVariants = {
  10: '#012523',
  20: '#013d37',
  30: '#01564d',
  40: '#016e61',
  50: '#008575',
  60: '#009485',
  70: '#00a897',
  80: '#26b9a9',
  90: '#4dcabb',
  100: '#73dbce',
  110: '#99ece0',
  120: '#b3f2eb',
  130: '#c6f5f0',
  140: '#d9f7f3',
  150: '#ecfaf8',
  160: '#f5fdfc',
};

export const evergreenLightTheme = createLightTheme(evergreenBrand);
export const evergreenDarkTheme = createDarkTheme(evergreenBrand);
