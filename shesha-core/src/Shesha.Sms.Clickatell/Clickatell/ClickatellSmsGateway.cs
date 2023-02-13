using Castle.Core.Logging;
using Shesha.Attributes;
using Shesha.Configuration;
using Shesha.Utilities;
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

        public ClickatellSmsGateway()
        {
            Logger = NullLogger.Instance;
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

            var clickatellHost = await SettingManager.GetSettingValueForApplicationAsync(ClickatellSettingNames.Host);
            var clickatellUsername = await SettingManager.GetSettingValueForApplicationAsync(ClickatellSettingNames.ApiUsername);
            var clickatellPassword = await SettingManager.GetSettingValueForApplicationAsync(ClickatellSettingNames.ApiPassword);
            var clickatellApiId = await SettingManager.GetSettingValueForApplicationAsync(ClickatellSettingNames.ApiId);

            var singleMessageMaxLength = (await SettingManager.GetSettingValueForApplicationAsync(ClickatellSettingNames.SingleMessageMaxLength)).ToInt(ClickatellSettingProvider.DefaultSingleMessageMaxLength);
            var messagePartLength = (await SettingManager.GetSettingValueForApplicationAsync(ClickatellSettingNames.MessagePartLength)).ToInt(ClickatellSettingProvider.DefaultMessagePartLength);

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
            var request = WebRequest.Create(url);

            var useProxy = await SettingManager.GetSettingValueForApplicationAsync(ClickatellSettingNames.UseProxy) == true.ToString();

            if (useProxy)
            {
                var proxyAddress = await SettingManager.GetSettingValueForApplicationAsync(ClickatellSettingNames.WebProxyAddress);

                var proxy = new WebProxy
                {
                    Address = new Uri(proxyAddress)
                };
                request.Proxy = proxy;

                var useDefaultCredentials = await SettingManager.GetSettingValueForApplicationAsync(ClickatellSettingNames.UseDefaultProxyCredentials) == true.ToString();
                if (useDefaultCredentials)
                {
                    proxy.Credentials = CredentialCache.DefaultCredentials;
                    proxy.UseDefaultCredentials = true;
                }
                else
                {
                    var username = await SettingManager.GetSettingValueForApplicationAsync(ClickatellSettingNames.WebProxyUsername);
                    var password = await SettingManager.GetSettingValueForApplicationAsync(ClickatellSettingNames.WebProxyPassword);

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
                ClickatellHost = await SettingManager.GetSettingValueAsync(ClickatellSettingNames.Host),
                ClickatellApiId = await SettingManager.GetSettingValueAsync(ClickatellSettingNames.ApiId),
                ClickatellApiUsername = await SettingManager.GetSettingValueAsync(ClickatellSettingNames.ApiUsername),
                ClickatellApiPassword = await SettingManager.GetSettingValueAsync(ClickatellSettingNames.ApiPassword),
                UseProxy = Boolean.Parse((ReadOnlySpan<char>)await SettingManager.GetSettingValueAsync(ClickatellSettingNames.UseProxy)),
                WebProxyAddress = await SettingManager.GetSettingValueAsync(ClickatellSettingNames.WebProxyAddress),
                UseDefaultProxyCredentials = Boolean.Parse((ReadOnlySpan<char>)await SettingManager.GetSettingValueAsync(ClickatellSettingNames.UseDefaultProxyCredentials)),
                WebProxyUsername = await SettingManager.GetSettingValueAsync(ClickatellSettingNames.WebProxyUsername),
                WebProxyPassword = await SettingManager.GetSettingValueAsync(ClickatellSettingNames.WebProxyPassword),

                SingleMessageMaxLength = (await SettingManager.GetSettingValueAsync(ClickatellSettingNames.SingleMessageMaxLength)).ToInt(ClickatellSettingProvider.DefaultSingleMessageMaxLength),
                MessagePartLength = (await SettingManager.GetSettingValueAsync(ClickatellSettingNames.MessagePartLength)).ToInt(ClickatellSettingProvider.DefaultMessagePartLength)
            };

            return settings;
        }

        public override async Task SetTypedSettingsAsync(ClickatellSettingDto settings)
        {
            await SettingManager.ChangeSettingAsync(ClickatellSettingNames.Host, settings.ClickatellHost);
            await SettingManager.ChangeSettingAsync(ClickatellSettingNames.ApiId, settings.ClickatellApiId);
            await SettingManager.ChangeSettingAsync(ClickatellSettingNames.ApiUsername, settings.ClickatellApiUsername);
            await SettingManager.ChangeSettingAsync(ClickatellSettingNames.ApiPassword, settings.ClickatellApiPassword);
            await SettingManager.ChangeSettingAsync(ClickatellSettingNames.SingleMessageMaxLength, settings.SingleMessageMaxLength.ToString());
            await SettingManager.ChangeSettingAsync(ClickatellSettingNames.MessagePartLength, settings.MessagePartLength.ToString());

            await SettingManager.ChangeSettingAsync(ClickatellSettingNames.UseProxy, settings.UseProxy.ToString());
            await SettingManager.ChangeSettingAsync(ClickatellSettingNames.WebProxyAddress, settings.WebProxyAddress);
            await SettingManager.ChangeSettingAsync(ClickatellSettingNames.UseDefaultProxyCredentials, settings.UseDefaultProxyCredentials.ToString());
            await SettingManager.ChangeSettingAsync(ClickatellSettingNames.WebProxyUsername, settings.WebProxyUsername);
            await SettingManager.ChangeSettingAsync(ClickatellSettingNames.WebProxyPassword, settings.WebProxyPassword);
        }
    }
}