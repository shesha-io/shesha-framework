using Shesha.Domain.Attributes;
using Shesha.Domain.Enums;

namespace Shesha.Domain
{
    /// <summary>
    /// Entity property value (initially for Dynamic properties)
    /// </summary>
    [Entity(TypeShortAlias = "Shesha.Framework.EntityPropertyValue", CrudActions = CrudActions.None, IsConfigurable = false)]
    public class EntityPropertyValue : FullPowerChildEntity
    {
        /// <summary>
        /// Owner entity property
        /// </summary>
        public virtual EntityProperty EntityProperty { get; set; }

        /// <summary>
        /// Property value
        /// </summary>
        public virtual string Value { get; set; }

        public EntityPropertyValue()
        {
        }
    }
}
