import React from "react"

type ErrorHandler = (error: Error, info: React.ErrorInfo) => void
type ErrorHandlingComponent<Props> = (props: Props, error?: Error) => React.ReactNode

interface ErrorState { error?: Error }

export default function Catch<Props extends {}>(
  component: ErrorHandlingComponent<Props>,
  errorHandler?: ErrorHandler
): React.ComponentType<Props> {
  return class extends React.Component<Props, ErrorState> {
    
    public static getDerivedStateFromError(error: Error) {
      return { error }
    }
    public state: ErrorState = {
      error: undefined
    }
    
    public componentDidCatch(error: Error, info: React.ErrorInfo) {
      if (errorHandler) {
        errorHandler(error, info)
      }
    }
    
    public render() {
      return component(this.props, this.state.error)
    }
  }
}