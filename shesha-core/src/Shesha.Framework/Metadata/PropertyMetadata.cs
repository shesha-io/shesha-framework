using Shesha.Configuration.Runtime;

namespace Shesha.Metadata
{
    /// <summary>
    /// Property metadata
    /// </summary>
    public class PropertyMetadata: IPropertyMetadata
    {
        /// <summary>
        /// Name
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// Label
        /// </summary>
        public string Label { get; set; }

        /// <summary>
        /// Description
        /// </summary>
        public string Description { get; set; }

        /// <summary>
        /// Data type
        /// </summary>
        public string DataType { get; set; }
    }
}
