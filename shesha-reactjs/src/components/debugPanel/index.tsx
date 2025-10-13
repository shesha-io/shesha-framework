import React, { FC, PropsWithChildren, useEffect, useState } from "react";
import { Drawer, Select, Space } from "antd";
import { useConfigurableAction } from "@/providers";
import { useKeyPress } from "react-use";
import { useLocalStorage } from "@/hooks";
import { CloseOutlined } from "@ant-design/icons";
import DebugPanelDataContent from "./dataContent";
import { useStyles } from './styles/styles';

export const DebugPanel: FC<PropsWithChildren> = ({ children }) => {
  const { styles } = useStyles();
  const [open, setOpen] = useState(false);
  const [ctrlPressed] = useKeyPress('Control');
  const [f12Pressed] = useKeyPress('F12');

  useEffect(() => {
    if (!f12Pressed || !ctrlPressed)
      return;
    if (open)
      setOpen(false);
    else
      setOpen(true);
  }, [ctrlPressed, f12Pressed]);

  const onClose = (): void => {
    setOpen(false);
  };

  useConfigurableAction(
    {
      name: 'Toggle debug panel',
      owner: 'Debug panel',
      ownerUid: 'debugPanel',
      hasArguments: false,
      executer: () => {
        if (open)
          setOpen(false);
        else
          setOpen(true);
        return Promise.resolve();
      },
    }, [],
  );

  const [position, setPosition] = useLocalStorage('debugPanelposition', 'bottom');
  const [heightTop, setHeightTop] = useLocalStorage('debugPanelHeightTop', 300);
  const [heightBottom, setHeightBottom] = useLocalStorage('debugPanelHeightBottom', 300);
  const [height, setHeight] = useState(position === 'top' ? heightTop : heightBottom);
  const [dragY, setDragY] = useState(0);
  const [dragHeight, setDragHeight] = useState(height);
  const [widthLeft, setWidthLeft] = useLocalStorage('debugPanelWidthLeft', 500);
  const [widthRight, setWidthRight] = useLocalStorage('debugPanelWidthRight', 500);
  const [width, setWidth] = useState(position === 'left' ? widthLeft : widthRight);
  const [dragX, setDragX] = useState(0);
  const [dragWidth, setDragWidth] = useState(width);

  useEffect(() => {
    if (height < 0)
      setHeight(300);
  }, [height]);

  const initialY = (e): void => {
    e.dataTransfer.effectAllowed = "move";
    setDragY(e.clientY);
    setDragHeight(height);
  };

  const resizeY = (e): void => {
    const d = position === 'top' ? e.clientY - dragY : dragY - e.clientY;
    const h = dragHeight + d;
    setHeight(h);
    if (position === 'top')
      setHeightTop(h);
    else
      setHeightBottom(h);
  };

  const initialX = (e): void => {
    e.dataTransfer.effectAllowed = "move";
    setDragX(e.clientX);
    setDragWidth(width);
  };

  const resizeX = (e): void => {
    const d = position === 'left' ? e.clientX - dragX : dragX - e.clientX;
    const w = dragWidth + d;
    setWidth(w);
    if (position === 'left')
      setWidthLeft(w);
    else
      setWidthRight(w);
  };

  const onChangePosition = (pos): void => {
    switch (pos) {
      case 'top':
        setHeight(heightTop);
        break;
      case 'bottom':
        setHeight(heightBottom);
        break;
      case 'left':
        setWidth(widthLeft);
        break;
      case 'right':
        setWidth(widthRight);
        break;
    }
    setPosition(pos);
  };

  const title = (
    <>
      {position === 'bottom' && (
        <div
          className={styles.debugPanelBottomResizer}
          draggable
          onDragStart={initialY}
          onDragEnd={resizeY}
        />
      )}
      <Space>
        <CloseOutlined onClick={onClose} />
        <span>Debug panel</span>
        <Select onChange={onChangePosition} value={position} style={{ minWidth: '7em' }}>
          <Select.Option key="1" value="top">Top</Select.Option>
          <Select.Option key="2" value="bottom">Bottom</Select.Option>
          <Select.Option key="3" value="left">Left</Select.Option>
          <Select.Option key="4" value="right">Right</Select.Option>
        </Select>
      </Space>
    </>
  );

  return (
    <>
      {children}
      {open && (
        <Drawer
          title={title}
          placement={position as any}
          open={open}
          onClose={onClose}
          closable={false}
          height={height}
          width={width}
          maskClosable={false}
          className={styles.debugPanelDrawer}
          styles={{
            mask: { height: 0 },
            header: { padding: '4px 12px 12px 8px', fontSize: 12 },
            body: { padding: '4px 4px 12px 4px', overflow: 'hidden' },
          }}
        >
          <div className={styles.debugPanelBody}>
            { position === 'right' && (
              <div
                className={styles.debugPanelRightResizer}
                draggable
                onDragStart={initialX}
                onDragEnd={resizeX}
              />
            )}
            <div className={styles.debugPanelContent}>
              <DebugPanelDataContent />
            </div>
            { position === 'left' && (
              <div
                className={styles.debugPanelLeftResizer}
                draggable
                onDragStart={initialX}
                onDragEnd={resizeX}
              />
            )}
          </div>
          {position === 'top' && (
            <div
              className={styles.debugPanelTopResizer}
              draggable
              onDragStart={initialY}
              onDragEnd={resizeY}
            />
          )}
        </Drawer>
      )}
    </>
  );
};

export default DebugPanel;
