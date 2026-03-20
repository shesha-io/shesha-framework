using FluentAssertions;
using Microsoft.AspNetCore.Authorization;
using Shesha.Authorization;
using Shesha.Domain.Enums;
using Shesha.Settings;
using System.Reflection;
using Xunit;

namespace Shesha.Tests.Security
{
    /// <summary>
    /// Tests to verify that SettingsAppService has the correct authorization attributes.
    /// Covers issue #4653: Restrict SettingsAppService GetConfigurations and UpdateValue to admin.
    /// </summary>
    public class SettingsAppServiceAuth_Tests
    {
        private static SheshaAuthorizeAttribute GetMethodSheshaAuthorize(string methodName)
        {
            var method = typeof(SettingsAppService).GetMethod(methodName, BindingFlags.Public | BindingFlags.Instance);
            return method?.GetCustomAttribute<SheshaAuthorizeAttribute>();
        }

        private static AllowAnonymousAttribute GetMethodAllowAnonymous(string methodName)
        {
            var method = typeof(SettingsAppService).GetMethod(methodName, BindingFlags.Public | BindingFlags.Instance);
            return method?.GetCustomAttribute<AllowAnonymousAttribute>();
        }

        [Fact]
        public void GetConfigurationsAsync_should_require_pages_maintenance()
        {
            var attr = GetMethodSheshaAuthorize("GetConfigurationsAsync");

            attr.Should().NotBeNull("GetConfigurationsAsync should have [SheshaAuthorize]");
            attr.Access.Should().Be(RefListPermissionedAccess.RequiresPermissions);
            attr.Permissions.Should().Contain("pages:maintenance");
        }

        [Fact]
        public void GetConfigurationsAsync_should_not_have_AllowAnonymous()
        {
            var attr = GetMethodAllowAnonymous("GetConfigurationsAsync");
            attr.Should().BeNull("GetConfigurationsAsync should no longer be [AllowAnonymous]");
        }

        [Fact]
        public void UpdateValueAsync_should_require_pages_maintenance()
        {
            var attr = GetMethodSheshaAuthorize("UpdateValueAsync");

            attr.Should().NotBeNull("UpdateValueAsync should have [SheshaAuthorize]");
            attr.Access.Should().Be(RefListPermissionedAccess.RequiresPermissions);
            attr.Permissions.Should().Contain("pages:maintenance");
        }

        [Fact]
        public void GetValueAsync_should_remain_AllowAnonymous()
        {
            var attr = GetMethodAllowAnonymous("GetValueAsync");
            attr.Should().NotBeNull("GetValueAsync must remain [AllowAnonymous] for frontend settings");
        }
    }
}
