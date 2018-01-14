using System.Collections.Generic;

namespace AspNetPushNotification.Models
{
    public class PushSubscriptionNotification
    {
        public string Endpoint { get; set; }
        public IDictionary<string,string> Keys { get; set; }
    }
}
