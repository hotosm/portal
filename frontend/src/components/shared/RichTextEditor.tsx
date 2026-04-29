import DOMPurify, { type Config as DOMPurifyConfig } from "dompurify";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

// ─── Shared sanitizer ────────────────────────────────────────────────────────

const PURIFY_CONFIG: DOMPurifyConfig = {
  ALLOWED_TAGS: [
    "p",
    "h3",
    "h4",
    "h5",
    "strong",
    "em",
    "u",
    "ul",
    "ol",
    "li",
    "br",
    "a",
  ],
  ALLOWED_ATTR: ["href"],
  FORCE_BODY: true,
};

/** Sanitize RTE HTML to the allowed tag/attribute allowlist. */
export function sanitizeRteHtml(html: string): string {
  return DOMPurify.sanitize(html, PURIFY_CONFIG);
}

// ─── Display component ────────────────────────────────────────────────────────

interface RichTextContentProps {
  html: string;
  className?: string;
}

export function RichTextContent({
  html,
  className = "",
}: RichTextContentProps) {
  const safe = sanitizeRteHtml(html);
  return (
    <div
      className={`rte-editor ${className}`}
      dangerouslySetInnerHTML={{ __html: safe }}
    />
  );
}

const MAX_CHARS = 10_000;

// ─── Toolbar button ──────────────────────────────────────────────────────────

interface ToolbarButtonProps {
  onClick: () => void;
  isActive?: boolean;
  title: string;
  children: React.ReactNode;
}

function ToolbarButton({
  onClick,
  isActive,
  title,
  children,
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`w-7 h-7 flex items-center justify-center rounded text-sm transition-colors ${
        isActive
          ? "bg-hot-red-100 text-hot-red-600"
          : "text-hot-gray-600 hover:bg-hot-gray-100"
      }`}
    >
      {children}
    </button>
  );
}

// ─── Editor component ─────────────────────────────────────────────────────────

interface RichTextEditorProps {
  id?: string;
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

function RichTextEditor({
  id,
  value,
  onChange,
  placeholder = "Write something…",
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Lock headings to h3/h4/h5 only; h1/h2/h6 are stripped on parse/paste.
        heading: { levels: [3, 4, 5] },
        // Disable elements outside the allowed set.
        blockquote: false,
        code: false,
        codeBlock: false,
        strike: false,
        horizontalRule: false,
      }),
      Underline,
      Placeholder.configure({ placeholder }),
      Link.configure({
        openOnClick: false,
        // Force safe link attributes so stored HTML never opens without referrer protection.
        HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
        // Block non-http(s) schemes (javascript:, data:, etc.) at the extension level.
        validate: (href) => /^https?:\/\//i.test(href),
      }),
    ],
    editorProps: {
      attributes: {
        ...(id ? { id } : {}),
        class: "outline-none",
      },
      // Sanitize HTML on paste before ProseMirror parses it.
      transformPastedHTML(html: string) {
        return sanitizeRteHtml(html);
      },
    },
    content: value,
    onUpdate({ editor }) {
      if (editor.isEmpty) {
        onChange("");
        return;
      }
      // Enforce plain-text length cap to prevent oversized payloads.
      if (editor.getText().length > MAX_CHARS) return;
      onChange(sanitizeRteHtml(editor.getHTML()));
    },
  });

  if (!editor) return null;

  const run = (fn: (c: ReturnType<typeof editor.chain>) => unknown) => () =>
    fn(editor.chain().focus());

  function handleLinkToggle() {
    if (editor.isActive("link")) {
      editor.chain().focus().unsetLink().run();
      return;
    }
    const url = window.prompt("URL");
    if (!url) return;
    const href = url.startsWith("http") ? url : `https://${url}`;
    editor.chain().focus().setLink({ href }).run();
  }

  const charCount = editor.getText().length;
  const nearLimit = charCount > MAX_CHARS * 0.9;

  return (
    <>
      <div className="border border-hot-gray-300 rounded-lg overflow-hidden focus-within:border-hot-red-500 transition-colors">
        <div className="flex flex-wrap gap-xs p-xs border-b border-hot-gray-200 bg-hot-gray-50">
          <ToolbarButton
            onClick={run((c) => c.toggleBold().run())}
            isActive={editor.isActive("bold")}
            title="Bold"
          >
            <strong>B</strong>
          </ToolbarButton>
          <ToolbarButton
            onClick={run((c) => c.toggleItalic().run())}
            isActive={editor.isActive("italic")}
            title="Italic"
          >
            <em>I</em>
          </ToolbarButton>
          <ToolbarButton
            onClick={run((c) => c.toggleUnderline().run())}
            isActive={editor.isActive("underline")}
            title="Underline"
          >
            <span style={{ textDecoration: "underline" }}>U</span>
          </ToolbarButton>

          <div className="w-px bg-hot-gray-200 mx-xs self-stretch" />

          <ToolbarButton
            onClick={run((c) => c.toggleHeading({ level: 3 }).run())}
            isActive={editor.isActive("heading", { level: 3 })}
            title="Heading 1"
          >
            <span className="font-bold text-xs">H1</span>
          </ToolbarButton>
          <ToolbarButton
            onClick={run((c) => c.toggleHeading({ level: 4 }).run())}
            isActive={editor.isActive("heading", { level: 4 })}
            title="Heading 2"
          >
            <span className="font-bold text-xs">H2</span>
          </ToolbarButton>
          <ToolbarButton
            onClick={run((c) => c.toggleHeading({ level: 5 }).run())}
            isActive={editor.isActive("heading", { level: 5 })}
            title="Heading 3"
          >
            <span className="font-bold text-xs">H3</span>
          </ToolbarButton>

          <div className="w-px bg-hot-gray-200 mx-xs self-stretch" />

          <ToolbarButton
            onClick={run((c) => c.toggleBulletList().run())}
            isActive={editor.isActive("bulletList")}
            title="Bullet list"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 16 16"
              fill="currentColor"
              aria-hidden="true"
            >
              <circle cx="2" cy="3.5" r="1.5" />
              <rect x="5" y="2.5" width="10" height="2" rx="1" />
              <circle cx="2" cy="8" r="1.5" />
              <rect x="5" y="7" width="10" height="2" rx="1" />
              <circle cx="2" cy="12.5" r="1.5" />
              <rect x="5" y="11.5" width="10" height="2" rx="1" />
            </svg>
          </ToolbarButton>
          <ToolbarButton
            onClick={run((c) => c.toggleOrderedList().run())}
            isActive={editor.isActive("orderedList")}
            title="Ordered list"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 16 16"
              fill="currentColor"
              aria-hidden="true"
            >
              <text x="0" y="5" fontSize="6" fontFamily="monospace">
                1.
              </text>
              <rect x="6" y="3" width="9" height="2" rx="1" />
              <text x="0" y="9.5" fontSize="6" fontFamily="monospace">
                2.
              </text>
              <rect x="6" y="7.5" width="9" height="2" rx="1" />
              <text x="0" y="14" fontSize="6" fontFamily="monospace">
                3.
              </text>
              <rect x="6" y="12" width="9" height="2" rx="1" />
            </svg>
          </ToolbarButton>

          <div className="w-px bg-hot-gray-200 mx-xs self-stretch" />

          <ToolbarButton
            onClick={handleLinkToggle}
            isActive={editor.isActive("link")}
            title={editor.isActive("link") ? "Remove link" : "Add link"}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 16 16"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M6.4 9.6a3.2 3.2 0 0 0 4.53.01l1.6-1.6a3.2 3.2 0 0 0-4.52-4.52L7.1 4.4a.8.8 0 1 0 1.13 1.13l.91-.91a1.6 1.6 0 0 1 2.26 2.26l-1.6 1.6a1.6 1.6 0 0 1-2.27 0 .8.8 0 0 0-1.13 1.13Z" />
              <path d="M9.6 6.4a3.2 3.2 0 0 0-4.53-.01l-1.6 1.6a3.2 3.2 0 0 0 4.52 4.52l.91-.91a.8.8 0 1 0-1.13-1.13l-.91.91a1.6 1.6 0 0 1-2.26-2.26l1.6-1.6a1.6 1.6 0 0 1 2.27 0 .8.8 0 0 0 1.13-1.13Z" />
            </svg>
          </ToolbarButton>

          <div className="ml-auto flex items-center pr-xs">
            <span
              className={`text-xs ${nearLimit ? "text-hot-red-500" : "text-hot-gray-400"}`}
            >
              {charCount}/{MAX_CHARS}
            </span>
          </div>
        </div>
        <div className="rte-editor">
          <EditorContent
            editor={editor}
            className="px-md py-sm text-base min-h-[5rem]"
          />
        </div>
      </div>
    </>
  );
}

export default RichTextEditor;
