using Shesha.Domain.Attributes;
using Shesha.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.Domain
{
    [DiscriminatorValue(ItemTypeName)]
    [JoinedProperty("Core_OtpConfigs")]
    public class OtpConfig : ConfigurationItemBase
    {
        /// <summary>
        /// 
        /// </summary>
        public const string ItemTypeName = "otp-config";
        /// <summary>
        ///  ctor
        /// </summary>
        public override string ItemType => ItemTypeName;
        /// <summary>
        /// 
        /// </summary>
        public virtual NotificationTemplate NotificationTemplate { get; set; }
        public virtual OtpSendType? SendType { get; set; }
        public virtual string RecipientType { get; set; }
        public virtual int? Lifetime { get; set; }
        public virtual string ActionType { get; set; }
        public EntityConfig EntityConfig { get; set; }
    }
}

