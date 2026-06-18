"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Bold,
  Italic,
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
} from "lucide-react";

interface RichEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export default function RichEditor({ value, onChange, placeholder }: RichEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Link.configure({ openOnClick: false, autolink: true }),
      Image.configure({ inline: false, allowBase64: false }),
      Placeholder.configure({ placeholder: placeholder ?? "Write your content here…" }),
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
      // Strip Word paste residue
      handlePaste(view, event) {
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

  const insertImage = useCallback(() => {
    if (!editor) return;
    const url = window.prompt("Image URL");
    if (url) editor.chain().focus().setImage({ src: url }).run();
  }, [editor]);

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
          title="Insert image"
        >
          <ImageIcon />
        </Button>
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
