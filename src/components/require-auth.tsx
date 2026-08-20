import { useQuery } from "@tanstack/react-query";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getSession } from "@/lib/auth";
import { queryKeys } from "@/lib/data";

export function RequireAuth() {
  const location = useLocation();
  const {
    data: session,
    isPending,
    isError,
  } = useQuery({
    queryKey: queryKeys.authSession,
    queryFn: getSession,
  });

  if (isPending) {
    return <div className="p-6 text-sm text-zinc-500">Prüfe Anmeldung...</div>;
  }

  if (isError || !session) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
