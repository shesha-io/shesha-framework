using Shesha.Domain;
using Shesha.Services.ReferenceLists.Dto;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Shesha.Services
{
    /// <summary>
    /// ReferenceList helper
    /// </summary>
    public interface IReferenceListHelper
    {
        /// <summary>
        /// Get <see cref="ReferenceList"/> by identifier
        /// </summary>
        /// <param name="refListId">Reference list identifier</param>
        /// <returns></returns>
        Task<ReferenceList> GetReferenceListAsync(ReferenceListIdentifier refListId);

        /// <summary>
        /// Get <see cref="ReferenceList"/> by identifier
        /// </summary>
        /// <param name="refListId">Reference list identifier</param>
        /// <returns></returns>
        ReferenceList GetReferenceList(ReferenceListIdentifier refListId);

        /// <summary>
        /// Get items by id (Guid) of the <see cref="ReferenceList"/>
        /// </summary>
        Task<List<ReferenceListItemDto>> GetItemsAsync(Guid refListId);

        /// <summary>
        /// Get items by full identifier of the <see cref="ReferenceList"/>
        /// </summary>
        /// <param name="refListId">Full identifier of the <see cref="ReferenceList"/></param>
        /// <returns></returns>
        Task<List<ReferenceListItemDto>> GetItemsAsync(ReferenceListIdentifier refListId);

        /// <summary>
        /// Get items by full identifier of the <see cref="ReferenceList"/>
        /// </summary>
        /// <param name="refListId">Full identifier of the <see cref="ReferenceList"/></param>
        /// <returns></returns>
        List<ReferenceListItemDto> GetItems(ReferenceListIdentifier refListId);

        /// <summary>
        /// Returns display name of the <see cref="ReferenceListItem"/> in the specified list
        /// </summary>
        /// <param name="refListId">Reference list identifier</param>
        /// <param name="value">Value of the <see cref="ReferenceListItem"/></param>
        /// <returns></returns>
        string? GetItemDisplayText(ReferenceListIdentifier refListId, Int64? value);

        /// <summary>
        /// Decompose <paramref name="value"/> into list of items. Is used for MultiValueReferenceLists
        /// </summary>
        /// <param name="refListId">Reference list identifier</param>
        /// <param name="value">Value</param>
        /// <returns></returns>
        List<ReferenceListItemDto> DecomposeMultiValueIntoItems(ReferenceListIdentifier refListId, Int64? value);

        /// <summary>
        /// Clear reference list cache
        /// </summary>
        Task ClearCacheAsync();

        /// <summary>
        /// Get actual ReferenceList revision Id
        /// </summary>
        Task<Guid?> GetListIdAsync(ReferenceListIdentifier refListId);

        /// <summary>
        /// Get actual ReferenceList revision Id
        /// </summary>
        Guid? GetListId(ReferenceListIdentifier refListId);
    }
}
