@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Outfit:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700&display=swap');
@import "tailwindcss";

@theme {
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
  --font-display: "Outfit", sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, SFMono-Regular, monospace;
}

@layer base {
  body {
    @apply bg-[#0A0A0B] text-slate-200 antialiased;
  }
}

@layer components {
  .glass-panel {
    @apply bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl;
  }
  
  .neo-card {
    @apply bg-[#121214] border border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:border-white/10 transition-all duration-300;
  }

  .text-gradient {
    @apply bg-clip-text text-transparent bg-gradient-to-br from-white via-white to-white/40;
  }
}
