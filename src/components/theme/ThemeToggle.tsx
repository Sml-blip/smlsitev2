"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="link" className="hover:bg-gray-200 dark:hover:bg-neutral-800 duration-200 p-2" size="icon">
        <Sun className="h-[1.5rem] w-[1.5rem]" />
      </Button>
    )
  }

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  return (
    <Button 
      variant="link" 
      className="hover:bg-gray-200 dark:hover:bg-neutral-800 duration-200 p-2" 
      size="icon"
      onClick={toggleTheme}
    >
      {theme === "dark" ? (
        <Sun className="h-[1.5rem] w-[1.5rem]" />
      ) : (
        <Moon className="h-[1.5rem] w-[1.5rem]" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
