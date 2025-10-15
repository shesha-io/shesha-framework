
import { ITableFilter } from '@/providers/dataTable/interfaces';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { Button, Tag } from 'antd';
import React, { FC, useEffect, useRef } from 'react';
import { useStyles } from '../advancedFilterButton/style';

export interface IFilterListProps {
  filters?: ITableFilter[];
  clearFilters?: () => void;
  removeColumnFilter?: (columnId: string) => void;
  rows: number;
}

export const FilterList: FC<IFilterListProps> = ({ filters, clearFilters, removeColumnFilter, rows }) => {
  const filtersRef = useRef(null);
  const scrollbarLeftArrow = useRef(null);
  const scrollbarRightArrow = useRef(null);
  const { styles } = useStyles();

  const manageArrows = (): void => {
    if (!filtersRef.current) return;

    const maxScrollDistance = filtersRef.current.scrollWidth - filtersRef.current.clientWidth - 30;

    if (filtersRef.current.scrollLeft <= 0) {
      scrollbarLeftArrow.current.classList.add("hidden");
      filtersRef.current.style.marginLeft = '0px';
    } else {
      scrollbarLeftArrow.current.classList.remove("hidden");
      filtersRef.current.style.marginLeft = '24px';
    }

    if (filtersRef.current.scrollLeft > maxScrollDistance + 24) {
      scrollbarRightArrow.current.classList.add("hidden");
      filtersRef.current.style.marginRight = '0px';
    } else {
      scrollbarRightArrow.current.classList.remove("hidden");
      filtersRef.current.style.marginRight = '24px';
    }
  };

  const scrollRight = (): void => {
    if (filtersRef.current) {
      filtersRef.current.scrollLeft += 100;
      manageArrows();
    }
  };

  const scrollLeft = (): void => {
    if (filtersRef.current) {
      manageArrows();
      filtersRef.current.scrollLeft -= filtersRef.current.scrollLeft === 0 ? 200 : 100;
    }
  };

  useEffect(() => {
    manageArrows();

    const handleScroll = (): void => {
      manageArrows();
    };

    if (filtersRef.current) {
      manageArrows();
      filtersRef.current.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (filtersRef.current) {
        filtersRef.current.removeEventListener('scroll', handleScroll);
      }
    };
  }, [filtersRef.current]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.resultCount}>
        {`Filters (${rows} results):`}
      </div>

      <div className={styles.scrollableTagsContainer}>
        <LeftOutlined
          ref={scrollbarLeftArrow}
          className={styles.arrowLeft}
          onClick={scrollLeft}
        />
        <div className={styles.filters} ref={filtersRef}>
          {filters?.map(({ columnId }) => {
            return (
              <Tag
                bordered={false}
                closable
                key={columnId}
                onClose={() => removeColumnFilter(columnId)}
                className={styles.tag}
              >
                {columnId}
              </Tag>
            );
          })}
        </div>
        <RightOutlined
          ref={scrollbarRightArrow}
          className={styles.arrowRight}
          onClick={scrollRight}
        />
      </div>

      {filters.length > 1 && (
        <Button
          onClick={clearFilters}
          type="link"
          className={styles.clearAllButton}
        >
          clear all
        </Button>
      )}
    </div>
  );
};
