using Shesha.Domain;
using Shesha.Email.Dtos;
using Shesha.OmoNotifications.Configuration.Email;
using Shesha.OmoNotifications.Configuration;
using Shesha.OmoNotifications.Helpers;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using Shesha.OmoNotifications.Configuration.Sms;

namespace Shesha.OmoNotifications.Sms.Gateways
{
    public class ClickatellGateway: ISmsGateway
    {
        private readonly ISmsGatewaySettings _smsGatewaySettings;
        private readonly INotificationSettings _notificationSettings;
        public ClickatellGateway(ISmsGatewaySettings smsGatewaySettings, INotificationSettings notificationSettings)
        {
            _notificationSettings = notificationSettings;
            _smsGatewaySettings = smsGatewaySettings;
        }

        public async Task<bool> SendAsync(string toPerson, string message)
        {
            var settings= _smsGatewaySettings.ClickatellSettings.GetValueAsync().Result;

            // Send SMS API logic here
            using var httpClient = new HttpClient();

            // Build the request URL
            var query = HttpUtility.ParseQueryString(string.Empty);
            query["api_id"] = settings.ApiId;
            query["user"] = settings.Username;
            query["password"] = settings.Password;
            query["to"] = MobileHelper.CleanupMobileNo(toPerson);
            query["text"] = HttpUtility.UrlEncode(message);

            var url = $"https://api.clickatell.com/http/sendmsg?{query}";

            try
            {
                // Send the GET request
                var response = await httpClient.GetAsync(url);

                var responseContent = await response.Content.ReadAsStringAsync();

                if (response.IsSuccessStatusCode && responseContent.StartsWith("ID"))
                {
                    Console.WriteLine("SMS sent successfully!");
                    return true;
                }

                Console.WriteLine($"Failed to send SMS. Response: {responseContent}");
                return false;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"An error occurred: {ex.Message}");
                return false;
            }
        }

        public Task<bool> BroadcastAsync(string topicSubscribers, string subject, string message, List<EmailAttachment> attachments = null)
        {
            throw new NotImplementedException();
        }
    }
}
