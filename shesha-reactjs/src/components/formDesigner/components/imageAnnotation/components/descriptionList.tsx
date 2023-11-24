import React, { FC } from 'react';
import DisplayFormItem from '@/components/displayFormItem';
import { IDataAnnotationListProps } from '../model';

const DescriptionsList: FC<IDataAnnotationListProps> = ({ data }) => {
  const filteredData = data?.map(({ id, mark, comment }) => ({ id, mark, comment }));
  return (
    <div className="List-Container">
      {filteredData
        ?.filter(mark => !!mark?.comment)
        ?.sort((a, b) => {
          const order = [...a.comment?.split('.'), ...b.comment?.split('.')];
          return parseInt(order[0], 10) - parseInt(order[2], 10);
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

export default DescriptionsList;
