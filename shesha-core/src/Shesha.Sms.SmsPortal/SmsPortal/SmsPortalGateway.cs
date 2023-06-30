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

            var gatewaySettings = await _settings.GatewaySettings.GetValueAsync();

            var sb = new StringBuilder();
            sb.Append("http://" + gatewaySettings.Host + "?Type=sendparam&Username=");
            sb.Append(gatewaySettings.Username);
            sb.Append("&password=");
            sb.Append(gatewaySettings.Password);
            sb.Append("&numto=");
            sb.Append(mobileNumber);
            sb.Append("&data1=");
            sb.Append(HttpUtility.UrlEncode(body));

            Logger.InfoFormat("Sending SMS to {0}: {1}", mobileNumber, body);

            string response = await DownloadUrlAsync(sb.ToString(), gatewaySettings);

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

        private HttpClient GetHttpClient(GatewaySettings gatewaySettings) 
        {
            if (gatewaySettings.UseProxy) 
            {
                var proxy = new WebProxy
                {
                    Address = new Uri(gatewaySettings.WebProxyAddress)
                };

                if (gatewaySettings.UseDefaultProxyCredentials)
                {
                    proxy.Credentials = CredentialCache.DefaultCredentials;
                    proxy.UseDefaultCredentials = true;
                }
                else
                {
                    proxy.Credentials = new NetworkCredential(gatewaySettings.WebProxyUsername, gatewaySettings.WebProxyPassword);
                }

                return new HttpClient(new HttpClientHandler { Proxy = proxy }, disposeHandler: true);                
            }
            else
                return new HttpClient();
        }

        public async Task<string> DownloadUrlAsync(string url, GatewaySettings gatewaySettings)
        {
            using (var httpClient = GetHttpClient(gatewaySettings))
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
            var gatewaySettings = await _settings.GatewaySettings.GetValueAsync();
            var settings = new SmsPortalSettingsDto
            {
                Host = gatewaySettings.Host,
                Username = gatewaySettings.Username,
                Password = gatewaySettings.Password,
                UseProxy = gatewaySettings.UseProxy,
                WebProxyAddress = gatewaySettings.WebProxyAddress,
                UseDefaultProxyCredentials = gatewaySettings.UseDefaultProxyCredentials,
                WebProxyUsername = gatewaySettings.WebProxyUsername,
                WebProxyPassword = gatewaySettings.WebProxyPassword
            };

            return settings;
        }

        public override async Task SetTypedSettingsAsync(SmsPortalSettingsDto settings)
        {
            await _settings.GatewaySettings.SetValueAsync(new GatewaySettings { 
                Host = settings.Host,
                Username = settings.Username,
                Password = settings.Password,

                UseProxy = settings.UseProxy,
                WebProxyAddress = settings.WebProxyAddress,
                UseDefaultProxyCredentials = settings.UseDefaultProxyCredentials,
                WebProxyUsername = settings.WebProxyUsername,
                WebProxyPassword = settings.WebProxyPassword
            });
        }
    }
}