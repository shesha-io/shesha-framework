using Abp.Application.Services.Dto;
using Shesha.Domain.Enums;
using System;
using System.Collections.Generic;

namespace Shesha.Startup
{
    /// <summary>
    /// Application startup DTO
    /// </summary>
    public class ApplicationStartupDto : EntityDto<Guid>
    {
        public ApplicationStartupStatus Status { get; set; }
        public bool BootstrappersDisabled { get; set; }
        public bool MigrationsDisabled { get; set; }
        public List<ApplicationStartupAssemblyDto> Assemblies { get; set; } = new List<ApplicationStartupAssemblyDto>();
    }
}
