import { Avatar } from "../ui/Avatar";
import { characterById } from "../../data/characters";
import { useT } from "../../i18n/store";
import { characterText } from "../../i18n/data";
import { cn } from "../../utils/cn";

interface CharacterPortraitProps {
  /** A character ID from data/characters.ts, e.g. "finance". */
  characterId: string;
  size?: "sm" | "md" | "lg" | "xl" | "stage";
  className?: string;
  /** Accessible label. Defaults to "<name>, <role>" in the active locale. */
  alt?: string;
}

/**
 * Portrait keyed by character ID — the presentation layer of the portrait
 * registry in data/portraits.tsx. Renders the painted asset once one is
 * registered, otherwise the character's engraving. Alt text travels with it,
 * so callers never hand-maintain aria labels.
 */
export function CharacterPortrait({ characterId, size = "md", className, alt }: CharacterPortraitProps) {
  const { lang } = useT();
  const def = characterById(characterId);
  const label =
    alt ?? (def ? (() => {
      const d = characterText(def, lang);
      return `${d.name}, ${d.role}`;
    })() : undefined);

  return (
    <span role="img" aria-label={label} className={cn("inline-flex", className)}>
      <Avatar name={def?.name ?? characterId} size={size} />
    </span>
  );
}
