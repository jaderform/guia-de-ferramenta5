import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { isAccessValid } from "@/lib/user-store"

export async function GET() {
  const user = await getCurrentUser()
  if (!user || !isAccessValid(user)) {
    return NextResponse.json({ user: null })
  }
  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      expiresAt: user.expiresAt,
    },
  })
}
