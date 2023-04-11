import { GenericRefListDropDown } from './genericRefListDropDown';
import { RawRefListDropDown } from './rawRefListDropDown';
import { DtoRefListDropDown } from './dtoRefListDropDown';

export { type IRefListDropDownProps, type IRefListDropDownOption } from './models';
export { RawRefListDropDown } from './rawRefListDropDown';
export { DtoRefListDropDown } from './dtoRefListDropDown';

type InternalDropDownType = typeof GenericRefListDropDown;

interface IInternalDropDownInterface extends InternalDropDownType {
  Raw: typeof RawRefListDropDown;
  Dto: typeof DtoRefListDropDown;
}

const DropDownInterface = GenericRefListDropDown as IInternalDropDownInterface;
DropDownInterface.Raw = RawRefListDropDown;
DropDownInterface.Dto = DtoRefListDropDown;

export default DropDownInterface;
