import { useForm } from '../form';
import { useSubForm } from '../subForm';

/**
 * Hook that returns the form data based on the context
 * If the item is rendered within the SubForm, the value that gets returned is the value of the SubForm, else it will the main form's data
 */
export const useFormData = () => {
  const form = useForm(false);
  const subForm = useSubForm(false);

  const data = subForm?.value ?? form?.formData;

  return { data };
};
