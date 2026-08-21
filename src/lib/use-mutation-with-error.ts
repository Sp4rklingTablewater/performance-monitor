import { useState } from "react";
import { useMutation, type UseMutationOptions, type UseMutationResult } from "@tanstack/react-query";

type UseMutationWithErrorOptions<TData, TVariables = void> = Omit<
  UseMutationOptions<TData, Error, TVariables>,
  "onMutate" | "onError"
> & {
  /**
   * Anzeigetext, falls der geworfene Fehler kein `Error`-Objekt ist. In der
   * Praxis werfen `mutations.ts`/`forms.ts` immer echte `Error`s – das ist
   * nur die letzte Absicherung gegen z. B. einen geworfenen String.
   */
  errorFallback: string;
};

type UseMutationWithErrorResult<TData, TVariables = void> = {
  mutation: UseMutationResult<TData, Error, TVariables>;
  errorMessage: string | null;
};

/**
 * Bündelt die in jeder Schreib-Seite (Athlet:in/Leistungstest anlegen,
 * bearbeiten, löschen) identisch wiederholte Fehlerbehandlung: Anzeigetext
 * aus dem Fehler ableiten und vor jedem neuen Versuch zurücksetzen.
 *
 * Das Zurücksetzen passiert hier in `onMutate` (läuft synchron bei jedem
 * `mutation.mutate()`-Aufruf, noch vor der `mutationFn`) statt – wie vorher
 * an 5 Stellen dupliziert – einzeln in jedem Submit-Handler. Eine Seite, die
 * das Zurücksetzen vor dem Mutieren vergisst, würde sonst nach einem
 * erneuten Versuch eine veraltete Fehlermeldung fälschlich stehen lassen.
 *
 * `onMutate`/`onError` sind bewusst NICHT von außen überschreibbar (siehe
 * `Omit` oben): Bisher braucht keine der Schreib-Seiten eigene Logik dort,
 * ein generischer Passthrough beider Callbacks würde die Typen dieses Hooks
 * unnötig verkomplizieren (React Querys `onMutate`-Rückgabewert fließt
 * generisch in `onError`/`onSuccess` als Kontext ein).
 */
export function useMutationWithError<TData, TVariables = void>({
  errorFallback,
  ...options
}: UseMutationWithErrorOptions<TData, TVariables>): UseMutationWithErrorResult<TData, TVariables> {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const mutation = useMutation<TData, Error, TVariables>({
    ...options,
    onMutate: () => {
      setErrorMessage(null);
    },
    onError: (error) => {
      setErrorMessage(error instanceof Error ? error.message : errorFallback);
    },
  });

  return { mutation, errorMessage };
}






