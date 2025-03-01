using Shesha.Domain;
using System.Threading.Tasks;

namespace Shesha.Notifications.MessageParticipants
{
    public class RawAddressMessageParticipant : IMessageSender, IMessageReceiver
    {
        private readonly string _address;
        public RawAddressMessageParticipant(string address)
        {
            _address = address;
        }
        public string? GetAddress(INotificationChannelSender notificationChannelSender)
        {
            return _address;
        }

        public Person? GetPerson()
        {
            return null;
        }

        public Task<bool> IsNotificationOptedOutAsync(NotificationTypeConfig type)
        {
            return Task.FromResult(false);
        }
    }
}