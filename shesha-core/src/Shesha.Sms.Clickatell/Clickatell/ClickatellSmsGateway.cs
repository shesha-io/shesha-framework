using Castle.Core.Logging;
using Shesha.Attributes;
using System;
using System.ComponentModel.DataAnnotations;
using System.IO;
using System.Net;
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
        public override async Task SendSmsAsync(string mobileNumber, string body)
        {
            if (string.IsNullOrEmpty(mobileNumber))
                throw new Exception("Can't send message, mobile number is empty");

            if (string.IsNullOrEmpty(body))
                throw new Exception("Can't send empty message");

            // Removing any spaces and any other common characters in a phone number.
            mobileNumber = MobileHelper.CleanupmobileNo(mobileNumber);

            var gatewaySettings = await _settings.GatewaySettings.GetValueAsync();

            var sb = new StringBuilder();
            sb.Append("https://" + gatewaySettings.Host + "/http/sendmsg?api_id=");
            sb.Append(gatewaySettings.ApiId);
            sb.Append("&user=");
            sb.Append(gatewaySettings.Username);
            sb.Append("&password=");
            sb.Append(gatewaySettings.Password);
            sb.Append("&to=");
            sb.Append(mobileNumber);
            sb.Append("&text=");
            sb.Append(HttpUtility.UrlEncode(body));

            if (body.Length > gatewaySettings.SingleMessageMaxLength)
            {
                var splitCount = body.Length / gatewaySettings.MessagePartLength;
                if (splitCount * gatewaySettings.MessagePartLength < body.Length)
                    splitCount++;

                sb.Append("&concat=" + splitCount);
            }

            Logger.InfoFormat("Sending SMS to {0}: {1}", mobileNumber, body);

            string response = await DownloadUrlAsync(sb.ToString(), gatewaySettings);

            // If response format is 'ID: XXXXXXXXXXXXXXXX' where XXXXXXXXXXXXXX is a message id then request has been successful.
            if (!response.StartsWith("ID:"))
            {
                var exceptionMessage = $"Could not send SMS to {mobileNumber}. Response: {response}";
                Logger.ErrorFormat(exceptionMessage);

                throw new Exception("Could not send SMS to " + mobileNumber + ". Please contact system administrator", new Exception(response));
            }

            Logger.InfoFormat("SMS successfully sent, response: {0}", response);
        }

        public async Task<string> DownloadUrlAsync(string url, GatewaySettings gatewaySettings)
        {
            #pragma warning disable SYSLIB0014
            var request = WebRequest.Create(url); // todo: replace with HttpClient
            #pragma warning restore SYSLIB0014

            if (gatewaySettings.UseProxy)
            {
                var proxy = new WebProxy
                {
                    Address = new Uri(gatewaySettings.WebProxyAddress)
                };
                request.Proxy = proxy;

                if (gatewaySettings.UseDefaultProxyCredentials)
                {
                    proxy.Credentials = CredentialCache.DefaultCredentials;
                    proxy.UseDefaultCredentials = true;
                }
                else
                {
                    proxy.Credentials = new NetworkCredential(gatewaySettings.WebProxyUsername, gatewaySettings.WebProxyPassword);
                }
            }

            using (var response = await request.GetResponseAsync())
            {
                await using (var receiveStream = response.GetResponseStream())
                {
                    if (receiveStream == null)
                        return null;

                    var readStream = new StreamReader(receiveStream, Encoding.GetEncoding("utf-8"));
                    var strResponse = await readStream.ReadToEndAsync();

                    return strResponse;
                }
            }
        }

        public override async Task<ClickatellSettingDto> GetTypedSettingsAsync()
        {
            var gatewaySettings = await _settings.GatewaySettings.GetValueAsync();

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
            await _settings.GatewaySettings.SetValueAsync(new GatewaySettings {
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