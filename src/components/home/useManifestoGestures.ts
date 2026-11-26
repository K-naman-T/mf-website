import { useEffect, type RefObject } from "react";
import { animate, type MotionValue } from "motion/react";

export interface ManifestoHandoff {
  from: number;
  to: number;
  t: number;
}

const WHEEL_GAP = 220;
const READ_HOLD = 240;
const ALIGNMENT_TOLERANCE = 2;

export function useManifestoGestures(
  sectionRef: RefObject<HTMLElement | null>,
  scrollerRef: RefObject<HTMLDivElement | null>,
  handoff: MotionValue<ManifestoHandoff>,
  count: number,
  enabled: boolean,
) {
  useEffect(() => {
    const section = sectionRef.current;
    const scroller = scrollerRef.current;
    if (!section || !scroller || !enabled || count < 2) return;

    const offset = (element: Element = section) => element.getBoundingClientRect().top - scroller.getBoundingClientRect().top;
    let previousOffset = offset();
    let locked = false;
    let leaving = false;
    let settled = handoff.get().to;
    let readyAt = 0;
    let pinUntil = 0;
    let animation: { stop: () => void } | undefined;
    let wheelTime = -Infinity;
    let wheelConsumed = false;
    let nativeDirection = 0;
    let nativeUntil = 0;
    let skipEntryUntil = 0;
    let touch: { x: number; y: number; handled: boolean } | undefined;

    const rest = (index: number) => {
      const current = handoff.get();
      if (!animation && current.from === index && current.to === index) return;
      animation?.stop();
      animation = undefined;
      settled = index;
      handoff.set({ from: index, to: index, t: 1 });
    };

    const unlock = () => {
      locked = false;
      nativeDirection = 0;
      delete scroller.dataset.manifestoLocked;
    };

    const align = () => {
      scroller.scrollTo({ top: scroller.scrollTop + offset(), behavior: "instant" });
      previousOffset = 0;
    };

    const lock = () => {
      locked = true;
      readyAt = performance.now() + READ_HOLD;
      if (touch) touch.handled = true;
      scroller.dataset.manifestoLocked = "";
      align();
    };

    const enter = (direction: number) => {
      rest(direction > 0 ? 0 : count - 1);
      nativeDirection = 0;
      pinUntil = performance.now() + READ_HOLD;
      lock();
    };

    const intent = (direction: number) => {
      if (leaving) return;
      if (!locked) lock();
      if (animation || performance.now() < readyAt) return;

      const from = settled;
      const to = from + direction;
      if (to < 0 || to >= count) {
        const destination = direction < 0 ? section.previousElementSibling : section.nextElementSibling;
        unlock();
        if (destination) {
          leaving = true;
          scroller.scrollTo({ top: scroller.scrollTop + offset(destination), behavior: "smooth" });
        }
        return;
      }

      handoff.set({ from, to, t: 0 });
      animation = animate(0, 1, {
        duration: 0.82,
        ease: "linear",
        onUpdate: (t) => handoff.set({ from, to, t }),
        onComplete: () => {
          animation = undefined;
          rest(to);
          readyAt = performance.now() + READ_HOLD;
        },
      });
    };

    const trackNativeInput = (direction: number) => {
      nativeDirection = direction;
      nativeUntil = performance.now() + WHEEL_GAP;
    };

    const onWheel = (event: WheelEvent) => {
      if (event.ctrlKey || Math.abs(event.deltaX) > Math.abs(event.deltaY) || !event.deltaY) return;
      const now = performance.now();
      if (event.timeStamp - wheelTime > WHEEL_GAP) wheelConsumed = false;
      wheelTime = event.timeStamp;

      if (wheelConsumed) {
        if (locked) pinUntil = now + WHEEL_GAP;
        event.preventDefault();
        return;
      }

      const direction = Math.sign(event.deltaY);
      const distance = offset();
      if (locked || Math.abs(distance) <= ALIGNMENT_TOLERANCE) {
        event.preventDefault();
        wheelConsumed = true;
        pinUntil = now + WHEEL_GAP;
        intent(direction);
      } else {
        const unit = event.deltaMode === 2 ? scroller.clientHeight : event.deltaMode === 1 ? 16 : 1;
        if (Math.sign(distance) === direction && Math.abs(event.deltaY * unit) >= Math.abs(distance)) {
          event.preventDefault();
          wheelConsumed = true;
          enter(direction);
        } else {
          // Also catch crossings caused by browser acceleration and momentum.
          trackNativeInput(direction);
        }
      }
    };

    const onTouchStart = (event: TouchEvent) => {
      touch = undefined;
      if (event.touches.length !== 1) return;
      const { clientX: x, clientY: y } = event.touches[0]!;
      touch = { x, y, handled: false };
    };

    const onTouchMove = (event: TouchEvent) => {
      if (!touch || event.touches.length !== 1) return;
      const delta = touch.y - event.touches[0]!.clientY;
      if (touch.handled) {
        if (locked) pinUntil = performance.now() + WHEEL_GAP;
        if (event.cancelable) event.preventDefault();
        return;
      }
      if (Math.abs(delta) < 6 || Math.abs(touch.x - event.touches[0]!.clientX) >= Math.abs(delta)) return;

      const direction = Math.sign(delta);
      const distance = offset();
      const aligned = Math.abs(distance) <= ALIGNMENT_TOLERANCE;
      const approaching = event.cancelable && Math.sign(distance) === direction
        && Math.abs(distance) <= scroller.clientHeight * 0.27;
      if (locked || aligned || approaching) {
        if (event.cancelable) event.preventDefault();
        if (Math.abs(delta) >= 30) {
          touch.handled = true;
          pinUntil = performance.now() + WHEEL_GAP;
          if (locked || aligned) intent(direction);
          else enter(direction);
        }
      } else {
        trackNativeInput(direction);
      }
    };

    const onTouchEnd = () => { touch = undefined; };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
      if (event.target instanceof HTMLElement) {
        if (event.target.closest("input, textarea, select, [contenteditable]")) return;
        if (event.key === " " && event.target.closest("button, a")) return;
      }
      const direction = { ArrowDown: 1, ArrowUp: -1, PageDown: 1, PageUp: -1, " ": event.shiftKey ? -1 : 1 }[event.key];
      if (!direction || (!locked && Math.abs(offset()) > ALIGNMENT_TOLERANCE)) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      if (!event.repeat) intent(direction);
    };

    const onScroll = () => {
      const distance = offset();
      const now = performance.now();
      if (leaving) {
        if (Math.abs(distance) <= ALIGNMENT_TOLERANCE) return;
        leaving = false;
      }
      if (locked && Math.abs(distance) > ALIGNMENT_TOLERANCE) {
        if (now < pinUntil) {
          align();
          return;
        }
        // Anchor links and programmatic navigation can still move the scroller.
        unlock();
      }

      const crossedDown = !locked && !leaving && previousOffset > 0 && distance <= 0;
      const crossedUp = !locked && !leaving && previousOffset < 0 && distance >= 0;
      if ((crossedDown || crossedUp) && now >= skipEntryUntil) {
        // A fast scroll can jump over the 2px alignment window. Catch the
        // crossing itself and pin at the edge the reader came from, instead of
        // letting the off-screen position mark every beat as already read.
        enter(crossedDown ? 1 : -1);
        if (now - wheelTime <= WHEEL_GAP) wheelConsumed = true;
        return;
      }

      const movingToward = now <= nativeUntil && Math.sign(previousOffset) === nativeDirection
        && Math.sign(previousOffset - distance) === nativeDirection;
      if (movingToward) {
        if (Math.abs(distance) <= ALIGNMENT_TOLERANCE || Math.sign(distance) !== nativeDirection) {
          enter(nativeDirection);
          if (now - wheelTime <= WHEEL_GAP) wheelConsumed = true;
          return;
        }
        // Keep tracking momentum until the native scroll stream goes quiet.
        nativeUntil = now + WHEEL_GAP;
      }

      previousOffset = distance;
      if (!locked && Math.abs(distance) <= ALIGNMENT_TOLERANCE) {
        enter(previousOffset >= 0 ? 1 : -1);
      }
    };

    const onClick = (event: MouseEvent) => {
      nativeDirection = 0;
      pinUntil = 0;
      const target = event.target instanceof Element ? event.target.closest("a") : null;
      const href = target?.getAttribute("href") ?? "";
      // A deliberate in-page CTA/anchor jump may cross the pinned scene; let it through.
      if (href.startsWith("#") || href.startsWith("/#")) {
        skipEntryUntil = performance.now() + 2000;
      }
    };

    onScroll();
    scroller.addEventListener("wheel", onWheel, { passive: false });
    scroller.addEventListener("touchstart", onTouchStart, { passive: true });
    scroller.addEventListener("touchmove", onTouchMove, { passive: false });
    scroller.addEventListener("touchend", onTouchEnd);
    scroller.addEventListener("touchcancel", onTouchEnd);
    scroller.addEventListener("scroll", onScroll, { passive: true });
    scroller.addEventListener("click", onClick, true);
    window.addEventListener("keydown", onKeyDown, true);

    return () => {
      rest(handoff.get().to);
      unlock();
      scroller.removeEventListener("wheel", onWheel);
      scroller.removeEventListener("touchstart", onTouchStart);
      scroller.removeEventListener("touchmove", onTouchMove);
      scroller.removeEventListener("touchend", onTouchEnd);
      scroller.removeEventListener("touchcancel", onTouchEnd);
      scroller.removeEventListener("scroll", onScroll);
      scroller.removeEventListener("click", onClick, true);
      window.removeEventListener("keydown", onKeyDown, true);
    };
  }, [count, enabled, handoff, scrollerRef, sectionRef]);
}
