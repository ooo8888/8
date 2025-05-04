import {
  formatDate,
  formatBytes,
  formatDuration,
  truncateAddress,
  generateQRCode,
  calculateCreditCost
} from '../src/lib/utils';

describe('Utility Functions', () => {
  describe('formatDate', () => {
    it('formats date in human-readable format', () => {
      const date = new Date('2025-05-03T12:34:56.789Z');
      const formatted = formatDate(date);
      expect(formatted).toBe('May 3, 2025');
    });

    it('handles date string input', () => {
      const dateString = '2025-05-03T12:34:56.789Z';
      const formatted = formatDate(dateString);
      expect(formatted).toBe('May 3, 2025');
    });

    it('returns "Invalid date" for invalid input', () => {
      const formatted = formatDate('not-a-date');
      expect(formatted).toBe('Invalid date');
    });

    it('returns empty string for null or undefined input', () => {
      expect(formatDate(null)).toBe('');
      expect(formatDate(undefined)).toBe('');
    });
  });

  describe('formatBytes', () => {
    it('formats bytes in human-readable format', () => {
      expect(formatBytes(0)).toBe('0 Bytes');
      expect(formatBytes(1024)).toBe('1.0 KB');
      expect(formatBytes(1024 * 1024)).toBe('1.0 MB');
      expect(formatBytes(1024 * 1024 * 1024)).toBe('1.0 GB');
    });

    it('handles decimal precision', () => {
      expect(formatBytes(1536, 1)).toBe('1.5 KB');
      expect(formatBytes(1536, 2)).toBe('1.50 KB');
      expect(formatBytes(1536, 3)).toBe('1.500 KB');
    });

    it('returns "0 Bytes" for null or undefined input', () => {
      expect(formatBytes(null)).toBe('0 Bytes');
      expect(formatBytes(undefined)).toBe('0 Bytes');
    });
  });

  describe('formatDuration', () => {
    it('formats seconds into human-readable duration', () => {
      expect(formatDuration(30)).toBe('30 seconds');
      expect(formatDuration(60)).toBe('1 minute');
      expect(formatDuration(90)).toBe('1 minute, 30 seconds');
      expect(formatDuration(3600)).toBe('1 hour');
      expect(formatDuration(3660)).toBe('1 hour, 1 minute');
      expect(formatDuration(86400)).toBe('1 day');
      expect(formatDuration(90061)).toBe('1 day, 1 hour, 1 minute, 1 second');
    });

    it('handles plural forms correctly', () => {
      expect(formatDuration(1)).toBe('1 second');
      expect(formatDuration(2)).toBe('2 seconds');
      expect(formatDuration(60)).toBe('1 minute');
      expect(formatDuration(120)).toBe('2 minutes');
      expect(formatDuration(3600)).toBe('1 hour');
      expect(formatDuration(7200)).toBe('2 hours');
      expect(formatDuration(86400)).toBe('1 day');
      expect(formatDuration(172800)).toBe('2 days');
    });

    it('returns "0 seconds" for null or undefined input', () => {
      expect(formatDuration(null)).toBe('0 seconds');
      expect(formatDuration(undefined)).toBe('0 seconds');
    });
  });

  describe('truncateAddress', () => {
    it('truncates Ethereum address', () => {
      const address = '0x1234567890abcdef1234567890abcdef12345678';
      expect(truncateAddress(address)).toBe('0x1234...5678');
    });

    it('truncates Bitcoin address', () => {
      const address = 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh';
      expect(truncateAddress(address)).toBe('bc1qxy...x0wlh');
    });

    it('handles custom prefix and suffix lengths', () => {
      const address = '0x1234567890abcdef1234567890abcdef12345678';
      expect(truncateAddress(address, 6, 8)).toBe('0x1234...ef12345678');
    });

    it('returns original string if shorter than truncation length', () => {
      const address = '0x1234';
      expect(truncateAddress(address)).toBe('0x1234');
    });

    it('returns empty string for null or undefined input', () => {
      expect(truncateAddress(null)).toBe('');
      expect(truncateAddress(undefined)).toBe('');
    });
  });

  describe('generateQRCode', () => {
    it('generates QR code data URL', async () => {
      const url = 'http://localhost:12000/v/abcdef123456';
      const qrCode = await generateQRCode(url);
      
      // QR code should be a data URL
      expect(qrCode).toMatch(/^data:image\/png;base64,/);
    });

    it('handles empty input', async () => {
      const qrCode = await generateQRCode('');
      
      // Should still generate a QR code (though it will be empty)
      expect(qrCode).toMatch(/^data:image\/png;base64,/);
    });
  });

  describe('calculateCreditCost', () => {
    it('calculates credit cost for text link', () => {
      const options = {
        type: 'text',
        blockScreenshot: false,
        hasPassword: false,
        regionLock: null,
        deviceLock: false,
        camouflage: null
      };
      
      expect(calculateCreditCost(options)).toBe(1);
    });

    it('calculates credit cost for file link', () => {
      const options = {
        type: 'file',
        fileSize: 1024 * 1024, // 1 MB
        blockScreenshot: false,
        hasPassword: false,
        regionLock: null,
        deviceLock: false,
        camouflage: null
      };
      
      expect(calculateCreditCost(options)).toBe(3);
    });

    it('calculates credit cost for large file link', () => {
      const options = {
        type: 'file',
        fileSize: 10 * 1024 * 1024, // 10 MB
        blockScreenshot: false,
        hasPassword: false,
        regionLock: null,
        deviceLock: false,
        camouflage: null
      };
      
      expect(calculateCreditCost(options)).toBe(5);
    });

    it('adds cost for password protection', () => {
      const options = {
        type: 'text',
        blockScreenshot: false,
        hasPassword: true,
        regionLock: null,
        deviceLock: false,
        camouflage: null
      };
      
      expect(calculateCreditCost(options)).toBe(2); // 1 (base) + 1 (password)
    });

    it('adds cost for screenshot blocking', () => {
      const options = {
        type: 'text',
        blockScreenshot: true,
        hasPassword: false,
        regionLock: null,
        deviceLock: false,
        camouflage: null
      };
      
      expect(calculateCreditCost(options)).toBe(3); // 1 (base) + 2 (screenshot)
    });

    it('adds cost for region locking', () => {
      const options = {
        type: 'text',
        blockScreenshot: false,
        hasPassword: false,
        regionLock: ['US', 'CA'],
        deviceLock: false,
        camouflage: null
      };
      
      expect(calculateCreditCost(options)).toBe(3); // 1 (base) + 2 (region)
    });

    it('adds cost for device locking', () => {
      const options = {
        type: 'text',
        blockScreenshot: false,
        hasPassword: false,
        regionLock: null,
        deviceLock: true,
        camouflage: null
      };
      
      expect(calculateCreditCost(options)).toBe(3); // 1 (base) + 2 (device)
    });

    it('adds cost for camouflage', () => {
      const options = {
        type: 'text',
        blockScreenshot: false,
        hasPassword: false,
        regionLock: null,
        deviceLock: false,
        camouflage: 'google-doc'
      };
      
      expect(calculateCreditCost(options)).toBe(4); // 1 (base) + 3 (camouflage)
    });

    it('calculates combined cost for multiple options', () => {
      const options = {
        type: 'file',
        fileSize: 10 * 1024 * 1024, // 10 MB
        blockScreenshot: true,
        hasPassword: true,
        regionLock: ['US'],
        deviceLock: true,
        camouflage: 'google-doc'
      };
      
      // 5 (large file) + 2 (screenshot) + 1 (password) + 2 (region) + 2 (device) + 3 (camouflage)
      expect(calculateCreditCost(options)).toBe(15);
    });
  });
});