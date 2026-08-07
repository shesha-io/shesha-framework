import React from "react";
import { IBackgroundValue, IDropdownOption, IRadioOption } from "./interfaces";
import { isDefined } from "@/utils/nullables";

/**
 * Reads gradient colour stops as an ordered array.
 *
 * Stops are stored as `string[]`, but configurations saved before that change hold a
 * `Record<string, string>` keyed by generated ids. Those are read through `Object.values`, which
 * preserves the insertion order the configurer saw in the editor. Blank stops are dropped either
 * way, since an empty entry cannot contribute to a CSS gradient.
 */
export const getGradientColors = (colors: string[] | Record<string, string | undefined> | undefined): string[] =>
  (Array.isArray(colors) ? colors : Object.values(colors ?? {}))
    .filter((color): color is string => typeof color === 'string' && color.trim() !== '');

export const getBackgroundImageUrl = async (propertyName: IBackgroundValue | undefined, backendUrl: string, httpHeaders: object): Promise<string> => {
  return (
    isDefined(propertyName) && propertyName.storedFile?.id && propertyName.type === 'storedFile'
      ? await fetch(`${backendUrl}/api/StoredFile/Download?id=${propertyName.storedFile.id}`, {
        headers: { ...httpHeaders, 'Content-Type': 'application/octet-stream' },
      })
        .then((response) => {
          return response.blob();
        })
        .then((blob) => {
          return URL.createObjectURL(blob);
        })
      : ''
  );
};

export const getBackgroundStyle = (input: IBackgroundValue | undefined, jsStyle: React.CSSProperties | undefined, url?: string): React.CSSProperties => {
  const style: React.CSSProperties = {};
  if (!isDefined(input))
    return style;

  if (input.size) {
    style.backgroundSize = input.size;
  }

  if (input.position) {
    style.backgroundPosition = input.position;
  }

  if (isDefined(input.repeat)) {
    style.backgroundRepeat = input.repeat;
  }

  if (isDefined(jsStyle) && (jsStyle.background || jsStyle.backgroundColor || jsStyle.backgroundImage))
    return style;

  switch (input.type) {
    case 'color': {
      style.backgroundColor = input.color;
      break;
    }
    case 'gradient': {
      const direction = input.gradient?.direction;
      const isRadial = direction === 'radial';
      const isConic = direction === 'conic';
      const colorsString = getGradientColors(input.gradient?.colors).join(', ');
      if (colorsString) {
        style.backgroundImage = isRadial || isConic
          ? `${direction}-gradient(${colorsString})`
          : `linear-gradient(${direction || 'to right'}, ${colorsString})`;
      }
      break;
    }
    case 'url': {
      style.backgroundImage = `url(${input.url})`;
      break;
    }
    case 'image': {
      const uploadFile = input.uploadFile;
      style.backgroundImage = `url(${uploadFile?.url || uploadFile})`;
      break;
    }
    case 'storedFile': {
      style.backgroundImage = `url(${url})`;
      break;
    }
  }

  return style;
};

export const gradientDirectionOptions: IDropdownOption[] = [
  { value: 'to right', label: 'To right' },
  { value: 'to left', label: 'To left' },
  { value: 'to top', label: 'To top' },
  { value: 'to bottom', label: 'To bottom' },
  { value: 'to top right', label: 'To top right' },
  { value: 'to top left', label: 'To top left' },
  { value: 'to bottom right', label: 'To bottom right' },
  { value: 'to bottom left', label: 'To bottom left' },
  { value: 'radial', label: 'Radial' },
  { value: 'conic', label: 'Conic' },
];

export const backgroundTypeOptions: IRadioOption[] = [
  {
    value: "color",
    icon: "FormatPainterOutlined",
    title: "Color",
  },
  {
    value: "gradient",
    icon: "BgColorsOutlined",
    title: "Gradient",
  },
  {
    value: "image",
    icon: "PictureOutlined",
    title: "Image",
  },
  {
    value: "url",
    icon: "LinkOutlined",
    title: "URL",
  },
  {
    value: "storedFile",
    icon: "DatabaseOutlined",
    title: "Stored File",
  },
];

export const repeatOptions: IRadioOption[] = [
  { value: 'no-repeat', title: 'No Repeat', icon: 'noRepeatIcon' },
  { value: 'repeat', title: 'Repeat', icon: 'repeatIcon' },
  { value: 'repeat-x', title: 'Repeat X', icon: 'repeatXIcon' },
  { value: 'repeat-y', title: 'Repeat Y', icon: 'repeatYIcon' },
];

export const sizeOptions: IDropdownOption[] = [{ value: 'cover', label: 'Cover' }, { value: 'contain', label: 'Contain' }, { value: 'auto', label: 'Auto' }];

export const positionOptions: IDropdownOption[] = [
  { value: 'center', label: 'Center' },
  { value: 'top', label: 'Top' },
  { value: 'left', label: 'Left' },
  { value: 'right', label: 'Right' },
  { value: 'bottom', label: 'Bottom' },
  { value: 'top left', label: 'Top left' },
  { value: 'top right', label: 'Top right' },
  { value: 'bottom left', label: 'Bottom left' },
  { value: 'bottom right', label: 'Bottom right' }];
