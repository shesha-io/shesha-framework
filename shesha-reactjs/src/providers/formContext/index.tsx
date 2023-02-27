import { useForm } from '../form';
import { useSubForm } from '../subForm';

export const useFormData = () => {
  const form = useForm(false);
  const subForm = useSubForm(false);

  const data = subForm?.value ?? form?.formData;

  return { data };
};
