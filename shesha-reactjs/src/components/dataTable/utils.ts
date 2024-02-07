import { CellStyleFunc, ITableColumn } from "@/providers/dataTable/interfaces";
import { FunctionExecutor, getFunctionExecutor, isPropertySetting } from "@/providers/form/utils";

export const getCellStyleAccessor = (columnItem: ITableColumn): CellStyleFunc => {
    const backgroundSetting = isPropertySetting<string>(columnItem.backgroundColor) ? columnItem.backgroundColor : undefined;

    const backgroundColorAccessor: FunctionExecutor<string> = backgroundSetting
        ? backgroundSetting._mode === 'value'
            ? () => backgroundSetting._value
            : getFunctionExecutor(backgroundSetting._code, [{ name: "row" }, { name: "value" }])
        : typeof (columnItem.backgroundColor) === 'string'
            ? () => columnItem.backgroundColor as string
            : undefined;

    const cellStyleAccessor: CellStyleFunc = backgroundColorAccessor
        ? ({ row, value }) => {
            const background = backgroundColorAccessor(row, value);
            return { backgroundColor: background };
        }
        : undefined;
    return cellStyleAccessor;
};