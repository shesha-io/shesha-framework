using EasyNetQ;
using Shesha.Configuration;
using Shesha.Reflection;
using Shesha.Services;
using System;
using System.Linq;

namespace Shesha.RabbitMQ
{
    /// <summary>
    /// 
    /// </summary>
    public class SheshaMQConventions : Conventions
    {
        /// <summary>
        /// 
        /// </summary>
        /// <param name="typeNameSerializer"></param>
        public SheshaMQConventions(ITypeNameSerializer typeNameSerializer) : base(typeNameSerializer)
        {
          
            QueueNamingConvention = (messageType, id) =>
            {
                var attr = GetQueueAttribute(messageType);

                if (!string.IsNullOrEmpty(attr.QueueName))
                {
                    var systemName = id.Split(':').FirstOrDefault();
                      systemName = string.Concat(systemName.Select((x, i) => i > 0 && char.IsUpper(x) ? "_" + x.ToString() : x.ToString()));
                    return $"{attr.QueueName}_{systemName.ToLower()}";
                }
                return base.QueueNamingConvention.Invoke(messageType, id);
            };
            ExchangeNamingConvention = messageType =>
            {
                var attr = GetQueueAttribute(messageType);
                
                // todo: use controller injection
                var settings = StaticContext.IocManager.Resolve<ISheshaSettings>();
                var exchangeNameSetting = settings.ExchangeName.GetValue();

                var exchangeName = string.IsNullOrEmpty(exchangeNameSetting) 
                    ? typeNameSerializer.Serialize(messageType) 
                    : exchangeNameSetting;

                return string.IsNullOrEmpty(attr.ExchangeName)
                    ? (exchangeName)
                    : attr.ExchangeName;
            };
        }

        private QueueAttribute GetQueueAttribute(Type messageType)
        {
            return messageType.GetAttribute<QueueAttribute>() ?? new QueueAttribute(string.Empty);
        }
    }
}

