import { motion } from "framer-motion";
import { Avatar } from "../ui/Avatar";
import { prefersReducedMotion } from "../../hooks/usePortalOverlay";
import { cn } from "../../utils/cn";
import type { Expression } from "../../data/pixel-portraits";

interface CharacterSpriteProps {
  speaker: string;
  role: string;
  /** Character id when the speaker is a registered officeholder; else anonymous. */
  characterId: string | null;
  /** Rule-selected face; never random (features/narrative/cast.ts). */
  expression?: Expression;
  className?: string;
}

/**
 * The stage figure: bust plus nameplate, one composition. The bust breathes
 * very slowly so the figure is alive without stealing the beat panel's
 * attention; the whole thing stills under reduced motion.
 */
export function CharacterSprite({ speaker, role, characterId, expression = "neutral", className }: CharacterSpriteProps) {
  const reduced = prefersReducedMotion();
  return (
    <div className={cn("flex flex-col items-center gap-2.5", className)}>
      <div className="relative">
        <div aria-hidden="true" className="absolute -bottom-3 left-1/2 -translate-x-1/2 h-4 w-4/5 rounded-[100%] bg-black/55 blur-[6px]" />
        <motion.div
          animate={reduced ? {} : { scale: [1, 1.03] }}
          transition={{ duration: 6, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
          className="relative"
        >
          <Avatar
            name={speaker}
            artId={characterId ?? undefined}
            size="stage"
            expression={expression}
            className="ring-1 ring-gold/40 shadow-lift"
          />
        </motion.div>
      </div>
      <div className="text-center bg-card/80 border border-gold/30 rounded-[2px] px-3 py-1.5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gold-bright">{speaker}</p>
        <p className="kicker text-[10px] mt-0.5">{role}</p>
      </div>
    </div>
  );
}
