import { useCallback, useMemo } from 'react';
import { App } from 'antd';
import { announce } from '@atlaskit/pragmatic-drag-and-drop-live-region';
import { isConfigurableFormComponent } from '@/providers/form/models';
import { useFormDesigner } from '@/providers/formDesigner';
import { IPasteSelection, parseClipboardText, PasteMode, toClipboardText } from '@/providers/formDesigner/clipboard';
import { getComponentDisplayText } from '@/providers/formDesigner/structure/displayText';
import { isDefined } from '@/utils/nullables';
import { flashRow } from '../layers/canvasBridge';

export interface IComponentClipboard {
  /** Clipboard text for a component and everything inside it */
  getCopyText: (componentId: string) => string | undefined;
  /** Says what was copied; a cut also removes the component */
  finishCopy: (componentId: string, cut: boolean) => void;
  /** Pastes clipboard text. False when it isn't a Shesha copy */
  paste: (text: string, selection: IPasteSelection, mode: PasteMode) => boolean;
  /** For menus and buttons, which can't use the browser's copy and paste events */
  copyToClipboard: (componentId: string, cut: boolean) => Promise<void>;
  pasteFromClipboard: (selection: IPasteSelection, mode: PasteMode) => Promise<void>;
}

/** Copy, cut and paste of components through the clipboard, with the messages that go with them */
export const useComponentClipboard = (): IComponentClipboard => {
  const designer = useFormDesigner();
  const { message } = App.useApp();

  const labelOf = useCallback((componentId: string): string => {
    const component = designer.state.formFlatMarkup.allComponents[componentId];
    return isConfigurableFormComponent(component) ? getComponentDisplayText(component) : componentId;
  }, [designer]);

  const getCopyText = useCallback((componentId: string): string | undefined => {
    const tree = designer.getComponentTree(componentId);
    return isDefined(tree) ? toClipboardText({ kind: 'components', components: [tree] }) : undefined;
  }, [designer]);

  const finishCopy = useCallback((componentId: string, cut: boolean): void => {
    void message.success(`${cut ? 'Cut' : 'Copied'} ${labelOf(componentId)}`);
    if (cut)
      designer.deleteComponent({ componentId });
  }, [designer, labelOf, message]);

  const paste = useCallback((text: string, selection: IPasteSelection, mode: PasteMode): boolean => {
    const content = parseClipboardText(text);
    if (!isDefined(content) || content.kind === 'settings')
      return false;
    if (content.kind === 'newer-version') {
      void message.warning("This was copied from a newer version of Shesha and can't be pasted here.");
      return true;
    }
    const result = designer.pasteComponents({ components: content.components, selection, mode });
    if (!result.ok) {
      void message.warning(result.reason);
      return true;
    }
    const [firstId] = result.componentIds;
    if (isDefined(firstId)) {
      designer.reveal(firstId);
      flashRow(firstId);
    }
    const what = result.componentIds.length === 1 && isDefined(firstId) ? labelOf(firstId) : `${result.componentIds.length} components`;
    const renames = result.renamed.map((change) => `Renamed ${change.from} to ${change.to} because that name is already used.`);
    void message.success(renames.length > 0 ? [`Pasted ${what}.`, ...renames].join(' ') : `Pasted ${what}`);
    announce(`Pasted ${what}.`);
    return true;
  }, [designer, labelOf, message]);

  const copyToClipboard = useCallback(async (componentId: string, cut: boolean): Promise<void> => {
    const text = getCopyText(componentId);
    if (!isDefined(text))
      return;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      void message.warning("The browser didn't allow access to the clipboard. Use the keyboard instead.");
      return;
    }
    finishCopy(componentId, cut);
  }, [getCopyText, message, finishCopy]);

  const pasteFromClipboard = useCallback(async (selection: IPasteSelection, mode: PasteMode): Promise<void> => {
    let text: string;
    try {
      text = await navigator.clipboard.readText();
    } catch {
      void message.warning("The browser didn't allow access to the clipboard. Use the keyboard instead.");
      return;
    }
    if (!paste(text, selection, mode))
      void message.info('Nothing to paste. Copy a component first.');
  }, [message, paste]);

  return useMemo(
    () => ({ getCopyText, finishCopy, paste, copyToClipboard, pasteFromClipboard }),
    [getCopyText, finishCopy, paste, copyToClipboard, pasteFromClipboard],
  );
};
