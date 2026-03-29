"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useRef, useState, useCallback } from "react";

interface LogoProps {
  variant?: "light" | "dark" | "auto";
  className?: string;
}

const LONG_PRESS_DURATION = 5000;

const useLongPress = (onLongPress: () => void) => {
  const router = useRouter();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [progress, setProgress] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  const startPress = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    startTimeRef.current = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const p = Math.min((elapsed / LONG_PRESS_DURATION) * 100, 100);
      setProgress(p);
      if (p < 100) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };
    rafRef.current = requestAnimationFrame(animate);

    timerRef.current = setTimeout(() => {
      setProgress(0);
      onLongPress();
    }, LONG_PRESS_DURATION);
  }, [onLongPress]);

  const cancelPress = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setProgress(0);
  }, []);

  return { startPress, cancelPress, progress };
};

const LogoImage = ({ src, alt, className }: { src: string; alt: string; className?: string }) => (
  <Image src={src} width={140} height={50} alt={alt} className={`h-10 w-auto ${className ?? ""}`} />
);

const Logo = ({ variant = "auto", className = "" }: LogoProps) => {
  const router = useRouter();
  const { startPress, cancelPress, progress } = useLongPress(() => router.push("/dashboard/products"));

  const circleRadius = 18;
  const circleCircumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circleCircumference - (progress / 100) * circleCircumference;

  const content = (
    <div
      className={`relative flex items-center select-none cursor-pointer ${className}`}
      onMouseDown={startPress}
      onMouseUp={cancelPress}
      onMouseLeave={cancelPress}
      onTouchStart={startPress}
      onTouchEnd={cancelPress}
      onTouchCancel={cancelPress}
      onClick={(e) => {
        if (progress === 0) router.push("/");
      }}
    >
      {variant === "light" && (
        <LogoImage src="/images/logo-light.svg" alt="SML Informatique" />
      )}
      {variant === "dark" && (
        <LogoImage src="/images/logo-dark.svg" alt="SML Informatique" />
      )}
      {variant === "auto" && (
        <>
          <LogoImage src="/images/logo-dark.svg" alt="SML Informatique" className="dark:hidden" />
          <LogoImage src="/images/logo-light.svg" alt="SML Informatique" className="hidden dark:block" />
        </>
      )}

      {/* Progress ring */}
      {progress > 0 && (
        <svg
          className="absolute inset-0 m-auto pointer-events-none"
          width={44}
          height={44}
          viewBox="0 0 44 44"
          style={{ left: "50%", top: "50%", transform: "translate(-50%, -50%) rotate(-90deg)" }}
        >
          <circle
            cx={22}
            cy={22}
            r={circleRadius}
            fill="none"
            stroke="rgba(255,255,255,0.15)"
            strokeWidth={3}
          />
          <circle
            cx={22}
            cy={22}
            r={circleRadius}
            fill="none"
            stroke="#facc15"
            strokeWidth={3}
            strokeDasharray={circleCircumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>
      )}
    </div>
  );

  return content;
};

export default Logo;
