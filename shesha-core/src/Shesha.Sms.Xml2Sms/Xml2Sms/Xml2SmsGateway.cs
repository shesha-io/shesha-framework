using Castle.Core.Logging;
using Shesha.Attributes;
using Shesha.Utilities;
using System;
using System.ComponentModel.DataAnnotations;
using System.IO;
using System.Net;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using System.Xml;

namespace Shesha.Sms.Xml2Sms
{
    [ClassUid("EA33034D-73C6-4D3D-94F0-EE0D4C56D97C")]
    [Display(Name = "Xml2Sms")]
    public class Xml2SmsGateway : ConfigurableSmsGateway<Xml2SmsSettingDto>, IXml2SmsGateway
    {
        public ILogger Logger { get; set; }
        private readonly IXml2SmsSetting _settings;

        public Xml2SmsGateway(IXml2SmsSetting settings)
        {
            Logger = NullLogger.Instance;
            _settings = settings;
        }

        /// <summary>
        /// Sends an SMS message.
        /// </summary>
        /// <param name="mobileNumber">Mobile number to send message to. Must be a South African number.</param>
        /// <param name="body">Message to be sent.</param>
        public async override Task SendSmsAsync(string mobileNumber, string body)
        {
            if (string.IsNullOrEmpty(mobileNumber))
                throw new Exception("Can't send message, your mobile number is empty");

            if (string.IsNullOrEmpty(body))
                throw new Exception("Can't send empty message");

            /*
            if (body.Length > 160)
                throw new Exception("Message length must be 160 characters or less");
            */

            // Removing any spaces and any other common characters in a phone number.
            mobileNumber = mobileNumber.Replace(" ", "");
            mobileNumber = mobileNumber.Replace("-", "");
            mobileNumber = mobileNumber.Replace("(", "");
            mobileNumber = mobileNumber.Replace(")", "");

            // Converting to the required format i.e. '27XXXXXXXXX'
            if (mobileNumber.StartsWith("0027"))
                mobileNumber = "27" + mobileNumber.Substring(4);

            if (mobileNumber.StartsWith("0"))
                mobileNumber = "27" + mobileNumber.Substring(1);

            var gatewaySettings = await _settings.GatewaySettings.GetValueAsync();

            var sb = new StringBuilder();
            sb.Append("http://" + gatewaySettings.Host + "/send/?username=");
            sb.Append(gatewaySettings.Username);
            sb.Append("&password=");
            sb.Append(gatewaySettings.Password);
            sb.Append("&number=");
            sb.Append(mobileNumber);
            sb.Append("&message=");
            sb.Append(HttpUtility.UrlEncode(body.RemoveDiacritics()));
            sb.Append("&ems=1");

            Logger.InfoFormat("Sending SMS to {0}: {1}", mobileNumber, body);

            string response = await DownloadUrlAsync(sb.ToString(), gatewaySettings);

            var xml = new XmlDocument();
            xml.LoadXml(response); // suppose that myXmlString contains "<Names>...</Names>"

            var node = xml.SelectSingleNode("/aatsms/submitresult");
            var result = node.Attributes["result"].InnerText;

            /*
             result = 1 - ok
            <aatsms>
                <submitresult action="not queued - Error 154" error="154" key="0" result="0" number="1"/>
            </aatsms>
            */
            if (!result.Equals("1"))
            {
                var errorText = node?.Attributes["action"]?.InnerText;
                var error = node?.Attributes["error"]?.InnerText;

                var exceptionMessage = $"Could not send SMS to {mobileNumber}. Response: {error} - {errorText}. Request: {sb?.ToString()}";
                
                Logger.Error(exceptionMessage);

                if (error?.Equals("155") == true)
                    throw new Exception("Duplicate message submitted within the last 15 minutes.");

                throw new Exception($"Could not send SMS to {mobileNumber}. Please contact system administrator");
            }

            Logger.InfoFormat("SMS successfully sent, response: {0}", response);
        }

        public async Task<string> DownloadUrlAsync(string url, GatewaySettings settings)
        {
            #pragma warning disable SYSLIB0014
            var request = WebRequest.Create(url); // todo: replace with HttpClient
            #pragma warning restore SYSLIB0014

            if (settings.UseProxy)
            {
                var proxy = new WebProxy
                {
                    Address = new Uri(settings.WebProxyAddress)
                };
                request.Proxy = proxy;

                if (settings.UseDefaultProxyCredentials)
                {
                    proxy.Credentials = CredentialCache.DefaultCredentials;
                    proxy.UseDefaultCredentials = true;
                }
                else
                {
                    proxy.Credentials = new NetworkCredential(settings.Username, settings.Password);
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

        public override async Task<Xml2SmsSettingDto> GetTypedSettingsAsync()
        {
            var settings = await _settings.GatewaySettings.GetValueAsync();

            var dto = new Xml2SmsSettingDto
            {
                Xml2SmsHost = settings?.Host,
                Xml2SmsPassword = settings?.Password,
                Xml2SmsUsername = settings?.Username,
                UseProxy = settings?.UseProxy ?? false,
                WebProxyAddress = settings?.WebProxyAddress,
                UseDefaultProxyCredentials = settings?.UseDefaultProxyCredentials ?? false,
                WebProxyUsername = settings?.WebProxyUsername,
                WebProxyPassword = settings?.WebProxyPassword,
            };

            return dto;
        }

        public override async Task SetTypedSettingsAsync(Xml2SmsSettingDto settings)
        {
            await _settings.GatewaySettings.SetValueAsync(new GatewaySettings { 
                Host = settings.Xml2SmsHost,
                Password = settings.Xml2SmsPassword,
                Username = settings.Xml2SmsUsername,
                UseProxy = settings.UseProxy,
                WebProxyAddress = settings.WebProxyAddress,
                UseDefaultProxyCredentials = settings.UseDefaultProxyCredentials,
                WebProxyUsername = settings.WebProxyUsername,
                WebProxyPassword= settings.WebProxyPassword
            });
        }
    }
}
