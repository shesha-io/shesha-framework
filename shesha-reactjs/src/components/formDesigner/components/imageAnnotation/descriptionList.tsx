import React, { FC } from 'react';
import DisplayFormItem from '../../../displayFormItem';
import { IDataAnnotationListProps } from './model';

const DescriptionsList: FC<IDataAnnotationListProps> = ({ data }) => {
  const filteredData = data?.map(({ id, mark, comment }) => ({ id, mark, comment }));
  return (
    <div className="List-Container">
      {filteredData
        ?.filter(mark => !!mark?.comment)
        ?.sort((a, b) => {
          const order = [...a.comment?.split('.'), ...b.comment?.split('.')];
          return parseInt(order[0]) - parseInt(order[2]);
        })
        ?.map(mrk => {
          const [index, comment] = mrk.comment?.split('.') || [];
          return (
            <div className="List-item">
              <span className="numbering">{`${index}.`}</span>
              <DisplayFormItem> {comment}</DisplayFormItem>
            </div>
          );
        })}
    </div>
  );
};

export { DescriptionsList };
