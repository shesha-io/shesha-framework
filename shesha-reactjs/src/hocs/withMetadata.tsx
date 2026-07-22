import { MetadataProvider } from "@/providers";
import React from "react";

export interface WithMetadataProps {
  modelType?: string;
}

export function withMetadata<P extends WithMetadataProps>(
  WrappedComponent: React.ComponentType<P>,
): React.FC<P> {
  const ComponentWithMetadata: React.FC<P> = (props) => {
    const { modelType, ...restProps } = props;

    // Check if modelType exists and is not empty string
    if (modelType && modelType.trim() !== '') {
      return (
        <MetadataProvider modelType={modelType}>
          <WrappedComponent {...restProps as P} />
        </MetadataProvider>
      );
    }

    // Return without MetadataProvider if no valid modelType
    return <WrappedComponent {...props} />;
  };

  // Optional: Set display name for better debugging
  const displayName = WrappedComponent.displayName || WrappedComponent.name || 'Component';
  ComponentWithMetadata.displayName = `withMetadata(${displayName})`;

  return ComponentWithMetadata;
}
