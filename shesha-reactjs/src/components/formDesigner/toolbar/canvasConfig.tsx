import React, { FC } from "react";
import { useStyles } from "../styles/styles";
import { Button, Space, Tooltip } from "antd";
import { ExpandOutlined, MinusOutlined, PlusOutlined } from "@ant-design/icons";
import { useCanvas } from "@/providers";
import { DeviceOptions } from "./mobileDropdown";
import { DEFAULT_OPTIONS } from "@/providers/canvas/utils";

export interface ICanvasConfigProps {

}

export const CanvasConfig: FC<ICanvasConfigProps> = () => {
  const { styles } = useStyles();
  const { setCanvasZoom, setCanvasAutoZoom, autoZoom, zoom } = useCanvas();

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

