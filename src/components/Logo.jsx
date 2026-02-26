import { useEffect, useState } from 'react'
import logoLight from '../assets/logo-light.svg'
import logoDark from '../assets/logo-dark.svg'

export function Logo({ size = 36 }) {
  const [isDark, setIsDark] = useState(
    () => document.documentElement.classList.contains('dark')
  )

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'))
    })
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })
    return () => observer.disconnect()
  }, [])

  return (
    <img
      src={isDark ? logoDark : logoLight}
      width={size}
      height={size}
      alt="markdowntopdf logo"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    />
  )
}
