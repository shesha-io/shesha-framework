using System.Net.Mail;

namespace Shesha.Email
{
    /// <summary>
    /// Helper for preprocessing images in the email messages
    /// </summary>
    public interface IEmailImagesHelper
    {
        /// <summary>
        /// Prepares images in the specified <paramref name="message"/>
        /// </summary>
        bool PrepareImages(MailMessage message);

        /// <summary>
        /// Convert local images to Base64 embedded images. Is used for conversion of html to use in email messages. 
        /// </summary>
        string LocalImagesToEmbedded(string html);
    }
}
