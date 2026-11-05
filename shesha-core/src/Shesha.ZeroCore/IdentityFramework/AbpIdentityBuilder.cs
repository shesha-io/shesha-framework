using Microsoft.AspNetCore.Identity;
using System;

namespace Microsoft.Extensions.DependencyInjection;

public class AbpIdentityBuilder : IdentityBuilder
{
    public Type TenantType { get; }

    public AbpIdentityBuilder(IdentityBuilder identityBuilder, Type tenantType)
        : base(identityBuilder.UserType, identityBuilder.RoleType ?? throw new ArgumentException("RoleType must not be null"), identityBuilder.Services)
    {
        TenantType = tenantType;
    }
}