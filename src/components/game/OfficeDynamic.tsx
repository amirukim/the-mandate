import { useEffect, useMemo, useState } from "react";
import { isMonsoonTurn } from "../../engine/calendar";
import { prefersReducedMotion } from "../../hooks/usePortalOverlay";
import { specFromAvatar, spriteDataUrl } from "../../data/pixel-portraits";
import type { GameState } from "../../types/game";

/**
 * The office's living layer (v2 Phase 5): everything between the static plate
 * and the hotspots. Weather and the clock follow the in-game month; the props
 * follow the state â€” unread files, wire pile, orchid, furled flag, award
 * plaque, phone badge. The PM stands at the desk; a visitor walks in when a
 * briefing is waiting. All motion stills under reduced motion.
 */

function useCycle(length: number, ms: number, enabled: boolean): number {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (!enabled || length <= 1) return;
    const timer = window.setInterval(() => setI((v) => (v + 1) % length), ms);
    return () => window.clearInterval(timer);
  }, [enabled, length, ms]);
  return i;
}

/** art-space coordinates â†’ percentage styles inside the SceneLayer box. */
const at = (x: number, y: number, w: number, h?: number) => ({
  left: `${(x / 480) * 100}%`,
  top: `${(y / 253) * 100}%`,
  width: `${(w / 480) * 100}%`,
  ...(h !== undefined ? { height: `${(h / 253) * 100}%` } : {}),
});

const OFFICE_ART = "/art/pixel/office";

export function OfficeDynamic({ state }: { state: GameState }) {
  const reduced = prefersReducedMotion();
  const monsoon = isMonsoonTurn(state.turn);
  const queued = state.queuedEventIds.length;
  const month = state.turn % 12;

  const rainFrame = useCycle(2, 170, monsoon && !reduced);
  const fanFrame = useCycle(3, 150, !reduced);
  const steamFrame = useCycle(3, 430, !reduced);
  const swayFrame = useCycle(2, 620, !reduced);

  const stabilityLow = state.politics.coalitionStability < 30;
  const orchidWilted = state.politics.approval < 40 && state.politics.coalitionStability < 45;
  const hasAward = Object.keys(state.flags).some((f) => f.startsWith("award."));
  const wireBusy = state.news.length >= 6;

  // the PM at the desk: runtime sprite from the avatar customisation
  const avatar = state.avatar ?? {};
  const [pmTick, setPmTick] = useState(0);
  const [pmBlink, setPmBlink] = useState(false);
  useEffect(() => {
    if (reduced) return;
    const idle = window.setInterval(() => setPmTick((t) => t + 1), 900);
    const blink = window.setInterval(() => {
      setPmBlink(true);
      window.setTimeout(() => setPmBlink(false), 150);
    }, 4750);
    return () => {
      window.clearInterval(idle);
      window.clearInterval(blink);
    };
  }, [reduced]);

  const pmSpec = useMemo(() => specFromAvatar(avatar), [avatar]);
  const pmIdleFrame = Math.floor(pmTick / 2) % 2 === 0 ? 0 : 1;
  const pmUrl = useMemo(
    () => spriteDataUrl(pmSpec, "neutral", { pose: "stand", frame: pmIdleFrame }),
    [pmSpec, pmIdleFrame],
  );
  const pmBlinkUrl = useMemo(() => spriteDataUrl(pmSpec, "neutral", { pose: "stand", blink: true }), [pmSpec]);

  // the visitor: walks in when a briefing is waiting
  const [visitorIn, setVisitorIn] = useState(queued > 0);
  useEffect(() => {
    if (queued > 0 && !visitorIn) {
      const timer = window.setTimeout(() => setVisitorIn(true), reduced ? 0 : 1500);
      return () => window.clearTimeout(timer);
    }
  }, [queued, visitorIn, reduced]);
  const walkFrame = useCycle(4, 150, !visitorIn && !reduced);
  const visitorLeft = visitorIn ? 88 : -60;

  return (
    <>
      {/* day / night window */}
      {monsoon && (
        <img src={`${OFFICE_ART}/window-night.png`} alt="" aria-hidden="true" className="pixelated absolute" style={at(157, 21, 152)} />
      )}

      {/* monsoon rain */}
      {monsoon && (
        <img
          src={`${OFFICE_ART}/rain-${rainFrame + 1}.png`}
          alt=""
          aria-hidden="true"
          className="pixelated absolute"
          style={at(150, 12, 160)}
        />
      )}

      {/* ceiling fan */}
      <img
        src={`${OFFICE_ART}/fan-${fanFrame + 1}.png`}
        alt=""
        aria-hidden="true"
        className="pixelated absolute"
        style={at(216, 2, 48)}
      />

      {/* flag: furled under a fragile coalition, swaying otherwise */}
      {stabilityLow ? (
        <img src={`${OFFICE_ART}/flag-furled.png`} alt="" aria-hidden="true" className="pixelated absolute" style={at(446, 31, 22)} />
      ) : (
        <img
          src={`${OFFICE_ART}/flag-sway-${swayFrame + 1}.png`}
          alt=""
          aria-hidden="true"
          className="pixelated absolute"
          style={at(446, 31, 22)}
        />
      )}

      {/* clock tied to the in-game month */}
      <img src={`${OFFICE_ART}/clock-face.png`} alt="" aria-hidden="true" className="pixelated absolute" style={at(324, 25, 30)} />
      <img
        src={`${OFFICE_ART}/clock-hands-${month}.png`}
        alt=""
        aria-hidden="true"
        className="pixelated absolute"
        style={at(324, 25, 30)}
      />

      {/* in-tray: unread files stack up */}
      <img
        src={`${OFFICE_ART}/tray-${queued === 0 ? "empty" : queued <= 2 ? "low" : "high"}.png`}
        alt=""
        aria-hidden="true"
        className="pixelated absolute"
        style={at(30, 144, 34)}
      />

      {/* wire pile when the press has been busy */}
      {wireBusy && (
        <img src={`${OFFICE_ART}/wire-pile.png`} alt="" aria-hidden="true" className="pixelated absolute" style={at(18, 146, 16)} />
      )}

      {/* orchid: fresh while the government holds, wilting when it fades */}
      <img
        src={`${OFFICE_ART}/orchid-${orchidWilted ? "wilt" : "fresh"}.png`}
        alt=""
        aria-hidden="true"
        className="pixelated absolute"
        style={at(58, 146, 10)}
      />

      {/* award plaque once the record has something to honour */}
      {hasAward && (
        <img src={`${OFFICE_ART}/award-plaque.png`} alt="" aria-hidden="true" className="pixelated absolute" style={at(328, 99, 16)} />
      )}

      {/* phone badge when a briefing or crisis is waiting */}
      {queued > 0 && (
        <img src={`${OFFICE_ART}/phone-badge.png`} alt="" aria-hidden="true" className="pixelated absolute" style={at(319, 143, 5)} />
      )}

      {/* coffee steam */}
      <img
        src={`${OFFICE_ART}/steam-${steamFrame + 1}.png`}
        alt=""
        aria-hidden="true"
        className="pixelated absolute"
        style={at(329, 131, 15)}
      />

      {/* the visitor, walking in from the left when a briefing waits */}
      {queued > 0 && (
        <img
          src={
            visitorIn
              ? `/art/pixel/sprites/sprite-chiefOfStaff-idle-${(walkFrame % 2) + 1}.png`
              : `/art/pixel/sprites/sprite-chiefOfStaff-walk-${walkFrame + 1}.png`
          }
          alt=""
          aria-hidden="true"
          className="pixelated absolute"
          style={{
            left: `${(visitorLeft / 480) * 100}%`,
            top: `${(180 / 253) * 100}%`,
            width: `${(96 / 480) * 100}%`,
            transition: reduced ? "none" : "left 1400ms ease-out",
          }}
        />
      )}

      {/* the PM at the desk: feet hidden behind the desk front */}
      <div
        aria-hidden="true"
        className="absolute overflow-hidden"
        style={{
          left: `${(184 / 480) * 100}%`,
          top: "0%",
          width: `${(96 / 480) * 100}%`,
          height: `${(156 / 253) * 100}%`,
        }}
      >
        <img
          src={pmBlink ? pmBlinkUrl : pmUrl}
          alt=""
          className="pixelated absolute bottom-0 left-0 w-full"
        />
      </div>
    </>
  );
}
