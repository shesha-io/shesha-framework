﻿using Abp.Configuration;
using Shesha.Notifications.Dto;
using Shesha.Reflection;
using System;
using System.Threading.Tasks;

namespace Shesha.Sms
{
    /// <summary>
    /// Configurable SMS gateway
    /// </summary>
    /// <typeparam name="TSettings"></typeparam>
    public abstract class ConfigurableSmsGateway<TSettings> : IConfigurableSmsGateway<TSettings> where TSettings : class
    {
        /// <summary>
        /// Gateway settings type
        /// </summary>
        public Type SettingsType => typeof(TSettings);

        /// <summary>
        /// Get gateway settings
        /// </summary>
        /// <returns></returns>
        public async Task<object> GetSettingsAsync() 
        {
            return await GetTypedSettingsAsync();
        }

        /// <summary>
        /// Get types settings
        /// </summary>
        /// <returns></returns>
        public abstract Task<TSettings> GetTypedSettingsAsync();

        /// <summary>
        /// Send SMS
        /// </summary>
        /// <param name="mobileNumber"></param>
        /// <param name="body"></param>
        /// <returns></returns>
        public abstract Task<SendStatus> SendSmsAsync(string mobileNumber, string body);

        /// <summary>
        /// Set gateway settings
        /// </summary>
        /// <param name="settings"></param>
        /// <returns></returns>
        public async Task SetSettingsAsync(object settings)
        {
            await SetTypedSettingsAsync(settings.ForceCastAs<TSettings>());
        }

        /// <summary>
        /// Get typed gateway settings
        /// </summary>
        /// <param name="settings"></param>
        /// <returns></returns>
        public abstract Task SetTypedSettingsAsync(TSettings settings);
    }
}
