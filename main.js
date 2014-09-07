var token = chrome.cookies.get("token");
if(!token)
{
	var notification = webkitNotifications.createNotification(
	  '48.png',  // icon url - can be relative
	  'Hello!',  // notification title
	  'Lorem ipsum...'  // notification body text
	);

}