using Castle.Core.Logging;
using Shesha.Attributes;
using System;
using System.ComponentModel.DataAnnotations;
using System.IO;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using System.Xml;

namespace Shesha.Sms.SmsPortal
{
    [ClassUid("2a85c238-9648-4292-8849-44c61f5ab705")]
    [Display(Name = "Sms Portal")]
    public class SmsPortalGateway : ConfigurableSmsGateway<SmsPortalSettingsDto>, ISmsPortalGateway
    {
        public ILogger Logger { get; set; }
        private readonly ISmsPortalSettings _settings;

        public SmsPortalGateway(ISmsPortalSettings settings)
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

            /*
            if (body.Length > 160)
            {
                errorMessage = "Message length must be 160 characters or less";
                return false;
            }
            */
            // Removing any spaces and any other common characters in a phone number.
            mobileNumber = mobileNumber.Replace(" ", "");
            mobileNumber = mobileNumber.Replace("-", "");
            mobileNumber = mobileNumber.Replace("(", "");
            mobileNumber = mobileNumber.Replace(")", "");

            // todo: move to a separate class
            // Converting to the required format i.e. '27XXXXXXXXX'
            if (mobileNumber.StartsWith("0027"))
                mobileNumber = "27" + mobileNumber.Substring(4);

            if (mobileNumber.StartsWith("0"))
                mobileNumber = "27" + mobileNumber.Substring(1);

            var smsPortalHost = await _settings.Host.GetValueAsync();
            var smsPortalUsername = await _settings.ApiUsername.GetValueAsync();
            var smsPortalPassword = await _settings.ApiPassword.GetValueAsync();

            var sb = new StringBuilder();
            sb.Append("http://" + smsPortalHost + "?Type=sendparam&Username=");
            sb.Append(smsPortalUsername);
            sb.Append("&password=");
            sb.Append(smsPortalPassword);
            sb.Append("&numto=");
            sb.Append(mobileNumber);
            sb.Append("&data1=");
            sb.Append(HttpUtility.UrlEncode(body));

            Logger.InfoFormat("Sending SMS to {0}: {1}", mobileNumber, body);

            string response = await DownloadUrlAsync(sb.ToString());

            var xml = new XmlDocument();
            xml.LoadXml(response); // suppose that myXmlString contains "<Names>...</Names>"

            var node = xml.SelectSingleNode("/api_result/call_result");
            var result = node["result"].InnerText;

            // If response format is <api_result><send_info><eventid>XXXXXX</eventid></send_info>
            //<call_result><result>True</result><error /></call_result></api_result> where XXXXXXXXXXXXXX is a /event id then request has been successful.
            if (!result.Equals("True"))
            {
                var error = node["error"].InnerText;
                
                // log with response
                var exceptionMessage = $"Could not send SMS to {mobileNumber}. Response: {error}";
                Logger.ErrorFormat(exceptionMessage);

                throw new Exception("Could not send SMS to " + mobileNumber + ". Please contact system administrator");
            }

            Logger.InfoFormat("SMS successfully sent, response: {0}", response);
        }

        private async Task<HttpClient> GetHttpClient() 
        {
            var useProxy = await _settings.UseProxy.GetValueAsync();

            if (useProxy) 
            {
                var proxyAddress = await _settings.WebProxyAddress.GetValueAsync();

                var proxy = new WebProxy
                {
                    Address = new Uri(proxyAddress)
                };

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

                return new HttpClient(new HttpClientHandler { Proxy = proxy }, disposeHandler: true);                
            }
            else
                return new HttpClient();
        }

        public async Task<string> DownloadUrlAsync(string url)
        {
            using (var httpClient = await GetHttpClient())
            {
                using (var receiveStream = await httpClient.GetStreamAsync(url))
                {
                    if (receiveStream == null)
                        return null;

                    var readStream = new StreamReader(receiveStream, Encoding.GetEncoding("utf-8"));
                    var strResponse = await readStream.ReadToEndAsync();

                    return strResponse;
                }
            }
        }

        public override async Task<SmsPortalSettingsDto> GetTypedSettingsAsync()
        {
            var settings = new SmsPortalSettingsDto
            {
                Host = await _settings.Host.GetValueAsync(),
                Username = await _settings.ApiUsername.GetValueAsync(),
                Password = await _settings.ApiPassword.GetValueAsync(),
                UseProxy = await _settings.UseProxy.GetValueAsync(),
                WebProxyAddress = await _settings.WebProxyAddress.GetValueAsync(),
                UseDefaultProxyCredentials = await _settings.UseDefaultProxyCredentials.GetValueAsync(),
                WebProxyUsername = await _settings.WebProxyUsername.GetValueAsync(),
                WebProxyPassword = await _settings.WebProxyPassword.GetValueAsync()
            };

            return settings;
        }

        public override async Task SetTypedSettingsAsync(SmsPortalSettingsDto settings)
        {
            await _settings.Host.SetValueAsync(settings.Host);
            await _settings.ApiUsername.SetValueAsync(settings.Username);
            await _settings.ApiPassword.SetValueAsync(settings.Password);

            await _settings.UseProxy.SetValueAsync(settings.UseProxy);
            await _settings.WebProxyAddress.SetValueAsync(settings.WebProxyAddress);
            await _settings.UseDefaultProxyCredentials.SetValueAsync(settings.UseDefaultProxyCredentials);
            await _settings.WebProxyUsername.SetValueAsync(settings.WebProxyUsername);
            await _settings.WebProxyPassword.SetValueAsync(settings.WebProxyPassword);
        }
    }
}