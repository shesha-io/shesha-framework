using Abp.Authorization.Roles;
using Abp.Authorization.Users;
using Abp.Domain.Entities;
using Shesha.DynamicEntities.TypeFinder;
using Shesha.Extensions;
using Shesha.Services;
using System;
using System.Collections.Generic;
using System.Linq;

namespace Shesha.Tests.DomainModel
{
    internal static class EntityTestsHelper
    {
        internal static List<Type> GetEntityTypesWithoutIgnored()
        {
            var typeFinder = StaticContext.IocManager.Resolve<IShaTypeFinder>();

            var types = typeFinder.FindAll().Where(t => t.IsEntityType()
    && t != typeof(AggregateRoot)
    && t != typeof(UserPermissionSetting)
    && t != typeof(RolePermissionSetting)
    && t.Assembly != typeof(SheshaTestModule).Assembly
    ).ToList();
            return types;
        }

    }
}
