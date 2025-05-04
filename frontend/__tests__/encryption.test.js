import { encrypt, decrypt } from '../src/lib/encryption';

describe('Encryption Utilities', () => {
  it('encrypts and decrypts text with a password', async () => {
    const text = 'This is a secret message';
    const password = 'secret123';
    
    // Encrypt the text
    const encrypted = await encrypt(text, password);
    
    // Verify the encrypted text is different from the original
    expect(encrypted).not.toBe(text);
    
    // Decrypt the text
    const decrypted = await decrypt(encrypted, password);
    
    // Verify the decrypted text matches the original
    expect(decrypted).toBe(text);
  });

  it('encrypts and decrypts text without a password', async () => {
    const text = 'This is a secret message';
    
    // Encrypt the text
    const encrypted = await encrypt(text);
    
    // Verify the encrypted text is different from the original
    expect(encrypted).not.toBe(text);
    
    // Decrypt the text
    const decrypted = await decrypt(encrypted);
    
    // Verify the decrypted text matches the original
    expect(decrypted).toBe(text);
  });

  it('fails to decrypt with wrong password', async () => {
    const text = 'This is a secret message';
    const password = 'secret123';
    const wrongPassword = 'wrong123';
    
    // Encrypt the text
    const encrypted = await encrypt(text, password);
    
    // Attempt to decrypt with wrong password
    await expect(decrypt(encrypted, wrongPassword)).rejects.toThrow();
  });

  it('encrypts and decrypts binary data', async () => {
    // Create a binary array
    const binaryData = new Uint8Array([1, 2, 3, 4, 5]);
    const password = 'secret123';
    
    // Encrypt the binary data
    const encrypted = await encrypt(binaryData, password);
    
    // Verify the encrypted data is different from the original
    expect(encrypted).not.toEqual(binaryData);
    
    // Decrypt the data
    const decrypted = await decrypt(encrypted, password);
    
    // Convert decrypted data back to Uint8Array for comparison
    const decryptedArray = new Uint8Array(decrypted.split('').map(c => c.charCodeAt(0)));
    
    // Verify the decrypted data matches the original
    expect(Array.from(decryptedArray.slice(0, 5))).toEqual([1, 2, 3, 4, 5]);
  });

  it('handles empty input', async () => {
    const text = '';
    const password = 'secret123';
    
    // Encrypt the empty text
    const encrypted = await encrypt(text, password);
    
    // Decrypt the text
    const decrypted = await decrypt(encrypted, password);
    
    // Verify the decrypted text is empty
    expect(decrypted).toBe('');
  });

  it('handles special characters', async () => {
    const text = '!@#$%^&*()_+{}|:"<>?~`-=[]\\;\',./';
    const password = 'secret123';
    
    // Encrypt the text
    const encrypted = await encrypt(text, password);
    
    // Decrypt the text
    const decrypted = await decrypt(encrypted, password);
    
    // Verify the decrypted text matches the original
    expect(decrypted).toBe(text);
  });

  it('handles unicode characters', async () => {
    const text = '你好，世界！こんにちは、世界！안녕하세요, 세계!';
    const password = 'secret123';
    
    // Encrypt the text
    const encrypted = await encrypt(text, password);
    
    // Decrypt the text
    const decrypted = await decrypt(encrypted, password);
    
    // Verify the decrypted text matches the original
    expect(decrypted).toBe(text);
  });

  it('produces different ciphertexts for the same input', async () => {
    const text = 'This is a secret message';
    const password = 'secret123';
    
    // Encrypt the text twice
    const encrypted1 = await encrypt(text, password);
    const encrypted2 = await encrypt(text, password);
    
    // Verify the encrypted texts are different (due to random IV)
    expect(encrypted1).not.toBe(encrypted2);
    
    // Decrypt both encrypted texts
    const decrypted1 = await decrypt(encrypted1, password);
    const decrypted2 = await decrypt(encrypted2, password);
    
    // Verify both decrypted texts match the original
    expect(decrypted1).toBe(text);
    expect(decrypted2).toBe(text);
  });
});