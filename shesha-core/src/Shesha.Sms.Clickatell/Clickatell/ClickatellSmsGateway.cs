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

            var clickatellHost = await _settings.Host.GetValueAsync();
            var clickatellUsername = await _settings.ApiUsername.GetValueAsync();
            var clickatellPassword = await _settings.ApiPassword.GetValueAsync();
            var clickatellApiId = await _settings.ApiId.GetValueAsync();

            var singleMessageMaxLength = await _settings.SingleMessageMaxLength.GetValueAsync();
            var messagePartLength = await _settings.MessagePartLength.GetValueAsync();

            var sb = new StringBuilder();
            sb.Append("https://" + clickatellHost + "/http/sendmsg?api_id=");
            sb.Append(clickatellApiId);
            sb.Append("&user=");
            sb.Append(clickatellUsername);
            sb.Append("&password=");
            sb.Append(clickatellPassword);
            sb.Append("&to=");
            sb.Append(mobileNumber);
            sb.Append("&text=");
            sb.Append(HttpUtility.UrlEncode(body));

            if (body.Length > singleMessageMaxLength)
            {
                var splitCount = body.Length / messagePartLength;
                if (splitCount * messagePartLength < body.Length)
                    splitCount++;

                sb.Append("&concat=" + splitCount);
            }

            Logger.InfoFormat("Sending SMS to {0}: {1}", mobileNumber, body);

            string response = await DownloadUrlAsync(sb.ToString());

            // If response format is 'ID: XXXXXXXXXXXXXXXX' where XXXXXXXXXXXXXX is a message id then request has been successful.
            if (!response.StartsWith("ID:"))
            {
                var exceptionMessage = $"Could not send SMS to {mobileNumber}. Response: {response}";
                Logger.ErrorFormat(exceptionMessage);

                throw new Exception("Could not send SMS to " + mobileNumber + ". Please contact system administrator", new Exception(response));
            }

            Logger.InfoFormat("SMS successfully sent, response: {0}", response);
        }

        public async Task<string> DownloadUrlAsync(string url)
        {
            #pragma warning disable SYSLIB0014
            var request = WebRequest.Create(url); // todo: replace with HttpClient
            #pragma warning restore SYSLIB0014

            var useProxy = await _settings.UseProxy.GetValueAsync();

            if (useProxy)
            {
                var proxyAddress = await _settings.WebProxyAddress.GetValueAsync();

                var proxy = new WebProxy
                {
                    Address = new Uri(proxyAddress)
                };
                request.Proxy = proxy;

                var useDefaultCredentials = await _settings.UseDefaultProxyCredentials.GetValueAsync();
                if (useDefaultCredentials)
                {
                    proxy.Credentials = CredentialCache.DefaultCredentials;
                    proxy.UseDefaultCredentials = true;
                }
                else
                {
                    var username = await _settings.WebProxyUsername.GetValueAsync();
                    var password = await _settings.WebProxyPassword.GetValueAsync();

                    proxy.Credentials = new NetworkCredential(username, password);
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
            var settings = new ClickatellSettingDto
            {
                ClickatellHost = await _settings.Host.GetValueAsync(),
                ClickatellApiId = await _settings.ApiId.GetValueAsync(),
                ClickatellApiUsername = await _settings.ApiUsername.GetValueAsync(),
                ClickatellApiPassword = await _settings.ApiPassword.GetValueAsync(),
                UseProxy = await _settings.UseProxy.GetValueAsync(),
                WebProxyAddress = await _settings.WebProxyAddress.GetValueAsync(),
                UseDefaultProxyCredentials = await _settings.UseDefaultProxyCredentials.GetValueAsync(),
                WebProxyUsername = await _settings.WebProxyUsername.GetValueAsync(),
                WebProxyPassword = await _settings.WebProxyPassword.GetValueAsync(),

                SingleMessageMaxLength = await _settings.SingleMessageMaxLength.GetValueAsync(),
                MessagePartLength = await _settings.MessagePartLength.GetValueAsync(),
            };

            return settings;
        }

        public override async Task SetTypedSettingsAsync(ClickatellSettingDto settings)
        {
            await _settings.Host.SetValueAsync(settings.ClickatellHost);
            await _settings.ApiId.SetValueAsync(settings.ClickatellApiId);
            await _settings.ApiUsername.SetValueAsync(settings.ClickatellApiUsername);
            await _settings.ApiPassword.SetValueAsync(settings.ClickatellApiPassword);
            await _settings.SingleMessageMaxLength.SetValueAsync(settings.SingleMessageMaxLength);
            await _settings.MessagePartLength.SetValueAsync(settings.MessagePartLength);

            await _settings.UseProxy.SetValueAsync(settings.UseProxy);
            await _settings.WebProxyAddress.SetValueAsync(settings.WebProxyAddress);
            await _settings.UseDefaultProxyCredentials.SetValueAsync(settings.UseDefaultProxyCredentials);
            await _settings.WebProxyUsername.SetValueAsync(settings.WebProxyUsername);
            await _settings.WebProxyPassword.SetValueAsync(settings.WebProxyPassword);
        }
    }
}