import { MetadataFluent } from '../index';

describe('MetadataFluent', () => {
    let metadataFluent: MetadataFluent;

    beforeEach(() => {
        metadataFluent = new MetadataFluent();
    });

    it('should set data type to entity', () => {
        const metadata = metadataFluent.entity().build();
        expect(metadata.dataType).toEqual('entity');
    });

    it('should set data type to object', () => {
        const metadata = metadataFluent.object().build();
        expect(metadata.dataType).toEqual('object');
    });
});