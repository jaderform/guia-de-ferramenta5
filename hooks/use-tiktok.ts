"use client"

import useSWR from "swr"
import type { BusinessCenter, TikTokAdvertiser } from "@/lib/tiktok-api"

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    const err = new Error(body.error || "Erro na requisicao") as Error & { status?: number }
    err.status = res.status
    throw err
  }
  return res.json()
}

export function useTikTokStatus() {
  const { data, isLoading, mutate } = useSWR<{ connected: boolean }>(
    "/api/tiktok/status",
    fetcher,
  )
  return {
    connected: data?.connected ?? false,
    isLoading,
    refresh: mutate,
  }
}

export function useAdvertisers(enabled: boolean) {
  const { data, error, isLoading, mutate } = useSWR<{ advertisers: TikTokAdvertiser[] }>(
    enabled ? "/api/tiktok/advertisers" : null,
    fetcher,
  )
  return {
    advertisers: data?.advertisers ?? [],
    error: error as (Error & { status?: number }) | undefined,
    isLoading,
    refresh: mutate,
  }
}

export function useBusinessCenters(enabled: boolean) {
  const { data, error, isLoading, mutate } = useSWR<{ businessCenters: BusinessCenter[] }>(
    enabled ? "/api/tiktok/business-centers" : null,
    fetcher,
  )
  return {
    businessCenters: data?.businessCenters ?? [],
    error: error as (Error & { status?: number }) | undefined,
    isLoading,
    refresh: mutate,
  }
}

export type ContentAccount = {
  openId: string
  displayName: string
  avatarUrl?: string
  username?: string
}

/** Status/lista das contas de criador conectadas (Content Posting v2). */
export function useContentStatus() {
  const { data, isLoading, mutate } = useSWR<{
    connected: boolean
    count: number
    accounts: ContentAccount[]
  }>("/api/tiktok/content/accounts", fetcher)
  return {
    connected: data?.connected ?? false,
    count: data?.count ?? 0,
    accounts: data?.accounts ?? [],
    isLoading,
    refresh: mutate,
  }
}
