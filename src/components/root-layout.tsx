import { Outlet } from "react-router-dom";
import { AppShell } from "@/components/app-shell";

export function RootLayout() {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}
