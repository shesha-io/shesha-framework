using System;

namespace Shesha.DynamicEntities
{
    /// <summary>
    /// Dynamic entity property
    /// </summary>
    public class DynamicProperty
    {
        /// <summary>
        /// Property name
        /// </summary>
        public string PropertyName { get; set; }

        /// <summary>
        /// Property type
        /// </summary>
        public Type PropertyType { get; set; }
    }
}
