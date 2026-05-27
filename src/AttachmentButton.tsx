import { useRef, type ChangeEvent } from "react";

function formatLabel(files: string[], emptyLabel: string): string {
  if (files.length === 0) return emptyLabel;
  if (files.length === 1) {
    const name = files[0];
    return name.length > 12 ? `${name.slice(0, 10)}…` : name;
  }
  return `${files.length} files`;
}

type Props = {
  files: string[];
  onFilesChange: (files: string[]) => void;
  emptyLabel?: string;
  multiple?: boolean;
  accept?: string;
  id?: string;
};

export function AttachmentButton({
  files,
  onFilesChange,
  emptyLabel = "Attach",
  multiple = true,
  accept,
  id = "file-att",
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files ?? []).map((f) => f.name);
    if (!picked.length) return;

    if (multiple) {
      const merged = [...files];
      for (const name of picked) {
        if (!merged.includes(name)) merged.push(name);
      }
      onFilesChange(merged);
    } else {
      onFilesChange([picked[0]]);
    }
    e.target.value = "";
  };

  return (
    <>
      <label
        className="rpill rpill-att"
        onClick={() => inputRef.current?.click()}
        title={files.length > 1 ? files.join(", ") : undefined}
      >
        <svg
          width="11"
          height="11"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
        </svg>
        <span>{formatLabel(files, emptyLabel)}</span>
      </label>
      <input
        ref={inputRef}
        type="file"
        id={id}
        multiple={multiple}
        accept={accept}
        style={{ display: "none" }}
        onChange={onFileChange}
      />
    </>
  );
}
