import classNames from 'classnames';
import React, { FC } from 'react';
import BoxInput from './input';
import '../styles/index.less';

interface IProps {
  className?: string;
  onChange?: Function;
  readOnly?: boolean;
  value?: string;
}

const Box: FC<IProps> = ({ className, onChange, readOnly, value }) => {
  const commonProps = { onChange, readOnly, value };

  return (
    <div className={classNames('sha-style-box', className)}>
      <div className="margin">
        <span className="title">Margin</span>

        <BoxInput {...commonProps} type="margin" direction="top" />
        <BoxInput {...commonProps} type="margin" direction="left" />
        <BoxInput {...commonProps} type="margin" direction="bottom" />
        <BoxInput {...commonProps} type="margin" direction="right" />

        <div className="padding">
          <span className="title">Padding</span>

          <BoxInput {...commonProps} type="padding" direction="top" />
          <BoxInput {...commonProps} type="padding" direction="left" />
          <BoxInput {...commonProps} type="padding" direction="bottom" />
          <BoxInput {...commonProps} type="padding" direction="right" />

          <div className="center" />
        </div>
      </div>
    </div>
  );
};

export default Box;
