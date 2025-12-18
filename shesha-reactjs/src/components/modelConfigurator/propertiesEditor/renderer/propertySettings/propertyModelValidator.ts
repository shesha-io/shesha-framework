import { ModelPropertyDto } from '@/apis/modelConfigurations';
import { DataTypes } from '@/interfaces';
import { ArrayFormats, EntityFormats, ObjectFormats } from '@/interfaces/dataTypes';
import { IPropertyErrors } from '@/providers/modelConfigurator/contexts';

export const validateDuplicated = (properties: ModelPropertyDto[], path: string): IPropertyErrors[] => {
  const duplicated: string[] = [];
  const errors: IPropertyErrors[] = [];
  properties.forEach((p) => {
    const fullPath = path ? `${path}.${p.name}` : p.name;
    if (p.name && properties.find((x) => x !== p && x.name === p.name && !duplicated.includes(fullPath))) {
      duplicated.push(fullPath);
      errors.push({ propertyName: fullPath, errors: [`Duplicated property name ${fullPath}`] });
    }
  });
  return errors;
};

export const propertyModelValidator = (model: ModelPropertyDto, parentModels?: ModelPropertyDto[]): IPropertyErrors[] => {
  let propsErrors: IPropertyErrors[] = [];
  let errors: string[] = [];

  const path = [...(parentModels ?? []), model].map((m) => m.name).join('.');

  if (!model.name) errors.push('Name is required.');
  if (!model.label) errors.push('Label is required.');
  if (!model.dataType) errors.push('Data Type is required.');
  if (model.dataType === DataTypes.number) {
    if (!model.dataFormat) errors.push('Number Format is required.');
  }
  if (model.dataType === DataTypes.referenceListItem) {
    if (!model.referenceListId?.name) errors.push('Reference List is required.');
  }
  if (model.dataType === DataTypes.entityReference) {
    if (!model.entityType && model.dataFormat !== EntityFormats.genericEntity) errors.push('Entity Type is required.');
  }
  if (model.dataType === DataTypes.object) {
    if (!model.dataFormat) errors.push('Object Format is required.');
    if (model.dataFormat === ObjectFormats.interface) {
      if (!model.entityType) errors.push('Part Of Entity Type is required.');
    }
    if (model.dataFormat === ObjectFormats.object) {
      if (model.properties?.length) {
        propsErrors = propsErrors.concat(validateDuplicated(model.properties, path));
        model.properties.forEach((p) => propsErrors = propsErrors.concat(propertyModelValidator(p, [...(parentModels ?? []), model])));
      }
    }
  }
  if (model.dataType === DataTypes.advanced) {
    if (!model.dataFormat) errors.push('Advanced Format is required.');
  }
  if (model.dataType === DataTypes.array) {
    if (!model.dataFormat) errors.push('List Format is required.');
    if (model.dataFormat === ArrayFormats.simple) {
      if (!model.itemsType)
        errors.push('Items Type configuration is required.');
      else
        propsErrors = propsErrors.concat(propertyModelValidator(model.itemsType, (parentModels ?? [])));
    }
    if (model.dataFormat === ArrayFormats.entityReference) {
      if (!model.genericEntityReference && !model.entityType) errors.push('Entity Type is required.');
      if (!model.listConfiguration?.foreignProperty) errors.push('Referencing Property is required.');
    }
    if (model.dataFormat === ArrayFormats.manyToManyEntities) {
      if (!model.entityType) errors.push('Entity Type is required.');
    }
    if (model.dataFormat === ArrayFormats.multivalueReferenceList) {
      if (!model.referenceListId?.name) errors.push('Reference List is required.');
    }
    if (model.dataFormat === ArrayFormats.childObjects) {
      if (!model.itemsType?.dataFormat) errors.push('Object Format is required.');
      if (model.itemsType?.dataFormat === ObjectFormats.interface) {
        if (!model.entityType) errors.push('Part Of Entity Type is required.');
      }
      if (model.itemsType?.dataFormat === ObjectFormats.object) {
        if (model.itemsType?.properties?.length) {
          propsErrors = propsErrors.concat(validateDuplicated(model.itemsType.properties, path));
          model.itemsType.properties.forEach((p) => propsErrors = propsErrors.concat(propertyModelValidator(p, [...(parentModels ?? []), model])));
        }
      }
    }
  }

  if (errors.length > 0)
    propsErrors = [{ propertyName: path, errors }, ...propsErrors];

  return propsErrors;
};
