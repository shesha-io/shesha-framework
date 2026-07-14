using FluentAssertions;
using Microsoft.AspNetCore.Authorization;
using Shesha.Authorization;
using Shesha.Domain.Enums;
using Shesha.Permissions;
using Shesha.Web.FormsDesigner.Services;
using System.Reflection;
using Xunit;

namespace Shesha.Tests.Security
{
    /// <summary>
    /// Tests to verify authorization attributes on PermissionAppService and FormConfigurationAppService.
    /// Covers issue #4655.
    /// </summary>
    public class PermissionAndFormServiceAuth_Tests
    {
        #region PermissionAppService

        [Fact]
        public void PermissionAppService_class_should_have_AnyAuthenticated()
        {
            var attr = typeof(PermissionAppService).GetCustomAttribute<SheshaAuthorizeAttribute>();
            attr.Should().NotBeNull();
            attr.Access.Should().Be(RefListPermissionedAccess.AnyAuthenticated);
        }

        [Theory]
        [InlineData("CreateAsync")]
        [InlineData("UpdateAsync")]
        [InlineData("UpdateParentAsync")]
        [InlineData("DeleteAsync")]
        public void PermissionAppService_write_methods_should_require_Configurator(string methodName)
        {
            var method = typeof(PermissionAppService).GetMethod(methodName, BindingFlags.Public | BindingFlags.Instance);
            method.Should().NotBeNull($"{methodName} should exist");

            var attr = method.GetCustomAttribute<SheshaAuthorizeAttribute>();
            attr.Should().NotBeNull($"{methodName} should have [SheshaAuthorize]");
            attr.Access.Should().Be(RefListPermissionedAccess.RequiresPermissions);
            attr.Permissions.Should().Contain("app:Configurator");
        }

        [Theory]
        [InlineData("GetAsync")]
        [InlineData("GetAllAsync")]
        [InlineData("GetAllTreeAsync")]
        [InlineData("AutocompleteAsync")]
        public void PermissionAppService_read_methods_should_not_have_method_level_auth(string methodName)
        {
            var method = typeof(PermissionAppService).GetMethod(methodName, BindingFlags.Public | BindingFlags.Instance);
            method.Should().NotBeNull($"{methodName} should exist");

            var attr = method.GetCustomAttribute<SheshaAuthorizeAttribute>();
            // Read methods should rely on class-level AnyAuthenticated, not have method-level restrictions
            // (except IsPermissionGrantedAsync which explicitly has AnyAuthenticated)
            if (attr != null)
            {
                attr.Access.Should().NotBe(RefListPermissionedAccess.RequiresPermissions,
                    $"{methodName} is a read method and should not require specific permissions");
            }
        }

        #endregion

        #region FormConfigurationAppService

        [Fact]
        public void FormConfigurationAppService_class_should_require_Configurator()
        {
            var attr = typeof(FormConfigurationAppService).GetCustomAttribute<SheshaAuthorizeAttribute>();
            attr.Should().NotBeNull("FormConfigurationAppService should have class-level [SheshaAuthorize]");
            attr.Access.Should().Be(RefListPermissionedAccess.RequiresPermissions);
            attr.Permissions.Should().Contain("app:Configurator");
        }

        [Theory]
        [InlineData("GetByNameAsync")]
        [InlineData("CheckPermissionsAsync")]
        [InlineData("GetAnonymousFormsAsync")]
        public void FormConfigurationAppService_public_methods_should_be_AllowAnonymous(string methodName)
        {
            var method = typeof(FormConfigurationAppService).GetMethod(methodName, BindingFlags.Public | BindingFlags.Instance);
            method.Should().NotBeNull($"{methodName} should exist");

            var attr = method.GetCustomAttribute<AllowAnonymousAttribute>();
            attr.Should().NotBeNull($"{methodName} should have [AllowAnonymous] to override class-level auth");
        }

        [Theory]
        [InlineData("UpdateMarkupAsync")]
        [InlineData("UpdateStatusAsync")]
        [InlineData("ImportJsonAsync")]
        public void FormConfigurationAppService_write_methods_should_not_be_AllowAnonymous(string methodName)
        {
            var method = typeof(FormConfigurationAppService).GetMethod(methodName, BindingFlags.Public | BindingFlags.Instance);
            method.Should().NotBeNull($"{methodName} should exist");

            var attr = method.GetCustomAttribute<AllowAnonymousAttribute>();
            attr.Should().BeNull($"{methodName} should inherit class-level auth (app:Configurator)");
        }

        #endregion
    }
}
