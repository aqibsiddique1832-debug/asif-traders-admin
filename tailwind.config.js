/** @type {import('tailwindcss').Config} */
// ────────────────────────────────────────────────────────────
// ASIF TRADERS — Premium Enterprise SaaS Design System
// Part 1A: Design Principles Foundation
// 8pt spacing · Inter font · premium radius scale · 5 breakpoints
// ────────────────────────────────────────────────────────────

export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      // ─── 8pt Spacing Scale ─────────────────────────────
      // Default Tailwind: 0, 0.5(2), 1(4), 1.5(6), 2(8), 2.5(10),
      // 3(12), 3.5(14), 4(16), 5(20), 6(24), 7(28), 8(32), 9(36),
      // 10(40), 12(48), 14(56), 16(64), 20(80), 24(96), 28(112)
      // Adding explicit 8pt scale references
      spacing: {
        '4.5': '1.125rem',  // 18px
        '5.5': '1.375rem',  // 22px
        '7.5': '1.875rem',  // 30px
        '13':   '3.25rem',  // 52px
        '15':   '3.75rem',  // 60px
        '17':   '4.25rem',  // 68px
        '18':   '4.5rem',   // 72px - topbar height
        '72':   '18rem',    // 288px - sidebar expanded
        '80':   '20rem',    // 320px - sidebar mobile
      },

      // ─── Border Radius (Premium Scale) ───────────────
      // Buttons: 10px · Inputs: 12px · Cards: 16px · Modals: 20px · Large: 24px
      borderRadius: {
        'none': '0',
        'sm':   '0.25rem',  // 4px
        'DEFAULT': '0.375rem',  // 6px
        'md':   '0.5rem',   // 8px
        'lg':   '0.625rem', // 10px - buttons
        'xl':   '0.75rem',  // 12px - inputs
        '2xl':  '1rem',     // 16px - cards
        '3xl':  '1.25rem',  // 20px - modals
        '4xl':  '1.5rem',   // 24px - large containers
        'pill': '9999px',
      },

      // ─── Typography ───────────────────────────────────
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'monospace'],
      },
      fontSize: {
        // Display
        '5xl': ['3rem',     { lineHeight: '1.1',   letterSpacing: '-0.03em' }],
        '4xl': ['2.25rem',  { lineHeight: '1.15',  letterSpacing: '-0.025em' }],
        // Page Title
        '3xl': ['1.875rem', { lineHeight: '1.2',   letterSpacing: '-0.02em' }],
        // Section Title
        '2xl': ['1.5rem',   { lineHeight: '1.3',   letterSpacing: '-0.015em' }],
        // Card Title
        'xl':  ['1.25rem',  { lineHeight: '1.4',   letterSpacing: '-0.01em' }],
        // Body Large
        'lg':  ['1rem',     { lineHeight: '1.5' }],
        // Body
        'base':['0.875rem', { lineHeight: '1.5' }],  // 14px - default body
        // Small Text
        'sm':  ['0.8125rem',{ lineHeight: '1.4' }],
        // Caption
        'xs':  ['0.75rem',  { lineHeight: '1.4' }],
        '2xs': ['0.6875rem',{ lineHeight: '1.3', letterSpacing: '0.025em' }],
      },
      fontWeight: {
        thin: '100',
        extralight: '200',
        light: '300',
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        extrabold: '800',
      },
      fontFeatureSettings: {
        'cv11': '"cv11", "ss01"',
        'ss01': '"ss01"',
        'tnum': '"tnum"',
      },

      // ─── Color System ─────────────────────────────────
      // Per Part 1A: Primary (Dark Charcoal) + Accent (one premium)
      // + Pure White, Very Light Gray, Light Gray borders,
      // Medium Gray secondary text, Light Gray muted
      colors: {
        // Accent — premium, used sparingly for primary actions
        accent: {
          DEFAULT: '#F97316',
          50:  '#FFF7ED',
          100: '#FFEDD5',
          200: '#FED7AA',
          300: '#FDBA74',
          400: '#FB923C',
          500: '#F97316',
          600: '#EA580C',
          700: '#C2410C',
          800: '#9A3412',
          900: '#7C2D12',
        },
        // Neutral scale (Dark Charcoal text → White surface)
        ink: {
          DEFAULT: '#0F172A',
          50:  '#F8FAFC',  // Page background (very light gray)
          100: '#F1F5F9',  // Subtle bg
          150: '#E8EEF5',
          200: '#E2E8F0',  // Borders
          300: '#CBD5E1',  // Strong borders
          400: '#94A3B8',  // Disabled/muted
          500: '#64748B',  // Secondary text
          600: '#475569',  // Strong secondary
          700: '#334155',  // Headings
          800: '#1E293B',  // Strong headings
          900: '#0F172A',  // Primary text (dark charcoal)
        },
        // Status colors (used in badges, alerts, etc.)
        success: {
          DEFAULT: '#10B981',
          subtle: '#D1FAE5',
          50: '#ECFDF5',
          100: '#D1FAE5',
          500: '#10B981',
          600: '#059669',
          700: '#047857',
        },
        warning: {
          DEFAULT: '#F59E0B',
          subtle: '#FEF3C7',
          50: '#FFFBEB',
          100: '#FEF3C7',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
        },
        danger: {
          DEFAULT: '#EF4444',
          subtle: '#FEE2E2',
          50: '#FEF2F2',
          100: '#FEE2E2',
          500: '#EF4444',
          600: '#DC2626',
          700: '#B91C1C',
        },
        info: {
          DEFAULT: '#3B82F6',
          subtle: '#DBEAFE',
          50: '#EFF6FF',
          100: '#DBEAFE',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
        },
        // Surfaces
        surface: {
          DEFAULT: '#FFFFFF',  // Cards
          subtle: '#FAFBFC',   // Page bg
          muted: '#F8FAFC',    // Subtle sections
        },
        // Legacy aliases (so existing code doesn't break)
        primary: {
          DEFAULT: '#F97316',
          dark: '#EA580C',
          light: '#FB923C',
        },
        secondary: {
          DEFAULT: '#1E293B',
          dark: '#0F172A',
          light: '#334155',
        },
      },

      // ─── Box Shadows (Premium Layered) ───────────────
      boxShadow: {
        'xs':  '0 1px 1px 0 rgb(15 23 42 / 0.04)',
        'sm':  '0 1px 2px 0 rgb(15 23 42 / 0.05)',
        'DEFAULT': '0 1px 3px 0 rgb(15 23 42 / 0.05), 0 1px 2px -1px rgb(15 23 42 / 0.04)',
        'md':  '0 4px 6px -1px rgb(15 23 42 / 0.05), 0 2px 4px -2px rgb(15 23 42 / 0.04)',
        'lg':  '0 10px 15px -3px rgb(15 23 42 / 0.06), 0 4px 6px -4px rgb(15 23 42 / 0.04)',
        'xl':  '0 20px 25px -5px rgb(15 23 42 / 0.08), 0 8px 10px -6px rgb(15 23 42 / 0.04)',
        '2xl': '0 25px 50px -12px rgb(15 23 42 / 0.18)',
        'inner-soft': 'inset 0 1px 0 0 rgb(255 255 255 / 0.04)',
        'focus-accent': '0 0 0 4px rgb(249 115 22 / 0.18)',
        'panel': '0 1px 0 0 rgb(15 23 42 / 0.04), 0 4px 16px -4px rgb(15 23 42 / 0.05)',
        'popover': '0 12px 24px -4px rgb(15 23 42 / 0.10), 0 4px 8px -2px rgb(15 23 42 / 0.04)',
        'modal': '0 24px 48px -12px rgb(15 23 42 / 0.20)',
      },

      // ─── Transitions (Elegant Curves) ─────────────────
      transitionTimingFunction: {
        'ease-out-quart': 'cubic-bezier(0.25, 1, 0.5, 1)',
        'ease-out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'ease-in-out-quart': 'cubic-bezier(0.76, 0, 0.24, 1)',
      },
      transitionDuration: {
        '250': '250ms',
        '350': '350ms',
      },

      // ─── Animations (Subtle, Professional) ───────────
      animation: {
        'fade-in':   'fadeIn 200ms cubic-bezier(0.16, 1, 0.3, 1) both',
        'fade-up':   'fadeUp 300ms cubic-bezier(0.16, 1, 0.3, 1) both',
        'slide-in':  'slideIn 250ms cubic-bezier(0.16, 1, 0.3, 1) both',
        'slide-right': 'slideRight 250ms cubic-bezier(0.16, 1, 0.3, 1) both',
        'scale-in':  'scaleIn 200ms cubic-bezier(0.16, 1, 0.3, 1) both',
        'shimmer':   'shimmer 1.8s linear infinite',
        'pulse-soft': 'pulseSoft 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { transform: 'translateY(-8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideRight: {
          '0%': { transform: 'translateX(-12px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.96)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.65' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },

      // ─── Background Patterns ──────────────────────────
      backgroundImage: {
        'gradient-accent': 'linear-gradient(135deg, #FB923C 0%, #F97316 50%, #EA580C 100%)',
        'gradient-soft':   'linear-gradient(180deg, #FAFBFC 0%, #F8FAFC 100%)',
        'shimmer-gradient': 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%)',
      },

      // ─── Touch Targets (Accessibility) ───────────────
      minHeight: {
        'touch': '44px',  // 44x44 minimum touch target
      },
      minWidth: {
        'touch': '44px',
      },
    },
  },
  plugins: [],
};
