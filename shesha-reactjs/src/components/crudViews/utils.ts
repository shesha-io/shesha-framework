type GenericFormModelPayloadType = object | [];

export interface IBoolGenericFormProps {
  readonly origin: boolean;
  readonly mutate: string | boolean;
}

export interface IGenericFormFilter {
  boolean?: IBoolGenericFormProps[];
}

export const DEFAULT_FILTERS: IGenericFormFilter = {
  boolean: [
    { origin: true, mutate: 'Yes' },
    { origin: false, mutate: 'No' },
  ],
};

export const filterGenericModelData = (model: GenericFormModelPayloadType, filters: IGenericFormFilter) => {
  if (Array.isArray(model) && model.length) {
    if (typeof model[model.length - 1] === 'object' && Object.keys(model[model.length - 1]).length) {
      return model.map(m => handleGenericFiltering(m, filters));
    }
  }

  if (model && typeof model === 'object' && Object.keys(model).length) {
    return handleGenericFiltering(model, filters);
  }

  return model;
};

export const handleGenericFiltering = (model: object, filters: IGenericFormFilter) => {
  let data = { ...model };

  if (filters?.boolean?.length) {
    Object.entries(model).map(([key, value]) => {
      if (typeof value === 'boolean') {
        filters.boolean.forEach(({ origin, mutate }) => {
          if (origin === value) {
            data = { ...data, ...{ [key]: mutate } };
          }
        });
      } else if (typeof value === 'object' && Object.keys(value || {})?.length) {
        data = { ...data, ...{ [key]: handleGenericFiltering(value, filters) } };
      } else {
        data = { ...data, ...{ [key]: value } };
      }
    });
  }

  return data;
};
