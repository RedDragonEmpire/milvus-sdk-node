import { promisify } from '../utils/index';
import {
  datetimeToHybrids,
  hybridtsToUnixtime,
  unixtimeToHybridts,
  formatAddress,
  stringToBase64,
  parseToKeyValue,
  formatKeyValueData,
  formatNumberPrecision,
} from '../milvus/utils/Format';
import { ERROR_REASONS } from '../milvus/const/ErrorReason';

describe('Insert data Api', () => {
  it('Promisify should catch  obj[target] is not a function', async () => {
    let a = {};
    try {
      await promisify(a, 'a', {});
      expect('a').toEqual('b');
    } catch (error) {
      expect(error.message).toContain('obj[target] is not a function');
    }
  });

  it('Promisify should catch error', async () => {
    let a = {
      a: () => {
        throw new Error('123');
      },
    };
    try {
      await promisify(a, 'a', {});
      expect('a').toEqual('b');
    } catch (error) {
      expect(error.message).toContain('123');
    }
  });

  it('Promisify should reject', async () => {
    let a = {
      a: (params = {}, {}, callback = (err: any) => {}) => {
        callback('123');
      },
    };
    try {
      await promisify(a, 'a', {});
      expect('a').toEqual('b');
    } catch (error) {
      expect(error.message).toContain('123');
    }
  });

  it('hybridtsToUnixtime should success', async () => {
    let unixtime = hybridtsToUnixtime('429642767925248000');
    expect(unixtime).toEqual('1638957092');
  });

  it('hybridtsToUnixtime should throw error', async () => {
    try {
      hybridtsToUnixtime(1 as any);
    } catch (error) {
      expect(error.message).toContain(ERROR_REASONS.TIMESTAMP_PARAM_CHECK);
    }
  });

  it('unixtimeToHybridts should success', async () => {
    let unixtime = unixtimeToHybridts('1638957092');
    expect(unixtime).toEqual('429642767925248000');
  });

  it('unixtimeToHybridts should throw error', async () => {
    try {
      unixtimeToHybridts(1 as any);
    } catch (error) {
      expect(error.message).toContain(ERROR_REASONS.TIMESTAMP_PARAM_CHECK);
    }

    try {
      unixtimeToHybridts('asd');
    } catch (error) {
      expect(error.message).toContain(ERROR_REASONS.TIMESTAMP_PARAM_CHECK);
    }
  });

  it('datetimeToHybrids should success', async () => {
    let unixtime = datetimeToHybrids(new Date(1638957092 * 1000));
    expect(unixtime).toEqual('429642767925248000');
  });

  it('datetimeToHybrids should throw error', async () => {
    try {
      datetimeToHybrids(1 as any);
    } catch (error) {
      expect(error.message).toContain(ERROR_REASONS.DATE_TYPE_CHECK);
    }
  });

  it('all kinds of url should be supported', async () => {
    const port = `80980`;
    const urlWithHttps = `https://my-url:${port}`;
    expect(formatAddress(urlWithHttps)).toBe(`my-url:${port}`);

    const urlWithHttp = `https://my-url:${port}`;
    expect(formatAddress(urlWithHttp)).toBe(`my-url:${port}`);

    const urlWithoutHttp = `my-url`;
    expect(formatAddress(urlWithoutHttp)).toBe(`my-url:19530`);

    const urlWithoutHttpCustomPort = `my-url:12345`;
    expect(formatAddress(urlWithoutHttpCustomPort)).toBe(`my-url:12345`);

    const urlWithEmpty = `://my-url`;
    expect(formatAddress(urlWithEmpty)).toBe(`my-url:19530`);

    const urlWithEmptyCustomPort = `://my-url:12345`;
    expect(formatAddress(urlWithEmptyCustomPort)).toBe(`my-url:12345`);
  });

  it('should convert string to base64 encoding', () => {
    const testString = 'hello world, I love milvus';
    const str = stringToBase64(testString);
    expect(str.length % 4 == 0 && /^[A-Za-z0-9+/]+[=]{0,2}$/.test(str)).toBe(
      true
    );
  });

  it('should convert [{key:"row_count",value:4}] to {row_count:4}', () => {
    const testValue = [{ key: 'row_count', value: 4 }];
    const res = formatKeyValueData(testValue, ['row_count']);
    expect(res).toMatchObject({ row_count: 4 });
  });

  it('should convert  {row_count:4} t0 [{key:"row_count",value:4}]', () => {
    const testValue = { row_count: 4, b: 3 };
    const res = parseToKeyValue(testValue);
    expect(res).toMatchObject([
      { key: 'row_count', value: 4 },
      { key: 'b', value: 3 },
    ]);
  });

  it('should convert [{key:"row_count",value:4}] to {row_count:4}', () => {
    const testValue = 3.1231241241234124124;
    const res = formatNumberPrecision(testValue, 3);
    expect(res).toBe(3.123);
  });
});
