using Shesha.Notifications.Configuration.Email.Gateways;
using Shesha.Notifications.Configuration.Sms.Gateways;
using Shesha.Settings;
using Shesha.Sms;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.Notifications.Configuration.Email
{
    [Category("Email Gateways")]
    public interface IEmailGatewaySettings: ISettingAccessors
    {
        /// <summary>
        /// SMS Settings
        /// </summary>
        [Display(Name = "SMTP Gateway")]
        [Setting(NotificationGatewaySettingNames.SmtpGatewaySettings, EditorFormName = "smtp-gateway-settings")]
        ISettingAccessor<SmtpSettings> SmtpSettings { get; }
    }
}
