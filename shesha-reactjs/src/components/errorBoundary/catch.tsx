import React, { ReactNode } from "react";

type ErrorHandler = (error: Error, info: React.ErrorInfo) => void;
type ErrorHandlingComponent<Props> = (props: Props, error?: Error) => React.ReactNode;

interface ErrorState { error?: Error | undefined }

export default function Catch<Props>(
  component: ErrorHandlingComponent<Props>,
  errorHandler?: ErrorHandler,
): React.ComponentType<Props> {
  // eslint-disable-next-line react/display-name
  return class extends React.Component<Props, ErrorState> {
    public static getDerivedStateFromError(error: Error): ErrorState {
      return { error };
    }

    public override state: ErrorState = {
      error: undefined,
    };

    public override componentDidCatch(error: Error, info: React.ErrorInfo): void {
      if (errorHandler) {
        errorHandler(error, info);
      }
    }

    public override render(): ReactNode {
      return component(this.props, this.state.error);
    }
  };
}
