function App() {
  return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="max-w-md w-full rounded-2xl border border-border bg-card p-8 text-center shadow-lg">
          <p className="text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">
            Tailwind check
          </p>
          <h1 className="mt-4 font-display text-3xl text-foreground">
            If this looks styled, you're good.
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Rounded card, spacing, custom colors, and a shadow should all be visible.
          </p>
          <button className="mt-6 rounded-xl bg-accent px-5 py-2.5 text-xs font-medium uppercase tracking-widest text-accent-foreground transition hover:opacity-90">
            Accent button
          </button>
          <div className="mt-6 flex justify-center gap-2">
            <span className="h-3 w-3 rounded-full bg-red-500"></span>
            <span className="h-3 w-3 rounded-full bg-yellow-500"></span>
            <span className="h-3 w-3 rounded-full bg-green-500"></span>
          </div>
        </div>
      </div>
  );
}

export default App;