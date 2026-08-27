import { isNotNullOrWhiteSpace } from '@/utils/nullables';
import { Radio } from 'antd';
import { SizeType } from 'antd/lib/config-provider/SizeContext';
import { FC } from 'react';
import { isRefListDisplayMode, RefListDisplayMode, RefListDisplayValue, toRefListDisplayMode } from './models';

export interface IRefListDisplaySelectorProps {
  value?: RefListDisplayValue | undefined;
  readOnly?: boolean | undefined;
  onChange?: ((value: RefListDisplayMode) => void) | undefined;
  /** Reports the hovered option to the inheritance popover, as the edit mode selector does. */
  onGetAdditionalInfo?: ((info: string) => void) | undefined;
  size?: SizeType | undefined;
  className?: string | undefined;
}

/**
 * Labelled with words rather than glyphs: the shared `Icon` set carries nothing that reads as "name"
 * or "icon", and a three-state control is not worth inventing iconography for.
 */
const OPTIONS: { mode: RefListDisplayMode; label: string; hint: string }[] = [
  { mode: 'name', label: 'Name', hint: 'Show the reference list item name' },
  { mode: 'icon', label: 'Icon', hint: 'Show the reference list item icon' },
  { mode: 'both', label: 'Both', hint: 'Show the reference list item icon and name' },
];

/**
 * Chooses between showing a reference list item's name, its icon, or both. One of the three is
 * always selected - the control has no way to express "neither".
 */
const RefListDisplaySelector: FC<IRefListDisplaySelectorProps> = (props) => {
  return (
    <Radio.Group
      buttonStyle="solid"
      value={toRefListDisplayMode(props.value)}
      /* antd types the event value as `any`. Bringing it into the type system by conversion and then
         narrowing keeps a value from outside these three options away from the caller, without
         coercing anything. */
      onChange={(e) => {
        const selected = String(e.target.value);
        if (isRefListDisplayMode(selected))
          props.onChange?.(selected);
      }}
      size={props.size}
      disabled={props.readOnly ?? false}
      {...(isNotNullOrWhiteSpace(props.className) ? { className: props.className } : {})}
    >
      {OPTIONS.map(({ mode, label, hint }) => (
        <Radio.Button
          key={mode}
          value={mode}
          title={hint}
          onMouseEnter={() => props.onGetAdditionalInfo?.(label)}
        >
          {label}
        </Radio.Button>
      ))}
    </Radio.Group>
  );
};

export default RefListDisplaySelector;
