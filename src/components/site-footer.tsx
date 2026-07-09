export function SiteFooter() {
  return (
      <footer className="mt-24 border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-6 py-10 md:flex-row md:items-center">
          <div>
            <div className="font-display text-xl">Lumihaven</div>
            <p className="mt-1 text-sm text-muted-foreground">
              A quiet marketplace for considered stays.
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Lumihaven. All rooms belong to their hosts.
          </p>
        </div>
      </footer>
  );
}