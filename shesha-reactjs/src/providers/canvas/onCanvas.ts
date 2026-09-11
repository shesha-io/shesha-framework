import { useContext } from 'react';
import { createNamedContext } from '@/utils/react';

/**
 * True only inside the designer canvas subtree (`ZoomableCanvas` provides it). The canvas
 * measurement lives on the app-level `CanvasProvider`, so while a designer is open it is visible
 * to every form in the app - the properties panel, settings modals, dialogs. Those forms must
 * behave as if no canvas exists; this flag is what tells the two apart.
 */
export const OnCanvasContext = createNamedContext<boolean>(false, 'OnCanvasContext');

/** Whether the component is rendered on the designer canvas itself. */
export const useIsOnCanvas = (): boolean => useContext(OnCanvasContext);
