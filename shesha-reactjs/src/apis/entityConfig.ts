import { IAjaxResponse } from '@/interfaces/ajaxResponse';

export interface FormIdFullNameDto {
  name: string;
  module: string;
}

export type FormIdFullNameDtoAjaxResponse = IAjaxResponse<FormIdFullNameDto>;
