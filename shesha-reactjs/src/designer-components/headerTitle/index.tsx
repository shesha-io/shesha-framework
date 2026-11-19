import { FontSizeOutlined } from '@ant-design/icons';
import { CSSProperties } from 'react';
import { IToolboxComponent } from '@/interfaces';
import { HEADER_TITLE_TYPE, IHeaderTitleComponentProps } from './models';
import { getSettings } from './settingsForm';

/** Everything typographic comes from the header the title sits in. */
const TITLE_STYLE: CSSProperties = {
  display: 'block',
  margin: 0,
  font: 'inherit',
  color: 'inherit',
  textAlign: 'inherit',
};

/**
 * Title of a card's or panel's header. Not in the toolbox: the card and panel create it in their header
 * (see `migrateCardHeaderLayout`, `migrateV9toV10`). It has no theme group or default styles, so the
 * theme's Text defaults never reach it - its font is the header's.
 */
const HeaderTitleComponent: IToolboxComponent<IHeaderTitleComponentProps> = {
  type: HEADER_TITLE_TYPE,
  name: 'Header Title',
  icon: <FontSizeOutlined />,
  isInput: false,
  isOutput: true,
  isHidden: true,
  Factory: ({ model }) => {
    if (model.hidden === true) return null;
    return <span className="sha-header-title" style={TITLE_STYLE}>{model.content}</span>;
  },
  settingsFormMarkup: getSettings,
  initModel: (model) => ({ ...model, content: model.content ?? 'Title' }),
};

export default HeaderTitleComponent;
