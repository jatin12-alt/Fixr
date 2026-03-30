import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: 'hsl(var(--card))',
        muted: 'hsl(var(--muted))',
        'muted-foreground': 'hsl(var(--muted-foreground))',
        primary: 'hsl(var(--primary))',
        border: 'hsl(var(--border))',
        "neon-blue":   "#00d4ff",
        "neon-green":  "#00ff88",
        "neon-purple": "#8b5cf6",
        "neon-pink":   "#ff006e",
        "cyber-dark":  "#0a0a0f",
        "cyber-darker":"#050508",
        "cyber-card":  "#0f0f1a",
      },
      fontFamily: {
        display: ["var(--font-orbitron)", "monospace"],
        sans:    ["var(--font-inter)", "ui-sans-serif", "system-ui"],
        mono:    ["JetBrains Mono", "monospace"],
      },
      backgroundImage: {
        "cyber-gradient": "linear-gradient(135deg, #0a0a0f 0%, #050508 100%)",
        "neon-gradient":  "linear-gradient(135deg, #00d4ff 0%, #8b5cf6 100%)",
      },
      boxShadow: {
        "neon-blue":   "0 0 20px rgba(0, 212, 255, 0.5)",
        "neon-green":  "0 0 20px rgba(0, 255, 136, 0.5)",
        "neon-purple": "0 0 20px rgba(139, 92, 246, 0.5)",
      },
      width: {
        'confidence': 'var(--confidence-width)',
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float":      "float 6s ease-in-out infinite",
        "glow":       "glow 2s ease-in-out infinite alternate",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":      { transform: "translateY(-20px)" },
        },
        glow: {
          "0%":   { boxShadow: "0 0 5px rgba(0, 212, 255, 0.2)" },
          "100%": { boxShadow: "0 0 30px rgba(0, 212, 255, 0.8)" },
        },
      },
    },
  },
  plugins: [],
  darkMode: "class",
};
export default config;
