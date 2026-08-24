import { IKeyInformationBarComponentProps, KeyInfomationBarItemProps } from '@/designer-components/keyInformationBar/interfaces';
import { Flex } from 'antd';
import { CSSProperties, FC } from 'react';
import { useStyles } from './style';
import { addPx } from '@/utils/style';
import ComponentsContainer from '../formDesigner/containers/componentsContainer';
import { isNullOrWhiteSpace } from '@/utils';

export const KeyInformationBar: FC<IKeyInformationBarComponentProps> = (props) => {
  const { styles } = useStyles(props);
  const { columns, hidden, orientation, gap, alignItems, styleCss, wrapperStyleCss, isDynamic } = props;

  if (hidden === true) return null;

  const vertical = orientation === 'vertical';

  const containerStyle = (item: KeyInfomationBarItemProps, gap?: number | undefined): CSSProperties => ({
    textAlign: item.textAlign,
    display: 'flex',
    flexDirection: item.flexDirection ? item.flexDirection : 'column',
    alignItems: item.textAlign,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    gap: addPx(gap ?? 0),
  });

  return (
    <Flex vertical={vertical} className={styles.flexContainer} style={styleCss}>
      {columns?.map((item, i) => {
        const itemWidth = addPx(item.width);
        return (
          <div
            key={item.id}
            className={styles.flexItemWrapper}
            style={vertical ? { width: isNullOrWhiteSpace(itemWidth) ? '100%' : itemWidth, justifyContent: alignItems } : { maxWidth: itemWidth }}
          >
            {i !== 0 && <div key={'divider' + i} className={styles.divider} />}
            <div className={styles.content} style={{ justifyContent: item.textAlign }}>
              <ComponentsContainer
                containerId={item.id}
                wrapperStyle={{
                  padding: addPx(item.padding) ?? '0px',
                  maxWidth: vertical ? '100%' : addPx(item.width),
                  boxSizing: 'border-box',
                }}
                style={{ ...containerStyle(item, gap), ...wrapperStyleCss }}
                dynamicComponents={isDynamic === true ? item.components : []}
              />
            </div>
          </div>
        );
      })}
    </Flex>
  );
};

export default KeyInformationBar;
