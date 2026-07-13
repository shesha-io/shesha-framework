import React, { CSSProperties, FC, ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { fadeColor } from "@/components/refListSelectorDisplay/provider/utils";
import { getFontStyle } from "@/designer-components/_settings/utils/font/utils";
import ConfigurableButton from "@/designer-components/button/configurableButton";
import { StyleBoxValue } from "@/providers/form/models";
import { pickStyleFromModel } from "@/providers/form/utils";
import { useTheme } from "@/providers/theme";
import { isDefined } from "@/utils/nullables";
import { jsonSafeParse } from "@/utils/object";
import { addPx } from '@/utils/style';
import { Button, Form, FormInstance } from "antd";
import classNames from "classnames";
import { IChevronButton, IChevronControlProps } from "./models";
import { useStyles } from "./styles";


export const ChevronControl: FC<IChevronControlProps> = (props) => {
  const fontStyles = useMemo(() => getFontStyle(props.font), [props.font]);
  const { value, activeColor, showIcons, colorSource, items, width, height, stylingBox } = props;
  const { styles } = useStyles({ height });
  const [form] = Form.useForm();
  const { theme } = useTheme();
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const stylingBoxJSON = jsonSafeParse<StyleBoxValue>(stylingBox || '{}');
  const stylingBoxCSS = pickStyleFromModel(stylingBoxJSON);

  const renderButton = (props: IChevronButton, uuid: string, form?: FormInstance): ReactNode => {
    function getColor(source: string): string | undefined {
      switch (source) {
        case 'primary':
          return theme.application?.primaryColor;
        case 'custom':
          return activeColor ?? theme.application?.primaryColor;
        case 'reflist':
          return props.color ?? theme.application?.primaryColor;
        default:
          return theme.application?.primaryColor;
      }
    }

    const color = isDefined(colorSource) ? getColor(colorSource) : undefined;
    const newStyles: CSSProperties = {
      backgroundColor: props.itemValue === value ? color : fadeColor(color, 70),
      clipPath: 'polygon(95% 0, 100% 50%, 95% 100%, 0% 100%, 5% 50%, 0% 0%)',
      cursor: 'pointer',
      outline: 'none',
      width: addPx(width) ?? '150px',
      height: addPx(height) ?? '35px',
      borderRadius: '0px',
      ...fontStyles,

    };

    return props.hidden !== true
      ? (
        <div className={styles.chevronButton}>
          <ConfigurableButton
            key={uuid}
            {...props}
            icon={showIcons ? props.icon : undefined}
            style={{ ...newStyles, ...stylingBoxCSS, alignContent: fontStyles.textAlign, justifyContent: fontStyles.textAlign }}
            readOnly={props.readOnly}
            buttonType="text"
            form={form}
            label={props.item}
          />
        </div>
      )
      : undefined;
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container)
      return undefined;

    const handleScroll = (): void => {
      setShowLeftArrow(container.scrollLeft > 0);
      setShowRightArrow(
        container.scrollLeft < container.scrollWidth - container.clientWidth,
      );
    };

    container.addEventListener('scroll', handleScroll);
    handleScroll(); // Call once to set initial state

    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  const scroll = (e: React.MouseEvent, scrollOffset: number): void => {
    e.preventDefault();
    if (containerRef.current)
      containerRef.current.scrollLeft += scrollOffset;
  };


  return (
    <div className={styles.pipelineContainer}>
      {showLeftArrow && (
        <Button onClick={(e) => scroll(e, -100)} className={classNames(styles.arrowButton, styles.leftArrow)}>
          &#8249;
        </Button>
      )}
      <div ref={containerRef} className={styles.pipelineStages}>
        {items?.map((item) => {
          return renderButton(item, item.id, form);
        })}
      </div>
      {showRightArrow && (
        <Button onClick={(e) => scroll(e, 100)} className={classNames(styles.arrowButton, styles.rightArrow)}>
          &#8250;
        </Button>
      )}
    </div>
  );
};


