using Shesha.ConfigurationItems;
using Shesha.Domain;

namespace Shesha.Services.ReferenceLists
{
    /// <summary>
    /// Reference list manager. Performs management operations (create/update/delete/copy etc)
    /// </summary>
    public interface IReferenceListManager: IConfigurationItemManager<ReferenceList>
    {
    }
}
