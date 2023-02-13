using Castle.Core.Logging;
using Shesha.Attributes;
using Shesha.Configuration;
using System;
using System.ComponentModel.DataAnnotations;
using System.IO;
using System.Net;
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

        public SmsPortalGateway()
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

            var smsPortalHost = await SettingManager.GetSettingValueForApplicationAsync(SmsPortalSettingNames.Host);
            var smsPortalUsername = await SettingManager.GetSettingValueForApplicationAsync(SmsPortalSettingNames.Username);
            var smsPortalPassword = await SettingManager.GetSettingValueForApplicationAsync(SmsPortalSettingNames.Password);
            
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

        public async Task<string> DownloadUrlAsync(string url)
        {
            var request = WebRequest.Create(url);
            var useProxy = await SettingManager.GetSettingValueForApplicationAsync(SmsPortalSettingNames.UseProxy) == true.ToString();

            if (useProxy)
            {
                var proxyAddress = await SettingManager.GetSettingValueForApplicationAsync(SmsPortalSettingNames.WebProxyAddress);

                var proxy = new WebProxy
                {
                    Address = new Uri(proxyAddress)
                };
                request.Proxy = proxy;

                var useDefaultCredentials = await SettingManager.GetSettingValueForApplicationAsync(SmsPortalSettingNames.UseDefaultProxyCredentials) == true.ToString();
                if (useDefaultCredentials)
                {
                    proxy.Credentials = CredentialCache.DefaultCredentials;
                    proxy.UseDefaultCredentials = true;
                }
                else
                {
                    var username = await SettingManager.GetSettingValueForApplicationAsync(SmsPortalSettingNames.WebProxyUsername);
                    var password = await SettingManager.GetSettingValueForApplicationAsync(SmsPortalSettingNames.WebProxyPassword);

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

        public override async Task<SmsPortalSettingsDto> GetTypedSettingsAsync()
        {
            var settings = new SmsPortalSettingsDto
            {
                Host = await SettingManager.GetSettingValueAsync(SmsPortalSettingNames.Host),
                Username = await SettingManager.GetSettingValueAsync(SmsPortalSettingNames.Username),
                Password = await SettingManager.GetSettingValueAsync(SmsPortalSettingNames.Password),
                UseProxy = Boolean.Parse((ReadOnlySpan<char>)await SettingManager.GetSettingValueAsync(SmsPortalSettingNames.UseProxy)),
                WebProxyAddress = await SettingManager.GetSettingValueAsync(SmsPortalSettingNames.WebProxyAddress),
                UseDefaultProxyCredentials = Boolean.Parse((ReadOnlySpan<char>)await SettingManager.GetSettingValueAsync(SmsPortalSettingNames.UseDefaultProxyCredentials)),
                WebProxyUsername = await SettingManager.GetSettingValueAsync(SmsPortalSettingNames.WebProxyUsername),
                WebProxyPassword = await SettingManager.GetSettingValueAsync(SmsPortalSettingNames.WebProxyPassword),
            };

            return settings;
        }

        public override async Task SetTypedSettingsAsync(SmsPortalSettingsDto settings)
        {
            await SettingManager.ChangeSettingAsync(SmsPortalSettingNames.Host, settings.Host);
            await SettingManager.ChangeSettingAsync(SmsPortalSettingNames.Username, settings.Username);
            await SettingManager.ChangeSettingAsync(SmsPortalSettingNames.Password, settings.Password);
                  
            await SettingManager.ChangeSettingAsync(SmsPortalSettingNames.UseProxy, settings.UseProxy.ToString());
            await SettingManager.ChangeSettingAsync(SmsPortalSettingNames.WebProxyAddress, settings.WebProxyAddress);
            await SettingManager.ChangeSettingAsync(SmsPortalSettingNames.UseDefaultProxyCredentials, settings.UseDefaultProxyCredentials.ToString());
            await SettingManager.ChangeSettingAsync(SmsPortalSettingNames.WebProxyUsername, settings.WebProxyUsername);
            await SettingManager.ChangeSettingAsync(SmsPortalSettingNames.WebProxyPassword, settings.WebProxyPassword);
        }
    }
}