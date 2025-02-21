using Shesha.Domain;

namespace Shesha.Notifications.MessageParticipants
{
#nullable enable
    public interface IMessageParticipant
    {
        string? GetAddress(INotificationChannelSender notificationChannelSender);
        Person? GetPerson();
    }
#nullable restore
}
