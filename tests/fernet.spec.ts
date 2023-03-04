import { Fernet } from '../src/Fernet';

describe('Fernet', () => {
  const key = '1HPScCt9WzQ8nYhTUTCESeDzqxKxw_DkZdOb3qABiM0=';
  const text = 'hello world';

  it('should generate a valid key', () => {
    const generatedKey = Fernet.generateKey();
    expect(generatedKey).toMatch(/^[A-Za-z0-9\-_=]{44}$/);
  });

  it('should not generate same key twice', () => {
    const generatedKey1 = Fernet.generateKey();
    const generatedKey2 = Fernet.generateKey();
    expect(generatedKey1).not.toEqual(generatedKey2);
  });

  it('should check if key is valid', () => {
    expect(() => Fernet.checkKey('1HPScCt9WzQ8nYhTUTCESeDzqxKxw')).toThrow();
    expect(() => Fernet.checkKey('1HPScCt9WzQ8nYhTUTCESeDzqxKxw_DkZdOb3qABiM')).toThrow();
    expect(() => Fernet.checkKey('7sVRqeEHHTUM6T1dPfasQ46yP4YlJNepqXV5laAi6pU7JwvaJd6e7UYigtn35G8R2a0Bc4iCu0k')).toThrow();
    expect(() => Fernet.checkKey('1HPScCt9WzQ8nYhTUTCESeDzqxKxw_DkZdOb3qABiM0=')).not.toThrow();
  });

  it('should encrypt and decrypt the text', () => {
    const fernet = new Fernet(key);
    const token = fernet.encrypt(text);
    const decryptedText = fernet.decrypt(token);
    expect(decryptedText).toEqual(text);
  });

  it('should throw error when the key is invalid', () => {
    expect(() => new Fernet('1HPScCt9WzQ8nYhTUTCESeDzqxKxw_DkZdOb3qABiM')).toThrow();
  });

  it('should throw error when the token is invalid', () => {
    const fernet = new Fernet(key);
    const token = fernet.encrypt(text);
    expect(() => fernet.decrypt(token + 'invalid')).toThrow();
  });

  it('should throw error when the key is invalid when encrypting', () => {
    expect(() => Fernet.encrypt('Secret message', 'invalidkey')).toThrow();
  });

  it('should return a string', () => {
    expect(typeof Fernet.deriveKey('test')).toBe('string');
  });

  it('should return the correct key for input "hello world"', () => {
    const expected = 'uU0nuZNNPgilLlLX2n2r-sSE7-N6U4DukIj3rOLvzek=';
    expect(Fernet.deriveKey('hello world')).toBe(expected);
  });

  it('should return the correct key for input "12345"', () => {
    const expected = 'WZRHGrsBESr8wYFZ9sx0tPURuZgG2lmzyvWpwXPKz8U=';
    expect(Fernet.deriveKey('12345')).toBe(expected);
  });

  it('should throw an error if the Fernet token has invalid version', () => {
    const token = 'eQAAAABkAwa0zA9m4oxSb5lh76kT1vHYE3zaWcsmBQdKfvBVPgCwC9sI9g1LgLJ11O0Ks9MObalfQs_7V2wFqWJDCyt5Zn2h8g==';
    expect(() => Fernet.decrypt(token, key)).toThrow('Fernet version must be 0x80');
  });

  it('should throw an error if the Fernet token has invalid signature', () => {
    const fernet = new Fernet(key);
    const token = fernet.encrypt(text);
    const tokenBuffer = Buffer.from(token, 'base64url');
    tokenBuffer.writeUInt32BE(0, tokenBuffer.length - 32);
    let invalidSignatureToken = tokenBuffer.toString('base64url');
    expect(() => Fernet.decrypt(invalidSignatureToken, key)).toThrow('Invalid signature. Signature did not match digest.');
  });
});