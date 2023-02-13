using Abp.Application.Services.Dto;
using System;

namespace Shesha.ReferenceLists.Dto
{
    /// <summary>
    /// Get by Id input
    /// </summary>
    public class GetReferenceListByIdInput: GetReferenceListInputBase, IEntityDto<Guid>
    {
        /// <summary>
        /// Reference listid
        /// </summary>
        public Guid Id { get; set; }
    }
}
