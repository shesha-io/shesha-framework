using System;
using System.Collections.Generic;
using Abp.Application.Services.Dto;
using Shesha.Domain.Enums;

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

        public RefListPermissionedAccess? Access { get; set; }

        public List<string> Permissions { get; set; }
    }
}
