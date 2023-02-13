import { useEffect, useState } from 'react';
import { useBoolean } from 'react-use';
import transformJS from 'js-to-json-logic';
import { useDataTable } from '../../providers';
import { useMutate } from 'restful-react';

const UNIQUE_FILTER_ID = 'HjHi0UVD27o8Ub8zfz6dH';

export const useSelectedTableRow = (selectedTableId: string) => {
  const [data, setData] = useState<object>();
  const [loading, setLoading] = useBoolean(false);
  const { entityType, properties, tableData } = useDataTable();
  const { mutate } = useMutate({
    verb: 'POST',
    path: '', /* todo:restore */
  });

  useEffect(() => {
    if (!selectedTableId) return;

    if (tableData?.find(item => (item as any)?.Id === selectedTableId)) {
      return;
    }

    setLoading(true);
    
    mutate({
      entityType,
      properties,
      pageSize: 1,
      currentPage: 1,
      filter: [],
      selectedStoredFilterIds: [UNIQUE_FILTER_ID],
      selectedFilters: [
        {
          expression: transformJS(`Id === "${selectedTableId}"`),
          name: 'EntityPickerInner filter',
          id: UNIQUE_FILTER_ID,
        },
      ],
    })
      .then(response => {
        if(response?.result){
          const { rows } = response?.result;

          setData(rows?.length ? rows[0] : null); // length === 1
        }else{
          setData(null)
        }
  
      })
      .finally(() => {
        setLoading(false);
      });
  
  }, [selectedTableId]);
  
  return { loading, data };
};
