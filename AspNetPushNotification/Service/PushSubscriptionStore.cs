using AspNetPushNotification.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AspNetPushNotification.Service
{
    public class PushSubscriptionStore
    {
        private List<PushSubscriptionNotification> _pushSubscription = new List<PushSubscriptionNotification>();

        public void DiscardSubscription(string endpoint)
        {
            PushSubscriptionNotification remove = _pushSubscription.FirstOrDefault(x => x.Endpoint == endpoint);
            if (remove != null)
                _pushSubscription.Remove(_pushSubscription.FirstOrDefault());
        }

        public async Task ForEachSubscriptionAsync(Func<PushSubscriptionNotification, Task> action)
        {
            var _tasks = new List<Task>(_pushSubscription.Count);
            foreach (var subscription in _pushSubscription)
                _tasks.Add(action(subscription));
            await Task.WhenAll(_tasks.ToArray());
        }

        public void StoreSubscription(PushSubscriptionNotification subscription)
        {
            if(!_pushSubscription.Any(x=>x.Endpoint == subscription.Endpoint))
                _pushSubscription.Add(subscription);
        }
    }
}
