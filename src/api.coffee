request = require 'request'
crypto = require 'crypto'
Q = require 'q'
dateFormat = require 'dateformat'

class Yuntongxun
  constructor: (@options) ->
    @rs = request.defaults
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
    sig.toUpperCase()
  _getAuthorization: (timestamp) ->
    buf = new Buffer "#{@options.accountSid}:#{timestamp}", 'utf8'
    buf.toString 'base64'
  voiceVerify: (mobile, token, displayNum = @options.displayNum, playTimes = 3) ->
    deferred = Q.defer()
    if not mobile or not token
      deferred.reject new Error 'mobile or token empty'
    else
      timestamp = dateFormat new Date(), 'yyyymmddHHMMss'
      authorization = @_getAuthorization timestamp
      sig = @_getSig timestamp
      opts =
        headers:
          authorization: authorization
        qs:
          sig: sig
        body:
          appId: @options.appId
          verifyCode: token
          to: mobile
          displayNum: displayNum
          playTimes: playTimes
      @rs.post '/Calls/VoiceVerify', opts, (err, response, body) ->
        if err
          deferred.reject err
          return
        if not body
          deferred.reject 'null response body'
          return
        if body.statusCode and body.statusCode is '000000'
          callSid = body.VoiceVerify && body.VoiceVerify.callSid
          deferred.resolve callSid
        else
          deferred.reject 'response invalid'
    deferred.promise

module.exports = Yuntongxun