using FluentAssertions;
using Microsoft.AspNetCore.Authorization;
using Shesha.Api;
using Shesha.Authorization;
using Shesha.Authorization.Settings;
using Shesha.ConfigurationItems;
using Shesha.Domain.Enums;
using Shesha.DynamicEntities;
using Shesha.Email;
using Shesha.Otp;
using Shesha.Scheduler.Services.ScheduledJobs;
using Shesha.Services;
using System;
using System.Linq;
using System.Reflection;
using Xunit;

namespace Shesha.Tests.Security
{
    /// <summary>
    /// Tests to verify that application services have the correct authorization attributes.
    /// Covers issue #4652: Add class-level authorization to 8 unsecured application services.
    /// </summary>
    public class ServiceAuthorizationAttribute_Tests
    {
        private static SheshaAuthorizeAttribute GetClassSheshaAuthorize(Type type)
        {
            return type.GetCustomAttribute<SheshaAuthorizeAttribute>();
        }

        private static AllowAnonymousAttribute GetMethodAllowAnonymous(Type type, string methodName)
        {
            var method = type.GetMethod(methodName, BindingFlags.Public | BindingFlags.Instance);
            return method?.GetCustomAttribute<AllowAnonymousAttribute>();
        }

        [Theory]
        [InlineData(typeof(NHibernateAppService), "app:Configurator")]
        [InlineData(typeof(ApiAppService), "app:Configurator")]
        [InlineData(typeof(AuthorizationSettingsAppService), "app:Configurator")]
        [InlineData(typeof(ConfigurationItemAppService), "app:Configurator")]
        [InlineData(typeof(ModelConfigurationsAppService), "app:Configurator")]
        public void Configurator_services_should_require_app_Configurator(Type serviceType, string expectedPermission)
        {
            var attr = GetClassSheshaAuthorize(serviceType);

            attr.Should().NotBeNull($"{serviceType.Name} should have [SheshaAuthorize] attribute");
            attr.Access.Should().Be(RefListPermissionedAccess.RequiresPermissions);
            attr.Permissions.Should().Contain(expectedPermission);
        }

        [Theory]
        [InlineData(typeof(ScheduledJobAppService), "pages:maintenance")]
        [InlineData(typeof(EmailSenderAppService), "pages:maintenance")]
        [InlineData(typeof(OtpAppService), "pages:maintenance")]
        public void Maintenance_services_should_require_pages_maintenance(Type serviceType, string expectedPermission)
        {
            var attr = GetClassSheshaAuthorize(serviceType);

            attr.Should().NotBeNull($"{serviceType.Name} should have [SheshaAuthorize] attribute");
            attr.Access.Should().Be(RefListPermissionedAccess.RequiresPermissions);
            attr.Permissions.Should().Contain(expectedPermission);
        }

        [Theory]
        [InlineData("SendPinAsync")]
        [InlineData("ResendPinAsync")]
        [InlineData("VerifyPinAsync")]
        public void OtpAppService_auth_flow_methods_should_be_AllowAnonymous(string methodName)
        {
            var attr = GetMethodAllowAnonymous(typeof(OtpAppService), methodName);
            attr.Should().NotBeNull($"OtpAppService.{methodName} should have [AllowAnonymous] for login flows");
        }

        [Theory]
        [InlineData("UpdateSettingsAsync")]
        [InlineData("GetSettingsAsync")]
        public void OtpAppService_settings_methods_should_not_be_AllowAnonymous(string methodName)
        {
            var attr = GetMethodAllowAnonymous(typeof(OtpAppService), methodName);
            attr.Should().BeNull($"OtpAppService.{methodName} should inherit class-level auth (pages:maintenance)");
        }
    }
}
