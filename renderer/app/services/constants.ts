import { AID, Command, Order } from './types';

/**
 * Common constants
 *
 * NOTE: preserveConstEnums in tsconfig makes this work
 *
 * @see https://stackoverflow.com/questions/18111657/
 *        how-does-one-get-the-names-of-typescript-enum-entries
 */

export const LT = [0xFF, 0xEF];

export const AIDLookup = {};
for (const aid in AID)
  AIDLookup[aid] = AID[aid];

export const CommandLookup = {};
for (const command in Command)
  CommandLookup[command] = Command[command];

export const OrderLookup = {};
for (const order in Order)
  OrderLookup[order] = Order[order];
