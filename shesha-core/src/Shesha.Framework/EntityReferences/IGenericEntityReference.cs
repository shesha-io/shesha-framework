using Shesha.DynamicEntities;

namespace Shesha.EntityReferences
{
    public interface IGenericEntityReference: IHasClassNameField, IHasDisplayNameField
    {
        string Id { get; }
    }

}
