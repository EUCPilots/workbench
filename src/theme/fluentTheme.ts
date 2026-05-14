import { createLightTheme, createDarkTheme, type BrandVariants } from '@fluentui/react-components';

const evergreenBrand: BrandVariants = {
  10: '#010e0d',
  20: '#011a18',
  30: '#012523',
  40: '#013d37',
  50: '#01564d',
  60: '#016e61',
  70: '#008575',
  80: '#009485',
  90: '#00a897',
  100: '#26b9a9',
  110: '#4dcabb',
  120: '#73dbce',
  130: '#99ece0',
  140: '#b3f2eb',
  150: '#c6f5f0',
  160: '#d9f7f3',
};

export const evergreenLightTheme = createLightTheme(evergreenBrand);
export const evergreenDarkTheme = createDarkTheme(evergreenBrand);
