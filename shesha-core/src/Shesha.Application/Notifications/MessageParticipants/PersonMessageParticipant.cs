using Abp.Dependency;
using Abp.Domain.Repositories;
using Shesha.Domain;
using Shesha.Extensions;
using System;
using System.Threading.Tasks;

namespace Shesha.Notifications.MessageParticipants
{
    public class PersonMessageParticipant : IMessageSender, IMessageReceiver
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
            var userNotificationPreferenceRepository = IocManager.Instance.Resolve<IRepository<UserNotificationPreference, Guid>>();
            return await userNotificationPreferenceRepository.GetAll().AnyAsync(x => x.User.Id == _person.Id && x.NotificationType.Id == type.Id && x.OptOut);            
        }
    }
}