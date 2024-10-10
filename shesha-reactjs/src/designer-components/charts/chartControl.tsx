import { useGet } from '@/hooks';
import { IModelMetadata, useMetadataDispatcher } from '@/index';
import { IRefListPropertyMetadata } from '@/interfaces/metadata';
import { useReferenceListDispatcher } from '@/providers/referenceListDispatcher';
import { LoadingOutlined } from '@ant-design/icons';
import { Alert, Button, Flex, Result, Spin } from 'antd';
import React, { useEffect } from 'react';
import { useChartDataActionsContext, useChartDataStateContext } from '../../providers/chartData';
import BarChart from './components/bar';
import FilterComponent from './components/filterComponent';
import LineChart from './components/line';
import PieChart from './components/pie';
import PolarAreaChart from './components/polarArea';
import { IChartData, IChartsProps } from './model';
import useStyles from './styles';
import { applyFilters, getAllProperties, getChartDataRefetchParams, prepareBarChartData, prepareLineChartData, preparePieChartData, preparePivotChartData, preparePolarAreaChartData } from './utils';

const ChartControl: React.FC<IChartsProps> = (props) => {
  const { chartType, entityType, valueProperty, filters, legendProperty, aggregationMethod, axisProperty, showLegend, showTitle, title, legendPosition, showXAxisLabel, showXAxisLabelTitle, showYAxisLabel, showYAxisLabelTitle, simpleOrPivot, filterProperties, stacked, tension, strokeColor } = props;
  const { refetch } = useGet({ path: '', lazy: true });
  const state = useChartDataStateContext();
  const { getMetadata } = useMetadataDispatcher();
  const { getReferenceList } = useReferenceListDispatcher();
  const { setData, setIsFilterVisible, setIsLoaded, setRefLists, setFilterdData, setChartFilters, setControlProps } = useChartDataActionsContext();

  const { styles, cx } = useStyles();

  useEffect(() => {
    setControlProps({
      valueProperty, legendProperty, aggregationMethod,
      axisProperty, showLegend, showTitle,
      title, legendPosition, showXAxisLabel,
      showXAxisLabelTitle, showYAxisLabel, showYAxisLabelTitle,
      simpleOrPivot, filterProperties, stacked, tension, strokeColor
    });
  }, []);

  useEffect(() => {
    refetch(getChartDataRefetchParams(entityType, valueProperty, filters, legendProperty, axisProperty))
      .then((resp) => {
        setData(resp.result?.items);
      })
      .then(() => setIsLoaded(true))
      .catch((err: any) => console.error('err data', err));

    getMetadata({ modelType: entityType, dataType: 'entity' })
      .then((resp: IModelMetadata) => {
        const refListProperties = (resp?.properties as Array<object>)?.filter((p: IRefListPropertyMetadata) => p.dataType === 'reference-list-item');

        // We need to further filter such that if label.toLowerCase() is equal to either valueProperty or legendProperty or axisProperty (in lowercase) again
        const refListPropertiesFiltered = refListProperties?.filter((p: IRefListPropertyMetadata) => {
          const strLabel = p.label + '';
          return strLabel?.toLowerCase() === valueProperty?.toLowerCase() || strLabel?.toLowerCase() === legendProperty?.toLowerCase() || strLabel?.toLowerCase() === axisProperty?.toLowerCase();
        });

        refListPropertiesFiltered?.forEach((refListProperty: IRefListPropertyMetadata) => {
          getReferenceList({ refListId: { module: refListProperty?.referenceListModule, name: refListProperty?.referenceListName } })
            .promise
            .then((refListResponse: {
              items: Array<object>;
            }) => {
              setRefLists({ ...state.refLists, [`${refListProperty.label}`.toLowerCase()]: refListResponse?.items });
            })
            .catch((err: any) => console.error('err metadata', err));
        });
      })
      .catch((err: any) => console.error('err metadata', err));
  }, [chartType]);

  useEffect(() => {
    if (state.data) {
      setFilterdData(state.data);
    }
  }, [state.data]);

  if (!entityType || !chartType || !valueProperty || !axisProperty) {
    // Collect the missing properties in an array
    const missingProperties: string[] = [];
    if (!entityType) missingProperties.push("'entityType'");
    if (!chartType) missingProperties.push("'chartType'");
    if (!valueProperty) missingProperties.push("'valueProperty'");
    if (!axisProperty) missingProperties.push("'axisProperty'");

    // Dynamically build the description
    const descriptionMessage = `Please make sure that you've specified the following properties: ${missingProperties.join(', ')}.`;

    return (
      <Alert
        showIcon
        message="Chart control properties not correctly!"
        description={descriptionMessage} // Dynamically constructed description
        type="warning"
      />
    );
  }

  const toggleFilterVisibility = () => {
    setIsFilterVisible(!state.isFilterVisible);
  };

  const resetFilter = () => {
    setChartFilters([]);
    setFilterdData(state.data);
  };

  const onFilter = () => {
    const afterFilterData = applyFilters(state.data, state.chartFilters);
    setFilterdData(afterFilterData);
  };

  let data: IChartData;

  if (!state.isLoaded) {
    return (
      <Flex align="center" justify='center'>
        <Spin indicator={<LoadingOutlined className={cx(styles.chartControlSpinFontSize)} spin />} />
      </Flex>
    );
  }

  return (
    <div className={cx(styles.chartControlContainer)}>
      <h3>
        {props.showName ? <p>{props.name}</p> : null}
      </h3>
      <div>
        {props.showDescription ? <p>{props.description}</p> : null}
      </div>
      <Flex justify='start' align='center' className={cx(styles.chartControlButtonContainer)}>
        <Button size='small' onClick={toggleFilterVisibility}>
          {state.isFilterVisible ? 'Hide Filter' : 'Show Filter'}
        </Button>
        <Button size='small' onClick={resetFilter}>
          Reset Filter
        </Button>
      </Flex>
      <FilterComponent
        filters={state.chartFilters}
        setFilters={setChartFilters}
        properties={filterProperties?.length > 0 ? filterProperties : getAllProperties(state.filteredData)}
        isVisible={state.isFilterVisible}
        onClose={toggleFilterVisibility}
        onFilter={onFilter}
        resetFilter={resetFilter}
      />
      {
        (() => {
          switch (chartType) {
            case 'line':
              data = simpleOrPivot === 'simple' ? prepareLineChartData(state.filteredData, axisProperty, valueProperty, strokeColor, aggregationMethod) : preparePivotChartData(state.filteredData, axisProperty, legendProperty, valueProperty, strokeColor, aggregationMethod, chartType, state.refLists);
              return <LineChart data={data} />;
            case 'bar':
              data = simpleOrPivot === 'simple' ? prepareBarChartData(state.filteredData, axisProperty, valueProperty, strokeColor, aggregationMethod) : preparePivotChartData(state.filteredData, axisProperty, legendProperty, valueProperty, strokeColor, aggregationMethod, chartType, state.refLists);
              return <BarChart data={data} />;
            case 'pie':
              data = simpleOrPivot === 'simple' ? preparePieChartData(state.filteredData, axisProperty, valueProperty, strokeColor, aggregationMethod) : preparePivotChartData(state.filteredData, axisProperty, legendProperty, valueProperty, strokeColor, aggregationMethod, chartType, state.refLists);
              return <PieChart data={data} />;
            case 'polarArea':
              data = simpleOrPivot === 'simple'
                ? preparePolarAreaChartData(state.filteredData, axisProperty, valueProperty, strokeColor, aggregationMethod)
                : preparePivotChartData(state.filteredData, axisProperty, legendProperty, valueProperty, strokeColor, aggregationMethod, chartType, state.refLists);
              return <PolarAreaChart data={data} />;
            default:
              return <Result status="404" title="404" subTitle="Sorry, please select a chart type." />;
          }
        })()
      }
    </div >
  );
};

export default ChartControl;
