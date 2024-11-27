using Shesha.Configuration;
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

namespace Shesha.Notifications.Configuration.Sms
{
    [Category("SMS Gateways")]
    public interface ISmsGatewaySettings: ISettingAccessors
    {
        /// <summary>
        /// SMS Settings
        /// </summary>
        [Display(Name = "Clickatell Gateway")]
        [Setting(NotificationGatewaySettingNames.ClickatellGatewaySettings, EditorFormName = "clickatall-gateway-settings")]
        ISettingAccessor<ClickatellSettings> ClickatellSettings { get; }
    }
}

