import classNames from 'classnames';
import React, {
    CSSProperties,
    FC,
    PropsWithChildren,
    useMemo
} from 'react';
import { ITextTypographyProps, ITypographyProps } from './models';
import { ParagraphProps } from 'antd/lib/typography/Paragraph';
import { TextProps } from 'antd/lib/typography/Text';
import { TitleProps } from 'antd/lib/typography/Title';
import { useStyles } from './styles/styles';
import { useTheme } from '@/providers';
import {
    DEFAULT_PADDING_SIZE,
    getFontSizeStyle,
    getPaddingSizeStyle,
} from './utils';
import { Typography } from 'antd';

const { Paragraph, Text, Title } = Typography;

declare const TITLE_ELE_LIST: [1, 2, 3, 4, 5];

type LevelType = typeof TITLE_ELE_LIST[number];

interface IGenericTextProps
    extends Omit<ITextTypographyProps, 'style' | 'contentDisplay' | 'name' | 'id' | 'type' | 'content' | 'value'> {
    style?: CSSProperties;
}

export const GenericText: FC<PropsWithChildren<IGenericTextProps>> = ({
    children,
    backgroundColor,
    color,
    contentType,
    dataType,
    dateFormat,
    fontSize,
    level,
    numberFormat,
    padding = DEFAULT_PADDING_SIZE,
    textType,
    style,
    ...model
}) => {
    const { theme } = useTheme();
    const { styles } = useStyles();
    // NOTE: to be replaced with a generic context implementation
    const sizeIdentifier = textType === 'title' ? level : fontSize;

    const fontSizeStyle = typeof sizeIdentifier === 'string' ? getFontSizeStyle(sizeIdentifier) : {};
    const paddingStyle = getPaddingSizeStyle(padding);

    const textColor = useMemo(() => {
        if (!contentType || !contentType[0]) return theme?.text?.default;

        if (contentType === 'secondary') return theme?.text?.secondary;

        if (contentType === 'custom' && color) return color;

        return null;
    }, [color, contentType, theme?.text]);

    const baseProps: ITypographyProps = {
        code: model?.code,
        copyable: model?.copyable,
        delete: model?.delete,
        ellipsis: model?.ellipsis,
        mark: model?.mark,
        underline: model?.underline,
        keyboard: model?.keyboard,
        italic: model?.italic,
        type: contentType !== 'custom' && contentType !== 'info' && contentType !== 'primary' ? contentType : null,
        style: {
            margin: 'unset',
            ...fontSizeStyle,
            ...paddingStyle,
            ...(style ?? {}),
            backgroundColor: backgroundColor,
            color: textColor,
        },
    };

    const textProps: TextProps = {
        ...baseProps,
        strong: model?.strong,
    };

    const paragraphProps: ParagraphProps = {
        ...baseProps,
        strong: model?.strong,
    };

    const titleProps: TitleProps = {
        ...baseProps,
        level: level ? (Number(level) as LevelType) : 1,
    };

    const className = classNames(styles.typographyText, { [styles.primary]: contentType === 'primary', [styles.info]: contentType === 'info' });

    if (textType === 'span') {
        return (
            <Text {...textProps} className={className}>
                {children}
            </Text>
        );
    }

    if (textType === 'paragraph') {
        return (
            <Paragraph {...paragraphProps} className={className}>
                {children}
            </Paragraph>
        );
    }

    return (
        <Title {...titleProps} className={className}>
            {children}
        </Title>
    );
};