using AspNetPushNotification.Models;
using AspNetPushNotification.Service;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace AspNetPushNotification.Controllers
{
    [Route("api/[controller]")]
    public class PushNotificationsController : Controller
    {
        private readonly PushSubscriptionStore _subscriptionStore;
        private readonly WebPushPushNotificationService _notificationService;

        public PushNotificationsController(PushSubscriptionStore subscriptionStore, WebPushPushNotificationService notificationService)
        {
            _subscriptionStore = subscriptionStore ?? throw new ArgumentNullException(nameof(subscriptionStore));
            _notificationService = notificationService ?? throw new ArgumentNullException(nameof(notificationService));
        }

        [HttpPost("subscriptions")]
        public IActionResult StoreSubscription([FromBody]PushSubscriptionNotification subscription)
        {
            _subscriptionStore.StoreSubscription(subscription);
            return Ok();
        }

        [HttpGet("message")]
        public async ValueTask<IActionResult> SendMessageAsync([FromQuery]string data)
        {
            await _subscriptionStore.ForEachSubscriptionAsync(async x => {
                 await _notificationService.SendNotificationAsync(x, data);
            });
            return Ok();
        }

        // DELETE push-notifications-api/subscriptions?endpoint={endpoint}
        [HttpDelete("subscriptions")]
        public IActionResult DiscardSubscription([FromQuery]string endpoint)
        {
            _subscriptionStore.DiscardSubscription(endpoint);

            return Ok();
        }
    }
}
