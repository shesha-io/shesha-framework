using System;
using Abp.Application.Services.Dto;
using Abp.AutoMapper;
using Shesha.Domain;

namespace Shesha.ShaUserLoginAttempts.Dto
{
    [AutoMapFrom(typeof(ShaUserLoginAttempt))]
    public class ShaUserLoginAttemptDto: EntityDto<Guid>
    {
    }
}
