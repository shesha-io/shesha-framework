using Abp.Dependency;
using Shesha.Firebase.Dtos;
using Shesha.Push;
using Shesha.Push.Dtos;
using System.Threading.Tasks;

namespace Shesha.Firebase
{
    /// <summary>
    /// Firebase application service
    /// </summary>
    public interface IFirebaseAppService: IPushNotifier, ITransientDependency
    {
        /// <summary>
        /// Updates Firebase settings
        /// </summary>
        Task UpdateSettings(UpdateFirebaseSettingsInput input);

        /// <summary>
        /// Send notification to topic
        /// </summary>
        /// <param name="input"></param>
        /// <returns>response from the Firebase API</returns>
        Task<string> SendNotificationToTopic(SendNotificationToTopicInput input);
    }
}
