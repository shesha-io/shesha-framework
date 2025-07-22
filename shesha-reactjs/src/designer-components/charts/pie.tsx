import React, { useEffect, useState, useMemo, useRef } from 'react';
import { ConfigurableFormItem } from '@/components';
import { validateConfigurableComponentSettings } from '@/formDesignerUtils';
import { IToolboxComponent } from '@/interfaces';
import { PieChartOutlined } from '@ant-design/icons';
import ChartDataProvider from '../../providers/chartData';
import ChartControl from './chartControl';
import ChartControlURL from './chartControlURL';
import { IChartProps } from './model';
import { getSettings } from './settingsFormIndividual';
import { defaultConfigFiller, defaultStyles, filterNonNull } from './utils';
import { removeUndefinedProps } from '@/utils/object';
import { migratePrevStyles } from '../_common-migrations/migrateStyles';
import { evaluateDynamicFiltersSync } from '@/utils';
import { useAvailableConstantsData, useDataContextManager, useMetadataDispatcher, IModelMetadata } from '@/index';
import { useShaFormDataUpdate } from '@/providers/form/providers/shaFormProvider';
import useStyles from './styles';
import ChartLoader from './components/chartLoader';

const PieChartComponent: IToolboxComponent<IChartProps> = {
  type: 'pieChart',
  name: 'Pie Chart',
  isInput: false,
  isOutput: true,
  icon: <PieChartOutlined />,
  Factory: ({ model }) => {
    useShaFormDataUpdate();
    const allAvailableData = useAvailableConstantsData();
    const dataContextManager = useDataContextManager();
    const { getMetadata } = useMetadataDispatcher();
    const [stateEvaluatedFilters, setStateEvaluatedFilters] = useState<string>('');
    const [metaData, setMetaData] = useState<IModelMetadata>(undefined);
    const [filtersReady, setFiltersReady] = useState<boolean>(false);
    const { cx, styles } = useStyles();

    // Use refs to track current filter state and prevent race conditions
    const filtersRef = useRef<string>('');
    const filtersReadyRef = useRef<boolean>(false);

    useEffect(() => {
      getMetadata({ modelType: model.entityType, dataType: 'entity' })
        .then(setMetaData)
        .catch(console.error);
    }, [model.entityType]);

    // Memoize the data context values to prevent unnecessary re-renders
    const pageContext = useMemo(() => dataContextManager?.getPageContext(), [dataContextManager]);
    const contextsData = useMemo(() => dataContextManager?.getDataContextsData(), [dataContextManager]);

    useEffect(() => {
      if (!model.filters) {
        filtersRef.current = '';
        filtersReadyRef.current = true;
        setStateEvaluatedFilters('');
        setFiltersReady(true);
        return;
      }

      // Check if we have all required data for filter evaluation
      if (!metaData?.properties) {
        console.warn('Waiting for metadata to evaluate filters');
        return;
      }

      const match = [
        { match: 'data', data: allAvailableData.form?.data },
        { match: 'globalState', data: allAvailableData.globalState },
        { match: 'pageContext', data: pageContext },
        contextsData ? { match: 'contexts', data: contextsData } : null
      ].filter(Boolean);

      try {
        const response = evaluateDynamicFiltersSync(
          [{ expression: model.filters } as any],
          match,
          metaData?.properties
        );

        const strFilters = JSON.stringify(response[0]?.expression || '');

        // Update both ref and state atomically
        filtersRef.current = strFilters;
        filtersReadyRef.current = true;
        setStateEvaluatedFilters(strFilters);
        setFiltersReady(true);
      } catch (error) {
        console.error('Error evaluating filters:', error);
        filtersRef.current = '';
        filtersReadyRef.current = false;
        setStateEvaluatedFilters('');
        setFiltersReady(false);
      }
    }, [metaData?.properties, model.filters, allAvailableData.form?.data, allAvailableData.globalState, pageContext, contextsData]);

    const {
      dimensionsStyles,
      borderStyles,
      backgroundStyles,
      shadowStyles,
      stylingBoxAsCSS,
      jsStyle
    } = model.allStyles;

    const wrapperStyles = removeUndefinedProps({
      ...dimensionsStyles,
      ...borderStyles,
      ...backgroundStyles,
      ...shadowStyles,
      ...stylingBoxAsCSS,
      ...jsStyle
    });

    if (model.hidden) return null;

    // Don't render chart until filters are ready to prevent race conditions
    if (!filtersReady) {
      return (
        <ConfigurableFormItem model={model}>
          <div className={cx(styles.loadingContainer)}>
            <ChartLoader chartType={model.chartType} /> 
            <div className={cx(styles.loadingText)}>Fetching data...</div>
          </div>
        </ConfigurableFormItem>
      );
    }

    return (
      <ConfigurableFormItem model={model}>
        {() => {
          return (
            <ChartDataProvider model={model}>
              <div style={{
                ...wrapperStyles,
                padding: '16px',
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
              }}>
                {model.dataMode === 'url' ? <ChartControlURL {...model} /> : <ChartControl chartType='pie' evaluatedFilters={stateEvaluatedFilters} />}
              </div>
            </ChartDataProvider>
          );
        }}
      </ConfigurableFormItem>
    );
  },
  settingsFormMarkup: (data) => getSettings(data),
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings(model), model),
  migrator: (m) => m
    .add<IChartProps>(0, prev => ({
      chartType: 'pie',
      showTitle: false,
      showLegend: true,
      legendPosition: 'top',
      hidden: false,
      ...prev,
    }))
    .add<IChartProps>(1, prev => ({ ...prev, hideLabel: true }))
    .add<IChartProps>(2, prev => ({ ...prev, showBorder: true }))
    .add<IChartProps>(3, prev => ({ ...prev, isDoughnut: false }))
    .add<IChartProps>(4, prev => ({ ...prev, showTitle: true }))
    .add<IChartProps>(5, prev => ({
      ...defaultConfigFiller,
      ...filterNonNull(prev),
      type: prev.type,
      id: prev.id
    }))
    .add<IChartProps>(6, prev => ({
      ...prev,
      isAxisTimeSeries: false,
      isGroupingTimeSeries: false,
      strokeColor: '#000000',
      strokeWidth: 1,
      maxResultCount: 10000,
      requestTimeout: 10000,
    }))
    .add<IChartProps>(7, prev => ({
      ...prev,
      timeSeriesFormat: 'month-year',
      groupingTimeSeriesFormat: 'month-year',
      ...migratePrevStyles(prev, defaultStyles())
    }))
    .add<IChartProps>(8, prev => ({
      ...prev,
      maxResultCount: 250,
      requestTimeout: 15000,
      orderDirection: 'asc',
    }))
};

export default PieChartComponent;
