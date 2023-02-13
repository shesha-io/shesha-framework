using Abp.Application.Services.Dto;
using System;

namespace Shesha.Services.ReferenceLists.Dto
{
    /// <summary>
    /// DTO that is used for Reference List updating
    /// </summary>
    public class UpdateReferenceListDto : EntityDto<Guid>
    {
        /// <summary>
        /// Label
        /// </summary>
        public Guid? ModuleId { get; set; }

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
    }
}
