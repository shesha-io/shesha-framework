using Castle.Core.Logging;
using Shesha.Attributes;
using Shesha.Notifications.Dto;
using System;
using System.ComponentModel.DataAnnotations;
using System.Net.Http;
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
            query["text"] = body;

            // Calculate message parts based on length
            int messagePartsCount = 1;
            if (body.Length > settings.SingleMessageMaxLength)
            {
                // Calculate number of parts needed for multipart message
                messagePartsCount = (int)Math.Ceiling((double)body.Length / settings.MessagePartLength);
            }

            // Add concat parameter for multipart messages
            if (messagePartsCount > 1)
            {
                query["concat"] = messagePartsCount.ToString();
            }

            var url = $"https://api.clickatell.com/http/sendmsg?{query}";
            try
            {
                // Send the GET request
                using var response = await httpClient.GetAsync(url);
                var responseContent = await response.Content.ReadAsStringAsync();
                if (response.IsSuccessStatusCode && responseContent.StartsWith("ID"))
                {
                    Logger.InfoFormat("SMS successfully sent as {0} part(s), response: {1}",
                        messagePartsCount, responseContent);
                    return SendStatus.Success();
                }
                var errorMessage = $"Could not send SMS to '{mobileNumber}'. Response: '{responseContent}'";
                Logger.ErrorFormat(errorMessage);
                return SendStatus.Failed(errorMessage);
            }
            catch (Exception ex)
            {
                Logger.ErrorFormat($"An error occurred: {ex.Message}");
                return SendStatus.Failed($"An error occurred: {ex.Message}");
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