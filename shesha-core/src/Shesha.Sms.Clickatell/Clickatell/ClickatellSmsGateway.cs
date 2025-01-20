using Castle.Core.Logging;
using Shesha.Attributes;
using Shesha.Notifications.Dto;
using System;
using System.ComponentModel.DataAnnotations;
using System.IO;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using System.Web;

namespace Shesha.Sms.Clickatell
{
    [ClassUid("fb8e8757-d831-41a3-925f-fd5c5088ef9b")]
    [Display(Name = "Clickatell")]
    public class ClickatellSmsGateway : ConfigurableSmsGateway<ClickatellSettingDto>, IClickatellSmsGateway
    {
        // https://archive.clickatell.com/developers/api-docs/http-sending-messages/

        public ILogger Logger { get; set; }
        private readonly IClickatellSettings _settings;

        public ClickatellSmsGateway(IClickatellSettings settings)
        {
            Logger = NullLogger.Instance;
            _settings = settings;
        }

        /// <summary>
        /// Sends an SMS message.
        /// </summary>
        /// <param name="mobileNumber">Mobile number to send message to. Must be a South African number.</param>
        /// <param name="body">Message to be sent.</param>
        /// <returns>Returns true if message was accepted by the gateway, else returns false.</returns>
        public override async Task<SendStatus> SendSmsAsync(string mobileNumber, string body)
        {
            var settings = await _settings.ClickatellGateway.GetValueAsync();

            // Send SMS API logic here
            using var httpClient = new HttpClient();

            // Build the request URL
            var query = HttpUtility.ParseQueryString(string.Empty);
            query["api_id"] = settings.ApiId;
            query["user"] = settings.Username;
            query["password"] = settings.Password;
            query["to"] = MobileHelper.CleanupMobileNo(mobileNumber);
            //query["text"] = HttpUtility.UrlEncode(body);
            query["text"] = body;

            var url = $"https://api.clickatell.com/http/sendmsg?{query}";

            try
            {
                // Send the GET request
                var response = await httpClient.GetAsync(url);

                var responseContent = await response.Content.ReadAsStringAsync();

                if (response.IsSuccessStatusCode && responseContent.StartsWith("ID"))
                {
                    Logger.InfoFormat("SMS successfully sent, response: {0}", response);
                    return new SendStatus()
                    {
                        IsSuccess = true,
                        Message = "SMS Successfully Sent!"
                    };
                }

                Logger.ErrorFormat($"Failed to send SMS. Response: {responseContent}");
                return new SendStatus()
                {
                    IsSuccess = false,
                    Message = $"Failed to send SMS. Response: {responseContent}"
                };
            }
            catch (Exception ex)
            {
                Logger.ErrorFormat($"An error occurred: {ex.Message}");
                return new SendStatus()
                {
                    IsSuccess = false,
                    Message = $"An error occurred: {ex.Message}"
                };
            }
        }

        public override async Task<ClickatellSettingDto> GetTypedSettingsAsync()
        {
            var gatewaySettings = await _settings.ClickatellGateway.GetValueAsync();

            var settings = new ClickatellSettingDto
            {
                ClickatellHost = gatewaySettings.Host,
                ClickatellApiId = gatewaySettings.ApiId,
                ClickatellApiUsername = gatewaySettings.Username,
                ClickatellApiPassword = gatewaySettings.Password,
                UseProxy = gatewaySettings.UseProxy,
                WebProxyAddress = gatewaySettings.WebProxyAddress,
                UseDefaultProxyCredentials = gatewaySettings.UseDefaultProxyCredentials,
                WebProxyUsername = gatewaySettings.WebProxyUsername,
                WebProxyPassword = gatewaySettings.WebProxyPassword,

                SingleMessageMaxLength = gatewaySettings.SingleMessageMaxLength,
                MessagePartLength = gatewaySettings.MessagePartLength,
            };

            return settings;
        }

        public override async Task SetTypedSettingsAsync(ClickatellSettingDto settings)
        {
            await _settings.ClickatellGateway.SetValueAsync(new GatewaySettings {
                Host = settings.ClickatellHost,
                ApiId = settings.ClickatellApiId,
                Username = settings.ClickatellApiUsername,
                Password = settings.ClickatellApiPassword,
                SingleMessageMaxLength = settings.SingleMessageMaxLength,
                MessagePartLength = settings.MessagePartLength,

                UseProxy = settings.UseProxy,
                WebProxyAddress = settings.WebProxyAddress,
                UseDefaultProxyCredentials = settings.UseDefaultProxyCredentials,
                WebProxyUsername = settings.WebProxyUsername,
                WebProxyPassword = settings.WebProxyPassword,
            });
        }
    }
}