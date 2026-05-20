import { clerkClient } from "@clerk/nextjs/server"

export interface ClerkUserInfo {
  email: string
  displayName?: string
  imageUrl?: string
}

export async function enrichEmails(emails: string[]): Promise<Map<string, ClerkUserInfo>> {
  const map = new Map<string, ClerkUserInfo>()
  const unique = Array.from(new Set(emails.map((e) => e.toLowerCase()))).filter(Boolean)
  if (unique.length === 0) return map

  try {
    const client = await clerkClient()
    const { data } = await client.users.getUserList({
      emailAddress: unique,
      limit: Math.max(unique.length, 10),
    })

    for (const user of data) {
      const fullName = user.fullName ?? [user.firstName, user.lastName].filter(Boolean).join(" ")
      const displayName = fullName.trim() !== "" ? fullName.trim() : undefined

      for (const addr of user.emailAddresses) {
        const key = addr.emailAddress.toLowerCase()
        if (!unique.includes(key)) continue
        map.set(key, {
          email: addr.emailAddress,
          displayName,
          imageUrl: user.imageUrl || undefined,
        })
      }
    }
  } catch {
    // Clerk lookup is best-effort. On failure, fall back to email-only rows.
  }

  return map
}
