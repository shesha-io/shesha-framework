using Castle.Core.Logging;
using Shesha.Attributes;
using Shesha.Configuration;
using System;
using System.Collections;
using System.ComponentModel.DataAnnotations;
using System.IO;
using System.Net;
using System.Text;
using System.Threading.Tasks;
using System.Web;

namespace Shesha.Sms.BulkSms
{
    [ClassUid("e77da5f3-a406-4b8a-bb6f-e3c2d5d20c8a")]
    [Display(Name = "Bulk Sms")]
    public class BulkSmsGateway : ConfigurableSmsGateway<BulkSmsSettingsDto>, IBulkSmsGateway
    {
        public ILogger Logger { get; set; }

        public BulkSmsGateway()
        {
            Logger = NullLogger.Instance;
        }

        public override async Task SendSmsAsync(string mobileNumber, string body)
        {
            if (string.IsNullOrEmpty(mobileNumber))
                throw new Exception("Can't send message, mobile number is empty");

            if (string.IsNullOrEmpty(body))
                throw new Exception("Can't send empty message");

            var bulkSmsUrl = await SettingManager.GetSettingValueForApplicationAsync(BulkSmsSettingNames.ApiUrl);
            var bulkSmsUsername = await SettingManager.GetSettingValueForApplicationAsync(BulkSmsSettingNames.ApiUsername);
            var bulkSmsPassword = await SettingManager.GetSettingValueForApplicationAsync(BulkSmsSettingNames.ApiPassword);
            if (string.IsNullOrWhiteSpace(bulkSmsUrl) || string.IsNullOrWhiteSpace(bulkSmsUsername) || string.IsNullOrWhiteSpace(bulkSmsPassword))
                throw new Exception("Bulk SMS Gateway is not configured properly, please check settings");

            // Removing any spaces and any other common characters in a phone number.
            var msisdn = MobileHelper.CleanupmobileNo(mobileNumber);

            Logger.Info($"Sending SMS to {mobileNumber} (converted to: {msisdn}): {body}");

            string data = GetSevenBitMessage(bulkSmsUsername, bulkSmsPassword, msisdn, body);

            var result = await DoSendSmsAsync(data, bulkSmsUrl);
            if ((int)result["success"] == 1)
            {
                var response = GetFormattedServerResponse(result);

                Logger.Info($"SMS successfully sent, response: {response}");
            }
            else
            {
                throw new Exception("Could not send SMS to " + mobileNumber + ". Please contact system administrator",
                    new Exception($"Could not send SMS to {mobileNumber}. Response: {GetFormattedServerResponse(result)}"));
            }
        }

        public static string GetFormattedServerResponse(Hashtable result)
        {
            string retString = "";
            if ((int)result["success"] == 1)
            {
                retString += "Success: batch ID " + (string)result["api_batch_id"] + "API message: " + (string)result["api_message"] + "\nFull details " + (string)result["details"];
            }
            else
            {
                retString += "Fatal error: HTTP status " + (string)result["http_status_code"] + " API status " + (string)result["api_status_code"] + " API message " + (string)result["api_message"] + "\nFull details " + (string)result["details"];
            }

            return retString;
        }

        public async Task<Hashtable> DoSendSmsAsync(string data, string url)
        {
            string smsResult = await PostAsync(url, data);

            Hashtable resultHash = new Hashtable();

            string tmp = "";
            tmp += "Response from server: " + smsResult + "\n";
            string[] parts = smsResult.Split('|');

            string statusCode = parts[0];
            string statusString = parts[1];

            resultHash.Add("api_status_code", statusCode);
            resultHash.Add("api_message", statusString);

            if (parts.Length != 3)
            {
                tmp += "Error: could not parse valid return data from server.\n";
            }
            else
            {
                if (statusCode.Equals("0"))
                {
                    resultHash.Add("success", 1);
                    resultHash.Add("api_batch_id", parts[2]);
                    tmp += "Message sent - batch ID " + parts[2] + "\n";
                }
                else if (statusCode.Equals("1"))
                {
                    // Success: scheduled for later sending.
                    resultHash.Add("success", 1);
                    resultHash.Add("api_batch_id", parts[2]);
                }
                else
                {
                    resultHash.Add("success", 0);
                    tmp += "Error sending: status code " + parts[0] + " description: " + parts[1] + "\n";
                }
            }
            resultHash.Add("details", tmp);
            return resultHash;
        }

        private async Task<string> PostAsync(string url, string data)
        {
            try
            {
                var request = (HttpWebRequest)WebRequest.Create(url);

                var useProxy = await SettingManager.GetSettingValueForApplicationAsync(BulkSmsSettingNames.UseProxy) == true.ToString();

                if (useProxy)
                {
                    var proxyAddress = await SettingManager.GetSettingValueForApplicationAsync(BulkSmsSettingNames.WebProxyAddress);

                    var proxy = new WebProxy
                    {
                        Address = new Uri(proxyAddress)
                    };
                    request.Proxy = proxy;

                    var useDefaultCredentials = await SettingManager.GetSettingValueForApplicationAsync(BulkSmsSettingNames.UseDefaultProxyCredentials) == true.ToString();
                    if (useDefaultCredentials)
                    {
                        proxy.Credentials = CredentialCache.DefaultCredentials;
                        proxy.UseDefaultCredentials = true;
                    }
                    else
                    {
                        var username = await SettingManager.GetSettingValueForApplicationAsync(BulkSmsSettingNames.WebProxyUsername);
                        var password = await SettingManager.GetSettingValueForApplicationAsync(BulkSmsSettingNames.WebProxyPassword);

                        proxy.Credentials = new NetworkCredential(username, password);
                    }
                }

                byte[] buffer = Encoding.Default.GetBytes(data);

                request.Method = "POST";
                request.ContentType = "application/x-www-form-urlencoded";
                request.ContentLength = buffer.Length;

                await using var postData = await request.GetRequestStreamAsync();
                await postData.WriteAsync(buffer, 0, buffer.Length);
                    
                var webResp = await request.GetResponseAsync();//as HttpWebResponse;
                if (webResp is HttpWebResponse httpResponse)
                    Console.WriteLine(httpResponse.StatusCode);

                await using var response = webResp.GetResponseStream();
                if (response == null)
                    return null;
                using var reader = new StreamReader(response);
                var result = await reader.ReadToEndAsync();
                return result.Trim() + "\n";
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                throw;
            }
        }

        public static string ResolveChars(string body)
        {
            Hashtable chrs = new Hashtable();
            chrs.Add('Ω', "Û");
            chrs.Add('Θ', "Ô");
            chrs.Add('Δ', "Ð");
            chrs.Add('Φ', "Þ");
            chrs.Add('Γ', "¬");
            chrs.Add('Λ', "Â");
            chrs.Add('Π', "º");
            chrs.Add('Ψ', "Ý");
            chrs.Add('Σ', "Ê");
            chrs.Add('Ξ', "±");

            string retStr = "";
            foreach (char c in body)
            {
                if (chrs.ContainsKey(c))
                {
                    retStr += chrs[c];
                }
                else
                {
                    retStr += c;
                }
            }
            return retStr;
        }

        public static string GetSevenBitMessage(string username, string password, string msisdn, string message)
        {

            /********************************************************************
            * Construct data                                                    *
            *********************************************************************/
            /*
            * Note the suggested encoding for the some parameters, notably
            * the username, password and especially the message.  ISO-8859-1
            * is essentially the character set that we use for message bodies,
            * with a few exceptions for e.g. Greek characters. For a full list,
            * see: http://developer.bulksms.com/eapi/submission/character-encoding/
            */

            string data = "";
            data += "username=" + HttpUtility.UrlEncode(username, Encoding.GetEncoding("ISO-8859-1"));
            data += "&password=" + HttpUtility.UrlEncode(password, Encoding.GetEncoding("ISO-8859-1"));
            data += "&message=" + HttpUtility.UrlEncode(ResolveChars(message), Encoding.GetEncoding("ISO-8859-1"));
            data += "&msisdn=" + msisdn;
            data += "&want_report=1";

            // allow concatenation (4 messages max)
            data += "&allow_concat_text_sms=1";
            data += "&concat_text_sms_max_parts=4";

            return data;
        }

        public static string StringToHex(string s)
        {
            string hex = "";
            foreach (char c in s)
            {
                int tmp = c;
                hex += String.Format("{0:x4}", (uint)System.Convert.ToUInt32(tmp.ToString()));
            }
            return hex;
        }

        public override async Task<BulkSmsSettingsDto> GetTypedSettingsAsync()
        {
            var settings = new BulkSmsSettingsDto
            {
                ApiUrl = await SettingManager.GetSettingValueForApplicationAsync(BulkSmsSettingNames.ApiUrl),
                ApiUsername = await SettingManager.GetSettingValueForApplicationAsync(BulkSmsSettingNames.ApiUsername),
                ApiPassword = await SettingManager.GetSettingValueForApplicationAsync(BulkSmsSettingNames.ApiPassword),

                UseProxy = Boolean.Parse((ReadOnlySpan<char>)await SettingManager.GetSettingValueForApplicationAsync(BulkSmsSettingNames.UseProxy)),
                WebProxyAddress = await SettingManager.GetSettingValueForApplicationAsync(BulkSmsSettingNames.WebProxyAddress),
                UseDefaultProxyCredentials = Boolean.Parse((ReadOnlySpan<char>)await SettingManager.GetSettingValueForApplicationAsync(BulkSmsSettingNames.UseDefaultProxyCredentials)),
                WebProxyUsername = await SettingManager.GetSettingValueForApplicationAsync(BulkSmsSettingNames.WebProxyUsername),
                WebProxyPassword = await SettingManager.GetSettingValueForApplicationAsync(BulkSmsSettingNames.WebProxyPassword),
            };

            return settings;
        }

        public override async Task SetTypedSettingsAsync(BulkSmsSettingsDto input)
        {
            await SettingManager.ChangeSettingAsync(BulkSmsSettingNames.ApiUrl, input.ApiUrl);
            await SettingManager.ChangeSettingAsync(BulkSmsSettingNames.ApiUsername, input.ApiUsername);
            await SettingManager.ChangeSettingAsync(BulkSmsSettingNames.ApiPassword, input.ApiPassword);

            await SettingManager.ChangeSettingAsync(BulkSmsSettingNames.UseProxy, input.UseProxy.ToString());
            await SettingManager.ChangeSettingAsync(BulkSmsSettingNames.WebProxyAddress, input.WebProxyAddress);
            await SettingManager.ChangeSettingAsync(BulkSmsSettingNames.UseDefaultProxyCredentials, input.UseDefaultProxyCredentials.ToString());
            await SettingManager.ChangeSettingAsync(BulkSmsSettingNames.WebProxyUsername, input.WebProxyUsername);
            await SettingManager.ChangeSettingAsync(BulkSmsSettingNames.WebProxyPassword, input.WebProxyPassword);
        }
    }
}
