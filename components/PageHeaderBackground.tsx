export function PageHeaderBackground() {
  return (
    <>
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-transparent -z-10 pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-grid-white/[0.02] bg-[size:32px_32px] -z-10 pointer-events-none" />
    </>
  );
}
