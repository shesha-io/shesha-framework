import { GenericConfigItemAutocomplete } from './generic';
import { FormAutocomplete } from './formAutocomplete';
import { NotificationAutocomplete } from './notificationAutocomplete';
import { NotificationChannelAutocomplete } from './notificationChannelAutocomplete';
import { ReferenceListAutocomplete } from './referenceListAutocomplete';
import { RoleAutocomplete } from './roleAutocomplete';

export { GenericConfigItemAutocomplete as ConfigurableItemAutocomplete };

type GenericConfigItemAutocompleteType = typeof GenericConfigItemAutocomplete;
interface ConfigItemAutocompleteType extends GenericConfigItemAutocompleteType {
  Form: typeof FormAutocomplete;
  Notification: typeof NotificationAutocomplete;
  NotificationChannel: typeof NotificationChannelAutocomplete;
  ReferenceList: typeof ReferenceListAutocomplete;
  Role: typeof RoleAutocomplete;
}

const autocomplete = GenericConfigItemAutocomplete as ConfigItemAutocompleteType;
autocomplete.Form = FormAutocomplete;
autocomplete.Notification = NotificationAutocomplete;
autocomplete.NotificationChannel = NotificationChannelAutocomplete;
autocomplete.ReferenceList = ReferenceListAutocomplete;
autocomplete.Role = RoleAutocomplete;

export { autocomplete as ConfigItemAutocomplete };
