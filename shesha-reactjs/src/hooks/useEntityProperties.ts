import { useContext, useState, useEffect } from 'react';
import { SubFormContext } from '@/providers/subForm/contexts';
import { asPropertiesArray, IPropertyMetadata } from '@/interfaces/metadata';
import { useForm, useMetadataDispatcher } from '@/providers';
import { IGetMetadataPayload } from '@/providers/metadataDispatcher/contexts';

async function fetchMetadata(dataType: string, getMetadata: Function, entityType: string) {
    const meta = await getMetadata({ dataType, modelType: entityType });
    return asPropertiesArray(meta?.properties, []);
}

export function useEntityProperties({ dataType }: Partial<Omit<IGetMetadataPayload,'modelType'>>): IPropertyMetadata[] {
    const { getMetadata } = useMetadataDispatcher();
    const {formSettings: subFormSettings } = useContext(SubFormContext);
    const {formSettings}=useForm();
    const [properties, setProperties] = useState<IPropertyMetadata[]>([]);

    useEffect(() => {
        const entityType = subFormSettings?.modelType || formSettings?.modelType;

        // Call the separate function and handle the Promise in useEffect
        fetchMetadata(dataType, getMetadata, entityType)
            .then(properties => setProperties(properties));

    }, [dataType, getMetadata, formSettings]);

    return properties;
}