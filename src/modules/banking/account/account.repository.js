import { describe, it, expect, vi, afterEach } from "vitest";
import { createAccount, getAccounts, deleteAccount } from './account.service.js';
import { HttpBadRequest, HttpForbidden } from "@httpx/exception";
import * as accountRepository from './account.repository.js';

// Mock du repository
vi.mock('./account.repository.js', () => ({
  createAccountInRepository: vi.fn(),
  getAccountsByUserIdInRepository: vi.fn(),
  deleteAccountInRepository: vi.fn(),
}));

describe("Account Service", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  // 1. Test : createAccount réussi
  describe("createAccount", () => {
    it("doit créer un compte avec des paramètres valides", async () => {
      const mockAccount = { id: 1, userId: 1, balance: 100, currency: "EUR" };
      accountRepository.createAccountInRepository.mockResolvedValue(mockAccount);

      const result = await createAccount({
        userId: 1,
        balance: 100,
        currency: "EUR"
      });

      expect(result).toEqual(mockAccount);
      expect(accountRepository.createAccountInRepository).toHaveBeenCalledWith({
        userId: 1,
        balance: 100,
        currency: "EUR"
      });
    });

    // 2. Test : createAccount échoue avec de mauvais paramètres
    it("doit échouer si les paramètres sont invalides (balance négative)", async () => {
      await expect(
        createAccount({
          userId: 1,
          balance: -100,
          currency: "EUR"
        })
      ).rejects.toThrow(HttpBadRequest);
    });

    it("doit échouer si les paramètres sont invalides (currency invalide)", async () => {
      await expect(
        createAccount({
          userId: 1,
          balance: 100,
          currency: "EURO"
        })
      ).rejects.toThrow(HttpBadRequest);
    });
  });

  // 3. Test : getAccounts réussi en vérifiant chaque élément de la liste
  describe("getAccounts", () => {
    it("doit retourner la liste des comptes pour un userId valide", async () => {
      const mockAccounts = [
        { id: 1, userId: 1, balance: 100, currency: "EUR" },
        { id: 2, userId: 1, balance: 200, currency: "USD" }
      ];
      accountRepository.getAccountsByUserIdInRepository.mockResolvedValue(mockAccounts);

      const result = await getAccounts(1);

      expect(result).toEqual(mockAccounts);
      expect(accountRepository.getAccountsByUserIdInRepository).toHaveBeenCalledWith(1);

      // Vérification de chaque élément
      result.forEach(account => {
        expect(account).toHaveProperty("id");
        expect(account).toHaveProperty("userId");
        expect(account).toHaveProperty("balance");
        expect(account).toHaveProperty("currency");
        expect(typeof account.id).toBe("number");
        expect(typeof account.balance).toBe("number");
        expect(typeof account.currency).toBe("string");
      });
    });
  });

  // 4. Test : deleteAccount réussi
  describe("deleteAccount", () => {
    it("doit supprimer un compte avec un userId et accountId valides", async () => {
      accountRepository.deleteAccountInRepository.mockResolvedValue(true);

      const result = await deleteAccount(1, 1);

      expect(result).toBe(true);
      expect(accountRepository.deleteAccountInRepository).toHaveBeenCalledWith(1, 1);
    });

    // 5. Test : deleteAccount échoue avec un mauvais id d'Account
    it("doit échouer si l'accountId est invalide", async () => {
      accountRepository.deleteAccountInRepository.mockRejectedValue(
        new HttpForbidden("Compte introuvable ou non autorisé")
      );

      await expect(deleteAccount(1, 999)).rejects.toThrow(HttpForbidden);
    });
  });
});
