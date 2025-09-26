import { IConfigurableColumnsProps, IDataColumnsProps, IRendererColumnProps } from "@/providers/datatableColumnsConfigurator/models";
import { StatusCell } from "./statusCell";
import React from "react";
import { PackageItemDto } from "../itemsImport/models";
import { DescriptionCell } from "./descriptionCell";

const dataColumn = (propertyName: string, caption: string): IDataColumnsProps => {
  return {
    id: propertyName,
    caption: caption,
    propertyName: propertyName,
    allowSorting: false,
    columnType: 'data',
    sortOrder: 0,
    itemType: 'item',
    isVisible: true,
  };
};

const descriptionColumn: IRendererColumnProps = {
  renderCell: (row) => (<DescriptionCell row={row as PackageItemDto} />),
  columnType: "renderer",
  id: "description",
  caption: "",
  minWidth: 30,
  maxWidth: 30,
  sortOrder: 0,
  itemType: "item",
  isVisible: true,
};

const statusColumn: IRendererColumnProps = {
  renderCell: (row) => (<StatusCell row={row as PackageItemDto} />),
  columnType: "renderer",
  id: "status",
  caption: "",
  minWidth: 30,
  maxWidth: 30,
  sortOrder: 0,
  itemType: "item",
  isVisible: true,
};

export const PACKAGE_ITEMS_COLUMNS: IConfigurableColumnsProps[] = [
  descriptionColumn,
  statusColumn,
  dataColumn('baseModule', 'Base Module'),
  dataColumn('overrideModule', 'Override Module'),
  dataColumn('name', 'Name'),
  dataColumn('type', 'Type'),
  dataColumn('dateUpdated', 'Date Updated'),
];
