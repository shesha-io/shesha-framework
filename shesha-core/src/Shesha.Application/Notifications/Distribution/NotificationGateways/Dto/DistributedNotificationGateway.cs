using Shesha.ConfigurationItems.Distribution;
using Shesha.Domain;
using Shesha.Domain.Attributes;
using Shesha.Domain.Enums;
using System;
using System.ComponentModel.DataAnnotations;

namespace Shesha.Notifications.Distribution.NotificationGateways.Dto
{
    /// <summary>
    /// Distributed file template
    /// </summary>
    public class DistributedNotificationGateway : DistributedConfigurableItemBase
    {
        /// <summary>
        /// 
        /// </summary>
        public Guid PartOfId { get; set; }

        /// <summary>
        /// 
        /// </summary>
        public string GatewayTypeName { get; set; }
    }
}
