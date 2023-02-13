using EasyNetQ;
using EasyNetQ.Topology;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace Shesha.RabbitMQ.Extensions
{
    /// <summary>
    /// 
    /// </summary>
    public static class RabbitMqExtensions
    {
        /// <summary>
        /// 
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="bus"></param>
        /// <param name="exchangeName"></param>
        /// <param name="apiKey"></param>
        /// <param name="routingkey"></param>
        /// <param name="message"></param>
        public static void PublishHeaderMessage<T>(this IBus bus, string exchangeName, string apiKey, string routingkey, T message) where T : class
        {
            var exchange = bus.Advanced.ExchangeDeclare(exchangeName, ExchangeType.Header); var messageWrapper = new Message<T>(message);
            messageWrapper.Properties.Headers.Add("ApiKey", apiKey);
            bus.Advanced.Publish<T>(exchange, routingkey, true, messageWrapper);
        }

        public static async Task PublishHeaderMessageAsync<T>(this IBus bus, string exchangeName, string apiKey, string routingkey, T message) where T : class
        {
            var exchange = await bus.Advanced.ExchangeDeclareAsync(exchangeName, ExchangeType.Header); var messageWrapper = new Message<T>(message);
            messageWrapper.Properties.Headers.Add("ApiKey", apiKey);
            await bus.Advanced.PublishAsync<T>(exchange, routingkey, true, messageWrapper);
        }
        /// <summary>
        /// 
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="bus"></param>
        /// <param name="exchangeName"></param>
        /// <param name="type"></param>
        /// <param name="message"></param>
        /// <param name="routingKey"></param>
        public static void Publish<T>(this IBus bus, string exchangeName, string type, T message, string routingKey = null) where T : class
        {
            var exchange = bus.Advanced.ExchangeDeclare(exchangeName, type);
            bus.Advanced.Publish<T>(exchange, routingKey, true, new Message<T>(message));
        }

        /// <summary>
        /// 
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="bus"></param>
        /// <param name="exchangeName"></param>
        /// <param name="type"></param>
        /// <param name="message"></param>
        /// <param name="routingKey"></param>
        /// <returns></returns>
        public static async Task PublishAsync<T>(this IBus bus, string exchangeName, string type, T message, string routingKey = null) where T : class
        {
            var exchange = await bus.Advanced.ExchangeDeclareAsync(exchangeName, type);
            await bus.Advanced.PublishAsync<T>(exchange, routingKey, true, new Message<T>(message));
        }

        /// <summary>
        /// 
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="bus"></param>
        /// <param name="exchangeName"></param>
        /// <param name="message"></param>
        /// <param name="topic"></param>
        public static void Publish<T>(this IBus bus, string exchangeName, T message, string topic) where T : class
        {
            var exchange = bus.Advanced.ExchangeDeclare(exchangeName, ExchangeType.Topic);
            bus.Advanced.Publish(exchange, topic, true, new Message<T>(message));
        }
        /// <summary>
        /// 
        /// </summary>
        /// <typeparam name="T"></typeparam>
        /// <param name="bus"></param>
        /// <param name="exchangeName"></param>
        /// <param name="message"></param>
        /// <param name="topic"></param>
        /// <returns></returns>
        public static async Task PublishAsync<T>(this IBus bus, string exchangeName, T message, string topic) where T : class
        {
            var exchange = await bus.Advanced.ExchangeDeclareAsync(exchangeName, ExchangeType.Topic);
            await bus.Advanced.PublishAsync(exchange, topic, true, new Message<T>(message));
        }
    }
}
