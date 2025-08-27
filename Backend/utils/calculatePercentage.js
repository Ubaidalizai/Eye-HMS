function calculatePercentage(price, value, isAmountDiscount = false) {
  if (isAmountDiscount) {
    const percentageAmount = 0; // Not used for amount discount
    const finalPrice = price - value;
    return { finalPrice, percentageAmount: value };
  } else {
    const percentageAmount = (price * value) / 100;
    const finalPrice = price - percentageAmount;
    return { finalPrice, percentageAmount };
  }
}

module.exports = calculatePercentage;