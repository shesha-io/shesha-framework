using System;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Threading.Tasks;
using Castle.Core.Logging;
using Shesha.Attributes;

namespace Shesha.Sms
{
    [ClassUid(Uid)]
    [Browsable(false)]
    [Display(Name = "Disabled")]
    public class NullSmsGateway : ISmsGateway
    {
        /// <summary>
        /// Unique identifier of the <see cref="NullSmsGateway"/> class, is used for references instead of class name
        /// </summary>
        public const string Uid = "648fa648-0673-4bf1-a3ca-ecdd454e3afc";

        public ILogger Logger { get; set; }

        public Type SettingsType => null;

        public NullSmsGateway()
        {
            Logger = NullLogger.Instance;
        }

        public Task SendSmsAsync(string mobileNumber, string body)
        {
            Logger.InfoFormat("SMS stub. Sending SMS to {0}: {1}", mobileNumber, body);

            if (string.IsNullOrEmpty(mobileNumber))
                throw new Exception("Can't send message, mobile number is empty");

            if (string.IsNullOrEmpty(body))
                throw new Exception("Can't send empty message");

            // Do nothing
            return Task.CompletedTask;
        }

        public Task<object> GetSettingsAsync()
        {
            throw new NotImplementedException();
        }

        public Task SetSettingsAsync(object settings)
        {
            throw new NotImplementedException();
        }
    }
}
