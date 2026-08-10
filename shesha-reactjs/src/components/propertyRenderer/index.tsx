import { IPropertyMetadata } from '@/interfaces';
import { useNestedPropertyMetadatAccessor } from '@/providers';
import { IEntityTypeIdentifier } from '@/providers/sheshaApplication/publicApi/entities/models';
import React, { ReactNode, useMemo } from 'react';
import { ValueRenderer } from '../valueRenderer';

export type IPropertyRendererProps<T = unknown> = {
  value: T;
  entityType: string | IEntityTypeIdentifier | undefined;
  propertyName: string;
};

export const PropertyRenderer = <T = unknown>({ value, entityType, propertyName }: IPropertyRendererProps<T>): ReactNode => {
  const propertyMetadataAccessor = useNestedPropertyMetadatAccessor(entityType);
  const propertyMetadata = useMemo<Promise<IPropertyMetadata | undefined>>(() => {
    return propertyMetadataAccessor(propertyName).then((meta) => meta ?? undefined);
  }, [propertyMetadataAccessor, propertyName]);
  return (
    <ValueRenderer value={value} meta={propertyMetadata} />
  );
};
