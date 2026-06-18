import React, { FC, useEffect, useState } from "react";
import { useStyles } from "../styles/styles";
import { Button, InputNumber, Space, Tooltip } from "antd";
import { ExpandOutlined, MinusOutlined, PlusOutlined } from "@ant-design/icons";
import { useCanvas } from "@/providers";
import { DeviceOptions } from "./mobileDropdown";
import { DEFAULT_OPTIONS } from "@/providers/canvas/utils";

const ZOOM_LEVELS = DEFAULT_OPTIONS.zoomLevels;

const clampZoom = (zoom: number): number =>
  Math.max(DEFAULT_OPTIONS.minZoom, Math.min(DEFAULT_OPTIONS.maxZoom, zoom));

const getNextZoomLevel = (currentZoom: number): number =>
  ZOOM_LEVELS.find((level) => level > currentZoom) ?? DEFAULT_OPTIONS.maxZoom;

const getPrevZoomLevel = (currentZoom: number): number =>
  [...ZOOM_LEVELS].reverse().find((level) => level < currentZoom) ?? DEFAULT_OPTIONS.minZoom;

export const CanvasConfig: FC = () => {
  const { styles } = useStyles();
  const { setCanvasZoom, setCanvasAutoZoom, autoZoom, zoom } = useCanvas();

  // Local state so the user can type freely before committing the value
  const [inputZoom, setInputZoom] = useState<number | null>(zoom);

  useEffect(() => {
    setInputZoom(zoom);
  }, [zoom]);

  // Zoom out: exit Auto mode (5e) and step to the previous predefined level (5c)
  const handleZoomOut = (): void => {
    if (autoZoom) setCanvasAutoZoom();
    setCanvasZoom(getPrevZoomLevel(zoom));
  };

  // Zoom in: exit Auto mode (5e) and step to the next predefined level (5c)
  const handleZoomIn = (): void => {
    if (autoZoom) setCanvasAutoZoom();
    setCanvasZoom(getNextZoomLevel(zoom));
  };

  // Commit a manually entered zoom value (5d), clamped to the allowed range
  const commitInputZoom = (): void => {
    if (inputZoom === null || Number.isNaN(inputZoom)) {
      setInputZoom(zoom);
      return;
    }
    if (autoZoom) setCanvasAutoZoom();
    setCanvasZoom(clampZoom(inputZoom));
  };

  return (
    <div className={styles.shaDesignerCanvasConfig}>
      <Space orientation="horizontal" size={5} style={{ flexWrap: "nowrap" }}>
        <DeviceOptions />
        <Space orientation="horizontal" size={2} style={{ flexWrap: "nowrap" }}>
          <Tooltip title={autoZoom ? "Auto" : "Manual"}>
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
          <Tooltip title="Zoom out"><Button size="small" type="default" icon={<MinusOutlined />} title="Zoom out" onClick={handleZoomOut} /></Tooltip>
          <Tooltip title="Zoom (%)">
            <InputNumber
              size="small"
              min={DEFAULT_OPTIONS.minZoom}
              max={DEFAULT_OPTIONS.maxZoom}
              value={inputZoom}
              controls={false}
              style={{ width: 56 }}
              formatter={(value) => `${value}%`}
              parser={(value) => Number((value ?? '').replace('%', ''))}
              onChange={(value) => setInputZoom(value)}
              onBlur={commitInputZoom}
              onPressEnter={commitInputZoom}
            />
          </Tooltip>
          <Tooltip title="Zoom in"><Button size="small" type="default" icon={<PlusOutlined />} title="Zoom in" onClick={handleZoomIn} /></Tooltip>
        </Space>
      </Space>
    </div>
  );
};
