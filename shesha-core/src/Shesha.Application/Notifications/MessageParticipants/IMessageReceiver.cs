using Shesha.Domain;
using System.Threading.Tasks;

namespace Shesha.Notifications.MessageParticipants
{
    public interface IMessageReceiver: IMessageParticipant
    {
        Task<bool> IsNotificationOptedOutAsync(NotificationTypeConfig type);
    }
}
