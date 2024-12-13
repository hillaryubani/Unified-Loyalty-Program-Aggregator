import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock contract state
let tokenBalances: { [key: string]: number } = {};
let totalSupply = 0;
let tokenUri = 'https://example.com/loyalty-token-metadata';

// Mock contract functions
const mockContractCall = vi.fn((functionName: string, args: any[], sender: string) => {
  switch (functionName) {
    case 'mint':
      if (sender !== contractOwner) return { success: false, error: 100 };
      const [amount, recipient] = args;
      tokenBalances[recipient] = (tokenBalances[recipient] || 0) + amount;
      totalSupply += amount;
      return { success: true };
    case 'transfer':
      const [transferAmount, from, to] = args;
      if (tokenBalances[from] < transferAmount) return { success: false };
      tokenBalances[from] -= transferAmount;
      tokenBalances[to] = (tokenBalances[to] || 0) + transferAmount;
      return { success: true };
    case 'get-balance':
      const [account] = args;
      return { success: true, value: tokenBalances[account] || 0 };
    case 'get-total-supply':
      return { success: true, value: totalSupply };
    case 'get-token-uri':
      return { success: true, value: tokenUri };
    case 'set-token-uri':
      if (sender !== contractOwner) return { success: false, error: 100 };
      tokenUri = args[0];
      return { success: true };
    default:
      return { success: false, error: 'Unknown function' };
  }
});

describe('Loyalty Token Contract', () => {
  const contractOwner = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
  const user1 = 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG';
  const user2 = 'ST3AM1A56AK2C1XAFJ4115ZSV26EB49BVQ10MGCS0';
  
  beforeEach(() => {
    tokenBalances = {};
    totalSupply = 0;
    tokenUri = 'https://example.com/loyalty-token-metadata';
    mockContractCall.mockClear();
  });
  
  describe('mint', () => {
    it('should mint tokens when called by contract owner', () => {
      const result = mockContractCall('mint', [1000, user1], contractOwner);
      expect(result.success).toBe(true);
    });
    
    it('should fail when called by non-owner', () => {
      const result = mockContractCall('mint', [1000, user1], user1);
      expect(result.success).toBe(false);
      expect(result.error).toBe(100); // err-owner-only
    });
  });
  
  describe('transfer', () => {
    it('should transfer tokens between users', () => {
      mockContractCall('mint', [1000, user1], contractOwner);
      const result = mockContractCall('transfer', [500, user1, user2], user1);
      expect(result.success).toBe(true);
    });
    
    it('should fail when sender has insufficient balance', () => {
      mockContractCall('mint', [1000, user1], contractOwner);
      const result = mockContractCall('transfer', [1500, user1, user2], user1);
      expect(result.success).toBe(false);
    });
  });
  
  describe('get-balance', () => {
    it('should return correct balance for a user', () => {
      mockContractCall('mint', [1000, user1], contractOwner);
      const result = mockContractCall('get-balance', [user1]);
      expect(result.success).toBe(true);
      expect(result.value).toBe(1000);
    });
  });
  
  describe('get-total-supply', () => {
    it('should return correct total supply', () => {
      mockContractCall('mint', [1000, user1], contractOwner);
      mockContractCall('mint', [500, user2], contractOwner);
      const result = mockContractCall('get-total-supply', []);
      expect(result.success).toBe(true);
      expect(result.value).toBe(1500);
    });
  });
  
  describe('get-token-uri', () => {
    it('should return the token URI', () => {
      const result = mockContractCall('get-token-uri', []);
      expect(result.success).toBe(true);
      expect(result.value).toBe('https://example.com/loyalty-token-metadata');
    });
  });
  
  describe('set-token-uri', () => {
    it('should update the token URI when called by contract owner', () => {
      const newUri = 'https://newexample.com/loyalty-token-metadata';
      const result = mockContractCall('set-token-uri', [newUri], contractOwner);
      expect(result.success).toBe(true);
      
      const getUriResult = mockContractCall('get-token-uri', []);
      expect(getUriResult.success).toBe(true);
      expect(getUriResult.value).toBe(newUri);
    });
    
    it('should fail when called by non-owner', () => {
      const newUri = 'https://newexample.com/loyalty-token-metadata';
      const result = mockContractCall('set-token-uri', [newUri], user1);
      expect(result.success).toBe(false);
      expect(result.error).toBe(100); // err-owner-only
    });
  });
});

