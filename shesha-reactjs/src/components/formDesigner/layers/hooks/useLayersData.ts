import { useMemo } from 'react';
import { useFormDesigner, useFormDesignerStructureVersion } from '@/providers/formDesigner';
import { IContainerOwnership } from '@/providers/formDesigner/structure/containers';
import { buildLayersIndex } from '../model/buildLayersIndex';
import { ILayersIndex } from '../model/types';

export interface ILayersData {
  index: ILayersIndex;
  ownership: IContainerOwnership;
  structureVersion: number;
}

/** The tree index, rebuilt only when the designer's structure changes (not on property edits) */
export const useLayersData = (): ILayersData => {
  const designer = useFormDesigner();
  const structureVersion = useFormDesignerStructureVersion();
  return useMemo(() => ({
    index: buildLayersIndex(designer.state.formFlatMarkup, designer.getComponentDefinition),
    ownership: designer.getContainerOwnership(),
    structureVersion,
  }), [designer, structureVersion]);
};
