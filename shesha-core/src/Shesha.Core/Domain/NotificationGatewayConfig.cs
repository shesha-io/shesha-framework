using Shesha.Domain.Attributes;
using Shesha.Domain.ConfigurationItems;
using Shesha.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.Domain
{
    [DiscriminatorValue(ItemTypeName)]
    [JoinedProperty("Core_NotificationGatewayConfigs")]
    [Entity(TypeShortAlias = "Shesha.Domain.NotificationGatewayConfig")]
    public class NotificationGatewayConfig : ConfigurationItemBase
    {
        public NotificationGatewayConfig()
        {
            Init();
        }

        private void Init()
        {
            VersionStatus = ConfigurationItemVersionStatus.Live;
        }

        /// <summary>
        /// 
        /// </summary>
        public const string ItemTypeName = "notification-gateway";

        /// <summary>
        /// 
        /// </summary>
        public override string ItemType => ItemTypeName;

        /// <summary>
        /// 
        /// </summary>
        public NotificationChannelConfig PartOf { get; set; }

        /// <summary>
        /// 
        /// </summary>
        public string GatewayTypeName { get; set; }
    }
}
