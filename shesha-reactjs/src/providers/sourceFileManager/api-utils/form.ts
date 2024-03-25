export const formApiDefinition = `/** Form mode */
export type FormMode = 'readonly' | 'edit' | 'designer';

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
}`;