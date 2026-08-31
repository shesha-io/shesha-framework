using Abp.Authorization;
using Abp.Configuration.Startup;
using Abp.Domain.Uow;
using Abp.Localization;
using FluentAssertions;
using NSubstitute;
using Shesha.Authorization;
using Shesha.Configuration.Security;
using Shesha.Domain.Enums;
using Shesha.DynamicEntities;
using Shesha.Permissions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Xunit;

namespace Shesha.Tests.Security
{
    /// <summary>
    /// Covers issue #4622: entity CRUD endpoints ignored the `DefaultEndpointAccess` security setting.
    /// `Inherited` access has to fall back to that setting, otherwise it silently allows every
    /// authenticated user (ABP grants access when the list of required permissions is empty).
    /// </summary>
    public class DefaultEndpointAccess_Tests
    {
        private const string EntityName = "Shesha.Domain.Person";
        private const string ObjectType = ShaPermissionedObjectsTypes.EntityAction;

        private static ObjectPermissionChecker CreateChecker(IShaPermissionChecker permissionChecker)
        {
            var authConfiguration = Substitute.For<IAuthorizationConfiguration>();
            authConfiguration.IsEnabled.Returns(true);

            var permissionedObjectManager = Substitute.For<IPermissionedObjectManager>();
            permissionedObjectManager.GetOrDefaultAsync($"{EntityName}@Get", ObjectType)
                .Returns(Task.FromResult(new PermissionedObjectDto
                {
                    Object = $"{EntityName}@Get",
                    Type = ObjectType,
                    Access = RefListPermissionedAccess.Inherited,
                    ActualAccess = RefListPermissionedAccess.Inherited,
                    ActualPermissions = new List<string>(),
                }));

            return new ObjectPermissionChecker(
                authConfiguration,
                permissionedObjectManager,
                permissionChecker,
                Substitute.For<ILocalizationManager>(),
                Substitute.For<IUnitOfWorkManager>()
            );
        }

        [Fact]
        public async Task Inherited_access_should_be_denied_when_default_is_RequiresPermissions_without_permissions()
        {
            var checker = CreateChecker(Substitute.For<IShaPermissionChecker>());

            var act = () => checker.AuthorizeAsync(false, EntityName, "Get", ObjectType, true,
                RefListPermissionedAccess.RequiresPermissions, null);

            await act.Should().ThrowAsync<AbpAuthorizationException>(
                "an `Inherited` endpoint must follow the DefaultEndpointAccess setting");
        }

        [Fact]
        public async Task Inherited_access_should_be_denied_when_user_misses_the_default_permission()
        {
            var permissionChecker = Substitute.For<IShaPermissionChecker>();
            permissionChecker.IsGrantedAsync("some:permission").Returns(Task.FromResult(false));

            var checker = CreateChecker(permissionChecker);

            var act = () => checker.AuthorizeAsync(false, EntityName, "Get", ObjectType, true,
                RefListPermissionedAccess.RequiresPermissions, new List<string> { "some:permission" });

            await act.Should().ThrowAsync<AbpAuthorizationException>();
        }

        [Fact]
        public async Task Inherited_access_should_be_allowed_when_user_has_the_default_permission()
        {
            var permissionChecker = Substitute.For<IShaPermissionChecker>();
            permissionChecker.IsGrantedAsync("some:permission").Returns(Task.FromResult(true));

            var checker = CreateChecker(permissionChecker);

            await checker.AuthorizeAsync(false, EntityName, "Get", ObjectType, true,
                RefListPermissionedAccess.RequiresPermissions, new List<string> { "some:permission" });
        }

        [Fact]
        public async Task Inherited_access_should_be_allowed_when_default_is_AnyAuthenticated()
        {
            var checker = CreateChecker(Substitute.For<IShaPermissionChecker>());

            await checker.AuthorizeAsync(false, EntityName, "Get", ObjectType, true,
                RefListPermissionedAccess.AnyAuthenticated, null);
        }

        [Fact]
        public async Task Inherited_access_should_be_denied_for_anonymous_users()
        {
            var checker = CreateChecker(Substitute.For<IShaPermissionChecker>());

            var act = () => checker.AuthorizeAsync(false, EntityName, "Get", ObjectType, false,
                RefListPermissionedAccess.AnyAuthenticated, null);

            await act.Should().ThrowAsync<AbpAuthorizationException>();
        }

        [Fact]
        public async Task Inherited_access_without_a_default_lets_everybody_in()
        {
            // characterization of the bug: when the caller does not pass the setting, `Inherited`
            // reaches the permission checker with an empty permission list, which ABP treats as granted.
            var checker = CreateChecker(Substitute.For<IShaPermissionChecker>());

            await checker.AuthorizeAsync(false, EntityName, "Get", ObjectType, true);
        }

        [Theory]
        [InlineData(typeof(EntityCrudAuthorizationHelper))]
        [InlineData(typeof(ApiAuthorizationHelper))]
        [InlineData(typeof(EntitiesAppService))]
        public void Permission_check_callers_should_depend_on_the_security_settings(Type type)
        {
            var dependsOnSecuritySettings = type.GetConstructors()
                .Any(c => c.GetParameters().Any(p => p.ParameterType == typeof(ISecuritySettings)));

            dependsOnSecuritySettings.Should().BeTrue(
                $"{type.Name} has to read DefaultEndpointAccess and pass it to the permission checker");
        }
    }
}
