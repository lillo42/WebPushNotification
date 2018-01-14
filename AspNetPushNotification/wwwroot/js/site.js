// Write your JavaScript code.
'use strict';
const applicationServerPublicKey = 'BAyUSEMEUHRrgCqqnmP9tS1Nt2pHlRJPFIw-WoscUwECXS6eu04oPbshzIujJREL21VHbu6lb5v31-KgYN3oB-A';

const pushButton = document.querySelector('.js-push-btn');

let isSubscribed = false;
let swRegistration = null;

function urlB64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

function updateBtn() {
    if (Notification.permission === 'denied') {
        pushButton.textContent = 'Push Messaging Blocked.';
        pushButton.disabled = true;
        updateSubscriptionOnServer(null);
        return;
    }

    if (isSubscribed) {
        pushButton.textContent = 'Disable Push Messaging';
    } else {
        pushButton.textContent = 'Enable Push Messaging';
    }

    pushButton.disabled = false;
}

function updateSubscriptionOnServer(subscription) {
    // TODO: Send subscription to application server

    const subscriptionJson = document.querySelector('.js-subscription-json');
    const subscriptionDetails =
        document.querySelector('.js-subscription-details');

    if (subscription) {
        subscriptionJson.textContent = JSON.stringify(subscription);
        subscriptionDetails.classList.remove('is-invisible');
        fetch('api/PushNotifications/subscriptions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(subscription)
        }).then(function (response) {
                if (response.ok) {
                    console.log('Successfully subscribed for Push Notifications');
                } else {
                    console.log('Failed to store the Push Notifications subscription on server');
                }
            }).catch(function (error) {
                console.log('Failed to store the Push Notifications subscription on server: ' + error);
            });
        //$.ajax({
        //    type: 'POST',
        //    dataType: 'json',
        //    contentType: 'application/json',
        //    data: subscription,
        //    method: 'POST',
        //    url: '/api/PushNotifications/subscriptions',
        //    success: function (data) {
        //        console.log(data);
        //    },
        //    error: function (error) {
        //        console.log(error);
        //    }
        //})
    } else {
        subscriptionDetails.classList.add('is-invisible');
    }
}

function subscribeUser() {
    const applicationServerKey = urlB64ToUint8Array(applicationServerPublicKey);
    swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey
    })
        .then(function (subscription) {
            console.log('User is subscribed.');

            updateSubscriptionOnServer(subscription);

            isSubscribed = true;

            updateBtn();
        })
        .catch(function (err) {
            console.log('Failed to subscribe the user: ', err);
            updateBtn();
        });
}

function unsubscribeUser() {
    swRegistration.pushManager.getSubscription()
        .then(function (subscription) {
            if (subscription) {
                fetch('api/PushNotifications/subscriptions?endpoint=' + subscription.endpoint, {
                    method: 'DELETE',
                }).then(function (response) {
                    if (response.ok) {
                        console.log('Successfully unsubscribed for Push Notifications');
                    } else {
                        console.log('Failed to store the Push Notifications unsubscribed on server');
                    }
                }).catch(function (error) {
                    console.log('Failed to store the Push Notifications unsubscribed on server: ' + error);
                });
                return subscription.unsubscribe();
            }
        })
        .catch(function (error) {
            console.log('Error unsubscribing', error);
        })
        .then(function () {
            updateSubscriptionOnServer(null);

            console.log('User is unsubscribed.');
            isSubscribed = false;

            updateBtn();
        });
}

function initializeUI() {
    pushButton.addEventListener('click', function () {
        pushButton.disabled = true;
        if (isSubscribed) {
            unsubscribeUser();
        } else {
            subscribeUser();
        }
    });

    // Set the initial subscription value
    swRegistration.pushManager.getSubscription()
        .then(function (subscription) {
            isSubscribed = !(subscription === null);

            updateSubscriptionOnServer(subscription);

            if (isSubscribed) {
                console.log('User IS subscribed.');
            } else {
                console.log('User is NOT subscribed.');
            }

            updateBtn();
        });
}

if ('serviceWorker' in navigator && 'PushManager' in window) {
    console.log('Service Worker and Push is supported');

    navigator.serviceWorker.register('js/service.js')
        .then(function (swReg) {
            console.log('Service Worker is registered', swReg);

            swRegistration = swReg;
            initializeUI();
        })
        .catch(function (error) {
            console.error('Service Worker Error', error);
        });
} else {
    console.warn('Push messaging is not supported');
    pushButton.textContent = 'Push Not Supported';
}


$(document).ready(function () {
    $("#sendMessage").click(function () {
        $.get('api/PushNotifications/message?data=' + $("#txtMensagem").val());
    });
});