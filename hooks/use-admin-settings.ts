"use client"

import useSWR from "swr"

export type SettingKey =
  | "tiktokAppId"
  | "tiktokAppSecret"
  | "tiktokClientKey"
  | "tiktokClientSecret"
  | "tiktokRedirectUri"

export type SettingStatus = {
  key: SettingKey
  configured: boolean
  source: "custom" | "env" | "none"
  preview: string | null
}

const fetcher = (url: string) =>
  fetch(url).then((r) => {
    if (!r.ok) throw new Error("unauthorized")
    return r.json()
  })

export function useAdminSettings() {
  const { data, error, isLoading, mutate } = useSWR<{ settings: SettingStatus[] }>(
    "/api/admin/settings",
    fetcher,
  )
  return {
    settings: data?.settings ?? [],
    error,
    isLoading,
    refresh: mutate,
  }
}
