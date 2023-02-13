using Shesha.Configuration.Runtime;

namespace Shesha.QuickSearch
{
    /// <summary>
    /// Quick search property info
    /// </summary>
    public class QuickSearchPropertyInfo
    {
        /// <summary>
        /// Property name
        /// </summary>
        public string Name { get; set; }
        
        /// <summary>
        /// General datatype
        /// </summary>
        public GeneralDataType DataType { get; set; }

        /// <summary>
        /// Referencelist module
        /// </summary>
        public string ReferenceListModule { get; set; }

        /// <summary>
        /// Referencelist name
        /// </summary>
        public string ReferenceListName { get; set; }
    }
}
