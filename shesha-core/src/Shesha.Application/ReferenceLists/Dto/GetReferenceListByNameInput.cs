using Abp.Application.Services.Dto;
using System;

namespace Shesha.ReferenceLists.Dto
{
    /// <summary>
    /// Get by name input
    /// </summary>
    public class GetReferenceListByNameInput : GetReferenceListInputBase
    {
        /// <summary>
        /// Module name
        /// </summary>
        public string Module { get; set; }

        /// <summary>
        /// Reference list name
        /// </summary>
        public string Name { get; set; }
    }
}
