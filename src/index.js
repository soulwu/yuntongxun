import crypto from 'crypto';
import request from 'request';
import dateformat from 'dateformat';
import defaults from 'lodash/defaults';
import noop from 'lodash/noop';

class Yuntongxun {
  static defaultOptions = {
    urlPrefix: 'https://app.cloopen.com:8883',
    version: '2013-12-26',
    logger: noop
  };

  constructor(options) {
    this.options = defaults({}, options, Yuntongxun.defaultOptions);

    this.rs = request.defaults({
      baseUrl: `${this.options.urlPrefix}/${this.options.version}/Accounts/${this.options.accountSid}`,
      strictSSL: false,
      timeout: this.options.timeout,
      proxy: this.options.proxy,
      headers: {
        accept: 'application/json'
      },
      json: true,
      time: true
    });
  }

  _getSig(timestamp) {
    const md5sum = crypto.createHash('md5');
    md5sum.update(`${this.options.accountSid}${this.options.authToken}${timestamp}`, 'utf8');
    let sig = md5sum.digest('hex');
    sig = sig.toUpperCase();
    if (this.options.debug) {
      this.options.logger(`sig: ${sig}`);
    }

    return sig;
  }

  _getAuthorization(timestamp) {
    const buf = new Buffer(`${this.options.accountSid}:${timestamp}`, 'utf8');
    const authorization = buf.toString('base64');
    if (this.options.debug) {
      this.options.logger(`authorization: ${authorization}`);
    }

    return authorization;
  }

  _request(url, body) {
    const timestamp = dateformat(new Date(), 'yyyymmddHHMMss');
    const authorization = this._getAuthorization(timestamp);
    const sig = this._getSig(timestamp);
    const opts = {
      headers: {
        authorization
      },
      qs: {
        sig
      },
      body
    };

    if (this.options.debug) {
      this.options.logger(`opts: ${JSON.stringify(opts)}`);
    }

    return new Promise((resolve, reject) => {
      this.rs.post(url, opts, (err, message, body) => {
        if (err) {
          this.options.logger(`Request failed. err[${err}]`);
          reject(err);
          return;
        }
        if (!body) {
          this.options.logger(`Request err. statusCode[${message.statusCode}] statusMessage[${message.statusMessage}]`);
          reject('null response body');
          return;
        }
        resolve(body);
      }).on('complete', (response) => {
        this.options.logger(`Request complete. elapsedTime[${response.elapsedTime}]`);
      });
    });
  }

  voiceVerify(to, verifyCode, displayNum = '', playTimes = 3) {
    if (!to || !verifyCode) {
      return Promise.reject('mobile or token empty');
    }

    return this._request('/Calls/VoiceVerify', {
      appId: this.options.appId,
      verifyCode,
      to,
      displayNum,
      playTimes
    }).then((body) => {
      if (body.statusCode !== '000000') {
        this.options.logger(`Request voiceVerify err. body[${JSON.stringify(body)}]`);
        throw new Error('response invalid');
      }
      const callSid = body.VoiceVerify && body.VoiceVerify.callSid;
      this.options.logger(`Request voiceVerify succ. callSid[${callSid}]`);
      return callSid;
    });
  }

  templateSms(to, templateId, datas = []) {
    if (!to || !templateId) {
      return Promise.reject('mobile or templateId empty');
    }
    return this._request('/SMS/TemplateSMS', {
      appId: this.options.appId,
      to,
      templateId,
      datas
    }).then((body) => {
      if (body.statusCode !== '000000') {
        this.options.logger(`Request templateSms err. body[${JSON.stringify(body)}]`);
        throw new Error('response invalid');
      }
      const smsMessageSid = body.TemplateSMS && body.TemplateSMS.smsMessageSid;
      this.options.logger(`Request templateSms succ. smsMessageSid[${smsMessageSid}]`);
      return smsMessageSid;
    });
  }
}

export default Yuntongxun;
