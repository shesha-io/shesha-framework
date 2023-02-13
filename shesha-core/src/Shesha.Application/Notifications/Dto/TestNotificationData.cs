using Abp.Notifications;

namespace Shesha.Notifications.Dto
{
    public class TestNotificationData: NotificationData
    {
        public string UserName { get; set; }
        public string Greeting { get; set; }
        public string CustomMessage { get; set; }
    }
}