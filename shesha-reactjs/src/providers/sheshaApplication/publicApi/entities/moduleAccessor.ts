import { BaseAccessor } from "../common/baseAccessor";
import { EntityTypeAccessor } from "./entityTypeAccessor";
import { EntitiesManager } from "./manager";

/**
 * Entities: module accessor
 */
export class EntitiesModuleAccessor extends BaseAccessor<EntityTypeAccessor, EntitiesManager> {
  override createChild = (accessor: string): EntityTypeAccessor => {
    return new EntityTypeAccessor(this._manager, this._accessor, accessor);
  };
}
