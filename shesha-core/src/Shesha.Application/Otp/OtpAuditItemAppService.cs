using Abp.Authorization;
using Abp.Domain.Repositories;
using Shesha.Domain;
using Shesha.Otp.Dto;
using System;

namespace Shesha.Otp;

/// <summary>
/// One-time-pin audit service
/// </summary>
[AbpAuthorize()]
public class OtpAuditItemAppService: SheshaCrudServiceBase<OtpAuditItem, OtpAuditItemDto, Guid>
{
    public OtpAuditItemAppService(IRepository<OtpAuditItem, Guid> repository) : base(repository)
    {
    }
}