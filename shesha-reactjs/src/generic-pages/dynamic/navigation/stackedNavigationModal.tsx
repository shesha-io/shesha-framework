import { CloseOutlined, ExpandAltOutlined, ShrinkOutlined } from '@ant-design/icons';
import { Button, Modal, ModalProps } from 'antd';
import Link from 'next/link';
import React, { CSSProperties, FC, useEffect, useState } from 'react';
import { useShaRouting } from '@/providers';
import { removeURLParameter } from '@/utils/url';
import { StackedNavigationModalProvider, useStackedModal } from './stackedNavigationModalProvider';

interface IStackedNavigationModalProps extends ModalProps {
  parentId?: string;
}

const StackedNavigationModal: FC<IStackedNavigationModalProps> = ({
  children,
  onCancel,
  title,
  parentId,
  ...props
}) => {
  const { isMaxWidth } = useStackedModal();
  const [maxWidth, setMaxWidth] = useState(typeof isMaxWidth === 'boolean' ? isMaxWidth : true);
  const { router } = useShaRouting();

  useEffect(() => {
    if (typeof isMaxWidth === 'boolean') {
      setMaxWidth(isMaxWidth);
    }
  }, [isMaxWidth]);

  const toggleMaxWidth = (): void => setMaxWidth((prev) => !prev);

  const closeDialog = (e: any): void => {
    onCancel(e);
  };

  const style: CSSProperties = { margin: 0, maxWidth: '100vw', maxHeight: '100vh', top: 0 };
  const bodyStyle: CSSProperties = { minHeight: '100vh' };

  return (
    <StackedNavigationModalProvider isMaxWidth={maxWidth} parentId={parentId}>
      <Modal
        style={maxWidth ? style : {}}
        width={maxWidth ? '100vw' : '80%'}
        styles={{ body: maxWidth ? bodyStyle : {} }}
        destroyOnHidden
        centered={false}
        footer={null}
        closable={false}
        title={(
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>
              <Link href={`${removeURLParameter(router?.fullPath, 'navMode')}`}>
                {title}
              </Link>
            </span>

            <span>
              <Button
                onClick={toggleMaxWidth}
                icon={maxWidth ? <ShrinkOutlined /> : <ExpandAltOutlined />}
                type="link"
              />

              <Button type="link" onClick={(event) => closeDialog(event)} icon={<CloseOutlined />} />
            </span>
          </div>
        )}
        {...props}
      >
        {children}
      </Modal>
    </StackedNavigationModalProvider>
  );
};

export { StackedNavigationModal };

export default StackedNavigationModal;
