export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-base">
      <div
        className="absolute inset-0 -z-10"
        style={{
          background: 'radial-gradient(circle at 50% 0%, rgba(109, 94, 246, 0.08), transparent 60%)',
        }}
      />
      <div className="w-full max-w-md bg-bg-surface border border-border-subtle rounded-2xl p-8 shadow-sm">
        {children}
      </div>
    </div>
  );
}