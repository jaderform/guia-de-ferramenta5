import "server-only"

/**
 * Normaliza o valor configurado como redirect_uri do OAuth do TikTok.
 *
 * Aceita tanto o endereco "limpo" (ex.: https://guiadeferramenta.com) quanto a
 * URL de autorizacao inteira colada por engano no painel/variavel de ambiente
 * (ex.: https://business-api.tiktok.com/portal/auth?...&redirect_uri=https%3A%2F%2F...).
 * Nesse ultimo caso, extrai automaticamente o redirect_uri aninhado.
 *
 * Se nada valido for encontrado, faz fallback para a origem da requisicao
 * (o proprio dominio do app), garantindo que o parametro nunca fique ausente.
 */
export function resolveRedirectUri(rawValue: string | undefined, origin?: string): string | undefined {
  const cleaned = extractClean(rawValue)
  if (cleaned) return cleaned
  return origin && origin.trim() ? origin.trim() : undefined
}

function extractClean(raw?: string): string | undefined {
  if (!raw) return undefined
  const value = raw.trim()
  if (!value) return undefined
  try {
    const url = new URL(value)
    if (url.protocol !== "http:" && url.protocol !== "https:") return undefined

    // Caso colem a URL de autorizacao inteira: extrai o redirect_uri aninhado.
    const nested = url.searchParams.get("redirect_uri")
    if (nested) return extractClean(nested)

    // URL de autorizacao sem redirect_uri aninhado: nao da pra recuperar nada.
    if (value.includes("portal/auth") || value.includes("/auth/authorize")) {
      return undefined
    }

    return value
  } catch {
    return undefined
  }
}
