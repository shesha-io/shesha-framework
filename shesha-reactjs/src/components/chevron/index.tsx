import { FC, ReactNode, useEffect, useMemo, useRef, useState } from "react";
import * as React from "react";
import ConfigurableButton from "@/designer-components/button/configurableButton";
import { useTheme } from "@/providers/theme";
import { isDefined } from "@/utils/nullables";
import classNames from "classnames";
import { IChevronButton, IChevronControlProps, isChevronItem } from "./models";
import { useRefListItemGroupConfigurator } from "@/components/refListSelectorDisplay/provider";
import { useStyles } from "./styles";
import { fadeColor } from "../refListSelectorDisplay/provider/utils";

export const ChevronControl: FC<IChevronControlProps> = (props) => {
  const { value, activeColor, showIcons, colorSource, onChange, readOnly } = props;
  const { items: refListItems } = useRefListItemGroupConfigurator();
  // Render from the reference list held by the provider rather than the saved snapshot,
  // so the designer, preview and runtime cannot drift apart.
  const items = useMemo(() => refListItems.filter(isChevronItem), [refListItems]);
  const { styles } = useStyles(props);
  const { theme } = useTheme();
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const stagesRef = useRef<HTMLDivElement>(null);

  const getColor = React.useCallback((source: NonNullable<IChevronControlProps['colorSource']>, itemColor: string | undefined): string | undefined => {
    switch (source) {
      case 'primary':
        return theme.application?.primaryColor;
      case 'custom':
        return activeColor ?? theme.application?.primaryColor;
      case 'reflist':
        return itemColor ?? theme.application?.primaryColor;
      default:
        return theme.application?.primaryColor;
    }
  }, [activeColor, theme.application?.primaryColor]);

  // The item configurator stores the per-step visibility as `hidden`, so that is what a step is
  // filtered on. Reading `visible` never worked: the configurator's editor seeds it to `true`,
  // so every step rendered regardless of the Hide switch.
  const visibleItems = useMemo(() => items.filter((item) => item.hidden !== true), [items]);

  const selectItem = React.useCallback((itemValue: number): void => {
    if (readOnly === true) return;
    onChange?.(itemValue);
  }, [onChange, readOnly]);

  const renderButton = React.useCallback((itemProps: IChevronButton, uuid: string): ReactNode => {
    const color = getColor(colorSource ?? 'primary', itemProps.color);
    return (
      <ConfigurableButton
        key={uuid}
        {...itemProps}
        icon={showIcons === true ? itemProps.icon : undefined}
        buttonType="default"
        label={itemProps.item}
        className={classNames(styles.chevronButton, { [styles.chevronButtonActive]: itemProps.itemValue === value })}
        font={props.font}
        background={{ type: 'color', color: itemProps.itemValue === value ? color : fadeColor(color, 70) }}
        // Clicking a step must set the bound property. `onBeforeClick` runs in addition to the
        // step's own action, so the Events configuration keeps working.
        onBeforeClick={() => selectItem(itemProps.itemValue)}
      />
    );
  }, [colorSource, getColor, props.font, selectItem, showIcons, styles.chevronButton, styles.chevronButtonActive, value]);

  const buttons = useMemo(() => visibleItems.map((item) => renderButton(item, item.id)), [visibleItems, renderButton]);

  const updateArrows = React.useCallback((stages: HTMLDivElement): void => {
    setShowLeftArrow(stages.scrollLeft > 0);
    setShowRightArrow(stages.scrollLeft < stages.scrollWidth - stages.clientWidth - 1);
  }, []);

  useEffect(() => {
    const stages = stagesRef.current;
    if (!stages)
      return undefined;

    const handleScroll = (): void => updateArrows(stages);
    stages.addEventListener('scroll', handleScroll);
    handleScroll(); // Call once to set initial state

    return () => stages.removeEventListener('scroll', handleScroll);
  }, [buttons, updateArrows]);

  useEffect(() => {
    const container = containerRef.current;
    const stages = stagesRef.current;
    if (!isDefined(stages) || !isDefined(container) || typeof ResizeObserver === 'undefined')
      return undefined;

    const observer = new ResizeObserver(() => updateArrows(stages));
    observer.observe(stages);
    observer.observe(container);
    return () => observer.disconnect();
  }, [updateArrows]);

  const scroll = (e: React.MouseEvent, scrollOffset: number): void => {
    e.preventDefault();
    if (stagesRef.current)
      stagesRef.current.scrollLeft += scrollOffset;
  };

  return (
    <div className={styles.pipelineContainer} ref={containerRef}>
      {showLeftArrow && (
        <button type="button" aria-label="Scroll left" onClick={(e) => scroll(e, -100)} className={classNames(styles.arrowButton, styles.leftArrow)}>
          <span aria-hidden="true">&#9204;</span>
        </button>
      )}
      <div ref={stagesRef} className={styles.pipelineStages}>{buttons}</div>
      {showRightArrow && (
        <button type="button" aria-label="Scroll right" onClick={(e) => scroll(e, 100)} className={classNames(styles.arrowButton, styles.rightArrow)}>
          <span aria-hidden="true">&#9205;</span>
        </button>
      )}
    </div>
  );
};


