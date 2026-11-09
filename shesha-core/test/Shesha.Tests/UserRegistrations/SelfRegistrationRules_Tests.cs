using Shesha.Domain.Enums;
using Shesha.UserManagements.Configurations;
using Shesha.UserRegistrations;
using Shouldly;
using Xunit;

namespace Shesha.Tests.UserRegistrations
{
    /// <summary>
    /// Pure rules: whether registration is enabled, and whether to create, link or reject
    /// </summary>
    public class SelfRegistrationRules_Tests
    {
        [Theory]
        // explicit switch wins (unless the method is None)
        [InlineData(true, SupportedRegistrationMethods.EmailAddress, true)]
        [InlineData(false, SupportedRegistrationMethods.EmailAddress, false)]
        [InlineData(true, SupportedRegistrationMethods.None, false)]
        // values saved before the switch existed (null): enabled only when saved with a method
        [InlineData(null, SupportedRegistrationMethods.MobileNumber, true)]
        [InlineData(null, SupportedRegistrationMethods.None, false)]
        public void IsSelfRegistrationEnabled(bool? allow, SupportedRegistrationMethods method, bool expected)
        {
            var settings = new UserManagementSettings { AllowSelfRegistration = allow, SupportedRegistrationMethods = method };

            SelfRegistrationManager.IsSelfRegistrationEnabled(settings).ShouldBe(expected);
        }

        [Fact]
        public void Missing_settings_do_not_enable_self_registration()
        {
            SelfRegistrationManager.IsSelfRegistrationEnabled(null).ShouldBeFalse();
        }

        [Theory]
        [InlineData(null, false, false, SelfRegistrationAction.CreateNew)]
        [InlineData(null, true, false, SelfRegistrationAction.Reject)]
        [InlineData(RefListSelfRegistrationCreationMode.AlwaysCreateNew, false, false, SelfRegistrationAction.CreateNew)]
        [InlineData(RefListSelfRegistrationCreationMode.AlwaysCreateNew, true, false, SelfRegistrationAction.Reject)]
        [InlineData(RefListSelfRegistrationCreationMode.MustAlreadyExist, false, false, SelfRegistrationAction.Reject)]
        [InlineData(RefListSelfRegistrationCreationMode.MustAlreadyExist, true, false, SelfRegistrationAction.LinkToExisting)]
        [InlineData(RefListSelfRegistrationCreationMode.LinkIfExistsOtherwiseCreate, false, false, SelfRegistrationAction.CreateNew)]
        [InlineData(RefListSelfRegistrationCreationMode.LinkIfExistsOtherwiseCreate, true, false, SelfRegistrationAction.LinkToExisting)]
        public void Plan_by_creation_mode(RefListSelfRegistrationCreationMode? mode, bool personExists, bool personHasUser, SelfRegistrationAction expected)
        {
            SelfRegistrationPlanner.Plan(mode, personExists, personHasUser).Action.ShouldBe(expected);
        }

        [Theory]
        [InlineData(null)]
        [InlineData(RefListSelfRegistrationCreationMode.AlwaysCreateNew)]
        [InlineData(RefListSelfRegistrationCreationMode.MustAlreadyExist)]
        [InlineData(RefListSelfRegistrationCreationMode.LinkIfExistsOtherwiseCreate)]
        public void Never_links_to_a_person_that_already_has_an_account(RefListSelfRegistrationCreationMode? mode)
        {
            var plan = SelfRegistrationPlanner.Plan(mode, matchingPersonExists: true, matchingPersonHasUser: true);

            plan.Action.ShouldBe(SelfRegistrationAction.Reject);
            plan.RejectionReason.ShouldBe(SelfRegistrationPlanner.AccountAlreadyExistsMessage);
        }

        [Fact]
        public void Unknown_mode_is_rejected()
        {
            SelfRegistrationPlanner.Plan((RefListSelfRegistrationCreationMode)99, false, false).Action.ShouldBe(SelfRegistrationAction.Reject);
        }
    }
}
