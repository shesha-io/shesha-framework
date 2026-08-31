import * as React from 'react';
import { InboxOutlined } from '@ant-design/icons';
import classNames from 'classnames';
import { FileUploadStylesResponse } from './styles/styles';
import { isNotNullOrWhiteSpace } from '@/utils/nullables';

interface DraggerStubProps {
  styles?: FileUploadStylesResponse;
  type?: string;
  /**
   * Replaces the stock prompt. Set, it stands alone — the generic hint below is boilerplate that
   * would contradict a message someone wrote deliberately.
   */
  text?: string | undefined;
}

/**
 * The three class names antd's Dragger styles its own contents with. They are plain antd classes
 * rather than emotion ones, so they are the hook a component's CSS uses to reach the stub's icon and
 * text — and antd's base dragger styling (icon size, hint colour) keys off them too.
 *
 * They used to arrive only through the optional `styles` prop, which meant a caller that rendered
 * `<DraggerStub />` bare got an unstyled stub: the file list did exactly that, so its icon and font
 * did not match the File component's. Defaulting them here makes the stub carry its own identity,
 * and `styles` now only adds to it.
 */
const ANT_DRAG_ICON = 'ant-upload-drag-icon';
const ANT_UPLOAD_TEXT = 'ant-upload-text';
const ANT_UPLOAD_HINT = 'ant-upload-hint';

export const DraggerStub = ({ styles, type, text }: DraggerStubProps): React.JSX.Element => {
  const dragIconClass = classNames(ANT_DRAG_ICON, styles?.antUploadDragIcon);
  const hasCustomText = isNotNullOrWhiteSpace(text);

  return (
    <div>
      <p className={dragIconClass}>
        <InboxOutlined className={classNames(dragIconClass, 'icon')} />
      </p>
      {/* Authored in a text area, so its line breaks are meant to show rather than collapse. */}
      <p
        className={classNames(ANT_UPLOAD_TEXT, styles?.antUploadText)}
        {...(hasCustomText ? { style: { whiteSpace: 'pre-line' as const } } : {})}
      >
        {hasCustomText ? text : 'Click or drag file to this area to upload'}
      </p>
      {!hasCustomText && (
        <p className={classNames(ANT_UPLOAD_HINT, styles?.antUploadHint)}>
          {type === 'fileUpload'
            ? 'Support for a single file upload. Strictly prohibit from uploading company data or other band files'
            : 'Support for a single or bulk upload. Strictly prohibit from uploading company data or other band files'}
        </p>
      )}
    </div>
  );
};
