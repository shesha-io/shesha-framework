using System;
using Abp.Application.Services.Dto;

namespace Shesha.Web.FormsDesigner.Dtos
{
    /// <summary>
    /// Form update markup input
    /// </summary>
    public class FormUpdateMarkupInput : EntityDto<Guid>
    {
        /// <summary>
        /// Form markup (components) in JSON format
        /// </summary>
        public string Markup { get; set; }
    }
}
