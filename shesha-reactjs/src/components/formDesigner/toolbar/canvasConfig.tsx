import React, { FC, useEffect } from 'react';
import { useStyles } from '../styles/styles';
import { Button, InputNumber, Space, Tooltip } from 'antd';
import { ExpandOutlined, MinusOutlined, PlusOutlined } from '@ant-design/icons';
import { useCanvas } from '@/providers';
import { DEFAULT_OPTIONS } from '@/components/sidebarContainer/canvasUtils';
import { DeviceOptions } from './mobileDropdown';

export interface ICanvasConfigProps {

}

export const CanvasConfig: FC<ICanvasConfigProps> = () => {
  const { styles } = useStyles();
  const { setCanvasZoom, setCanvasAutoZoom, autoZoom, zoom } = useCanvas();

  useEffect(() => {
    const isTextInput = (el: EventTarget | null) => {
      if (!(el instanceof HTMLElement)) return false;
      const tag = el.tagName.toLowerCase();
      const isEditable = el.isContentEditable;
      return (
        isEditable ||
        tag === 'input' ||
        tag === 'textarea' ||
        (tag === 'div' && el.getAttribute('role') === 'textbox')
      );
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (autoZoom) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (isTextInput(e.target)) return;

      const isPlus = e.key === '+' || e.code === 'NumpadAdd' || (e.shiftKey && e.key === '=') || e.code === 'Equal';
      const isMinus = e.key === '-' || e.code === 'NumpadSubtract' || e.code === 'Minus';

      if (!isPlus && !isMinus) return;

      e.preventDefault();

      if (isPlus) {
        const next = Math.min(DEFAULT_OPTIONS.maxZoom, zoom + (zoom > DEFAULT_OPTIONS.minZoom ? 2 : 0));
        setCanvasZoom(next);
      } else if (isMinus) {
        const next = Math.max(DEFAULT_OPTIONS.minZoom, zoom - (zoom > DEFAULT_OPTIONS.minZoom ? 2 : 0));
        setCanvasZoom(next);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [autoZoom, zoom, setCanvasZoom]);

  return (
    <div className={styles.shaDesignerCanvasConfig}>
      <DeviceOptions />
      <Space direction='horizontal' size={0} style={{ flexWrap: 'nowrap' }}>
        <Space size={0} direction='horizontal' style={{ flexWrap: 'nowrap' }}>
          <Tooltip title={`${zoom}%`}>
            <Button size='small' style={{ height: '24px' }} type={autoZoom ? 'link' : 'text'} icon={<ExpandOutlined />} title='Auto' onClick={() => {
              setCanvasAutoZoom();
            }} />
          </Tooltip>
          <Button disabled={autoZoom} type='link' size='small' icon={<MinusOutlined />} onClick={() => setCanvasZoom(zoom - (zoom > DEFAULT_OPTIONS.minZoom ? 2 : 0))} />
          <InputNumber
            min={25}
            max={200}
            maxLength={3}
            size='small'
            value={zoom}
            variant='borderless'
            disabled={autoZoom}
            style={{ width: '42px', paddingInlineStart:'2px' }}
            controls={false}
            onChange={setCanvasZoom}
            suffix='%'
          />
          <Button disabled={autoZoom} style={{ zIndex: 1000 }} type='link' size='small' icon={<PlusOutlined />} onClick={() => setCanvasZoom(zoom + (zoom > DEFAULT_OPTIONS.minZoom ? 2 : 0))} />
        </Space>
      </Space>
    </div>
  );
};

