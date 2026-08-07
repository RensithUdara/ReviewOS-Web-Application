import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#17211f',
        mist: '#edf4f2',
        leaf: '#2f7d66',
        coral: '#dc6b4d',
        sun: '#f1b44c',
        sky: '#4f83cc',
      },
      boxShadow: {
        panel: '0 1px 2px rgba(23, 33, 31, 0.08)',
      },
    },
  },
  plugins: [],
};

export default config;
