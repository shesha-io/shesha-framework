using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Threading.Tasks;
using Castle.Core.Logging;
using Shesha.Attributes;
using Shesha.Push.Dtos;

namespace Shesha.Push
{
    /// <summary>
    /// Null push notifier
    /// </summary>
    [ClassUid(Uid)]
    [Browsable(false)]
    [Display(Name = "Disabled")]
    public class NullPushNotifier: IPushNotifier
    {
        /// <summary>
        /// Unique identifier of the <see cref="NullPushNotifier"/> class, is used for references instead of class name
        /// </summary>
        public const string Uid = "E048D1A4-734F-4E31-B621-B2EF73BA80E9";

        /// <summary>
        /// Logger
        /// </summary>
        public ILogger Logger { get; set; } = NullLogger.Instance;

        /// inheritedDoc
        public Task SendNotificationToPersonAsync(SendNotificationToPersonInput input)
        {
            Logger.Info($"Send push notification. PersonId: {input.PersonId}, Title: {input.Title}, Body: {input.Body}");

            return Task.CompletedTask;
        }
    }
}
