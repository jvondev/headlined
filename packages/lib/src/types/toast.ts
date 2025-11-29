import * as React from "react"

export type ToastActionElement = React.ReactElement

export type ToastProps = {
    id?: string
    className?: string
    variant?: "default" | "destructive" | null | undefined
    title?: React.ReactNode
    description?: React.ReactNode
    action?: ToastActionElement
    open?: boolean
    onOpenChange?: (open: boolean) => void
    duration?: number
}
