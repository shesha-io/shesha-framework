using Abp;
using Abp.Domain.Entities;

namespace Shesha.Exceptions
{
    /// <summary>
    /// Metadata of type not found exception
    /// </summary>
    public class MetadataOfTypeNotFoundException : EntityNotFoundException, IHasErrorCode
    {
        public MetadataOfTypeNotFoundException(string typeName) : base($"Type `{typeName}` not found")
        {
            TypeName = typeName;
            Code = 404;
        }

        /// <summary>
        /// Type name
        /// </summary>
        public string TypeName { get; set; }

        /// <summary>
        /// Error code
        /// </summary>
        public int Code { get; set; }
    }
}
