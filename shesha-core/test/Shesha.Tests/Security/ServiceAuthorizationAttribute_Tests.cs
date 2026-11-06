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
        [InlineData(typeof(NHibernateAppService), "Application-Configure")]
        [InlineData(typeof(ApiAppService), "Application-Configure")]
        [InlineData(typeof(AuthorizationSettingsAppService), "Application-Configure")]
        [InlineData(typeof(ConfigurationItemAppService), "Application-Configure")]
        [InlineData(typeof(ModelConfigurationsAppService), "Application-Configure")]
        public void Configurator_services_should_require_app_Configurator(Type serviceType, string expectedPermission)
        {
            var attr = GetClassSheshaAuthorize(serviceType);

            attr.Should().NotBeNull($"{serviceType.Name} should have [SheshaAuthorize] attribute");
            attr.Access.Should().Be(RefListPermissionedAccess.RequiresPermissions);
            attr.Permissions.Should().Contain(expectedPermission);
        }

        [Theory]
        [InlineData(typeof(ScheduledJobAppService), "Application-Maintenance")]
        [InlineData(typeof(EmailSenderAppService), "Application-Maintenance")]
        [InlineData(typeof(OtpAppService), "Application-Maintenance")]
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

        /// <summary>
        /// Verifies that NHibernateAppService is protected by a class-level guard.
        /// </summary>
        [Fact]
        public void NHibernateAppService_should_be_guarded()
        {
            var classAttr = GetClassSheshaAuthorize(typeof(NHibernateAppService));
            classAttr.Should().NotBeNull("NHibernateAppService must have class-level [SheshaAuthorize]");
            classAttr.Access.Should().Be(RefListPermissionedAccess.RequiresPermissions);
            classAttr.Permissions.Should().Contain("Application-Configure");
        }

        /// <summary>
        /// Verifies that NHibernateAppService does not expose an endpoint that executes
        /// arbitrary HQL. ExecuteHql was a debugging endpoint that allowed any caller with
        /// Application-Configure or Application-Maintenance to query any mapped entity;
        /// it was removed and must not be reintroduced.
        /// </summary>
        [Fact]
        public void NHibernateAppService_should_not_expose_ExecuteHql()
        {
            var hqlMethods = typeof(NHibernateAppService)
                .GetMethods(BindingFlags.Public | BindingFlags.Instance | BindingFlags.DeclaredOnly)
                .Where(m => m.Name.Contains("Hql", StringComparison.OrdinalIgnoreCase))
                .Select(m => m.Name)
                .ToList();

            hqlMethods.Should().BeEmpty("NHibernateAppService must not expose endpoints that execute arbitrary HQL");
        }

        /// <summary>
        /// Verifies that no public method on NHibernateAppService has [AllowAnonymous],
        /// ensuring the class-level guard cannot be bypassed on any endpoint.
        /// </summary>
        [Fact]
        public void NHibernateAppService_no_method_should_be_AllowAnonymous()
        {
            var publicMethods = typeof(NHibernateAppService)
                .GetMethods(BindingFlags.Public | BindingFlags.Instance | BindingFlags.DeclaredOnly);

            foreach (var method in publicMethods)
            {
                var anonAttr = method.GetCustomAttribute<AllowAnonymousAttribute>();
                anonAttr.Should().BeNull(
                    $"NHibernateAppService.{method.Name} must not have [AllowAnonymous] — " +
                    "all endpoints on this service execute database operations and must require Application-Configure");
            }
        }

        /// <summary>
        /// Verifies the complete OTP allow/deny matrix: anonymous callers can reach
        /// login-flow methods but NOT settings methods, because the class-level
        /// [SheshaAuthorize] guard applies to settings while [AllowAnonymous] overrides
        /// it for login-flow methods.
        /// </summary>
        [Fact]
        public void OtpAppService_allow_deny_matrix()
        {
            // Class-level guard exists
            var classAttr = GetClassSheshaAuthorize(typeof(OtpAppService));
            classAttr.Should().NotBeNull();
            classAttr.Access.Should().Be(RefListPermissionedAccess.RequiresPermissions);
            classAttr.Permissions.Should().Contain("Application-Maintenance");

            // Methods that MUST be reachable by anonymous callers (login flow)
            var allowedAnonymous = new[] { "SendPinAsync", "ResendPinAsync", "VerifyPinAsync" };
            foreach (var methodName in allowedAnonymous)
            {
                var method = typeof(OtpAppService).GetMethod(methodName, BindingFlags.Public | BindingFlags.Instance);
                method.Should().NotBeNull();
                method.GetCustomAttribute<AllowAnonymousAttribute>().Should().NotBeNull(
                    $"{methodName} must have [AllowAnonymous] to allow unauthenticated OTP login flow");
            }

            // Methods that MUST be denied to anonymous callers (settings)
            var deniedAnonymous = new[] { "UpdateSettingsAsync", "GetSettingsAsync" };
            foreach (var methodName in deniedAnonymous)
            {
                var method = typeof(OtpAppService).GetMethod(methodName, BindingFlags.Public | BindingFlags.Instance);
                method.Should().NotBeNull();
                method.GetCustomAttribute<AllowAnonymousAttribute>().Should().BeNull(
                    $"{methodName} must NOT have [AllowAnonymous] — it should inherit class-level pages:maintenance guard");
            }
        }
    }
}
