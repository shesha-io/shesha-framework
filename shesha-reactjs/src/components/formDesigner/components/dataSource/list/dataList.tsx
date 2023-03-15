import { Checkbox, Divider } from "antd";
import classNames from "classnames";
import React, { FC, useEffect, useMemo } from "react";
import { Row } from "react-table";
import { useMeasure } from "react-use";
import { FormIdentifier, useAppConfigurator, useDataTableSelection, useDataTableStore } from "../../../../../providers";
import { useFormConfiguration } from "../../../../../providers/form/api";
import { IPersistedFormProps } from "../../../../../providers/formPersisterProvider/models";
import CollapsiblePanel from "../../../../collapsiblePanel";
import ConditionalWrap from "../../../../conditionalWrapper";
import ConfigurableForm from "../../../../configurableForm";
import FormInfo from "../../../../configurableForm/formInfo";
import ShaSpin from "../../../../shaSpin";
import Show from "../../../../show";

export interface IDataListProps {
    name: string;
    formId?: FormIdentifier;
    selectionMode?: 'none' | 'single' | 'multiple';
  

    records?: object[];

    useMultiselect?: boolean;
    disableCustomFilters?: boolean;
    //actionColumns?: ITableActionColumns[];
  
    title?: React.ReactNode;
    selectedRowIndex?: number;
    onSelectRow?: (index: number, row: any) => void;
    onSelectedIdsChanged?: (selectedRowIds: string[]) => void;
    onDblClick?: (data: any, index?: number) => void;
    onMultiRowSelect?: (rows: Array<Row> | Row) => void;

    /** Called when fetch data or refresh is complete is complete */
    onFetchDataSuccess?: () => void;
    onRowsChanged?: (rows: object[]) => void;
}

export const DataList: FC<Partial<IDataListProps>> = (props) => {
    const {
        tableData: recordsFromProvider,
        isFetchingTableData,
    } = useDataTableStore();

    const { selectedRow, selectedRows, setSelectedRow, setMultiSelectedRow } = useDataTableSelection();

    const tableData = useMemo(() => {
        return props.records?.length ? props.records : recordsFromProvider;
    }, [props.records, recordsFromProvider]);

    useEffect(() => {
        if (!isFetchingTableData && tableData?.length && props.onFetchDataSuccess) {
            props.onFetchDataSuccess();
        }
    }, [isFetchingTableData]);

    const { formConfiguration,/*refetch: refetchFormConfig, error: fetchFormError*/ } = useFormConfiguration({
        formId: {name: 'person-details'},
        lazy: false,
      });

      
    const renderSubForm = (localName?: string | number, item?: any) => {
        let values: { [key: string]: any, id: string } = {...item};
        return (
            <ConfigurableForm
                key={localName}
                mode="edit"                 
                labelCol={{span: 3}}
                wrapperCol={{span: 17}} 
                markup={{ components: formConfiguration?.markup, formSettings: formConfiguration?.settings }}
                initialValues={values} 
                skipFetchData={true}
                //onValuesChange={(value, index) => { alert(JSON.stringify(value) + " : " + JSON.stringify(index))}}
            />
        );
    };

    const { formInfoBlockVisible } = useAppConfigurator();
    const showFormInfo = Boolean(formConfiguration) && formInfoBlockVisible;
    const persistedFormProps: IPersistedFormProps = { 
        id: formConfiguration?.id,
        module: formConfiguration?.module,
        versionNo: formConfiguration?.versionNo,
        description: formConfiguration?.description,
        versionStatus: formConfiguration?.versionStatus,
        name: formConfiguration?.name
    };

    const [ref, measured] = useMeasure();
    
    const listItemWidth = 1;

    const itemWidth = useMemo(() => {
        if (!measured) return 0;
        //ensures that vertical landscape is always 100% of measured width
        if (!listItemWidth /*|| orientation === 'vertical'*/) {
          return measured?.width;
        }
    
        /*if (listItemWidth === 'custom') {
          if (!customListItemWidth) return measured?.width;
          else return customListItemWidth;
        }*/
    
        return measured?.width * listItemWidth;
    }, [measured?.width, listItemWidth/*, customListItemWidth, orientation*/]);

    return (
        <CollapsiblePanel
            extraClass="sha-list-component-extra"
            className="sha-list-component-panel"
            header={
                <>
                    <Show when={true}/*selectionMode === 'multiple'}*/>
                        <Checkbox
                            onChange={(e) => { 
                                setMultiSelectedRow(tableData.map((item: any, index) => 
                                    { return { isSelected: e.target.checked, index, id: item?.id, original: item } as Row;})
                                )
                            }}
                            checked={selectedRows?.length === tableData?.length && tableData?.length > 0}
                            indeterminate={selectedRows?.length !== tableData?.length && selectedRows?.length > 0}
                        >
                            Select All
                        </Checkbox>
                    </Show>
                    {props.title}
                </>
            }
        >        
            <Show when={showFormInfo}>
                <FormInfo {...persistedFormProps} />
            </Show>
            <ShaSpin spinning={isFetchingTableData} tip={isFetchingTableData ? 'Loading...' : 'Submitting...'}>
                <div
                    ref={ref}
                    className={classNames('sha-list-component-body', {
                        loading: isFetchingTableData && tableData?.length === 0,
                        //horizontal: orientation === 'horizontal',
                    })}
                >
                    <Show when={Boolean(tableData) && Boolean(formConfiguration?.markup)}>
                        {tableData.map((item: any, index) => {
                            const isLastItem = tableData?.length - 1 == index;
                            const selected = selectedRow?.index == index || selectedRows.some(({id}) => id === item?.id);
                            return (
                                <div key={item['id']} >
                                    <ConditionalWrap
                                        key={index}
                                        condition={true}//selectionMode !== 'none'}
                                        wrap={children => (
                                            <Checkbox
                                                className={classNames('sha-list-component-item-checkbox', { selected })}
                                                checked={selected}
                                                onChange={() => {
                                                    setSelectedRow(index, item);
                                                }}
                                            >
                                                {children}
                                            </Checkbox>
                                        )}
                                    >
                                        <div
                                            className={classNames('sha-list-component-item', { selected })}
                                            onClick={() => { setSelectedRow(index, item); }}
                                            style={{ width: /*selectionMode === 'none' ? itemWidth : !isNaN(itemWidth) ? itemWidth - 28 : */itemWidth }}
                                        >
                                            {renderSubForm(index, item)}
                                        </div>
                                        {!isLastItem && <Divider className="sha-list-component-divider" />}
                                    </ConditionalWrap>
                                </div>
                            );
                        })}
                    </Show>
                </div>
            </ShaSpin>
        </CollapsiblePanel>
    );
};