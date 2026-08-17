import { NextResponse } from "next/server"
import { getConnectedAccounts, publishVideo } from "@/lib/tiktok-content"

export const runtime = "nodejs"

/**
 * Publica o mesmo video em varias contas de criador em paralelo.
 * Body: { openIds: string[], title, videoUrl, privacyLevel, disableComment, disableDuet, disableStitch }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { openIds, title, videoUrl, privacyLevel } = body as {
      openIds: string[]
      title: string
      videoUrl: string
      privacyLevel: string
    }

    if (!Array.isArray(openIds) || openIds.length === 0) {
      return NextResponse.json({ error: "Selecione ao menos uma conta" }, { status: 400 })
    }
    if (!title?.trim()) {
      return NextResponse.json({ error: "Titulo/legenda obrigatorio" }, { status: 400 })
    }
    if (!videoUrl?.trim()) {
      return NextResponse.json({ error: "URL do video obrigatoria" }, { status: 400 })
    }

    const all = await getConnectedAccounts()
    const targets = all.filter((a) => openIds.includes(a.openId))
    if (targets.length === 0) {
      return NextResponse.json({ error: "Nenhuma conta valida selecionada" }, { status: 400 })
    }

    const results = await Promise.allSettled(
      targets.map((account) =>
        publishVideo(account, {
          title: title.trim(),
          videoUrl: videoUrl.trim(),
          privacyLevel: privacyLevel || "SELF_ONLY",
          disableComment: body.disableComment ?? false,
          disableDuet: body.disableDuet ?? false,
          disableStitch: body.disableStitch ?? false,
        }),
      ),
    )

    const report = results.map((r, i) => ({
      openId: targets[i].openId,
      displayName: targets[i].displayName,
      success: r.status === "fulfilled",
      publishId: r.status === "fulfilled" ? r.value.publish_id : undefined,
      error: r.status === "rejected" ? String(r.reason?.message ?? r.reason) : undefined,
    }))

    return NextResponse.json({
      total: report.length,
      succeeded: report.filter((r) => r.success).length,
      failed: report.filter((r) => !r.success).length,
      results: report,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro ao publicar"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
