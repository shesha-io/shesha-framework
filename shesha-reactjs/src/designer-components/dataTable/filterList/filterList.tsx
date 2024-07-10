
import { ITableFilter } from '@/providers/dataTable/interfaces';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { Button, Tag } from 'antd';
import React, { FC, useEffect, useRef } from 'react';

export interface IFilterListProps {
    filters?: ITableFilter[];
    clearFilters?: () => void;
    removeColumnFilter?: (columnId: string) => void;
    styles: any;
    rows: number;
}

export const FilterList: FC<IFilterListProps> = ({ filters, clearFilters, styles, removeColumnFilter, rows }) => {

    const filtersRef = useRef(null);
    const scrollbarLeftArrow = useRef(null);
    const scrollbarRightArrow = useRef(null);

    const manageArrows = () => {
        if (!filtersRef.current) return;

        const maxScrollDistance = filtersRef.current.scrollWidth - filtersRef.current.clientWidth - 30;

        if (filtersRef.current.scrollLeft <= 0) {
            scrollbarLeftArrow.current.classList.add("hidden");
        } else {
            scrollbarLeftArrow.current.classList.remove("hidden");
        }

        if (filtersRef.current.scrollLeft > maxScrollDistance + 24) {
            scrollbarRightArrow.current.classList.add("hidden");
        } else {
            scrollbarRightArrow.current.classList.remove("hidden");
        }

        if (filtersRef.current.scrollWidth <= filtersRef.current.clientWidth) {
            scrollbarRightArrow.current.classList.remove("active");
            scrollbarLeftArrow.current.classList.remove("active");
        }
    };

    const scrollRight = () => {
        if (filtersRef.current) {
            filtersRef.current.scrollLeft += 100;
            manageArrows();
        }
    };

    const scrollLeft = () => {
        if (filtersRef.current) {
            manageArrows();
            filtersRef.current.scrollLeft -= filtersRef.current.scrollLeft === 0 ? 200 : 100;
        }
    };

    useEffect(() => {
        manageArrows();

        const handleScroll = () => {
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
        <div style={{ textAlign: "center" }}>
            <div className={styles.scrollableTagsContainer}>
                <LeftOutlined
                    ref={scrollbarLeftArrow}
                    className={styles.arrowLeft}
                    onClick={scrollLeft}
                />
                <div className="filters" ref={filtersRef}>
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
            {`Filters (${rows} results): `}
            <Button
                onClick={clearFilters}
                type='link'
                style={{ padding: "0 4px", marginRight: "2em", height: "max-content" }}
            >
                clear all
            </Button>
        </div>
    );
};
