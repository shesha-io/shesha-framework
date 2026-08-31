using FluentAssertions;
using Shesha.Authorization;
using Shesha.Domain.Enums;
using Shesha.Permissions;
using System;
using System.Reflection;
using Xunit;
using Xunit.Sdk;

namespace Shesha.Tests.Security
{
    /// <summary>
    /// Tests to verify that the permission management services are restricted to administrators.
    /// Covers issue #4619: PermissionedObjectAppService and PermissionAppService were accessible
    /// to any authenticated user, which allowed low-privilege users to read (and change) the
    /// security configuration of the application.
    /// </summary>
    public class PermissionServicesAuth_Tests
    {
        private static SheshaAuthorizeAttribute GetRequiredClassAuthorize(Type type)
        {
            return type.GetCustomAttribute<SheshaAuthorizeAttribute>()
                ?? throw new XunitException($"{type.Name} should have a class level [SheshaAuthorize] attribute");
        }

        private static MethodInfo GetPublicMethod(Type type, string methodName)
        {
            return type.GetMethod(methodName, BindingFlags.Public | BindingFlags.Instance)
                ?? throw new XunitException($"{type.Name}.{methodName} should exist");
        }

        private static SheshaAuthorizeAttribute GetRequiredMethodAuthorize(Type type, string methodName)
        {
            return GetPublicMethod(type, methodName).GetCustomAttribute<SheshaAuthorizeAttribute>()
                ?? throw new XunitException($"{type.Name}.{methodName} should have [SheshaAuthorize]");
        }

        [Fact]
        public void PermissionedObjectAppService_should_require_pages_maintenance()
        {
            var attr = GetRequiredClassAuthorize(typeof(PermissionedObjectAppService));

            attr.Access.Should().Be(RefListPermissionedAccess.RequiresPermissions);
            attr.Permissions.Should().Contain(ShaPermissionNames.Pages_Maintenance);
        }

        [Fact]
        public void PermissionAppService_should_require_app_Configurator()
        {
            var attr = GetRequiredClassAuthorize(typeof(PermissionAppService));

            attr.Access.Should().Be(RefListPermissionedAccess.RequiresPermissions);
            attr.Permissions.Should().Contain(ShaPermissionNames.Application_Configurator);
        }

        [Theory]
        [InlineData("GetAllAsync")]
        [InlineData("GetAllTreeAsync")]
        [InlineData("GetAsync")]
        [InlineData("AutocompleteAsync")]
        public void PermissionAppService_read_methods_should_not_be_open_to_any_authenticated_user(string methodName)
        {
            // no method level attribute is fine, the class level restriction then applies
            var attr = GetPublicMethod(typeof(PermissionAppService), methodName)
                .GetCustomAttribute<SheshaAuthorizeAttribute>();

            if (attr != null)
                attr.Access.Should().NotBe(RefListPermissionedAccess.AnyAuthenticated,
                    $"{methodName} must not override the class level restriction with AnyAuthenticated");
        }

        [Fact]
        public void IsPermissionGranted_should_stay_available_to_authenticated_users()
        {
            // Every logged in user needs to be able to check its own permissions,
            // so this single method intentionally overrides the class level restriction.
            var attr = GetRequiredMethodAuthorize(typeof(PermissionAppService), "IsPermissionGrantedAsync");

            attr.Access.Should().Be(RefListPermissionedAccess.AnyAuthenticated);
        }
    }
}
