using System.Threading.Tasks;
using Shesha.Push.Dtos;

namespace Shesha.Push
{
    /// <summary>
    /// Interface of the push notifier
    /// </summary>
    public interface IPushNotifier
    {
        /// <summary>
        /// Send notification to a specified person
        /// </summary>
        /// <param name="input"></param>
        /// <returns></returns>
        Task SendNotificationToPersonAsync(SendNotificationToPersonInput input);
    }
}
