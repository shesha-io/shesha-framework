import { useContext } from 'react';
import { createNamedContext } from '@/utils/react';

/**
 * True while components render as static samples, as in the theme settings preview. Data-driven
 * components should show the same sample content they show in the designer instead of loading
 * live data.
 */
export const ComponentPreviewContext = createNamedContext<boolean>(false, 'ComponentPreviewContext');

export const useIsComponentPreview = (): boolean => useContext(ComponentPreviewContext);
