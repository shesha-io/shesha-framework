export const formApiDefinition = `/** Form mode */
export type FormMode = 'readonly' | 'edit' | 'designer';

export interface IFormSettings {
  modelType?: string;

  postUrl?: string;
  putUrl?: string;
  deleteUrl?: string;
  getUrl?: string;

  layout: FormLayout;
  colon: boolean;
  //labelCol: ColProps;
  //wrapperCol: ColProps;
  preparedValues?: string;
  size?: SizeType;
  formKeysToPersist?: string[];
  fieldsToFetch?: string[];
  excludeFormFieldsInPayload?: string;
  uniqueFormId?: string;
  onDataLoaded?: string;
  onInitialized?: string;
  onUpdate?: string;
  //initialValues?: IKeyValue[];

  /** if true then need to update components structure for using Setting component */
  isSettingsForm?: boolean;
}

/**
* Form instance API
*/
export interface FormApi<Values = any> {
   /**
    * Set field value
    * @param name field name
    * @param value field value
    */
   setFieldValue: (name: string, value: any) => void;
   /**
    * Set fields value
    * @param values 
    */
   setFieldsValue: (values: Values) => void;
   /**
    * Submit form
    */
   submit: () => void;

   /**
    * Configurable form settings)
    */
   formSettings: IFormSettings;
}`;