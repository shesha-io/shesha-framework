import { useCallback, useMemo } from 'react';
import { App } from 'antd';
import { announce } from '@atlaskit/pragmatic-drag-and-drop-live-region';
import { isConfigurableFormComponent } from '@/providers/form/models';
import { useFormDesigner } from '@/providers/formDesigner';
import { getCopiedSettings, IPasteSelection, parseClipboardText, PasteMode, toClipboardText } from '@/providers/formDesigner/clipboard';
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
  copySettings: (componentId: string) => Promise<void>;
  pasteSettings: (componentId: string) => Promise<void>;
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

  const readClipboard = useCallback(async (refusedMessage: string): Promise<string | undefined> => {
    try {
      return await navigator.clipboard.readText();
    } catch {
      void message.warning(refusedMessage);
      return undefined;
    }
  }, [message]);

  const pasteFromClipboard = useCallback(async (selection: IPasteSelection, mode: PasteMode): Promise<void> => {
    const text = await readClipboard("The browser didn't allow access to the clipboard. Use the keyboard instead.");
    if (isDefined(text) && !paste(text, selection, mode))
      void message.info('Nothing to paste. Copy a component first.');
  }, [message, paste, readClipboard]);

  const copySettings = useCallback(async (componentId: string): Promise<void> => {
    const component = designer.state.formFlatMarkup.allComponents[componentId];
    if (!isConfigurableFormComponent(component))
      return;
    const settings = getCopiedSettings(component, designer.getComponentDefinition(component.type));
    try {
      await navigator.clipboard.writeText(toClipboardText({ kind: 'settings', componentType: component.type, settings }));
    } catch {
      void message.warning("The browser didn't allow access to the clipboard.");
      return;
    }
    void message.success(`Copied the settings of ${labelOf(componentId)}`);
  }, [designer, labelOf, message]);

  const pasteSettings = useCallback(async (componentId: string): Promise<void> => {
    const text = await readClipboard("The browser didn't allow access to the clipboard.");
    if (!isDefined(text))
      return;
    const content = parseClipboardText(text);
    if (content?.kind !== 'settings') {
      void message.info("Nothing to paste. Copy a component's settings first.");
      return;
    }
    const result = designer.pasteSettings({ componentId, componentType: content.componentType, settings: content.settings });
    if (result.ok)
      void message.success(`Pasted settings onto ${labelOf(componentId)}`);
    else
      void message.warning(result.reason);
  }, [designer, labelOf, message, readClipboard]);

  return useMemo(
    () => ({ getCopyText, finishCopy, paste, copyToClipboard, pasteFromClipboard, copySettings, pasteSettings }),
    [getCopyText, finishCopy, paste, copyToClipboard, pasteFromClipboard, copySettings, pasteSettings],
  );
};
