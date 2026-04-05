// Auth pages should NOT show Navbar/Footer — this layout overrides root layout's children wrapper
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
