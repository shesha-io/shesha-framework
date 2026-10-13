import { ClipboardEvent, HTMLAttributes, KeyboardEvent, SyntheticEvent, useMemo, useRef } from 'react';
import { useFormDesigner } from '@/providers/formDesigner';
import { isDefined } from '@/utils/nullables';
import { useComponentClipboard } from './useComponentClipboard';

/** Typing somewhere other than the canvas (fields on the canvas are only previews in the designer) */
const isTypingTarget = (target: EventTarget | null): boolean => {
  if (!(target instanceof HTMLElement) || target.closest('[data-sha-drag-wrapper]') !== null)
    return false;
  return target.isContentEditable ||
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement ||
    target.closest('.monaco-editor') !== null;
};

const hasTextSelection = (): boolean => (window.getSelection()?.toString() ?? '') !== '';

/** Dialogs and menus opened from the designer render elsewhere in the page, but React still bubbles their events here */
const isFromOutside = (event: SyntheticEvent<HTMLElement>): boolean => !(event.target instanceof Node && event.currentTarget.contains(event.target));

type ClipboardHandlers = Pick<HTMLAttributes<HTMLElement>, 'onCopy' | 'onCut' | 'onPaste' | 'onKeyDown'>;

/** Ctrl/Cmd+C, X and V for the selected component (Ctrl+Shift+V pastes after it), through the browser's own clipboard events */
export const useDesignerClipboardEvents = (): ClipboardHandlers => {
  const designer = useFormDesigner();
  const clipboard = useComponentClipboard();
  const pasteAfter = useRef(false);

  return useMemo((): ClipboardHandlers => {
    const copy = (event: ClipboardEvent<HTMLElement>, cut: boolean): void => {
      const componentId = designer.selectedComponentId;
      if (!isDefined(componentId) || isFromOutside(event) || isTypingTarget(event.target) || hasTextSelection() || (cut && designer.readOnly))
        return;
      const text = clipboard.getCopyText(componentId);
      if (!isDefined(text))
        return;
      event.preventDefault();
      event.clipboardData.setData('text/plain', text);
      clipboard.finishCopy(componentId, cut);
    };

    return {
      onCopy: (event) => copy(event, false),
      onCut: (event) => copy(event, true),
      onPaste: (event) => {
        const mode = pasteAfter.current ? 'after' : 'auto';
        pasteAfter.current = false;
        if (designer.readOnly || isFromOutside(event) || isTypingTarget(event.target))
          return;
        if (clipboard.paste(event.clipboardData.getData('text/plain'), { componentId: designer.selectedComponentId }, mode))
          event.preventDefault();
      },
      onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
        // the paste event doesn't say whether Shift was held
        if ((event.ctrlKey || event.metaKey) && event.code === 'KeyV')
          pasteAfter.current = event.shiftKey;
      },
    };
  }, [designer, clipboard]);
};
