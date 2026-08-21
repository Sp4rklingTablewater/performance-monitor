import { useEffect } from "react";
import type { QueryClient } from "@tanstack/react-query";
import { Navigate, RouterProvider, createBrowserRouter } from "react-router-dom";
import { RootLayout } from "@/components/root-layout";
import { RequireAuth } from "@/components/require-auth";
import { LoginPage } from "@/pages/login-page";
import { AthletesPage } from "@/pages/athletes-page";
import { NewAthletePage } from "@/pages/new-athlete-page";
import { AthleteDetailPage } from "@/pages/athlete-detail-page";
import { EditAthletePage } from "@/pages/edit-athlete-page";
import { NewPerformanceTestPage } from "@/pages/new-performance-test-page";
import { EditPerformanceTestPage } from "@/pages/edit-performance-test-page";
import { DeletePerformanceTestPage } from "@/pages/delete-performance-test-page";
import { ComparePage } from "@/pages/compare-page";
import { NotFoundPage } from "@/pages/not-found-page";
import { supabase } from "@/lib/supabase/client";
import { queryKeys } from "@/lib/data";

const router = createBrowserRouter(
  [
    {
      path: "/login",
      element: <LoginPage />,
    },
    {
      element: <RequireAuth />,
      children: [
        {
          element: <RootLayout />,
          children: [
            { path: "/", element: <Navigate to="/athletes" replace /> },
            { path: "/athletes", element: <AthletesPage /> },
            { path: "/athletes/new", element: <NewAthletePage /> },
            { path: "/athletes/:id", element: <AthleteDetailPage /> },
            { path: "/athletes/:id/edit", element: <EditAthletePage /> },
            {
              path: "/athletes/:id/tests/new",
              element: <NewPerformanceTestPage />,
            },
            {
              path: "/athletes/:id/tests/:testId/edit",
              element: <EditPerformanceTestPage />,
            },
            {
              path: "/athletes/:id/tests/:testId/delete",
              element: <DeletePerformanceTestPage />,
            },
            { path: "/compare", element: <ComparePage mode="comparison" /> },
            { path: "/compare/ranking", element: <ComparePage mode="ranking" /> },
            { path: "/compare/development", element: <ComparePage mode="development" /> },
          ],
        },
      ],
    },
    {
      path: "*",
      element: <NotFoundPage />,
    },
  ],
  { basename: import.meta.env.BASE_URL },
);

type AppProps = {
  queryClient: QueryClient;
};

export function App({ queryClient }: AppProps) {
  useEffect(() => {
    const subscription = supabase.auth.onAuthStateChange(() => {
      queryClient.invalidateQueries({ queryKey: queryKeys.authSession });
    });

    return () => {
      subscription.data.subscription.unsubscribe();
    };
  }, [queryClient]);

  return <RouterProvider router={router} />;
}
