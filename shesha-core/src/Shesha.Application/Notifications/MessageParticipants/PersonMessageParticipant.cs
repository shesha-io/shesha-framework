using Abp.Domain.Repositories;
using Shesha.Domain;
using Shesha.Extensions;
using Shesha.Services;
using System;
using System.Threading.Tasks;

namespace Shesha.Notifications.MessageParticipants
{
    public class PersonMessageParticipant : IMessageSender, IMessageReceiver, IEquatable<IMessageReceiver>
    {
        private readonly Person _person;
        public PersonMessageParticipant(Person person)
        {
            _person = person;
        }
        public string? GetAddress(INotificationChannelSender notificationChannelSender)
        {
            return notificationChannelSender.GetRecipientId(_person);
        }

        public Person? GetPerson()
        {
            return _person;
        }

        public async Task<bool> IsNotificationOptedOutAsync(NotificationTypeConfig type)
        {
            var userNotificationPreferenceRepository = StaticContext.IocManager.Resolve<IRepository<UserNotificationPreference, Guid>>();
            return await userNotificationPreferenceRepository.GetAll().AnyAsync(x => x.User.Id == _person.Id && x.NotificationType.Id == type.Id && x.OptOut);            
        }

        public override int GetHashCode()
        {
            return _person != null
                ? _person.Id.GetHashCode()
                : base.GetHashCode();
        }

        public bool Equals(IMessageReceiver? other)
        {
            return other is PersonMessageParticipant participant && participant.GetPerson() == this.GetPerson();
        }

        public override bool Equals(object? obj) => this.Equals(obj as PersonMessageParticipant);

        public static bool operator ==(PersonMessageParticipant? l, PersonMessageParticipant? r)
        {
            if (l is null)
            {
                if (r is null)
                    return true;
                // Only the left side is null.
                return false;
            }
            // Equals handles case of null on right side.
            return l.Equals(r);
        }
        public static bool operator !=(PersonMessageParticipant? l, PersonMessageParticipant? r) => !(l == r);
    }
}