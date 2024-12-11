using Abp.Application.Services.Dto;
using Abp.Authorization;
using Abp.Domain.Repositories;
using Abp.Runtime.Validation;
using Shesha.Authorization;
using Shesha.Domain;
using Shesha.DynamicEntities.Dtos;
using Shesha.GraphQL.Mvc;
using Shesha.Otp.Dto;
using System;
using System.Threading.Tasks;

namespace Shesha.Otp;

/// <summary>
/// One-time-pin audit service
/// </summary>
[SheshaAuthorize(Domain.Enums.RefListPermissionedAccess.AnyAuthenticated)]
public class OtpAuditItemAppService: DynamicCrudAppService<OtpAuditItem, DynamicDto<OtpAuditItem, Guid>, Guid>
{
    public OtpAuditItemAppService(IRepository<OtpAuditItem, Guid> repository) : base(repository)
    {
    }

    [Obsolete]
    public override Task<DynamicDto<OtpAuditItem, Guid>> CreateAsync(DynamicDto<OtpAuditItem, Guid> input)
    {
        throw new AbpValidationException($"Manual creation of {nameof(OtpAuditItem)} is not allowed");
    }

    [Obsolete]
    public override Task<GraphQLDataResult<OtpAuditItem>> CreateGqlAsync(string properties, DynamicDto<OtpAuditItem, Guid> input)
    {
        throw new AbpValidationException($"Manual creation of {nameof(OtpAuditItem)} is not allowed");
    }

    [Obsolete]
    public override Task<DynamicDto<OtpAuditItem, Guid>> UpdateAsync(DynamicDto<OtpAuditItem, Guid> input)
    {
        throw new AbpValidationException($"Manual update of {nameof(OtpAuditItem)} is not allowed");
    }

    [Obsolete]
    public override Task<GraphQLDataResult<OtpAuditItem>> UpdateGqlAsync(string properties, DynamicDto<OtpAuditItem, Guid> input)
    {
        throw new AbpValidationException($"Manual update of {nameof(OtpAuditItem)} is not allowed");
    }


    [Obsolete]
    public override Task DeleteAsync(EntityDto<Guid> input)
    {
        throw new AbpValidationException($"Manual deletion of {nameof(OtpAuditItem)} is not allowed");
    }
}