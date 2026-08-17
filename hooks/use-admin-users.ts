"use client"

import useSWR from "swr"

export type AdminUser = {
  id: string
  email: string
  name: string
  role: "admin" | "user"
  status: "active" | "suspended"
  expiresAt: string | null
  createdAt: string
}

const fetcher = (url: string) =>
  fetch(url).then((r) => {
    if (!r.ok) throw new Error("unauthorized")
    return r.json()
  })

export function useAdminUsers() {
  const { data, error, isLoading, mutate } = useSWR<{ users: AdminUser[] }>(
    "/api/admin/users",
    fetcher,
  )
  return {
    users: data?.users ?? [],
    error,
    isLoading,
    refresh: mutate,
  }
}
