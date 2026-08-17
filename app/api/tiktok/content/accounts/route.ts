import { NextResponse } from "next/server"
import { getConnectedAccounts, toPublicAccount } from "@/lib/tiktok-content"

export const runtime = "nodejs"

export async function GET() {
  const accounts = await getConnectedAccounts()
  return NextResponse.json({
    connected: accounts.length > 0,
    count: accounts.length,
    accounts: accounts.map(toPublicAccount),
  })
}
