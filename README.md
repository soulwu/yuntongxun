# yuntongxun
Node.js SDK for yuntongxun RestAPI.

Examples
--------

``` js
var Yuntongxun = require('yuntongxun-sdk');

var yuntongxun = new Yuntongxun({
	urlPrefix: 'https://app.cloopen.com:8883',
	version: '2013-12-26',
	accountSid: '<Your accountSid>',
	authToken: '<Your authToken>',
	appId: '<Your appId>'
});

yuntongxun.voiceVerify('13700000000', '123456').then(function(callSid) {
	console.log(callSid);
}, function(err) {
	console.error(err);
});
```

Installation
------------

``` bash
$ npm install yuntongxun-sdk
```


Todo List
---------

1. [x] To implement TemplateSMS interface.
2. [ ] To implement other Rest API interface.


ChangeLog
---------
[Change Log](CHANGELOG.md)

License
-------

MIT License. See the [`LICENSE`](LICENSE) file.


