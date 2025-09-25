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
          balance: -100, // Balance invalide
          currency: "EUR"
        })
      ).rejects.toThrow(HttpBadRequest);
    });

    it("doit échouer si les paramètres sont invalides (currency invalide)", async () => {
      await expect(
        createAccount({
          userId: 1,
          balance: 100,
          currency: "EURO" // Ici la devise est de 4 caractères au lieu de 3
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
    // J'ai modifié la fonction deleteAccount afin de compléter le coverage (La condition quand accountId es négatif ou non-entier n'était pas testée)
    describe("deleteAccount", () => {
        it("doit supprimer un compte avec des IDs valides", async () => {
            vi.spyOn(accountRepository, 'deleteAccountInRepository').mockResolvedValue(true);
            const result = await deleteAccount(1, 1);
            expect(result).toBe(true);
        });

        it("doit échouer si userId est invalide", async () => {
            await expect(deleteAccount(-1, 1))
            .rejects.toThrow(HttpBadRequest);
        });

        it("doit échouer si accountId est invalide (négatif)", async () => {
            await expect(deleteAccount(1, -1))
            .rejects.toThrow(HttpBadRequest);
        });

        it("doit échouer si accountId est invalide (non-entier)", async () => {
            await expect(deleteAccount(1, 1.5))
            .rejects.toThrow(HttpBadRequest);
        });
    });

});
