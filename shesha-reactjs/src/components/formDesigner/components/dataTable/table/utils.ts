import { nanoid } from 'nanoid/non-secure';
import { GenericDictionary } from '../../../../../providers';
import { IExecuteActionPayload } from '../../../../../providers/configurableActionsDispatcher/contexts';
import { IShowModalActionArguments } from '../../../../../providers/dynamicModal/configurable-actions/show-dialog-arguments';
import { ITableComponentProps } from './models';

const NEW_KEY = ['{{NEW_KEY}}', '{{GEN_KEY}}'];

export const generateNewKey = (json: object) => {
  try {
    let stringify = JSON.stringify(json);

    NEW_KEY.forEach(key => {
      stringify = stringify.replaceAll(key, nanoid());
    });

    return JSON.parse(stringify);
  } catch (error) {
    return json;
  }
};

export const getOnRowDraggedDialogAction = (
  props: ITableComponentProps,
  argumentsEvaluationContext: GenericDictionary
): IExecuteActionPayload => {
  const {
    dialogForm,
    dialogFormSkipFetchData,
    dialogOnSuccessScript,
    dialogOnErrorScript,
    dialogSubmitHttpVerb,
    dialogShowModalButtons,
    dialogTitle,
  } = props;

  const handleSuccess = Boolean(dialogOnSuccessScript);
  const handleFail = Boolean(dialogOnErrorScript);

  const actionArguments: IShowModalActionArguments = {
    modalTitle: dialogTitle,
    formId: dialogForm,
    showModalFooter: dialogShowModalButtons,
    skipFetchData: dialogFormSkipFetchData,
    submitHttpVerb: dialogSubmitHttpVerb,
  };

  const payload: IExecuteActionPayload = {
    actionConfiguration: {
      actionOwner: 'Common',
      actionName: 'Show Dialog',
      handleFail,
      handleSuccess,
      actionArguments,
      onFail: handleFail
        ? {
            actionOwner: 'Common',
            actionName: 'Execute Script',
            actionArguments: {
              expression: dialogOnErrorScript,
            },
            handleFail: false,
            handleSuccess: false,
          }
        : null,
      onSuccess: handleSuccess
        ? {
            actionOwner: 'Common',
            actionName: 'Execute Script',
            actionArguments: {
              expression: dialogOnSuccessScript,
            },
            handleFail: false,
            handleSuccess: false,
          }
        : null,
    },
    argumentsEvaluationContext,
  };

  return payload;
};

export const getOnRowDraggedExecuteExpressionAction = (
  props: ITableComponentProps,
  argumentsEvaluationContext: GenericDictionary
): IExecuteActionPayload => {
  const { onRowDropped } = props;

  const payload: IExecuteActionPayload = {
    actionConfiguration: {
      actionOwner: 'Common',
      actionName: 'Execute Script',
      actionArguments: {
        expression: onRowDropped,
      },
      handleFail: false,
      handleSuccess: false,
    },
    argumentsEvaluationContext,
  };

  return payload;
};

export const getOnRowDroppedAction = (props: ITableComponentProps, argumentsEvaluationContext: GenericDictionary) => {
  const action =
    props?.rowDroppedMode === 'executeScript' ? getOnRowDraggedExecuteExpressionAction : getOnRowDraggedDialogAction;

  return action(props, argumentsEvaluationContext);
};
