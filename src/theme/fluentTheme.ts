import { createLightTheme, createDarkTheme, type BrandVariants } from '@fluentui/react-components';

const evergreenBrand: BrandVariants = {
  10: '#011a18',
  20: '#012523',
  30: '#013d37',
  40: '#01564d',
  50: '#016e61',
  60: '#008575',
  70: '#009485',
  80: '#00a897',
  90: '#26b9a9',
  100: '#4dcabb',
  110: '#73dbce',
  120: '#99ece0',
  130: '#b3f2eb',
  140: '#c6f5f0',
  150: '#d9f7f3',
  160: '#ecfaf8',
};

export const evergreenLightTheme = createLightTheme(evergreenBrand);
export const evergreenDarkTheme = createDarkTheme(evergreenBrand);
