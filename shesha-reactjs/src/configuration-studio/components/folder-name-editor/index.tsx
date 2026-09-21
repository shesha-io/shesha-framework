/* eslint @typescript-eslint/strict-boolean-expressions: "error" */
import { Input, InputRef } from 'antd';
import { FC, useEffect, useRef, useState } from 'react';
import * as React from 'react';
import { useConfigurationStudio } from '@/configuration-studio/cs/contexts';

export interface IFolderNameEditorProps {
  initialName: string;
}

/**
 * Inline name editor rendered in place of a tree node while a folder is being created or renamed
 * (issue #4783 - folders are no longer named in a dialog).
 *
 * Enter commits, Escape cancels, and blurring commits too, which is what file explorers do.
 */
export const FolderNameEditor: FC<IFolderNameEditorProps> = ({ initialName }) => {
  const cs = useConfigurationStudio();
  const [value, setValue] = useState(initialName);
  const inputRef = useRef<InputRef>(null);
  // Guards against committing twice when Enter is followed by the resulting blur.
  const isSettledRef = useRef(false);

  useEffect(() => {
    // select() puts the caret over the existing name so renaming can start by typing.
    inputRef.current?.focus({ cursor: 'all' });
  }, []);

  const commit = (): void => {
    if (isSettledRef.current)
      return;
    isSettledRef.current = true;
    void cs.commitFolderDraftAsync(value);
  };

  const cancel = (): void => {
    if (isSettledRef.current)
      return;
    isSettledRef.current = true;
    cs.cancelFolderDraft();
  };

  const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    // The tree owns Enter/Escape/arrows, so keep them from reaching it while editing.
    e.stopPropagation();
    if (e.key === 'Enter') {
      e.preventDefault();
      commit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancel();
    }
  };

  return (
    <Input
      ref={inputRef}
      size="small"
      value={value}
      placeholder="Folder name"
      aria-label="Folder name"
      onChange={(e) => setValue(e.target.value)}
      onKeyDown={onKeyDown}
      onBlur={commit}
      // Selecting the row shouldn't steal focus from the editor.
      onClick={(e) => e.stopPropagation()}
      onDoubleClick={(e) => e.stopPropagation()}
    />
  );
};
