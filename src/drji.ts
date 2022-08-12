import { BigInt, store, } from "@graphprotocol/graph-ts"
import {
  Transfer as TransferEvent
} from "../generated/drji/drji"
import { User, Token, Transfer } from "../generated/schema"

export const BIGINT_ZERO = BigInt.fromI32(0);
export const BIGINT_ONE = BigInt.fromI32(1);
export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'


export function handleTransfer(event: TransferEvent): void {
  let token = Token.load(event.params.tokenId.toString());

  if (!token) {
    token = new Token(event.params.tokenId.toString());
    token.tokenID = event.params.tokenId
  }
  token.owner = event.params.to.toHexString();

  token.lastPrice = event.transaction.value
  token.lastGas = event.transaction.gasPrice
  token.save();

  if (event.params.to.toHexString() != ZERO_ADDRESS ) {


    // Buyer
    let user1 = User.load(event.params.to.toHexString());
    if (!user1) {
      user1 = new User(event.params.to.toHexString());
      user1.totalActions = BIGINT_ONE;
      user1.totalGas = event.transaction.gasPrice
      user1.totalIncome = BIGINT_ZERO;
      user1.totalExpense = event.transaction.value
      user1.hold = BIGINT_ONE;
      user1.owner = event.params.to
      user1.currentProfits = BIGINT_ZERO

    } else {
      user1.totalActions = user1.totalActions.plus(BIGINT_ONE);
      user1.totalGas = user1.totalGas.plus(event.transaction.gasPrice);
      // user1.totalIncome 
      user1.totalExpense = user1.totalExpense.plus(event.transaction.value);
      user1.hold = user1.hold.plus(BIGINT_ONE);
      user1.currentProfits = user1.totalIncome.minus(user1.totalExpense)

    }

    user1.save();


    // Seller
    let user2 = User.load(event.params.from.toHexString());
    if (!user2) {
      user2 = new User(event.params.from.toHexString());
      user2.totalActions = BIGINT_ONE;
      user2.totalGas = BIGINT_ZERO;
      user2.totalIncome = event.transaction.value;
      user2.totalExpense = BIGINT_ZERO;
      user2.hold = BIGINT_ZERO;
      user2.owner = event.params.from
      user2.currentProfits = event.transaction.value


    } else {
      user2.totalActions = user2.totalActions.plus(BIGINT_ONE);
      // user2.totalGas = 
      user2.totalIncome = user2.totalIncome.plus(event.transaction.value);
      // user2.totalExpense 
      user2.hold = user2.hold.minus(BIGINT_ONE);
      user2.currentProfits = user2.totalIncome.minus(user2.totalExpense)

    }



    user2.save();
  }


}
