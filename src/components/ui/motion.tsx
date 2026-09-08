import { motion, useAnimationFrame, useMotionValue, type HTMLMotionProps } from 'framer-motion'
import { forwardRef, useState } from 'react'
import { cn } from '@/lib/utils'

// Fade in up animation
export const FadeInUp = forwardRef<HTMLDivElement, HTMLMotionProps<'div'> & { delay?: number; duration?: number; y?: number }>(
  ({ children, className, delay = 0, duration = 0.6, y = 20, ...props }, ref) => (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  ),
)
FadeInUp.displayName = 'FadeInUp'

// Staggered children container
export const StaggerContainer = forwardRef<HTMLDivElement, HTMLMotionProps<'div'> & { stagger?: number }>(
  ({ children, className, stagger = 0.1, ...props }, ref) => (
    <motion.div
      ref={ref}
      initial="hidden"
      animate="show"
      variants={{
        hidden: { opacity: 0 },
        show: { transition: { staggerChildren: stagger } },
      }}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  ),
)
StaggerContainer.displayName = 'StaggerContainer'

// Staggered item
export const StaggerItem = forwardRef<HTMLDivElement, HTMLMotionProps<'div'>>(
  ({ children, className, ...props }, ref) => (
    <motion.div
      ref={ref}
      variants={{
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
      }}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  ),
)
StaggerItem.displayName = 'StaggerItem'

// Scale on hover/tap
export const ScaleOnHover = forwardRef<HTMLDivElement, HTMLMotionProps<'div'> & { scale?: number }>(
  ({ children, className, scale = 1.02, ...props }, ref) => (
    <motion.div
      ref={ref}
      whileHover={{ scale }}
      whileTap={{ scale: 0.98 }}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  ),
)
ScaleOnHover.displayName = 'ScaleOnHover'

// Floating animation
export const Float = forwardRef<HTMLDivElement, HTMLMotionProps<'div'> & { amplitude?: number }>(
  ({ children, className, amplitude = 8, ...props }, ref) => (
    <motion.div
      ref={ref}
      animate={{ y: [-amplitude, amplitude, -amplitude] }}
      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  ),
)
Float.displayName = 'Float'

// Slide in from direction
export const SlideIn = forwardRef<HTMLDivElement, HTMLMotionProps<'div'> & { direction?: 'left' | 'right' | 'up' | 'down'; delay?: number }>(
  ({ children, className, direction = 'up', delay = 0, ...props }, ref) => {
    const variants = {
      left: { x: -50, opacity: 0 },
      right: { x: 50, opacity: 0 },
      up: { y: 50, opacity: 0 },
      down: { y: -50, opacity: 0 },
    }
    return (
      <motion.div
        ref={ref}
        initial={variants[direction]}
        animate={{ x: 0, y: 0, opacity: 1 }}
        transition={{ duration: 0.7, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
        className={cn(className)}
        {...props}
      >
        {children}
      </motion.div>
    )
  },
)
SlideIn.displayName = 'SlideIn'

// Reveal text by word/char
export const RevealText = ({
  children,
  className,
  by = 'word',
  delay = 0,
  stagger = 0.03,
  ...props
}: {
  children: string
  className?: string
  by?: 'word' | 'char'
  delay?: number
  stagger?: number
} & Omit<HTMLMotionProps<'span'>, 'children'>) => {
  const words = by === 'word' ? children.split(' ') : children.split('')
  return (
    <motion.span className={cn('inline-flex flex-wrap', className)} {...props}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: delay + i * stagger, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{ display: 'inline-block' }}
        >
          {by === 'word' ? `${word} ` : word}
        </motion.span>
      ))}
    </motion.span>
  )
}

// Magnetic button effect
export const Magnetic = forwardRef<HTMLButtonElement, HTMLMotionProps<'button'> & { strength?: number }>(
  ({ children, className, strength = 30, ...props }, ref) => {
    const x = useMotionValue(0)
    const y = useMotionValue(0)

    return (
      <motion.button
        ref={ref}
        style={{ x, y }}
        className={cn(className)}
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect()
          const centerX = rect.left + rect.width / 2
          const centerY = rect.top + rect.height / 2
          x.set((e.clientX - centerX) / strength)
          y.set((e.clientY - centerY) / strength)
        }}
        onMouseLeave={() => {
          x.set(0)
          y.set(0)
        }}
        onMouseEnter={() => {}}
        {...props}
      >
        {children}
      </motion.button>
    )
  },
)
Magnetic.displayName = 'Magnetic'

// Scroll reveal
export const ScrollReveal = forwardRef<HTMLDivElement, HTMLMotionProps<'div'> & { once?: boolean }>(
  ({ children, className, once = true, ...props }, ref) => (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: '-100px' }}
      transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  ),
)
ScrollReveal.displayName = 'ScrollReveal'

// Animated counter
export function useCounter(end: number, duration = 2000, delay = 0) {
  const count = useMotionValue(0)
  useAnimationFrame((t) => {
    const progress = Math.min(1, Math.max(0, (t - delay) / duration))
    const eased = 1 - Math.pow(1 - progress, 3)
    count.set(Math.round(eased * end))
  })
  return count
}

export const Counter = ({
  end,
  duration = 2000,
  delay = 0,
  className,
}: {
  end: number
  duration?: number
  delay?: number
  className?: string
}) => {
  const [val, setVal] = useState(0)
  useAnimationFrame((t) => {
    const progress = Math.min(1, Math.max(0, (t - delay) / duration))
    const eased = 1 - Math.pow(1 - progress, 3)
    const next = Math.round(eased * end)
    setVal((prev) => (prev === next ? prev : next))
  })
  return <span className={cn('font-mono tabular-nums', className)}>{val.toLocaleString()}</span>
}

// Pulse glow effect
export const PulseGlow = forwardRef<HTMLDivElement, HTMLMotionProps<'div'> & { color?: string }>(
  ({ children, className, color = 'rgba(99, 102, 241, 0.35)', ...props }, ref) => (
    <motion.div
      ref={ref}
      animate={{
        boxShadow: [
          `0 0 0 0 ${color}`,
          `0 0 30px 10px ${color}`,
          `0 0 0 0 ${color}`,
        ],
      }}
      transition={{ duration: 3, repeat: Infinity }}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  ),
)
PulseGlow.displayName = 'PulseGlow'

const ORB_BG: Record<string, string> = {
  indigo: 'bg-indigo-500/30',
  purple: 'bg-purple-500/30',
  pink: 'bg-pink-500/30',
  emerald: 'bg-emerald-500/30',
  sky: 'bg-sky-500/30',
  amber: 'bg-amber-500/30',
}
const ORB_BLUR: Record<string, string> = {
  '2xl': 'blur-2xl',
  '3xl': 'blur-3xl',
}

// Orb background
export const Orb = ({
  className,
  color = 'indigo',
  size = 400,
  blur = '3xl',
  ...props
}: {
  className?: string
  color?: string
  size?: number
  blur?: string
} & Omit<HTMLMotionProps<'div'>, 'children'>) => (
  <motion.div
    className={cn(
      'absolute rounded-full opacity-20',
      ORB_BG[color] || 'bg-indigo-500/30',
      ORB_BLUR[blur] || 'blur-3xl',
      className,
    )}
    style={{ width: size, height: size }}
    animate={{
      x: [0, 20, -10, 0],
      y: [0, -15, 20, 0],
      scale: [1, 1.1, 0.95, 1],
    }}
    transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
    {...props}
  />
)

const GRAD_FROM: Record<string, string> = {
  indigo: 'before:from-indigo-500',
  purple: 'before:from-purple-500',
  pink: 'before:from-pink-500',
  emerald: 'before:from-emerald-500',
}
const GRAD_VIA: Record<string, string> = {
  indigo: 'before:via-indigo-500',
  purple: 'before:via-purple-500',
  pink: 'before:via-pink-500',
  emerald: 'before:via-emerald-500',
}
const GRAD_TO: Record<string, string> = {
  indigo: 'before:to-indigo-500',
  purple: 'before:to-purple-500',
  pink: 'before:to-pink-500',
  emerald: 'before:to-emerald-500',
}

// Gradient border
export const GradientBorder = forwardRef<HTMLDivElement, HTMLMotionProps<'div'> & { colors?: [string, string] }>(
  ({ children, className, colors = ['indigo', 'purple'], ...props }, ref) => (
    <motion.div
      ref={ref}
      className={cn(
        'relative rounded-xl',
        'before:absolute before:inset-[-1px] before:rounded-xl before:bg-gradient-to-r',
        GRAD_FROM[colors[0]] || 'before:from-indigo-500',
        GRAD_VIA[colors[1]] || 'before:via-purple-500',
        GRAD_TO[colors[0]] || 'before:to-indigo-500',
        'before:opacity-0 group-hover:before:opacity-100 before:transition-opacity before:duration-300',
        'before:-z-10',
        className,
      )}
      {...props}
    >
      {children}
    </motion.div>
  ),
)
GradientBorder.displayName = 'GradientBorder'