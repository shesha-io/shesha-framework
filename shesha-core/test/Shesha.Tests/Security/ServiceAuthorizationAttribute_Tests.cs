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

        /// <summary>
        /// Verifies that NHibernateAppService.ExecuteHql — the highest-risk endpoint
        /// (arbitrary HQL execution) — is protected by the class-level guard and has
        /// no method-level [AllowAnonymous] override that could bypass it.
        /// </summary>
        [Fact]
        public void NHibernateAppService_ExecuteHql_should_be_guarded()
        {
            // Class-level guard must be present
            var classAttr = GetClassSheshaAuthorize(typeof(NHibernateAppService));
            classAttr.Should().NotBeNull("NHibernateAppService must have class-level [SheshaAuthorize]");
            classAttr.Access.Should().Be(RefListPermissionedAccess.RequiresPermissions);
            classAttr.Permissions.Should().Contain("app:Configurator");

            // ExecuteHql must NOT have [AllowAnonymous] that would bypass the class guard
            var method = typeof(NHibernateAppService).GetMethod("ExecuteHql", BindingFlags.Public | BindingFlags.Instance);
            method.Should().NotBeNull("ExecuteHql method should exist");

            var anonAttr = method.GetCustomAttribute<AllowAnonymousAttribute>();
            anonAttr.Should().BeNull("ExecuteHql must NOT have [AllowAnonymous] — it executes arbitrary HQL");

            // ExecuteHql should also not have its own [SheshaAuthorize] that weakens the class-level guard
            var methodAuthAttr = method.GetCustomAttribute<SheshaAuthorizeAttribute>();
            if (methodAuthAttr != null)
            {
                methodAuthAttr.Access.Should().Be(RefListPermissionedAccess.RequiresPermissions,
                    "If ExecuteHql has method-level auth, it should not weaken the class-level guard");
            }
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
                    "all endpoints on this service execute database operations and must require app:Configurator");
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
            classAttr.Permissions.Should().Contain("pages:maintenance");

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
