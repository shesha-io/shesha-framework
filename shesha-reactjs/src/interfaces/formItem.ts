import { IValuable } from './valuable';
import { IChangeable } from './changeable';
import { INamed } from './named';

export interface IFormItem extends IChangeable, IValuable, INamed {}
