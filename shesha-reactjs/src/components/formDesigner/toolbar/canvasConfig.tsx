import React, { FC, useState } from "react";
import { useStyles } from "../styles/styles";
import { Button, InputNumber, Space, Tooltip } from "antd";
import { ExpandOutlined, MinusOutlined, PlusOutlined } from "@ant-design/icons";
import { useCanvas } from "@/providers";
import { DeviceOptions } from "./mobileDropdown";
import { DEFAULT_OPTIONS } from "@/providers/canvas/utils";
import { useDebouncedCallback } from "use-debounce";

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
  // The last zoom we synced from. Stored in state (not a ref) so we can compare during render and
  // mirror *external* zoom changes without a setState-in-effect. See:
  // https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  const [lastSyncedZoom, setLastSyncedZoom] = useState(zoom);
  // True while the user is actively editing the input (focused or holding the arrow keys). While
  // editing, the input owns its value and we don't let external zoom changes overwrite what's typed.
  const [isEditing, setIsEditing] = useState(false);

  // Committing zoom re-renders the whole canvas, so debounce it. This keeps the input responsive
  // (and avoids "Maximum update depth exceeded" when holding the arrow keys) while the canvas
  // catches up once the rapid-fire changes settle.
  const debouncedSetCanvasZoom = useDebouncedCallback((value: number) => {
    if (autoZoom) setCanvasAutoZoom(false);
    setCanvasZoom(value);
  }, 150);

  // Mirror external zoom changes (auto-zoom, +/- buttons, device change) into the input during
  // render. We skip this while the user is editing or a debounced commit is pending so we never
  // clobber what's being typed.
  if (zoom !== lastSyncedZoom) {
    setLastSyncedZoom(zoom);
    if (!isEditing && !debouncedSetCanvasZoom.isPending() && zoom !== inputZoom) {
      setInputZoom(zoom);
    }
  }

  // Zoom out: exit Auto mode (5e) and step to the previous predefined level (5c)
  const handleZoomOut = (): void => {
    debouncedSetCanvasZoom.cancel();
    if (autoZoom) setCanvasAutoZoom(false);
    setCanvasZoom(getPrevZoomLevel(zoom));
  };

  // Zoom in: exit Auto mode (5e) and step to the next predefined level (5c)
  const handleZoomIn = (): void => {
    debouncedSetCanvasZoom.cancel();
    if (autoZoom) setCanvasAutoZoom(false);
    setCanvasZoom(getNextZoomLevel(zoom));
  };

  const handleInputFocus = (): void => {
    setIsEditing(true);
  };

  // Apply the zoom live as the user types (5d). The input keeps the raw typed value so partial
  // entries (e.g. "1" on the way to "150") aren't clamped mid-typing, but the canvas only updates
  // (debounced) once the typed value lands within the allowed range.
  const handleInputZoomChange = (value: number | null): void => {
    setIsEditing(true);
    setInputZoom(value);
    if (value === null || Number.isNaN(value)) return;
    if (value < DEFAULT_OPTIONS.minZoom || value > DEFAULT_OPTIONS.maxZoom) return;
    debouncedSetCanvasZoom(value);
  };

  // Commit a manually entered zoom value on blur/Enter, clamped to the allowed range. Flush any
  // pending debounced update immediately so the canvas matches the field as soon as editing ends.
  const commitInputZoom = (): void => {
    setIsEditing(false);
    debouncedSetCanvasZoom.cancel();
    if (inputZoom === null || Number.isNaN(inputZoom)) {
      setInputZoom(zoom);
      return;
    }
    if (autoZoom) setCanvasAutoZoom(false);
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
              onFocus={handleInputFocus}
              onChange={handleInputZoomChange}
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
