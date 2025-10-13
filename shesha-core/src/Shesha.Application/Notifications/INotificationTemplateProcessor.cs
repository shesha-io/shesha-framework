using System.Threading.Tasks;

namespace Shesha.Notifications
{
    /// <summary>
    /// Notification template processor
    /// </summary>
    public interface INotificationTemplateProcessor
    {
        /// <summary>
        /// Generate notification text using specified <paramref name="template"/> and <paramref name="model"/>
        /// </summary>
        /// <param name="template">Template with mustache syntax</param>
        /// <param name="model">Model to use for replacements in the template</param>
        /// <returns></returns>
        Task<string> GenerateAsync(string template, object model);
    }
}
