"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"

interface AnimateOnScrollProps {
  children: ReactNode
  className?: string
  delay?: number
  direction?: "up" | "left" | "right" | "scale"
}

export function AnimateOnScroll({
  children,
  className = "",
  delay = 0,
  direction = "up",
}: AnimateOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.unobserve(entry.target)
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    )

    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  const baseHidden: Record<string, string> = {
    up: "translate-y-10 opacity-0",
    left: "-translate-x-10 opacity-0",
    right: "translate-x-10 opacity-0",
    scale: "scale-90 opacity-0",
  }

  const baseVisible: Record<string, string> = {
    up: "translate-y-0 opacity-100",
    left: "translate-x-0 opacity-100",
    right: "translate-x-0 opacity-100",
    scale: "scale-100 opacity-100",
  }

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${isVisible ? baseVisible[direction] : baseHidden[direction]} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}
