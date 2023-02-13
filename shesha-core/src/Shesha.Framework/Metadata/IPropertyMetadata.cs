using Shesha.Configuration.Runtime;

namespace Shesha.Metadata
{
    /// <summary>
    /// Property metadata interface
    /// </summary>
    public interface IPropertyMetadata
    {
        /// <summary>
        /// Name
        /// </summary>
        string Name { get; }

        /// <summary>
        /// Label
        /// </summary>
        string Label { get; }

        /// <summary>
        /// Description
        /// </summary>
        string Description { get; }

        /// <summary>
        /// Data type
        /// </summary>
        string DataType { get; }
    }
}
