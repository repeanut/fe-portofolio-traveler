import React, { useEffect, useRef } from "react";

import $ from "jquery";
import "summernote/dist/summernote-lite.min.css";

type SummernoteEditorProps = {
  value: string;
  onChange: (html: string) => void;
  height?: number;
};

const SummernoteEditor: React.FC<SummernoteEditorProps> = ({
  value,
  onChange,
  height = 420,
}) => {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const lastValueRef = useRef<string>(value);
  const isReadyRef = useRef(false);
  const onChangeRef = useRef<SummernoteEditorProps["onChange"]>(onChange);
  const isInternalChangeRef = useRef(false);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    let cancelled = false;
    const el = hostRef.current;

    const setup = async () => {
      (window as unknown as { $?: unknown; jQuery?: unknown }).$ = $ as unknown;
      (window as unknown as { $?: unknown; jQuery?: unknown }).jQuery = $ as unknown;

      if (typeof ($ as unknown as { now?: unknown }).now !== "function") {
        ($ as unknown as { now: () => number }).now = () => Date.now();
      }

      await import("summernote/dist/summernote-lite.min.js");
      if (cancelled || !el) return;
      if (isReadyRef.current) return;

      const $node = $(el) as unknown as {
        summernote: (arg0: unknown, arg1?: unknown) => unknown;
      };

      $node.summernote({
        height,
        focus: false,
        dialogsInBody: true,
        toolbar: [
          ["style", ["style"]],
          ["font", ["bold", "italic", "underline", "strikethrough", "clear"]],
          ["fontsize", ["fontsize"]],
          ["color", ["color"]],
          ["para", ["ul", "ol", "paragraph"]],
          ["insert", ["link", "picture", "video", "table", "hr"]],
          ["view", ["codeview", "help"]],
        ],
        callbacks: {
          onChange: (contents: string) => {
            lastValueRef.current = contents;
            isInternalChangeRef.current = true;
            onChangeRef.current(contents);
          },
          onImageUpload: (files: File[]) => {
            if (!files || files.length === 0) return;
            const file = files[0];
            const reader = new FileReader();
            reader.onload = () => {
              const dataUrl = String(reader.result ?? "");
              try {
                $node.summernote("insertImage", dataUrl);
              } catch {
                // ignore
              }
            };
            reader.readAsDataURL(file);
          },
        },
      });

      $node.summernote("code", lastValueRef.current ?? "");
      isReadyRef.current = true;
    };

    setup();

    return () => {
      cancelled = true;
      if (!el) return;
      const $node = $(el) as unknown as {
        summernote: (arg0: unknown, arg1?: unknown) => unknown;
      };
      try {
        $node.summernote("destroy");
      } catch {
        // ignore
      }
      isReadyRef.current = false;
    };
  }, [height]);

  useEffect(() => {
    if (!hostRef.current) return;
    if (!isReadyRef.current) return;
    if (lastValueRef.current === value) return;

    if (isInternalChangeRef.current) {
      isInternalChangeRef.current = false;
      return;
    }

    const $node = $(hostRef.current) as unknown as {
      summernote: (arg0: unknown, arg1?: unknown) => unknown;
    };

    try {
      $node.summernote("code", value ?? "");
      lastValueRef.current = value ?? "";
    } catch {
      // ignore
    }
  }, [value]);

  return <div ref={hostRef} />;
};

export default SummernoteEditor;
