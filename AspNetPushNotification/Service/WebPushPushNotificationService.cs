using AspNetPushNotification.Models;
using Microsoft.Extensions.Options;
using System.Threading.Tasks;
using WebPush;

namespace AspNetPushNotification.Service
{
    public class WebPushPushNotificationService
    {
        private readonly PushNotificationServiceOptions _options;
        private readonly WebPushClient _pushClient;

        public WebPushPushNotificationService(IOptions<PushNotificationServiceOptions> options)
        {
            _options = options.Value;

            _pushClient = new WebPushClient();
            _pushClient.SetVapidDetails(_options.Subject, _options.PublicKey, _options.PrivateKey);
        }

        public async Task SendNotificationAsync(PushSubscriptionNotification subscription, string payload)
        {
            var webPushSubscription = new PushSubscription(
                subscription.Endpoint, 
                subscription.Keys["p256dh"],
                subscription.Keys["auth"]);

            await _pushClient.SendNotificationAsync(webPushSubscription, payload);
        }

    }
}
