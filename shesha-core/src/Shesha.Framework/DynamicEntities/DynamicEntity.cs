namespace Shesha.DynamicEntities
{
    /// <summary>
    /// Dynamic entity
    /// </summary>
    public class DynamicEntity
    {
        /// <summary>
        /// Entity class name
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// Properties
        /// </summary>
        public DynamicPropertyList Properties { get; set; }
    }
}
