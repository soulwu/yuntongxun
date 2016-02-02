import crypto from 'crypto';
import request from 'request';
import Q from 'q';
import dateFormat from 'dateformat';
import defaults from 'lodash/object/defaults';
import noop from 'lodash/utility/noop';

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
      this.options.logger(`sig[${sig}]`);
    }

    return sig;
  }

  _getAuthorization(timestamp) {
    const buf = new Buffer(`${this.options.accountSid}:${timestamp}`, 'utf8');
    const authorization = buf.toString('base64');
    if (this.options.debug) {
      this.options.logger(`authorization[${authorization}]`);
    }

    return authorization;
  }

  _request(url, body) {
    const deferred = Q.defer();
    const timestamp = dateFormat(new Date(), 'yyyymmddHHMMss');
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
      this.options.logger(`opts[${JSON.stringify(opts)}]`);
    }
    this.rs.post(url, opts, (err, response, responseBody) => {
      if (err) {
        this.options.logger(`Request failed. err[${err}]`);
        return deferred.reject(err);
      }
      if (!responseBody) {
        this.options.logger(`Request err. statusCode[${response.statusCode}] statusMessage[${response.statusMessage}]`);
        return deferred.reject('null response body');
      }
      return deferred.resolve(responseBody);
    }).on('complete', (response) => {
      this.options.logger(`Request complete. elapsedTime[${response.elapsedTime}]`);
    });

    return deferred.promise;
  }

  voiceVerify(to, verifyCode, displayNum = '', playTimes = 3) {
    const deferred = Q.defer();

    if (!to || !verifyCode) {
      return deferred.reject('mobile or token empty');
    }
    this._request('/Calls/VoiceVerify', {
      appId: this.options.appId,
      verifyCode,
      to,
      displayNum,
      playTimes
    }).then((body) => {
      if (body.statusCode === '000000') {
        const callSid = body.VoiceVerify && body.VoiceVerify.callSid;
        this.options.logger(`Request voiceVerify succ. callSid[${callSid}]`);
        deferred.resolve(callSid);
      } else {
        this.options.logger(`Request voiceVerify err. body[${JSON.stringify(body)}]`);
        deferred.reject('response invalid');
      }
    }, (err) => {
      deferred.reject(err);
    });

    return deferred.promise;
  }

  templateSms(to, templateId, datas = []) {
    const deferred = Q.defer();

    if (!to || !templateId) {
      return deferred.reject('mobile or templateId empty');
    }
    this._request('/SMS/TemplateSMS', {
      appId: this.options.appId,
      to,
      templateId,
      datas
    }).then((body) => {
      if (body.statusCode === '000000') {
        const smsMessageSid = body.TemplateSMS && body.TemplateSMS.smsMessageSid;
        this.options.logger(`Request templateSms succ. smsMessageSid[${smsMessageSid}]`);
        deferred.resolve(smsMessageSid);
      } else {
        this.options.logger(`Request templateSms err. body[${JSON.stringify(body)}]`);
        deferred.reject('response invalid');
      }
    }, (err) => {
      deferred.reject(err);
    });

    return deferred.promise;
  }
}

export default Yuntongxun;
