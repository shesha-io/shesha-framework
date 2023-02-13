using Shesha.ConfigurationItems.Exceptions;
using Shesha.Domain;

namespace Shesha.Services.ReferenceLists.Exceptions
{
    /// <summary>
    /// Reference List not found exception
    /// </summary>
    public class ReferenceListNotFoundException : ConfigurationItemNotFoundException
    {
        public string Namespace { get; set; }

        public ReferenceListNotFoundException(string module, string name) : base(ReferenceList.ItemTypeName, module, name, null)
        {
        }

        public ReferenceListNotFoundException(ReferenceListIdentifier refListId) : this(refListId.Module, refListId.Name)
        {
            
        }
    }
}
