using Shesha.Domain;

namespace Shesha.Notifications.MessageParticipants
{
    public interface IMessageParticipant
    {
        string? GetAddress(INotificationChannelSender notificationChannelSender);
        Person? GetPerson();
    }
}
