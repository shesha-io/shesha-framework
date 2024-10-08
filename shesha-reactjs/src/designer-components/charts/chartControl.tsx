import { LoadingOutlined } from '@ant-design/icons';
import { Button, Flex, Result, Spin } from 'antd';
import React, { useEffect } from 'react';
import { useChartDataActionsContext, useChartDataStateContext } from '../../providers/chartData';
import BarChart from './components/bar';
import FilterComponent from './components/filterComponent';
import LineChart from './components/line';
import PieChart from './components/pie';
import { IChartData, IChartsProps } from './model';
import { applyFilters, getAllProperties, getChartData, prepareBarChartData, prepareLineChartData, preparePieChartData, preparePivotChartData } from './utils';
import { useGet } from '@/hooks';
import useStyles from './styles';
import { IModelMetadata, useMetadataDispatcher } from '@/index';
import { useReferenceListDispatcher } from '@/providers/referenceListDispatcher';
import { IRefListPropertyMetadata } from '@/interfaces/metadata';

const ChartControl: React.FC<IChartsProps> = (props) => {
  const { chartType, entityType, valueProperty, filters, legendProperty, aggregationMethod, axisProperty, showLegend, showTitle, title, legendPosition, showXAxisLabel, showXAxisLabelTitle, showYAxisLabel, showYAxisLabelTitle, simpleOrPivot, filterProperties, stacked } = props;
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
      simpleOrPivot, filterProperties, stacked
    });
  }, []);

  useEffect(() => {
    refetch(getChartData(entityType, valueProperty, filters, legendProperty, axisProperty))
      .then((resp) => {
        setData(resp.result?.items);
      })
      .then(() => setIsLoaded(true))
      .catch((err) => console.error('err data', err));

    getMetadata({ modelType: entityType, dataType: 'entity' })
      .then((resp: IModelMetadata) => {
        const refListProperties = (resp?.properties as Array<object>)?.filter((p: IRefListPropertyMetadata) => p.dataType === 'reference-list-item');

        // We need to further filter such that if label.toLowerCase() is equal to either valueProperty or legendProperty or axisProperty (in lowercase) again
        const refListPropertiesFiltered = refListProperties?.filter((p: IRefListPropertyMetadata) => {
          return p.label.toLowerCase() === valueProperty.toLowerCase() || p.label.toLowerCase() === legendProperty.toLowerCase() || p.label.toLowerCase() === axisProperty.toLowerCase();
        });

        refListPropertiesFiltered?.forEach((refListProperty: IRefListPropertyMetadata) => {
          getReferenceList({ refListId: { module: refListProperty?.referenceListModule, name: refListProperty?.referenceListName } })
            .promise
            .then((refListResponse: {
              items: Array<object>;
            }) => {
              setRefLists({ ...state.refLists, [`${refListProperty.label}`.toLowerCase()]: refListResponse?.items });
            })
            .catch((err) => console.error('err metadata', err));
        });
      })
      .catch((err) => console.error('err metadata', err));
  }, [chartType]);

  useEffect(() => {
    if (state.data) {
      setFilterdData(state.data);
    }
  }, [state.data]);

  const toggleFilterVisibility = () => {
    setIsFilterVisible(!state.isFilterVisible);
  };

  const resetFilter = () => {
    setChartFilters([{ property: '', operator: 'equals', value: '' }]);
    setFilterdData(state.data);
  };

  const onFilter = () => {
    if (state.chartFilters?.length === 1 && (state?.chartFilters[0]?.property === '' || state?.chartFilters[0]?.value === '')) {
      resetFilter();
      return;
    }
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
              data = simpleOrPivot === 'simple' ? prepareLineChartData(state.filteredData, axisProperty, valueProperty, aggregationMethod) : preparePivotChartData(state.filteredData, axisProperty, legendProperty, valueProperty, aggregationMethod, chartType, state.refLists);
              return <LineChart data={data} />;
            case 'bar':
              data = simpleOrPivot === 'simple' ? prepareBarChartData(state.filteredData, axisProperty, valueProperty, aggregationMethod) : preparePivotChartData(state.filteredData, axisProperty, legendProperty, valueProperty, aggregationMethod, chartType, state.refLists);
              return <BarChart data={data} />;
            case 'pie':
              data = simpleOrPivot === 'simple' ? preparePieChartData(state.filteredData, axisProperty, valueProperty, aggregationMethod) : preparePivotChartData(state.filteredData, axisProperty, legendProperty, valueProperty, aggregationMethod, chartType, state.refLists);
              return <PieChart data={data} />;
            default:
              return <Result status="404" title="404" subTitle="Sorry, please select a chart type." />;
          }
        })()
      }
    </div >
  );
};

export default ChartControl;
