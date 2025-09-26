import { z } from "zod";
import { HttpBadRequest, HttpForbidden } from "@httpx/exception";
import {
  createAccountInRepository,
  getAccountsByUserIdInRepository,
  deleteAccountInRepository,
} from "./account.repository.js";

const AccountSchema = z.object({
  userId: z.number().int().positive(),
  balance: z.number().nonnegative(),
  currency: z.string().length(3),
});

export async function createAccount(data) {
  const result = AccountSchema.safeParse(data);
  if (!result.success) throw new HttpBadRequest(result.error);
  return createAccountInRepository(result.data);
}

export async function getAccounts(userId) {
  if (!Number.isInteger(userId) || userId <= 0) throw new HttpBadRequest("Invalid userId");
  return getAccountsByUserIdInRepository(userId);
}

export async function deleteAccount(userId, accountId) {
  if (!Number.isInteger(userId) || userId <= 0 || !Number.isInteger(accountId) || accountId <= 0) {
    throw new HttpBadRequest("Invalid userId or accountId");
  }
  return deleteAccountInRepository(userId, accountId);
}

// Supprime cette ligne (doublon) :
// import { HttpBadRequest, HttpForbidden } from "@httpx/exception";
// Supprime aussi ce doublon :
// import { z } from "zod";
