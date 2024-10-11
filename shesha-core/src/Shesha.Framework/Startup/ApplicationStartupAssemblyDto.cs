using Abp.Application.Services.Dto;
using System;

namespace Shesha.Startup
{
    /// <summary>
    /// Application startup assembly DTO
    /// </summary>
    public class ApplicationStartupAssemblyDto: AssemblyBaseDto, IEntityDto<Guid>
    {
        public Guid Id { get; set; }
    }
}
