"use client"

import useSWR from "swr"

export type SessionUser = {
  id: string
  email: string
  name: string
  role: "admin" | "user"
  expiresAt: string | null
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function useSession() {
  const { data, error, isLoading, mutate } = useSWR<{ user: SessionUser | null }>(
    "/api/auth/session",
    fetcher,
  )
  return {
    user: data?.user ?? null,
    isLoading,
    error,
    refresh: mutate,
  }
}
