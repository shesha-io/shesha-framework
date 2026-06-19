export type RequestValue = string;

export interface IRequestParam {
  key: string;
  value: string;
  description?: string;
  enabled: boolean;
}

export interface IRequestHeader {
  key: string;
  value: string;
  enabled: boolean;
}

export type BodyType = 'none' | 'json' | 'form-data' | 'x-www-form-urlencoded' | 'raw';

export interface IFormDataField {
  key: string;
  value: string;
  enabled: boolean;
}

export type RawBodySubType = 'text' | 'json' | 'xml' | 'html' | 'javascript';

export interface IRequestBody {
  type: BodyType;
  content: string | Record<string, unknown> | IFormDataField[];
  rawSubType?: RawBodySubType;
}

/**
 * Optional transformation applied to the API response before it is displayed/consumed.
 * The original response is left unchanged; when the transformation is disabled or fails,
 * the original response is returned unchanged.
 */
export interface IResponseTransformationConfiguration {
  enabled: boolean;
  /** JavaScript body that receives `input` (the response) and returns the transformed value. */
  script: string;
}

export interface IRequestConfig {
  params: IRequestParam[];
  headers: IRequestHeader[];
  body: IRequestBody;
  responseTransformation?: IResponseTransformationConfiguration;
}
  