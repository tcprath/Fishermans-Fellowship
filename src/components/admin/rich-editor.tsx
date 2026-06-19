"use client";

import { useEditor, EditorContent, Node as TiptapNode, mergeAttributes } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import { useEffect, useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Highlighter,
  Palette,
  Minus,
  Square,
  List,
  ListOrdered,
  Quote,
  Link2,
  Link2Off,
  ImageIcon,
  Undo2,
  Redo2,
  Heading2,
  Heading3,
  Loader2,
  Link as LinkIconLucide,
} from "lucide-react";

// Custom callout node — styled section container
type CalloutVariant = "blue" | "cream" | "gold" | "gray";

const Callout = TiptapNode.create({
  name: "callout",
  group: "block",
  content: "block+",
  defining: true,
  addAttributes() {
    return {
      variant: {
        default: "cream" as CalloutVariant,
        parseHTML: (el) =>
          (el.getAttribute("data-variant") as CalloutVariant) ?? "cream",
        renderHTML: (attrs) => ({
          "data-variant": attrs.variant,
          class: `callout callout-${attrs.variant}`,
        }),
      },
    };
  },
  parseHTML() {
    return [{ tag: "div.callout" }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes), 0];
  },
});

const COLOR_PRESETS = [
  { name: "Ink",   value: "#243746" },
  { name: "Blue",  value: "#33485A" },
  { name: "Gold",  value: "#BD9A5F" },
  { name: "Cream", value: "#F4EDE5" },
  { name: "Red",   value: "#B23A3A" },
  { name: "Green", value: "#3E6B47" },
];

const HIGHLIGHT_PRESETS = [
  { name: "Yellow", value: "#FFF3B0" },
  { name: "Gold",   value: "#E8D7AE" },
  { name: "Blue",   value: "#CFE0EA" },
  { name: "Green",  value: "#D4E5CC" },
  { name: "Pink",   value: "#F4D5D5" },
];

const CALLOUT_VARIANTS: { key: CalloutVariant; label: string; swatch: string }[] = [
  { key: "cream", label: "Cream", swatch: "#F4EDE5" },
  { key: "blue",  label: "Blue",  swatch: "#243746" },
  { key: "gold",  label: "Gold",  swatch: "#BD9A5F" },
  { key: "gray",  label: "Gray",  swatch: "#ECECEC" },
];

function ColorMenu({
  trigger,
  children,
}: {
  trigger: React.ReactNode;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="size-7 rounded inline-flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
      >
        {trigger}
      </button>
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="absolute z-30 mt-1 flex flex-wrap items-center gap-1.5 p-2 rounded-lg border border-border bg-white shadow-lg min-w-[180px]"
        >
          {children}
        </div>
      )}
    </div>
  );
}

interface RichEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  uploadFolder?: "posts" | "devotionals" | "events" | "resources";
}

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

type EditorRef = { setImage: (url: string) => void };

export default function RichEditor({
  value,
  onChange,
  placeholder,
  uploadFolder = "posts",
}: RichEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const editorRef = useRef<EditorRef | null>(null);

  const uploadImageFile = useCallback(
    async (file: File) => {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        toast.error("JPEG, PNG, WebP, or GIF only");
        return;
      }
      if (file.size > MAX_IMAGE_BYTES) {
        toast.error("Image must be under 5 MB");
        return;
      }
      setUploading(true);
      try {
        const ext = file.name.split(".").pop() ?? "jpg";
        const uuid = crypto.randomUUID();
        const path = `${uploadFolder}/inline/${uuid}.${ext}`;
        const supabase = createClient();
        const { error: uploadError } = await supabase.storage
          .from("media")
          .upload(path, file, { contentType: file.type, upsert: false });
        if (uploadError) throw uploadError;
        const { data } = supabase.storage.from("media").getPublicUrl(path);
        editorRef.current?.setImage(data.publicUrl);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Upload failed");
      } finally {
        setUploading(false);
      }
    },
    [uploadFolder]
  );

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Link.configure({ openOnClick: false, autolink: true }),
      Image.configure({ inline: false, allowBase64: false }),
      Placeholder.configure({ placeholder: placeholder ?? "Write your content here…" }),
      Underline,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      Callout,
    ],
    content: value,
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-slate max-w-none focus:outline-none min-h-[240px] p-4 text-[15px]",
      },
      // Strip Word paste residue + intercept pasted images
      handlePaste(view, event) {
        const files = Array.from(event.clipboardData?.files ?? []).filter((f) =>
          f.type.startsWith("image/")
        );
        if (files.length > 0) {
          event.preventDefault();
          files.forEach((f) => void uploadImageFile(f));
          return true;
        }
        const html = event.clipboardData?.getData("text/html");
        if (html && /mso-|MsoNormal|w:WordDocument/i.test(html)) {
          const text = event.clipboardData?.getData("text/plain") ?? "";
          view.dispatch(
            view.state.tr.insertText(text, view.state.selection.from, view.state.selection.to)
          );
          return true;
        }
        return false;
      },
      handleDrop(view, event) {
        const dt = (event as DragEvent).dataTransfer;
        if (!dt) return false;
        const files = Array.from(dt.files).filter((f) => f.type.startsWith("image/"));
        if (files.length === 0) return false;
        event.preventDefault();
        files.forEach((f) => void uploadImageFile(f));
        return true;
      },
    },
  });

  // Sync external value changes (e.g. initial load)
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [editor, value]);

  const setLink = useCallback(() => {
    if (!editor) return;
    const prev = editor.getAttributes("link").href as string;
    const url = window.prompt("URL", prev);
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    }
  }, [editor]);

  // Wire editor ref once mounted
  useEffect(() => {
    editorRef.current = editor
      ? { setImage: (url: string) => editor.chain().focus().setImage({ src: url }).run() }
      : null;
  }, [editor]);

  const insertImage = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const insertImageByUrl = useCallback(() => {
    if (!editor) return;
    const url = window.prompt("Image URL");
    if (url) editor.chain().focus().setImage({ src: url }).run();
  }, [editor]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) void uploadImageFile(file);
    e.target.value = "";
  }

  if (!editor) return null;

  const toolbarBtn = (active: boolean) =>
    `size-7 ${active ? "bg-muted text-foreground" : "text-muted-foreground"}`;

  return (
    <div className="rounded-lg border border-border overflow-hidden bg-white">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 p-2 border-b border-border bg-muted/30">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className={toolbarBtn(editor.isActive("heading", { level: 2 }))}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          title="Heading 2"
        >
          <Heading2 />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className={toolbarBtn(editor.isActive("heading", { level: 3 }))}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          title="Heading 3"
        >
          <Heading3 />
        </Button>
        <div className="w-px h-5 bg-border mx-1" />
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className={toolbarBtn(editor.isActive("bold"))}
          onClick={() => editor.chain().focus().toggleBold().run()}
          title="Bold"
        >
          <Bold />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className={toolbarBtn(editor.isActive("italic"))}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          title="Italic"
        >
          <Italic />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className={toolbarBtn(editor.isActive("underline"))}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          title="Underline"
        >
          <UnderlineIcon />
        </Button>

        {/* Color */}
        <ColorMenu
          trigger={
            <span title="Text color" className="inline-flex items-center justify-center">
              <Palette className="size-3.5" />
            </span>
          }
        >
          {COLOR_PRESETS.map((c) => (
            <button
              key={c.value}
              type="button"
              className="size-5 rounded-full border border-border hover:scale-110 transition-transform"
              style={{ backgroundColor: c.value }}
              title={c.name}
              onClick={() => editor.chain().focus().setColor(c.value).run()}
            />
          ))}
          <button
            type="button"
            className="ml-1 text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground"
            onClick={() => editor.chain().focus().unsetColor().run()}
          >
            Reset
          </button>
        </ColorMenu>

        {/* Highlight */}
        <ColorMenu
          trigger={
            <span title="Highlight" className="inline-flex items-center justify-center">
              <Highlighter className="size-3.5" />
            </span>
          }
        >
          {HIGHLIGHT_PRESETS.map((c) => (
            <button
              key={c.value}
              type="button"
              className="size-5 rounded-md border border-border hover:scale-110 transition-transform"
              style={{ backgroundColor: c.value }}
              title={c.name}
              onClick={() =>
                editor.chain().focus().toggleHighlight({ color: c.value }).run()
              }
            />
          ))}
          <button
            type="button"
            className="ml-1 text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground"
            onClick={() => editor.chain().focus().unsetHighlight().run()}
          >
            Clear
          </button>
        </ColorMenu>

        <div className="w-px h-5 bg-border mx-1" />
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className={toolbarBtn(editor.isActive("bulletList"))}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          title="Bullet list"
        >
          <List />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className={toolbarBtn(editor.isActive("orderedList"))}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          title="Ordered list"
        >
          <ListOrdered />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className={toolbarBtn(editor.isActive("blockquote"))}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          title="Blockquote"
        >
          <Quote />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className={toolbarBtn(false)}
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Insert divider"
        >
          <Minus />
        </Button>

        {/* Callout (section container) */}
        <ColorMenu
          trigger={
            <span title="Section box" className="inline-flex items-center justify-center">
              <Square className="size-3.5" />
            </span>
          }
        >
          {CALLOUT_VARIANTS.map((v) => (
            <button
              key={v.key}
              type="button"
              className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-muted text-xs"
              onClick={() => {
                if (editor.isActive("callout")) {
                  editor.chain().focus().updateAttributes("callout", { variant: v.key }).run();
                } else {
                  editor
                    .chain()
                    .focus()
                    .wrapIn("callout", { variant: v.key })
                    .run();
                }
              }}
            >
              <span
                className="size-3.5 rounded-sm border border-border"
                style={{ backgroundColor: v.swatch }}
              />
              {v.label}
            </button>
          ))}
          {editor.isActive("callout") && (
            <button
              type="button"
              className="ml-1 text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground"
              onClick={() => editor.chain().focus().lift("callout").run()}
            >
              Remove
            </button>
          )}
        </ColorMenu>

        <div className="w-px h-5 bg-border mx-1" />
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className={toolbarBtn(editor.isActive("link"))}
          onClick={setLink}
          title="Link"
        >
          <Link2 />
        </Button>
        {editor.isActive("link") && (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className={toolbarBtn(false)}
            onClick={() => editor.chain().focus().unsetLink().run()}
            title="Remove link"
          >
            <Link2Off />
          </Button>
        )}
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className={toolbarBtn(false)}
          onClick={insertImage}
          disabled={uploading}
          title="Upload image"
        >
          {uploading ? <Loader2 className="animate-spin" /> : <ImageIcon />}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className={toolbarBtn(false)}
          onClick={insertImageByUrl}
          title="Insert image by URL"
        >
          <LinkIconLucide />
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={handleFileChange}
        />
        <div className="w-px h-5 bg-border mx-1" />
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className={toolbarBtn(false)}
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo"
        >
          <Undo2 />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className={toolbarBtn(false)}
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo"
        >
          <Redo2 />
        </Button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
