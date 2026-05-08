import Button from "../../components/shared/Button";

interface AddByUrlSectionProps {
  urlInput: string;
  setUrlInput: (value: string) => void;
  urlError: string | null;
  setUrlError: (value: string | null) => void;
  isPending: boolean;
  onAdd: () => void;
}

export function AddByUrlSection({
  urlInput,
  setUrlInput,
  urlError,
  setUrlError,
  isPending,
  onAdd,
}: AddByUrlSectionProps) {
  return (
    <div className="border-t border-hot-gray-200 pt-md mt-md flex flex-col gap-xs">
      <p className="text-xs font-semibold text-hot-gray-500 uppercase tracking-wide">
        Add by URL
      </p>
      <div className="flex gap-xs">
        <input
          type="url"
          value={urlInput}
          onChange={(e) => {
            setUrlInput(e.target.value);
            setUrlError(null);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onAdd();
            }
          }}
          placeholder="https://tasks.hotosm.org/projects/123"
          className="flex-1 border border-hot-gray-300 rounded-lg px-sm py-xs text-sm outline-none focus:border-hot-red-500"
        />
        <Button
          type="button"
          size="small"
          disabled={!urlInput.trim() || isPending}
          onClick={onAdd}
        >
          {isPending ? "Checking…" : "Add"}
        </Button>
      </div>
      {urlError && <p className="text-xs text-hot-red-600">{urlError}</p>}
    </div>
  );
}
