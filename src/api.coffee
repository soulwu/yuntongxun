request = require 'request'
crypto = require 'crypto'
Q = require 'q'
dateFormat = require 'dateformat'
_ = require 'lodash'

class Yuntongxun
  @defaultOptions:
    urlPrefix: 'https://app.cloopen.com:8883'
    version: '2013-12-26'
    accountSid: ''
    authToken: ''
    appId: ''
  constructor: (@options) ->
    _.defaults @options, Yuntongxun.defaultOptions
    if @options.logger
      @_logger = @options.logger
      delete @options.logger
    else if @options.debug
      @_logger = console.log.bind console
    else
      @_logger = _.noop
    @_rs = request.defaults
      baseUrl: "#{@options.urlPrefix}/#{@options.version}/Accounts/#{@options.accountSid}"
      strictSSL: false
      timeout: @options.timeout
      proxy: @options.proxy
      headers:
        accept: 'application/json'
      json: true
      time: true
  _getSig: (timestamp) ->
    md5sum = crypto.createHash 'md5'
    md5sum.update "#{@options.accountSid}#{@options.authToken}#{timestamp}", 'utf8'
    sig = md5sum.digest 'hex'
    sig = sig.toUpperCase()
    if @options.debug
      @_logger "sig: #{sig}"
    sig
  _getAuthorization: (timestamp) ->
    buf = new Buffer "#{@options.accountSid}:#{timestamp}", 'utf8'
    authorization = buf.toString 'base64'
    if @options.debug
      @_logger "authorization: #{authorization}"
    authorization
  voiceVerify: (mobile, token, displayNum = '', playTimes = 3) ->
    deferred = Q.defer()
    if not mobile or not token
      deferred.reject 'mobile or token empty'
    else
      timestamp = dateFormat new Date(), 'yyyymmddHHMMss'
      opts =
        headers:
          authorization: @_getAuthorization timestamp
        qs:
          sig: @_getSig timestamp
        body:
          appId: @options.appId
          verifyCode: token
          to: mobile
          displayNum: displayNum
          playTimes: playTimes
      if @options.debug
        @_logger "opts: #{JSON.stringify opts}"
      @_rs.post '/Calls/VoiceVerify', opts, (err, response, body) =>
        if err
          @_logger "Request voiceVerify failed. err[#{err}]"
          deferred.reject err
          return
        if not body
          @_logger "Request voiceVerify err. statusCode[#{response.statusCode}] statusMessage[#{response.statusMessage}]"
          deferred.reject 'null response body'
          return
        if body.statusCode and body.statusCode is '000000'
          callSid = body.VoiceVerify && body.VoiceVerify.callSid
          @_logger "Request voiceVerify succ. callSid[#{callSid}]"
          deferred.resolve callSid
        else
          @_logger "Request voiceVerify err. body[#{JSON.stringify body}]"
          deferred.reject 'response invalid'
      .on 'complete', (response) =>
        @_logger "Request complete. elapsedTime[#{response.elapsedTime}]"
    deferred.promise
  templateSms: (mobile, templateId, datas = []) ->
    deferred = Q.defer()
    if not mobile or not templateId
      deferred.reject 'mobile or templateId empty'
    else
      timestamp = dateFormat new Date(), 'yyyymmddHHMMss'
      opts =
        headers:
          authorization: @_getAuthorization timestamp
        qs:
          sig: @_getSig timestamp
        body:
          appId: @options.appId
          to: mobile
          templateId: templateId
          datas: datas
      if @options.debug
        @_logger "opts: #{JSON.stringfy opts}"
      @_rs.post '/SMS/TemplateSMS', opts, (err, response, body) =>
        if err
          @_logger "Request templateSms failed. err[#{err}]"
          deferred.reject err
          return
        if not body
          @_logger "Request templateSms err. statusCode[#{response.statusCode}] statusMessage[#{response.statusMessage}]"
          deferred.reject 'null response body'
          return
        if body.statusCode and body.statusCode is '000000'
          smsMessageSid = body.TemplateSMS && body.TemplateSMS.smsMessageSid
          @_logger "Request templateSms succ. smsMessageSid[#{smsMessageSid}]"
          deferred.resolve smsMessageSid
        else
          @_logger "Request voiceVerify err. body[#{JSON.stringify body}]"
          deferred.reject 'response invalid'
      .on 'complete', (response) =>
        @_logger "Request complete. elapsedTime[#{response.elapsedTime}]"
    deferred.promise

module.exports = Yuntongxun