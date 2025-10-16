import React, { FC, useEffect } from "react";
import { useStyles } from "../styles/styles";
import { Button, Space, Tooltip } from "antd";
import { ExpandOutlined, MinusOutlined, PlusOutlined } from "@ant-design/icons";
import { useCanvas } from "@/providers";
import { DeviceOptions } from "./mobileDropdown";
import { DEFAULT_OPTIONS } from "@/providers/canvas/utils";

export const CanvasConfig: FC = () => {
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
      <Space direction="horizontal" size={0} style={{ flexWrap: "nowrap" }}>
        <Tooltip title={`${zoom}%`}>
          <Button
            size="small"
            type={autoZoom ? "link" : "text"}
            icon={<ExpandOutlined size={14} />}
            title="Auto"
            onClick={() => {
              setCanvasAutoZoom();
            }}
          />
        </Tooltip>
        <Tooltip title={`${zoom}%`}><Button size="small" disabled={autoZoom} type="text" icon={<MinusOutlined />} title="Zoom out" onClick={() => setCanvasZoom(zoom - (zoom > DEFAULT_OPTIONS.minZoom ? 2 : 0))} /></Tooltip>
        <Tooltip title={`${zoom}%`}><Button size="small" disabled={autoZoom} type="text" icon={<PlusOutlined />} title="Zoom in" onClick={() => setCanvasZoom(zoom + (zoom < DEFAULT_OPTIONS.maxZoom ? 2 : 0))} /></Tooltip>
      </Space>
    </div>
  );
};

