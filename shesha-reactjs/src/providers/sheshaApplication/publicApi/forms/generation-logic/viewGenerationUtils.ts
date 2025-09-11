// Utility functions for view generation logic

import { evaluateString } from "@/providers/form/utils";
import { PropertyMetadataDto } from "@/apis/metadata";
import { DesignerToolbarSettings, EditMode } from "@/index";
import { nanoid } from "@/utils/uuid";
import { COLUMN_FLEX, COLUMN_GUTTER_X, COLUMN_GUTTER_Y, ROW_COUNT } from "../constants";
import { FormMetadataHelper } from "./formMetadataHelper";

export function findContainersWithPlaceholderRecursive(
  token: any,
  placeholder: string,
  results: any[],
  visited: WeakSet<any>
): void {
  if (!token) return;
  if (typeof token === 'object' && token !== null) {
    if (visited.has(token)) return;
    visited.add(token);
    if (token.componentName === placeholder || token.propertyName === placeholder) {
      results.push(token);
    }
    if (Array.isArray(token)) {
      token.forEach(item =>
        findContainersWithPlaceholderRecursive(item, placeholder, results, visited)
      );
    } else {
      for (const key in token) {
        if (Object.prototype.hasOwnProperty.call(token, key)) {
          findContainersWithPlaceholderRecursive(token[key], placeholder, results, visited);
        }
      }
    }
  }
}

export function findContainersWithPlaceholder(markup: any, placeholder: string): any[] {
  const containers: any[] = [];
  const visited = new WeakSet();
  findContainersWithPlaceholderRecursive(markup, placeholder, containers, visited);
  return containers;
}

export function castToExtensionType<T>(data: unknown): T {
    if (!data || typeof data !== 'object') {
        throw new Error(`Invalid extension data: expected object, got ${typeof data}`);
    }
        return data as T;
}

export function humanizeModelType(modelType: string): string {
  if (!modelType) return '';
  const parts = modelType.split('.');
  const name = parts[parts.length - 1];
  return name.replace(/([A-Z])/g, ' $1').trim();
}

export function processBaseMarkup(markup: string, replacements: Record<string, any>): string {
    return evaluateString(markup, replacements, true);
}

/**
 * Adds details panel components to the markup.
 * Organizes properties into columns if there are more than five, otherwise adds them in a single column.
 *
 * @param metadata The properties metadata.
 * @param markup The JSON markup object.
 * @param metadataHelper The metadata helper instance.
 */
export function addDetailsPanel(
  metadata: PropertyMetadataDto[], 
  markup: any, 
  metadataHelper: FormMetadataHelper, 
): void {
  const placeholderName = "//*DETAILSPANEL*//";

  const builder = new DesignerToolbarSettings({});

  const detailsPanelContainer = findContainersWithPlaceholder(markup, placeholderName);
  
  if (detailsPanelContainer.length === 0) {
    throw new Error(`No details panel container found in the markup with placeholder ${placeholderName}.`);
  }

  const column1 = [];
  const column2 = [];
  if (metadata.length > ROW_COUNT) {

    metadata.forEach((prop, index) => {
      const columnBuilder = new DesignerToolbarSettings({});
      metadataHelper.getConfigFields(prop, columnBuilder);

      if (index % 2 === 0) {
        column1.push(...columnBuilder.toJson());
      } else {
        column2.push(...columnBuilder.toJson());
      };
    });

    builder.addColumns({
      id: nanoid(),
      propertyName: "detailsPanel",
      label: "Details Panel",
      editMode: 'inherited' as EditMode,
      hideLabel: true,
      hidden: false,
      componentName: "detailsPanel",
      gutterX: COLUMN_GUTTER_X,
      gutterY: COLUMN_GUTTER_Y,
      columns: [{
          id: nanoid(),
          flex: COLUMN_FLEX,
          offset: 0,
          push: 0,
          pull: 0,
          components: column1
        }, 
        {
          id: nanoid(),
          flex: COLUMN_FLEX,
          offset: 0,
          push: 0,
          pull: 0,
          components: column2
        }]
    });
  } else {
    metadata.forEach(prop => {
      metadataHelper.getConfigFields(prop, builder);
    });
  }
  
  if (detailsPanelContainer[0].components && Array.isArray(detailsPanelContainer[0].components)) {
    detailsPanelContainer[0].components.push(...builder.toJson());
  }
}