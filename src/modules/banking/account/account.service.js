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

import { HttpBadRequest, HttpForbidden } from "@httpx/exception";
import { z } from "zod";
import { createUserInRepository } from "../account/account.service";
import { calculateAge } from "../../../shared/utils";

export const MIN_USER_AGE = 18;

const UserSchema = z.object({
  name: z.string().min(2),
  birthday: z.date(),
});

