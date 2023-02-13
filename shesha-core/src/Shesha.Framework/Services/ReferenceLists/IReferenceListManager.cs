using Shesha.ConfigurationItems;
using Shesha.Domain;
using Shesha.Services.ReferenceLists.Dto;
using System.Threading.Tasks;

namespace Shesha.Services.ReferenceLists
{
    /// <summary>
    /// Reference list manager. Performs management operations (create/update/delete/copy etc)
    /// </summary>
    public interface IReferenceListManager: IConfigurationItemManager<ReferenceList>
    {
        /// <summary>
        /// Create new version of the reference list
        /// </summary>
        /// <param name="form">Reference list</param>
        /// <returns></returns>
        Task<ReferenceList> CreateNewVersionAsync(ReferenceList form);

        /// <summary>
        /// Create new Reference List
        /// </summary>
        /// <param name="input"></param>
        /// <returns></returns>
        Task<ReferenceList> CreateAsync(CreateReferenceListDto input);

        /// <summary>
        /// Update Reference List
        /// </summary>
        /// <param name="refList"></param>
        /// <param name="input"></param>
        /// <returns></returns>
        Task UpdateAsync(ReferenceList refList, UpdateReferenceListDto input);
    }
}
