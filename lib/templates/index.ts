import type { StarterTemplate } from "@/types/template"

import { STARTER_TEMPLATES } from "./templates"

/**
 * O(1) lookup by template id, built lazily on first access. The registry
 * is intentionally a `Map` rather than a plain object so future sources
 * (org templates, AI-generated, marketplace) can populate it at boot
 * without colliding with the literal-key object shape.
 */
const TEMPLATE_REGISTRY: ReadonlyMap<string, StarterTemplate> = new Map(
  STARTER_TEMPLATES.map((template) => [template.id, template]),
)

/** Returns the immutable template with the given id, or `null` if unknown. */
export function getTemplate(id: string): StarterTemplate | null {
  return TEMPLATE_REGISTRY.get(id) ?? null
}

/** All visible templates, in registration order. Use for gallery rendering. */
export function listTemplates(): readonly StarterTemplate[] {
  return STARTER_TEMPLATES
}

export { STARTER_TEMPLATES } from "./templates"
export {
  cloneTemplate,
  generateTemplateProjectName,
  sanitizeTemplateData,
  type ClonedTemplate,
  type CloneTemplateOptions,
} from "./template-utils"
