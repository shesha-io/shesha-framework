import { ModelPropertyDto } from "@/apis/modelConfigurations";
import { DataTypes } from "@/interfaces";
import { ArrayFormats, EntityFormats, ObjectFormats } from "@/interfaces/dataTypes";

const propertyModelValidator = (model: ModelPropertyDto, parentModels?: ModelPropertyDto[]): string[] => {
  let errors: string[] = [];

  const path = parentModels ? `${parentModels.map((m) => m.name).join('.')}: ` : '';

  if (!model.name) errors.push(path + "Name is required.");
  if (!model.label) errors.push(path + "Label is required.");
  if (!model.dataType) errors.push(path + "Data Type is required.");
  if (model.dataType === DataTypes.number) {
    if (!model.dataFormat) errors.push(path + "Number Format is required.");
  }
  if (model.dataType === DataTypes.referenceListItem) {
    if (!model.referenceListId?.name) errors.push(path + "Reference List is required.");
  }
  if (model.dataType === DataTypes.entityReference) {
    if (!model.entityType && model.dataFormat !== EntityFormats.genericEntity) errors.push(path + "Entity Type is required.");
  }
  if (model.dataType === DataTypes.object) {
    if (!model.dataFormat) errors.push(path + "Object Format is required.");
    if (model.dataFormat === ObjectFormats.interface) {
      if (!model.entityType) errors.push(path + "Part Of Entity Type is required.");
    }
  }
  if (model.dataType === DataTypes.advanced) {
    if (!model.dataFormat) errors.push(path + "Advanced Format is required.");
  }
  if (model.dataType === DataTypes.array) {
    if (!model.dataFormat) errors.push(path + "List Format is required.");
    if (model.dataFormat === ArrayFormats.simple) {
      if (!model.itemsType)
        errors.push(path + "Check property configuration.");
      else
        errors = errors.concat(propertyModelValidator(model.itemsType, [...(parentModels ?? []), model]));
    }
    if (model.dataFormat === ArrayFormats.entityReference) {
      if (!model.entityType) errors.push(path + "Entity Type is required.");
      if (!model.listConfiguration?.foreignProperty) errors.push(path + "Referencing Property is required.");
    }
    if (model.dataFormat === ArrayFormats.manyToManyEntities) {
      if (!model.entityType) errors.push(path + "Entity Type is required.");
    }
    if (model.dataFormat === ArrayFormats.multivalueReferenceList) {
      if (!model.referenceListId?.name) errors.push(path + "Reference List is required.");
    }
    if (model.dataFormat === ArrayFormats.childObjects) {
      if (!model.itemsType?.dataFormat) errors.push(path + "Object Format is required.");
      if (model.itemsType?.dataFormat === ObjectFormats.interface) {
        if (!model.entityType) errors.push(path + "Part Of Entity Type is required.");
      }
    }
  }

  return errors;
};

export default propertyModelValidator;
