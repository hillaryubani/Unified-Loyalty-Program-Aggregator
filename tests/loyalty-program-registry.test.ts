import { describe, it, expect, beforeEach, vi } from 'vitest';

const contractOwner = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';

// Mock contract state
let loyaltyPrograms: { [key: number]: any } = {};
let nextProgramId = 1;

// Mock contract functions
const mockContractCall = vi.fn((functionName: string, args: any[], sender: string) => {
  switch (functionName) {
    case 'register-program':
      if (sender !== contractOwner) return { success: false, error: 100 };
      const [name, tokenContract, exchangeRate] = args;
      const programId = nextProgramId++;
      loyaltyPrograms[programId] = { name, token_contract: tokenContract, exchange_rate: exchangeRate };
      return { success: true, value: programId };
    case 'update-exchange-rate':
      if (sender !== contractOwner) return { success: false, error: 100 };
      const [id, newRate] = args;
      if (!loyaltyPrograms[id]) return { success: false, error: 101 };
      loyaltyPrograms[id].exchange_rate = newRate;
      return { success: true };
    case 'get-program':
      const [getProgramId] = args;
      if (!loyaltyPrograms[getProgramId]) return { success: false, error: 101 };
      return { success: true, value: loyaltyPrograms[getProgramId] };
    case 'get-exchange-rate':
      const [getExchangeRateId] = args;
      if (!loyaltyPrograms[getExchangeRateId]) return { success: false, error: 101 };
      return { success: true, value: loyaltyPrograms[getExchangeRateId].exchange_rate };
    default:
      return { success: false, error: 'Unknown function' };
  }
});

describe('Loyalty Program Registry Contract', () => {
  const user = 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG';
  const tokenContract = 'ST3AM1A56AK2C1XAFJ4115ZSV26EB49BVQ10MGCS0.loyalty-token';
  
  beforeEach(() => {
    loyaltyPrograms = {};
    nextProgramId = 1;
    mockContractCall.mockClear();
  });
  
  describe('register-program', () => {
    it('should register a new loyalty program when called by contract owner', () => {
      const result = mockContractCall('register-program', ['Airline Miles', tokenContract, 100], contractOwner);
      expect(result.success).toBe(true);
      expect(result.value).toBe(1);
    });
    
    it('should fail when called by non-owner', () => {
      const result = mockContractCall('register-program', ['Hotel Points', tokenContract, 200], user);
      expect(result.success).toBe(false);
      expect(result.error).toBe(100); // err-owner-only
    });
  });
  
  describe('update-exchange-rate', () => {
    it('should update the exchange rate for an existing program when called by contract owner', () => {
      mockContractCall('register-program', ['Airline Miles', tokenContract, 100], contractOwner);
      const result = mockContractCall('update-exchange-rate', [1, 150], contractOwner);
      expect(result.success).toBe(true);
    });
    
    it('should fail when called by non-owner', () => {
      mockContractCall('register-program', ['Airline Miles', tokenContract, 100], contractOwner);
      const result = mockContractCall('update-exchange-rate', [1, 150], user);
      expect(result.success).toBe(false);
      expect(result.error).toBe(100); // err-owner-only
    });
    
    it('should fail for non-existent program', () => {
      const result = mockContractCall('update-exchange-rate', [999, 150], contractOwner);
      expect(result.success).toBe(false);
      expect(result.error).toBe(101); // err-not-found
    });
  });
  
  describe('get-program', () => {
    it('should return program details for an existing program', () => {
      mockContractCall('register-program', ['Airline Miles', tokenContract, 100], contractOwner);
      const result = mockContractCall('get-program', [1]);
      expect(result.success).toBe(true);
      expect(result.value).toEqual({
        name: 'Airline Miles',
        token_contract: tokenContract,
        exchange_rate: 100
      });
    });
    
    it('should fail for non-existent program', () => {
      const result = mockContractCall('get-program', [999]);
      expect(result.success).toBe(false);
      expect(result.error).toBe(101); // err-not-found
    });
  });
  
  describe('get-exchange-rate', () => {
    it('should return the exchange rate for an existing program', () => {
      mockContractCall('register-program', ['Airline Miles', tokenContract, 100], contractOwner);
      const result = mockContractCall('get-exchange-rate', [1]);
      expect(result.success).toBe(true);
      expect(result.value).toBe(100);
    });
    
    it('should fail for non-existent program', () => {
      const result = mockContractCall('get-exchange-rate', [999]);
      expect(result.success).toBe(false);
      expect(result.error).toBe(101); // err-not-found
    });
  });
});

