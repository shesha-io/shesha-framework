using Abp.Events.Bus;
using Shesha.Authorization.Users;
using Shesha.Domain;
using Shesha.UserManagements.Configurations;

namespace Shesha.UserRegistrations
{
    /// <summary>
    /// Raised inside the registration unit of work after a user has self-registered.
    /// Implement <c>IAsyncEventHandler&lt;UserSelfRegisteredEventData&gt;</c> to run project-specific logic
    /// (e.g. create related records or assign extra roles). Throwing from a handler rolls the registration back.
    /// </summary>
    public class UserSelfRegisteredEventData : EventData
    {
        public UserSelfRegisteredEventData(User user, Person person, bool linkedToExistingPerson, string frontEndApplication, UserManagementSettings settings)
        {
            User = user;
            Person = person;
            LinkedToExistingPerson = linkedToExistingPerson;
            FrontEndApplication = frontEndApplication;
            Settings = settings;
        }

        public User User { get; }

        /// <summary>
        /// The new or linked Person (an instance of the configured Person entity type)
        /// </summary>
        public Person Person { get; }

        public bool LinkedToExistingPerson { get; }

        /// <summary>
        /// AppKey of the front-end the user registered from (null when not specified)
        /// </summary>
        public string FrontEndApplication { get; }

        /// <summary>
        /// Effective settings used for the registration
        /// </summary>
        public UserManagementSettings Settings { get; }
    }
}
