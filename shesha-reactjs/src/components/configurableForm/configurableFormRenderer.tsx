import _ from 'lodash';
import classNames from 'classnames';
import ComponentsContainer from '../formDesigner/containers/componentsContainer';
import React, {
  FC,
  PropsWithChildren,
  useEffect,
  useMemo,
} from 'react';
import {
  hasFiles,
  jsonToFormData,
} from '@/utils/form';
import { ComponentsContainerForm } from '../formDesigner/containers/componentsContainerForm';
import { ComponentsContainerProvider } from '@/providers/form/nesting/containerContext';
import { Button, Form, Result, Spin } from 'antd';
import { useFormData } from '@/providers/form/api';
import { getQueryParams } from '@/utils/url';
import { ValidateErrorEntity } from '@/interfaces';
import { IConfigurableFormRendererProps } from './models';
import { ROOT_COMPONENT_KEY } from '@/providers/form/models';
import { StandardEntityActions } from '@/interfaces/metadata';
import { ShaForm, useForm } from '@/providers/form';
import { useFormDesignerState } from '@/providers/formDesigner';
import { useGlobalState, useSheshaApplication } from '@/providers';
import { useModelApiEndpoint } from './useActionEndpoint';
import { useMutate } from '@/hooks/useMutate';
import { useStyles } from './styles/styles';
import {
  evaluateComplexString,
  evaluateValue,
  IMatchData,
} from '@/providers/form/utils';
import Link from 'next/link';
import ParentProvider from '@/providers/parentProvider';

export const ConfigurableFormRenderer: FC<PropsWithChildren<IConfigurableFormRendererProps>> = ({
  children,
  form,
  submitAction = StandardEntityActions.create,
  parentFormValues,
  initialValues,
  beforeSubmit,
  prepareInitialValues,
  onSubmittedFailed,
  skipFetchData,
  ...props
}) => {
  const formInstance = useForm();

  const { styles } = useStyles();
  const formFlatMarkup = ShaForm.useMarkup();
  const { anyOfPermissionsGranted } = useSheshaApplication();

  const {
    updateStateFormData,
    formData,
    formMode,
    formSettings,
    setValidationErrors,
    setFormData,
  } = formInstance;

  const { isDragging = false } = useFormDesignerState(false) ?? {};

  const { onDataLoaded, onUpdate, onInitialized, uniqueFormId } = formSettings;
  const { globalState } = useGlobalState();

  const urlEvaluationData: IMatchData[] = [
    { match: 'initialValues', data: initialValues },
    { match: 'query', data: getQueryParams() },
    { match: 'data', data: formData },
    { match: 'parentFormValues', data: parentFormValues },
    { match: 'globalState', data: globalState },
  ];

  const submitEndpoint = useModelApiEndpoint({
    actionName: submitAction,
    formSettings: formSettings,
    mappings: urlEvaluationData,
  });

  const dataFetcher = useFormData({
    formFlatStructure: formFlatMarkup,
    formSettings: formSettings,
    lazy: skipFetchData,
    urlEvaluationData: urlEvaluationData,
    // data: formData, NOTE: form data must not be used here!
  });

  const queryParamsFromAddressBar = useMemo(() => getQueryParams(), []);

  // Execute onInitialized if provided
  useEffect(() => {
    if (onInitialized) {
      try {
        formInstance.executeExpression(onInitialized);
      } catch (error) {
        console.warn('onInitialized error', error);
      }
    }
  }, [onInitialized]);

  const onValuesChangeInternal = (changedValues: any, values: any) => {
    if (props.onValuesChange) props.onValuesChange(changedValues, values);

    // recalculate components visibility
    updateStateFormData({ values, mergeValues: true });
  };

  const initialValuesFromSettings = useMemo(() => {
    const computedInitialValues = {} as object;

    formSettings?.initialValues?.forEach(({ key, value }) => {
      const evaluatedValue = value?.includes('{{')
        ? evaluateComplexString(value, [
          { match: 'data', data: formData },
          { match: 'parentFormValues', data: parentFormValues },
          { match: 'globalState', data: globalState },
          { match: 'query', data: queryParamsFromAddressBar },
          { match: 'initialValues', data: initialValues },
        ])
        : value?.includes('{')
          ? evaluateValue(value, {
            data: formData,
            parentFormValues: parentFormValues,
            globalState: globalState,
            query: queryParamsFromAddressBar,
            initialValues: initialValues,
          })
          : value;
      _.set(computedInitialValues, key, evaluatedValue);
    });

    return computedInitialValues;
  }, [formSettings?.initialValues]);

  const fetchedFormEntity = dataFetcher.fetchedData as object;

  useEffect(() => {
    if (fetchedFormEntity && onDataLoaded) {
      formInstance.executeExpression(onDataLoaded, fetchedFormEntity); // On Initialize
    }
  }, [onDataLoaded, fetchedFormEntity]);

  useEffect(() => {
    if (onUpdate) {
      formInstance.executeExpression(onUpdate); // On Update
    }
  }, [formData, onUpdate]);

  useEffect(() => {
    let incomingInitialValues = null;

    // By default the `initialValuesFromSettings` are merged with `fetchedFormEntity`
    // If you want only `initialValuesFromSettings`, then pass skipFetchData
    // If you want only `fetchedFormEntity`, don't pass `initialValuesFromSettings`
    if (!_.isEmpty(initialValuesFromSettings)) {
      incomingInitialValues = fetchedFormEntity
        ? Object.assign(fetchedFormEntity, initialValuesFromSettings)
        : initialValuesFromSettings;
    } else if (!_.isEmpty(fetchedFormEntity)) {
      // `fetchedFormEntity` will always be merged with persisted values from local storage
      // To override this, to not persist values or pass skipFetchData
      let computedInitialValues = fetchedFormEntity
        ? prepareInitialValues
          ? prepareInitialValues(fetchedFormEntity)
          : fetchedFormEntity
        : initialValues;

      incomingInitialValues = computedInitialValues;
    }
    // }

    if (incomingInitialValues) {
      setFormData({ values: incomingInitialValues, mergeValues: true });
    }
  }, [fetchedFormEntity, initialValuesFromSettings, uniqueFormId]);

  const { mutate: doSubmit, loading: submitting } = useMutate();


  const options = { setValidationErrors };

  const convertToFormDataIfRequired = (data: any) => {
    return data && hasFiles(data) ? jsonToFormData(data) : data;
  };

  const onFinishInternal = () => {
    formInstance.prepareDataForSubmit().then((postData) => {
      if (props.onFinish) {
        props.onFinish(postData, options);
      } else {
        if (submitEndpoint?.url) {
          setValidationErrors(null);

          const preparedData = convertToFormDataIfRequired(postData);

          const doPost = () =>
            doSubmit(submitEndpoint, preparedData)
              .then((response) => {
                // note: we pass merged values
                if (props.onSubmitted) props.onSubmitted(postData, response?.result, options);
              })
              .catch((e) => {
                onSubmittedFailed();
                setValidationErrors(e?.data?.error || e);
                console.error('Submit failed: ', e);
              });

          if (typeof beforeSubmit === 'function') {
            beforeSubmit(postData)
              .then(() => {
                doPost();
              })
              .catch((e) => {
                console.error('`beforeSubmit` handler failed', e);
              });
          } else {
            doPost();
          }
        } else throw 'failed to determine a submit endpoint';
      }
    });
  };

  const onFinishFailedInternal = (errorInfo: ValidateErrorEntity) => {
    setValidationErrors(null);
    if (props.onFinishFailed) props.onFinishFailed(errorInfo);
  };

  const mergedProps = {
    layout: props.layout ?? formSettings.layout,
    labelCol: props.labelCol ?? formSettings.labelCol,
    wrapperCol: props.wrapperCol ?? formSettings.wrapperCol,
    colon: formSettings.colon,
  };

  if (formSettings?.access === 4 && !anyOfPermissionsGranted(formSettings?.permissions || [])) {
    return (
      <Result
        status="403"
        style={{ height: '100vh - 55px' }}
        title="403"
        subTitle="Sorry, you are not authorized to access this page."
        extra={
          <Button type="primary">
            <Link href={'/'}>
              Back Home
            </Link>
          </Button>
        }
      />
    );
  }

  return (
    <ParentProvider model={{}} formMode={formMode} formFlatMarkup={formFlatMarkup} isScope >
      <ComponentsContainerProvider ContainerComponent={ComponentsContainerForm}>
        <Spin spinning={submitting}>
          <Form
            form={form}
            labelWrap
            size={props.size}
            onFinish={onFinishInternal}
            onFinishFailed={onFinishFailedInternal}
            onValuesChange={onValuesChangeInternal}
            initialValues={initialValues}
            className={classNames(styles.shaForm, { 'sha-dragging': isDragging }, props.className)}
            {...mergedProps}
          >
            <ComponentsContainer containerId={ROOT_COMPONENT_KEY} />
            {children}
          </Form>
        </Spin>
      </ComponentsContainerProvider>
    </ParentProvider>
  );
};

export default ConfigurableFormRenderer;
