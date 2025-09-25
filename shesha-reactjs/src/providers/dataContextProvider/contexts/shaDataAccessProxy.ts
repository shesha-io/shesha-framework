import { GHOST_PAYLOAD_KEY } from "@/utils/form";
import { IFormApi } from "../../form/formApi";
import { getValueByPropertyName, hasProperty, safeGetProperty, setValueByPropertyName } from "@/utils/object";
import { isDefined, isNullOrWhiteSpace } from "@/utils/nullables";
import { FieldValueGetter, FieldValueSetter, Path } from '@/utils/dotnotation';

export interface IHasGetAccessorValue {
  getAccessorValue: () => unknown;
};

export interface IShaDataAccessor<TData = unknown> extends IHasGetAccessorValue {
  setFieldValue: FieldValueSetter<TData>;
  getFieldValue: FieldValueGetter<TData>;
  getData: () => TData;
  setData: (data: TData) => void;
}

export interface IHasDataAccessor<TData = unknown> extends IHasGetAccessorValue {
  readonly accessor: IShaDataAccessor<TData>;
}

export type IShaDataAccessorWithNested<TData = unknown> = IShaDataAccessor<TData> & IHasDataAccessor<TData>;

export const CreateDataAccessor = <TData extends object = object>(
  getData: () => TData,
  setData: (data: TData) => void,
  setFieldValue: FieldValueSetter<TData>,
  propertyName?: Path<TData>
): IShaDataAccessor<TData> => {
  const data = getValueByPropertyName(getData(), isDefined(propertyName) ? propertyName : '');
  const property: IShaDataAccessorWithNested<TData> = (Array.isArray(data))
    ? new ShaArrayAccessProxy<TData>(getData, setData, setFieldValue, propertyName)
    : new ShaObjectAccessProxy<TData>(getData, setData, setFieldValue, propertyName);

  return new Proxy<IShaDataAccessorWithNested<TData>>(property, {
    get(target, name) {
      const propertyName = name.toString();

      if (typeof name === 'symbol') {
        const accessorData = target.getAccessorValue();
        if (isDefined(accessorData)) {
          const objSymbol = safeGetProperty(accessorData, name) as unknown;
          if (isDefined(objSymbol) && typeof objSymbol === 'function') {
            return objSymbol.bind(accessorData);
          }
        }
      }

      if (propertyName.includes(GHOST_PAYLOAD_KEY))
        return undefined;

      if (propertyName === 'hasOwnProperty')
        return (prop: string | symbol) => prop ? propertyName in target.accessor : false;

      if (hasProperty(target.accessor, propertyName))
        return typeof target.accessor[propertyName] === 'function'
          ? target.accessor[propertyName].bind(target.accessor)
          : target.accessor[propertyName];

      return target.accessor.getFieldValue(propertyName as Path<TData>);
    },
    set(target, name, newValue, _receiver) {
      const propertyName = name.toString();
      target.setFieldValue(propertyName as Path<TData>, newValue as never);
      return true;
    },
    has(target, prop) {
      const propertyName = prop.toString();
      const data = target.getAccessorValue();
      return !propertyName.includes(GHOST_PAYLOAD_KEY) && isDefined(data) && propertyName in data;
    },
    ownKeys(target) {
      const data = target.getAccessorValue();
      return data && typeof (data) === 'object'
        ? Reflect.ownKeys(data)
        : [];
    },
    getOwnPropertyDescriptor(target, prop) {
      const propertyName = prop.toString();
      const data = target.getAccessorValue();
      if (isDefined(data) && propertyName in data)
        return { enumerable: true, configurable: true, writable: true };
      return undefined;
    },
  });
};


export class ShaObjectAccessProxy<TData extends object = object> implements IShaDataAccessor<TData>, IHasDataAccessor<TData> {
  readonly accessor: ShaDataAccessor<TData>;

  setFieldValue: FieldValueSetter<TData> = (name, value) => this.accessor.setFieldValue(name, value);

  getFieldValue: FieldValueGetter<TData> = (name) => this.accessor.getFieldValue(name);

  getData = (): TData => this.accessor.getData();

  setData = (data: TData): void => this.accessor.setData(data);

  getAccessorValue = (): unknown => this.accessor.getAccessorValue();

  constructor(getData: () => TData, setData: (data: TData) => void, setFieldValue: FieldValueSetter<TData>, propertyName?: Path<TData>) {
    this.accessor = new ShaDataAccessor<TData>(getData, setData, setFieldValue, propertyName);
  }
}

export class ShaArrayAccessProxy<TData extends object = Array<unknown>> extends Array implements IShaDataAccessor<TData>, IHasDataAccessor<TData> {
  readonly accessor: IShaDataAccessor<TData>;

  setFieldValue: FieldValueSetter<TData> = (name, value) => this.accessor.setFieldValue(name, value);

  getFieldValue: FieldValueGetter<TData> = (name) => this.accessor.getFieldValue(name);

  getData = (): TData => this.accessor.getData();

  setData = (data: TData): void => this.accessor.setData(data);

  getAccessorValue = (): unknown => this.accessor.getAccessorValue();

  constructor(getData: () => TData, setData: (data: TData) => void, setFieldValue: FieldValueSetter<TData>, propertyName?: Path<TData>) {
    super();
    this.accessor = new ShaDataAccessor<TData>(getData, setData, setFieldValue, propertyName);
  }
}

export class ShaDataAccessor<TData extends object = object> implements IShaDataAccessor<TData> {
  readonly getData: () => TData;

  readonly setData: (data: TData) => void;

  readonly _setFieldValue: FieldValueSetter<TData>;

  readonly propertyName: Path<TData> | undefined;

  getFullPropertyName(propertyName: Path<TData>): Path<TData> {
    const prefix = this.propertyName?.toString();
    const result = !isNullOrWhiteSpace(prefix)
      ? `${prefix}.${propertyName.toString()}`
      : propertyName.toString();
    return result as Path<TData>;
  }

  getAccessorValue(): unknown {
    return getValueByPropertyName(this.getData(), this.propertyName ?? "");
  }

  getFieldValue: FieldValueGetter<TData> = (propertyName) => {
    const propName = this.getFullPropertyName(propertyName);
    const propValue = getValueByPropertyName(this.getData(), propName);

    if (propValue === undefined)
      return undefined;
    if (propValue === null)
      return null;

    if (typeof propValue === 'function')
      return propValue.bind(this.getAccessorValue());

    if (typeof propValue === 'object' && isDefined(propValue)) {
      return CreateDataAccessor(this.getData, this.setData, this._setFieldValue, propName as Path<TData>);
    }

    return propValue;
  };

  setFieldValue: FieldValueSetter<TData> = (propertyName, value) => {
    this._setFieldValue(this.getFullPropertyName(propertyName), value);
  };

  constructor(getData: () => TData, setData: (data: TData) => void, setFieldValue: FieldValueSetter<TData>, propertyName?: Path<TData>) {
    this.getData = getData;
    this.setData = setData;
    this._setFieldValue = setFieldValue;
    this.propertyName = propertyName;
  }
}

export const GetShaFormDataAccessor = <TValues extends object = object>(shaInstance: IFormApi<TValues>): IShaDataAccessor<TValues> => {
  return CreateDataAccessor(() => shaInstance.getFormData(), shaInstance.setFieldsValue, shaInstance.setFieldValue) as IShaDataAccessor<TValues>;
};


export const GetShaContextDataAccessor = <TData extends object = object>(onChange: () => void): IShaDataAccessor<TData> => {
  let data: TData = {} as TData;
  const setFieldValue: FieldValueSetter<TData> = (propertyName, value): void => {
    setValueByPropertyName(data, propertyName.toString(), value);
    onChange();
  };
  const setData = (inputData: TData): void => {
    data = inputData;
    onChange();
  };

  return CreateDataAccessor(() => data, setData, setFieldValue);
};
