import React, { ReactNode } from "react";

type ErrorHandler = (error: Error, info: React.ErrorInfo) => void;
type ErrorHandlingComponent<Props> = (props: Props, error?: Error) => React.ReactNode;

interface ErrorState { error?: Error }

export default function Catch<Props>(
  component: ErrorHandlingComponent<Props>,
  errorHandler?: ErrorHandler,
): React.ComponentType<Props> {
  // eslint-disable-next-line react/display-name
  return class extends React.Component<Props, ErrorState> {
    public static getDerivedStateFromError(error: Error): ErrorState {
      return { error };
    }

    public state: ErrorState = {
      error: undefined,
    };

    public componentDidCatch(error: Error, info: React.ErrorInfo): void {
      if (errorHandler) {
        errorHandler(error, info);
      }
    }

    public render(): ReactNode {
      return component(this.props, this.state.error);
    }
  };
}
