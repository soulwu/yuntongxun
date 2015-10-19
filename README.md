# yuntongxun
Node.js SDK for yuntongxun RestAPI.

[![Build Status](https://travis-ci.org/soulwu/yuntongxun.svg?branch=master)](https://travis-ci.org/soulwu/yuntongxun)

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


Documents
---------
[Official Rest API document](http://docs.yuntongxun.com/index.php/Rest%E4%BB%8B%E7%BB%8D)

### Table of Contents
- [Class: Yuntongxun](#class-yuntongxun)
    - [new Yuntongxun(options)](#new-yuntongxunoptions)
    - [yuntongxun.voiceVerify(mobile, token[, displayNum, playTimes])](#yuntongxunvoiceverifymobile-token-displaynum-playtimes)
    - [yuntongxun.templateSms(mobile, templateId[, datas])](#yuntongxuntemplatesmsmobile-templateid-datas)

### Class: Yuntongxun
This class is a wrapper for yuntongxun Rest API

#### new Yuntongxun(options)
Construct a new yuntongxun object

`options` is an object with the following defaults:

``` js
{
    urlPrefix: 'https://app.cloopen.com:8883',
    version: '2013-12-26',
    useSubAccount: false,
    debug: false,
    logger: false
}
```

`options`'s property list as below:

| Name          | type     | Description                             | Requirement |
| ------------- | -------- | --------------------------------------- | ----------- |
| urlPrefix     | string   | Base url without version                | optional    |
| version       | string   | API version                             | optional    |
| accountSid    | string   | The accountSid or subAccountSid         | required    |
| authToken     | string   | The account auth token                  | required    |
| appId         | string   | The app id                              | required    |
| useSubAccount | bool     | Whether use subAccountSid or accountSid | optional    |
| debug         | bool     | Debug toggle                            | optional    |
| logger        | function | A logger handler                        | optional    |
| proxy         | string   | Proxy for someone behind a firewall     | optional    |
| timeout       | integer  | Timeout for request                     | optional    |

`logger` function accept only one argument `msg` like

``` js
function(msg) {
    // do some thing...
}
```

| Name | type   | Description | Requirement |
| ---- | ------ | ----------- | ----------- |
| msg  | string | Log message | optional    |

#### yuntongxun.voiceVerify(mobile, token[, displayNum, playTimes])
Send Voice Verify `token` to `mobile` with CID `displayNum` and repeat `playTimes` times

| Name       | type     | Description                           | Requirement |
| ---------- | -------- | ------------------------------------- | ----------- |
| mobile     | string   | User's mobile to receive voice verify | required    |
| token      | string   | Token played                          | required    |
| displayNum | string   | CID                                   | optional    |
| playTimes  | integer  | Repeat play times                     | optional    |

#### yuntongxun.templateSms(mobile, templateId[, datas])
Send Template SMS identified by `templateId` to `mobile` with template data `datas`

| Name       | type     | Description                                        | Requirement |
| ---------- | -------- | -------------------------------------------------- | ----------- |
| mobile     | string   | User's mobile to receive template SMS              | required    |
| templateId | integer  | Template ID applied from yuntongxun admin          | required    |
| datas      | array    | Template data corresponding to template definition | optional    |


Todo List
---------
 - [ ] To implement other Rest API interface.


ChangeLog
---------
[Change Log](CHANGELOG.md)

License
-------

MIT License. See the [`LICENSE`](LICENSE) file.


