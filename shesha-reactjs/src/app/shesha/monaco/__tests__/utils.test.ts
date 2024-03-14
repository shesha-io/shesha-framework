import { blockCode } from '../utils';

describe('blockCode', () => {
    it('should contain wrapped code', () => {
        const wrappedCode = `console.log('test');`;
        const result = blockCode`import { application, data } from './exposed-vars';

        function onClick() {
          ${wrappedCode}
        };`;

        expect(result.content).toContain(wrappedCode);
    });
});