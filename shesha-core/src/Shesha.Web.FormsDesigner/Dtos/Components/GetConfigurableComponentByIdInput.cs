using Abp.Application.Services.Dto;
using System;

namespace Shesha.Web.FormsDesigner.Dtos
{
    public class GetConfigurableComponentByIdInput : GetConfigurationItemInputBase, IEntityDto<Guid>
    {
        /// <summary>
        /// Form configuration id
        /// </summary>
        public Guid Id { get; set; }
    }
}
