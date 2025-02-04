using Shesha.Domain;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.Notifications.MessageParticipants
{
    public class PersonMessageParticipant : IMessageSender, IMessageReciever
    {
        private readonly Person _person;
        private readonly INotificationChannelSender _notificationChannelSender;
        public PersonMessageParticipant(Person person, INotificationChannelSender notificationChannelSender)
        {
            _person = person;
            _notificationChannelSender = notificationChannelSender;

        }
        public string GetAddress()
        {
            return _notificationChannelSender.GetRecipientId(_person);
        }
    }
}

