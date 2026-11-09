using Shesha.Domain.Enums;

namespace Shesha.UserRegistrations
{
    /// <summary>
    /// What self-registration should do with the Person record
    /// </summary>
    public enum SelfRegistrationAction
    {
        /// <summary>Create a new Person and user account</summary>
        CreateNew,
        /// <summary>Create a user account and link it to the existing (pre-registered) Person</summary>
        LinkToExisting,
        /// <summary>Refuse the registration</summary>
        Reject,
    }

    /// <summary>
    /// Result of <see cref="SelfRegistrationPlanner.Plan"/>
    /// </summary>
    public class SelfRegistrationPlan
    {
        private SelfRegistrationPlan(SelfRegistrationAction action, string rejectionReason)
        {
            Action = action;
            RejectionReason = rejectionReason;
        }

        /// <summary>
        /// What to do with the registration
        /// </summary>
        public SelfRegistrationAction Action { get; }

        /// <summary>
        /// User-facing reason when <see cref="Action"/> is <see cref="SelfRegistrationAction.Reject"/>
        /// </summary>
        public string RejectionReason { get; }

        /// <summary>
        /// Create a new Person for the registrant
        /// </summary>
        public static SelfRegistrationPlan CreateNew() => new(SelfRegistrationAction.CreateNew, null);
        /// <summary>
        /// Link the new user to the matching pre-registered Person
        /// </summary>
        public static SelfRegistrationPlan LinkToExisting() => new(SelfRegistrationAction.LinkToExisting, null);
        /// <summary>
        /// Refuse the registration with the specified user-facing reason
        /// </summary>
        public static SelfRegistrationPlan Reject(string reason) => new(SelfRegistrationAction.Reject, reason);
    }

    /// <summary>
    /// Decides how to handle a registration based on the creation mode and any Person matching the registrant's email/mobile.
    /// Never links to a Person that already has a user account: that would let an anonymous caller take over the account.
    /// </summary>
    public static class SelfRegistrationPlanner
    {
        public const string AccountAlreadyExistsMessage = "An account already exists for these details. Please log in or reset your password.";
        public const string NotPreRegisteredMessage = "We could not find your details. Self-registration is only available to people who have been pre-registered.";

        /// <param name="mode">Configured creation mode (null means <see cref="RefListSelfRegistrationCreationMode.AlwaysCreateNew"/>)</param>
        /// <param name="matchingPersonExists">A Person with the registrant's email address or mobile number exists</param>
        /// <param name="matchingPersonHasUser">That Person is already linked to a user account</param>
        public static SelfRegistrationPlan Plan(RefListSelfRegistrationCreationMode? mode, bool matchingPersonExists, bool matchingPersonHasUser)
        {
            if (matchingPersonExists && matchingPersonHasUser)
                return SelfRegistrationPlan.Reject(AccountAlreadyExistsMessage);

            switch (mode ?? RefListSelfRegistrationCreationMode.AlwaysCreateNew)
            {
                case RefListSelfRegistrationCreationMode.AlwaysCreateNew:
                    return matchingPersonExists
                        ? SelfRegistrationPlan.Reject(AccountAlreadyExistsMessage)
                        : SelfRegistrationPlan.CreateNew();

                case RefListSelfRegistrationCreationMode.MustAlreadyExist:
                    return matchingPersonExists
                        ? SelfRegistrationPlan.LinkToExisting()
                        : SelfRegistrationPlan.Reject(NotPreRegisteredMessage);

                case RefListSelfRegistrationCreationMode.LinkIfExistsOtherwiseCreate:
                    return matchingPersonExists
                        ? SelfRegistrationPlan.LinkToExisting()
                        : SelfRegistrationPlan.CreateNew();

                default:
                    return SelfRegistrationPlan.Reject("Self-registration is not configured correctly. Please contact the system administrator.");
            }
        }
    }
}
