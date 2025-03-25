using Shesha.Domain.Attributes;

namespace Shesha.Domain
{
    /// <summary>
    /// Entity property value (initially for Dynamic properties)
    /// </summary>
    [Entity(TypeShortAlias = "Shesha.Framework.EntityPropertyValue", GenerateApplicationService = GenerateApplicationServiceState.DisableGenerateApplicationService)]
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
