import { BaseAccessor } from "../common/baseAccessor";
import { EntityTypeAccessor } from "./entityTypeAccessor";
import { EntitiesManager } from "./manager";

export interface IEntitiesModuleAccessor {

}

/**
 * Entities: module accessor
 */
export class EntitiesModuleAccessor extends BaseAccessor<EntityTypeAccessor, EntitiesManager> implements IEntitiesModuleAccessor {
    createChild = (accessor: string) => {
        return new EntityTypeAccessor(this._manager, this._accessor, accessor);
    };
}