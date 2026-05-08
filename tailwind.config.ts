import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans:    ['Plus Jakarta Sans', 'sans-serif'],
        heading: ['Rajdhani', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
      colors: {
        atlas: {
          deep:  '#060f0f',
          0:     '#0a1a1a',
          1:     '#0d2020',
          2:     '#112626',
          3:     '#183030',
          4:     '#1f3a3a',
          teal:  '#2a7a6a',
          teal2: '#3a9a87',
          teal3: '#5ab8a2',
          amber: '#c4843a',
          amber2:'#d99a50',
          amber3:'#f0b870',
        },
      },
      animation: {
        'fade-in':   'fadeIn .2s ease-out',
        'slide-up':  'slideUp .25s ease-out',
        'spin-globe':'spinGlobe 20s linear infinite',
      },
      keyframes: {
        fadeIn:     { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp:    { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        spinGlobe:  { to: { transform: 'rotate(360deg)' } },
      },
    },
  },
  plugins: [],
}

export default config
