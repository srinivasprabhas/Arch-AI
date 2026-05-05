import { EditorShell } from "@/components/editor/editor-shell"

export default function EditorLayout({ children }: { children: React.ReactNode }) {
  return <EditorShell>{children}</EditorShell>
}
