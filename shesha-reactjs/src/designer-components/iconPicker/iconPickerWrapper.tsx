import IconPicker, { ShaIconTypes } from '@/components/iconPicker';
import React, {
    CSSProperties,
    FC,
    ReactNode,
    useRef,
} from 'react';
import { IApplicationContext, pickStyleFromModel } from '@/providers/form/utils';
import { executeFunction, getStyle, useFormData, useGlobalState } from '@/index';
import ConfigurableButton from '../button/configurableButton';
import { removeNullUndefined } from '@/providers/utils';
import { addPx } from '../button/util';

interface IconPickerWrapperProps {
    disabled?: boolean; // todo: move to the model level
    applicationContext: IApplicationContext;
    value: any;
    onChange: (...args: any[]) => void;
    readOnly?: boolean;
    fontSize?: string;
    color?: string;
    customColor?: string;
    borderWidth?: string;
    borderColor?: string;
    borderRadius?: string;
    backgroundColor?: string;
    stylingBox?: string;
    defaultValue?: ShaIconTypes;
    textAlign?: string;
    form:any
    model:any
}

export const IconPickerWrapper: FC<IconPickerWrapperProps> = (props) => {
    const { fontSize, form, model, color, readOnly, onChange, borderColor, borderRadius, borderWidth, backgroundColor, stylingBox, defaultValue, value, textAlign } = props;
    const { data } = useFormData();
    const { globalState } = useGlobalState();
    const { styles, ...restProps } = model;
    const buttonRef = useRef<any>(null);
    const iconPickerRef = useRef<any>(null);

    const onIconChange = (_icon: ReactNode, iconName: ShaIconTypes) => {
            if (onChange) {
                onChange(iconName)
            }
    };

    const stylingBoxJSON = JSON.parse(stylingBox || '{}');

    const style: CSSProperties = {
        fontSize: fontSize || 24,
        color: color,
        marginLeft: (defaultValue) ? '12px' : 'none' //this allows us to correct the icon layout when an icon is selected
    };

    const getIconStyle = {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        width: Number(fontSize) ? `${fontSize}px` : '25px',
        height: Number(fontSize) ? `${fontSize}px` : '25px',
        border: `${borderWidth}px solid ${borderColor}`,
        borderRadius: `${borderRadius}px`,
        backgroundColor: backgroundColor,
        ...pickStyleFromModel(stylingBoxJSON),
        ...(executeFunction("{}", { data, globalState }) || {})
    };

    const newStyles = {
        width: addPx(60),
        height: addPx(60),
        borderWidth: 0
      };

      const handleIconClick = () =>{
            if (buttonRef.current && buttonRef?.current.actionConfiguration) {
                buttonRef.current.triggerClick();
            }else{
                if (iconPickerRef.current) {
                    iconPickerRef.current.toggleModalVisibility(); 
                  }
            }
      }
 
    return (
        <div style={(defaultValue || value) ? { display: 'grid', placeItems: textAlign, width: '100%' } : {}}>
            <div style={(defaultValue) ? getIconStyle : {}}>

            <div style={{display:'none'}}> 
            <ConfigurableButton
         ref={buttonRef}

      name={''} itemType={'item'} sortOrder={0} {...restProps}
      readOnly={readOnly}
      block={true}
      style={{ ...getStyle(styles, data), ...removeNullUndefined(newStyles) }}
      form={form}          />

            </div>



                <IconPicker
                    value={value as ShaIconTypes}
                    onIconChange={onIconChange}
                    readOnly={readOnly}
                    style={style}
                    twoToneColor={color}
                    defaultValue={defaultValue as ShaIconTypes}
                    onClick={handleIconClick}
                    ref={iconPickerRef}
                    />
                
            </div>
        </div>
    );
};