using FluentAssertions;
using Microsoft.AspNetCore.Authorization;
using Shesha.Authorization;
using Shesha.Domain.Enums;
using Shesha.UserManagements;
using Shesha.UserRegistrations;
using Shesha.UserRegistrations.Dto;
using System;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Reflection;
using Xunit;

namespace Shesha.Tests.Security
{
    /// <summary>
    /// Anonymous self-registration must be reachable without a login, while admin user management stays locked to User-Manage
    /// </summary>
    public class UserRegistrationAppServiceAuth_Tests
    {
        private static MethodInfo Method(Type type, string name) =>
            type.GetMethod(name, BindingFlags.Public | BindingFlags.Instance | BindingFlags.DeclaredOnly);

        [Theory]
        [InlineData(nameof(UserRegistrationAppService.RegisterAsync))]
        [InlineData(nameof(UserRegistrationAppService.GetSettingsAsync))]
        [InlineData(nameof(UserRegistrationAppService.CompleteRegistrationAsync))]
        public void Registration_endpoints_should_be_AllowAnonymous(string methodName)
        {
            Method(typeof(UserRegistrationAppService), methodName).GetCustomAttribute<AllowAnonymousAttribute>()
                .Should().NotBeNull($"{methodName} is called before the user can log in");
        }

        [Fact]
        public void CompleteRegistration_should_be_authorised_by_a_completion_token()
        {
            var method = Method(typeof(UserRegistrationAppService), nameof(UserRegistrationAppService.CompleteRegistrationAsync));

            method.GetParameters().Select(p => p.ParameterType).Should().Equal(typeof(CompleteRegistrationInput));
            typeof(CompleteRegistrationInput).GetProperty(nameof(CompleteRegistrationInput.Token))
                .GetCustomAttribute<RequiredAttribute>().Should().NotBeNull("the token is what authorises an anonymous caller");
        }

        [Fact]
        public void Only_the_expected_registration_endpoints_are_anonymous()
        {
            typeof(UserRegistrationAppService).GetCustomAttribute<AllowAnonymousAttribute>().Should().BeNull();

            var anonymous = typeof(UserRegistrationAppService)
                .GetMethods(BindingFlags.Public | BindingFlags.Instance | BindingFlags.DeclaredOnly)
                .Where(m => m.GetCustomAttribute<AllowAnonymousAttribute>() != null)
                .Select(m => m.Name)
                .OrderBy(n => n);

            anonymous.Should().BeEquivalentTo(
                nameof(UserRegistrationAppService.CompleteRegistrationAsync),
                nameof(UserRegistrationAppService.GetSettingsAsync),
                nameof(UserRegistrationAppService.RegisterAsync));
        }

        [Fact]
        public void UserManagementAppService_should_stay_locked_to_User_Manage()
        {
            var attr = typeof(UserManagementAppService).GetCustomAttribute<SheshaAuthorizeAttribute>();
            attr.Should().NotBeNull();
            attr.Access.Should().Be(RefListPermissionedAccess.RequiresPermissions);
            attr.Permissions.Should().Contain(PermissionNames.User_Manage);

            typeof(UserManagementAppService)
                .GetMethods(BindingFlags.Public | BindingFlags.Instance | BindingFlags.DeclaredOnly)
                .Where(m => m.GetCustomAttribute<AllowAnonymousAttribute>() != null)
                .Should().BeEmpty();
        }
    }
}
