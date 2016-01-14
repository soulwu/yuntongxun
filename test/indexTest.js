import {expect} from 'chai';
import Yuntongxun from '../src/index';

describe('yuntongxun', () => {
  describe('init with default options', () => {
    const instance = new Yuntongxun();
    it('should set urlPrefix to default value', () => {
      expect(instance.options.urlPrefix).to.equal(Yuntongxun.defaultOptions.urlPrefix);
    });
    it('should set version to default value', () => {
      expect(instance.options.version).to.equal(Yuntongxun.defaultOptions.version);
    });
    it('should set logger to default value', () => {
      expect(instance.options.logger).to.equal(Yuntongxun.defaultOptions.logger);
    });
  });
});
