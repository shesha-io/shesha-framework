import { FC } from 'react';
import { useMedia } from 'react-use';
import { useStyles } from './style';
import { ITablePagerBaseProps } from './tablePaging';


export const TableNoPaging: FC<Pick<ITablePagerBaseProps, 'totalRows' | 'style' | 'font' | 'stylingBoxJson'>> = (props) => {
  const { styles } = useStyles(props);
  const isWider = useMedia('(min-width: 1202px)');

  if (!isWider) return null;

  return (
    <div className={styles.pagerContainer} style={props.style}>
      <span className={styles.pagerItemsNumber}>Total {props.totalRows} items</span>
    </div>
  );
};

export default TableNoPaging;
