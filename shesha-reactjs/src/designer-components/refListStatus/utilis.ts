import { ReferenceListItemDto, ReferenceListWithItemsDto } from '../../apis/referenceList';

const getCurrentStatus = (
  refListData: ReferenceListWithItemsDto,
  data: any,
  formMode: string,
  name: string
): ReferenceListItemDto => {
  if (formMode === 'designer') {
    return !refListData?.items?.length ? null : refListData?.items[0];
  }
  return !refListData?.items?.length || data[name] === null || data[name] === undefined
    ? null
    : refListData?.items?.find((i) => i.itemValue === data[name]);
};

export { getCurrentStatus };
