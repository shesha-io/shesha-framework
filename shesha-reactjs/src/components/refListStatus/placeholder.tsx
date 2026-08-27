import { IReferenceListIdentifier } from '@/interfaces/referenceList';
import { useReferenceList } from '@/providers/referenceListDispatcher';
import { isNullOrWhiteSpace } from '@/utils/nullables';
import { CSSProperties, FC } from 'react';
import { ShaIcon } from '../shaIcon';
import RefTag from './tag';
import { DEFAULT_SOLID_COLOR, PLAIN_TEXT_STYLE, resolveColor, SOLID_TEXT_COLOR } from './utils';

/** Stand-in text for a component with nothing to name it - an unbound status, in practice. */
const PLACEHOLDER_TEXT = 'N/A';
/** Generic icon for the canvas, where there is no item to read a real one from. */
const PLACEHOLDER_ICON = 'TagOutlined';

export interface IRefListStatusPlaceholderProps {
  referenceListId: IReferenceListIdentifier;
  /** Named on the canvas so the configurator can tell one status apart from the next. */
  propertyName: string | undefined;
  showIcon: boolean;
  showReflistName: boolean;
  solidBackground: boolean;
  style: CSSProperties;
  /** Emotion class for the tag itself, including the disabled treatment when it applies. */
  tagClassName: string;
}

/**
 * Stand-in for the designer canvas, which has no value to resolve and so nothing for the appearance
 * switches to act on.
 *
 * The icon is a generic tag rather than one lifted from the list: at design time there is no item
 * to read an icon from, and picking some other item's would misrepresent whichever value the form
 * ends up showing. The badge colour does come from the list, since that is a property of the list
 * as a whole rather than of the absent value.
 */
export const RefListStatusPlaceholder: FC<IRefListStatusPlaceholderProps> = ({
  referenceListId,
  propertyName,
  showIcon,
  showReflistName,
  solidBackground,
  style,
  tagClassName,
}) => {
  const items = useReferenceList(referenceListId).data?.items;

  // The first item that actually carries one, so the badge previews the colour the runtime will
  // paint for the items that have them, and grey for a list with none.
  const listColor = items?.find((item) => !isNullOrWhiteSpace(item.color))?.color;

  const text = isNullOrWhiteSpace(propertyName) ? PLACEHOLDER_TEXT : propertyName;

  return (
    <RefTag
      {...(solidBackground
        ? { color: resolveColor(listColor) ?? DEFAULT_SOLID_COLOR, variant: 'solid' as const }
        : {})}
      icon={showIcon ? <ShaIcon iconName={PLACEHOLDER_ICON} /> : null}
      style={solidBackground ? { ...style, color: SOLID_TEXT_COLOR } : { ...style, ...PLAIN_TEXT_STYLE }}
      className={tagClassName}
    >
      {/* The text is dropped only when an icon is there to stand for the component. With neither,
          the runtime renders a bare colour swatch - or nothing at all with the badge off - which is
          easy to mistake for a missing component while laying the form out. */}
      {showReflistName ? text : showIcon ? null : PLACEHOLDER_TEXT}
    </RefTag>
  );
};
