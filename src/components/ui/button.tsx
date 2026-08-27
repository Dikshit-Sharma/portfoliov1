import { cva, type VariantProps } from 'class-variance-authority'
import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'bg-indigo-500 text-white hover:bg-indigo-400 dark:bg-indigo-500 dark:hover:bg-indigo-400',
        outline:
          'border border-[var(--color-border)] bg-transparent text-[var(--color-fg)] hover:bg-white/5 dark:hover:bg-white/5 hover:bg-zinc-900/5',
        ghost: 'hover:bg-white/8 text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]',
        link: 'text-indigo-400 underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-11 px-5',
        icon: 'size-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>

export function Button({ className, variant, size, type = 'button', ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
}

export function buttonClass(props?: VariantProps<typeof buttonVariants>) {
  return buttonVariants(props)
}
