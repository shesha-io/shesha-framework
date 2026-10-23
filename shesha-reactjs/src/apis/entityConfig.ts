import { IAjaxResponse } from '@/interfaces/ajaxResponse';

interface FormIdFullNameDto {
  name: string;
  module: string;
}

export type FormIdFullNameDtoAjaxResponse = IAjaxResponse<FormIdFullNameDto>;
