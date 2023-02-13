using System;
using Abp.Application.Services.Dto;

namespace Shesha.Web.FormsDesigner.Dtos
{
    /// <summary>
    /// Forms short info, is used for lists (e.g. autocomplete)
    /// </summary>
    public class FormListItemDto: EntityDto<Guid>
    {
        /// <summary>
        /// Form path/id is used to identify a form
        /// </summary>
        public string Path { get; set; }

        /// <summary>
        /// Form name
        /// </summary>
        public string Name { get; set; }
    }
}
