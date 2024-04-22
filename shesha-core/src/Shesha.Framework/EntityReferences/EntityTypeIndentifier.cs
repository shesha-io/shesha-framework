namespace Shesha.EntityReferences
{
    /// <summary>
    /// Generic entity type identifier. Note: Uses acccessors instead of names
    /// </summary>
    public class EntityTypeIndentifier
    {
        /// <summary>
        /// Accessor of the entity type
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// Accessor of the module
        /// </summary>
        public string Module { get; set; }

        public EntityTypeIndentifier(string module, string name)
        {
            Module = module;
            Name = name;
        }
    }
}
