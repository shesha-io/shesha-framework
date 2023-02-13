using System.ComponentModel.DataAnnotations;

namespace Shesha.Configuration
{
    public interface ISheshaSettings
    {
        /// <summary>
        /// Upload Folder
        /// </summary>
        [Display(Name = "Upload Folder")]
        string UploadFolder { get; }

        /// <summary>
        /// RabbitMq Exchange
        /// </summary>
        [Display(Name = "Exchange Name")]
        string ExchangeName { get; }
    }
}
