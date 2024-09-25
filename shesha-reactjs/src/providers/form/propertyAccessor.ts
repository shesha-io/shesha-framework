import { BaseAccessor } from "../sheshaApplication/publicApi/common/baseAccessor";

export interface IPropertyTouch {
  propertyName: string;
  value: any;
}

export interface IPropertyTouched {
    touched: (propName: string, fullPropName: string, value: any) => void;
}

export class PropertyTouchAccessor extends BaseAccessor<PropertyTouchAccessor, any> implements IPropertyTouched {
    protected _touchedProps: Array<IPropertyTouch>;

    protected _data: any;
    readonly _parent: IPropertyTouched;


    constructor(data: any, parent: IPropertyTouched, name: string) {
        super(undefined, name);
        this._data = data;
        this._parent = parent;

        this._touchedProps = new Array<IPropertyTouch>();
    }

    get touchedProps(): Array<IPropertyTouch> {
        return this._touchedProps;
    };

    addTouchedProp = (propName: string, value?: any) => {
        if (!this._touchedProps.find(p => p.propertyName === propName))
            this._touchedProps.push({propertyName: propName, value });
    };

    touched = (propName: string, fullPropName: string, value: any) => {
        this.addTouchedProp(propName);
        if (this._parent && this._parent.touched) 
            this._parent.touched(this._accessor, this._accessor + '.' + fullPropName, value);
    };

    createChild = (accessor: string) => {
        const child = this._data[accessor];
        
        if (typeof child === 'function')
            return child.bind(this);

        this.addTouchedProp(accessor);

        if (typeof child === 'object')
            return new PropertyTouchAccessor(child, this, accessor);
          
        if (this._parent && this._parent.touched) 
            this._parent.touched(this._accessor, this._accessor + '.' + accessor, child);

        return child;
    };
}