import React, { FC, Fragment } from 'react';
import { Tooltip, Button } from 'antd';
import { IToolbarItem } from '@/interfaces';
import { SizeType } from 'antd/lib/config-provider/SizeContext';
import { nanoid } from '@/utils/uuid';
import classNames from 'classnames';
import { useStyles } from './styles/styles';

export interface IActionButtonGroupProps {
  /** The items to display as buttons */
  items: IToolbarItem[];

  /** The class name */
  className?: string;

  /** The button size  */
  btnSize?: SizeType;
}

/**
 * A component to display action buttons.
 *
 * Can be rendered as toolbar items and extra buttons on the CollapsiblePanel
 */
export const ActionButtonGroup: FC<IActionButtonGroupProps> = ({ items, className, btnSize = 'small' }) => {
  const { styles } = useStyles();
  return (
    <div className={classNames(styles.shaActionBtnGroup, className)}>
      <div className="sha-index-toolbar-left">
        <Fragment>
          <Fragment>
            {items
              ?.filter(({ hide }) => !hide)
              ?.map(({ title, icon, onClick, className: localClassName, disabled, tooltipName, render }) => {
                if (render && typeof render === 'function') {
                  return render();
                }

                return (
                  <Tooltip title={tooltipName} placement="right" key={nanoid()}>
                    <Button
                      onClick={(event) => {
                        event?.stopPropagation();
                        onClick(event);
                      }}
                      disabled={disabled}
                      className={classNames(styles.toolbarItem, { disabled }, localClassName)}
                      key={nanoid()}
                      type="link"
                      icon={icon}
                      size={btnSize}
                    >
                      {title}
                    </Button>
                  </Tooltip>
                );
              })}
          </Fragment>
        </Fragment>
      </div>
    </div>
  );
};

export default ActionButtonGroup;
