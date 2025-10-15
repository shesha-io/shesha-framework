import React, { FC } from "react";
import { useStyles } from "../styles/styles";
import { Button, Space, Tooltip } from "antd";
import { ExpandOutlined, MinusOutlined, PlusOutlined } from "@ant-design/icons";
import { useCanvas } from "@/providers";
import { DeviceOptions } from "./mobileDropdown";
import { DEFAULT_OPTIONS } from "@/providers/canvas/utils";

export const CanvasConfig: FC = () => {
  const { styles } = useStyles();
  const { setCanvasZoom, setCanvasAutoZoom, autoZoom, zoom } = useCanvas();

  return (
    <div className={styles.shaDesignerCanvasConfig}>
      <Space direction="horizontal" size={5} style={{ flexWrap: "nowrap" }}>
        <DeviceOptions />
        <Space direction="horizontal" size={2} style={{ flexWrap: "nowrap" }}>
          <Tooltip title={`${zoom}%`}>
            <Button
              size="small"
              type="default"
              icon={<ExpandOutlined size={14} />}
              style={autoZoom ? { color: 'var(--ant-button-default-hover-color)', borderColor: 'var(--ant-button-default-hover-color)' } : {}}
              title={autoZoom ? "Auto" : "Manual"}
              onClick={() => {
                setCanvasAutoZoom();
              }}
            />
          </Tooltip>
          <Tooltip title={`${zoom}%`}><Button size="small" disabled={autoZoom} type="default" icon={<MinusOutlined />} title="Zoom out" onClick={() => setCanvasZoom(zoom - (zoom > DEFAULT_OPTIONS.minZoom ? 2 : 0))} /></Tooltip>
          <Tooltip title={`${zoom}%`}><Button size="small" disabled={autoZoom} type="default" icon={<PlusOutlined />} title="Zoom in" onClick={() => setCanvasZoom(zoom + (zoom < DEFAULT_OPTIONS.maxZoom ? 2 : 0))} /></Tooltip>
        </Space>
      </Space>
    </div>
  );
};

