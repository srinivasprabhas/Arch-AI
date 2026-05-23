import { auth } from "@clerk/nextjs/server"
import { put } from "@vercel/blob"
import { revalidatePath } from "next/cache"
import { NextResponse } from "next/server"
import { z } from "zod"

import { prisma } from "@/lib/prisma"
import {
  cloneTemplate,
  generateTemplateProjectName,
  getTemplate,
  sanitizeTemplateData,
} from "@/lib/templates"

const RequestSchema = z.object({
  templateId: z.string().min(1, "templateId is required"),
})

/**
 * POST /api/projects/from-template
 *
 * Atomically creates a new project from a starter template, the way Figma,
 * FigJam, Miro, and Notion do it:
 *
 *  1) Resolve the template from the immutable in-process registry.
 *  2) Compute a non-colliding project name for the requesting user.
 *  3) Insert the `Project` row (no `canvasJsonPath` yet).
 *  4) Deep-clone the template (fresh ids via `cloneTemplate`) and write
 *     the canvas snapshot to the SAME blob path the autosave PUT route
 *     uses (`canvas/{projectId}.json`). One canvas storage layout in the
 *     entire app — never two.
 *  5) Patch the Project row with the blob URL.
 *
 * On any failure during steps 4–5 the half-created Project row is rolled
 * back so a user is never left with an empty workspace that points at no
 * canvas. From the editor's perspective the new project is indistinguishable
 * from one the user manually saved — it loads through the same blob-restore
 * effect every other project uses. No URL query params, no special-case
 * client code, no fallback paths.
 *
 * Failure modes:
 *  - 401: unauthenticated
 *  - 400: invalid body / non-JSON
 *  - 404: unknown template id
 *  - 500: blob/DB write failed (project rolled back)
 */
export async function POST(request: Request) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Body must be valid JSON" }, { status: 400 })
  }

  const parsed = RequestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 },
    )
  }

  const template = getTemplate(parsed.data.templateId)
  if (!template) {
    return NextResponse.json({ error: "Template not found" }, { status: 404 })
  }

  // Compute a non-colliding name from existing owned projects. Mirrors the
  // `Untitled scene N` algorithm from `CreateProjectButton` so the two
  // create paths feel consistent.
  const existing = await prisma.project.findMany({
    where: { ownerId: userId },
    select: { name: true },
  })
  const name = generateTemplateProjectName(
    template,
    existing.map((p) => p.name),
  )

  // Insert the row first so we can use the generated id as the deterministic
  // blob pathname (matches the autosave PUT route's `canvas/{projectId}.json`).
  const project = await prisma.project.create({
    data: { ownerId: userId, name },
  })

  try {
    const cloned = cloneTemplate(template, { idPrefix: template.id })
    const sanitized = sanitizeTemplateData(cloned)
    const payload = JSON.stringify({
      nodes: sanitized.nodes,
      edges: sanitized.edges,
    })

    const blob = await put(`canvas/${project.id}.json`, payload, {
      access: "private",
      contentType: "application/json",
      allowOverwrite: true,
      addRandomSuffix: false,
    })

    await prisma.project.update({
      where: { id: project.id },
      data: { canvasJsonPath: blob.url },
    })
  } catch (err) {
    // Roll back the project so a failed seed doesn't leave an empty
    // workspace pointing at no canvas. Best-effort — if delete also fails
    // we still surface the original error to the client.
    await prisma.project
      .delete({ where: { id: project.id } })
      .catch((deleteErr) => {
        console.error("from-template rollback failed", deleteErr)
      })
    console.error("from-template seed failed", err)
    return NextResponse.json(
      { error: "Failed to seed canvas from template" },
      { status: 500 },
    )
  }

  // Invalidate the dashboard / projects RSC cache so the new project
  // appears on next soft-navigation back to those listings — without this,
  // Next.js's client-side router cache would serve a stale render and the
  // user would have to hard-refresh to see the new card.
  revalidatePath("/dashboard")
  revalidatePath("/projects")

  return NextResponse.json(
    {
      id: project.id,
      name: project.name,
      templateId: template.id,
      templateVersion: template.version,
    },
    { status: 201 },
  )
}
