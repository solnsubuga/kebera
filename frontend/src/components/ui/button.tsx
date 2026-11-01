import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { Slot } from 'radix-ui'

// Tickmark buttons are pills. Blue is the main action, grey the rest, graphite a person committing.
const buttonVariants = cva(
  "inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full text-[13px] font-medium whitespace-nowrap transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40 disabled:pointer-events-none disabled:opacity-50 aria-invalid:ring-destructive/30 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: 'bg-link text-primary-foreground hover:bg-link-hover',
        secondary: 'bg-fill text-ink hover:bg-rule',
        graphite: 'bg-ink text-on-ink hover:bg-ink/85',
        destructive: 'bg-vermilion text-white hover:bg-vermilion/90',
        outline: 'border border-rule-strong bg-sheet text-ink hover:bg-fill',
        ghost: 'text-ink hover:bg-fill',
        link: 'h-auto rounded-none px-0 text-link underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-[18px] has-[>svg]:px-4',
        xs: "h-6 gap-1 px-2.5 text-xs [&_svg:not([class*='size-'])]:size-3",
        sm: 'h-8 gap-1.5 px-3.5 text-[12.5px]',
        lg: 'h-10 px-6 text-sm',
        icon: 'size-9',
        'icon-xs': "size-6 [&_svg:not([class*='size-'])]:size-3",
        'icon-sm': 'size-8',
        'icon-lg': 'size-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function Button({
  className,
  variant = 'default',
  size = 'default',
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : 'button'

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
