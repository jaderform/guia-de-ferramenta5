import { NextResponse } from "next/server"
import { removeConnectedAccount } from "@/lib/tiktok-content"

export const runtime = "nodejs"

export async function POST(request: Request) {
  const { openId } = await request.json().catch(() => ({ openId: undefined }))
  if (!openId) {
    return NextResponse.json({ error: "openId obrigatorio" }, { status: 400 })
  }
  await removeConnectedAccount(openId)
  return NextResponse.json({ ok: true })
}
