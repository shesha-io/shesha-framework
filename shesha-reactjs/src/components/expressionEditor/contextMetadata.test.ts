import { DataTypes } from '@/interfaces';
import { IObjectMetadata } from '@/interfaces/metadata';
import { buildExpressionContextFromMetadata } from './contextMetadata';

describe('buildExpressionContextFromMetadata', () => {
  it('merges nested properties with type-definition members for context suggestions', async () => {
    const metadata: IObjectMetadata = {
      dataType: DataTypes.object,
      properties: [
        {
          path: 'contexts',
          dataType: DataTypes.object,
          properties: [
            {
              path: 'canvasContext',
              dataType: DataTypes.object,
              properties: [
                { path: 'zoom', dataType: DataTypes.number },
                { path: 'details.themeName', dataType: DataTypes.string },
              ],
              typeDefinitionLoader: async () => ({
                typeName: 'ICanvasContextApi',
                files: [{
                  fileName: 'apis/canvasContext.ts',
                  content: `
                    export interface ICanvasActions {
                      setDesignerDevice(deviceType: string): void;
                      setCanvasWidth(width: number | string): void;
                    }

                    export interface ICanvasState {
                      activeDevice?: string;
                    }

                    export interface ICanvasContextApi extends ICanvasState {
                      zoom?: number;
                      api: ICanvasActions;
                    }
                  `,
                }],
              }),
            },
          ],
        },
      ],
    };

    await expect(buildExpressionContextFromMetadata(metadata)).resolves.toEqual({
      contexts: {
        canvasContext: {
          zoom: null,
          details: {
            themeName: null,
          },
          activeDevice: null,
          api: {
            setDesignerDevice: null,
            setCanvasWidth: null,
          },
        },
      },
    });
  });
});
