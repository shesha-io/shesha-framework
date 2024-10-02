import { LoadingOutlined } from '@ant-design/icons';
import { Button, Flex, Result, Spin } from 'antd';
import React, { useEffect } from 'react';
import { useChartDataActionsContext, useChartDataStateContext } from '../../providers/chartData';
import BarChart from './components/bar';
import FilterComponent from './components/filterComponent';
import LineChart from './components/line';
import PieChart from './components/pie';
import { IChartsProps } from './model';
import { applyFilters, getAllProperties, getChartData, getEntityMetaData, getRefListValues, prepareBarChartData, prepareLineChartData, preparePieChartData, preparePivotChartData } from './utils';
import { useGet } from '@/hooks';

const ChartControl: React.FC<IChartsProps> = (props) => {
  const { chartType, entityType, valueProperty, filters, legendProperty, aggregationMethod, axisProperty, showLegend, showTitle, title, legendPosition, showXAxisLabel, showXAxisLabelTitle, showYAxisLabel, showYAxisLabelTitle, simpleOrPivot, filterProperties, stacked } = props;
  const { refetch } = useGet({ path: '', lazy: true });
  const state = useChartDataStateContext();
  const { setData, setIsFilterVisible, setIsLoaded, setRefLists, setFilterdData, setChartFilters, setControlProps } = useChartDataActionsContext();

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

    // Get reference lists for all the ref list properties of the chosen entity type
    refetch(getEntityMetaData(entityType))
      .then((resp) => {
        const refListProperties = resp?.result?.properties?.filter((p: any) => p.dataType === 'reference-list-item');

        // We need to further filter such that if label.toLowerCase() is equal to either valueProperty or legendProperty or axisProperty in lowercase again
        const refListPropertiesFiltered = refListProperties?.filter((p: any) => {
          return p.label.toLowerCase() === valueProperty.toLowerCase() || p.label.toLowerCase() === legendProperty.toLowerCase() || p.label.toLowerCase() === axisProperty.toLowerCase();
        });

        refListPropertiesFiltered?.forEach((refListProperty: any) => {
          refetch(getRefListValues(refListProperty.referenceListName))
            .then((resp2) => {
              setRefLists({ ...state.refLists, [`${refListProperty.label}`.toLowerCase()]: resp2.result?.items });
            })
            .catch((err) => console.error('err ref list data', err));
        });
      })
      .catch((err) => console.error('err entity metadata', err));
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

  let data: any;

  if (!state.isLoaded) {
    return (
      <Flex align="center" justify='center'>
        <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
      </Flex>
    );
  }

  return (
    <div style={{ border: '1px solid #ddd', padding: 10, position: 'relative' }}>
      <h3>
        {props.showName ? <p>{props.name}</p> : null}
      </h3>
      <div>
        {props.showDescription ? <p>{props.description}</p> : null}
      </div>
      <Flex justify='start' align='center'
        style={{ marginTop: 10, gap: 10 }}
      >
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
