function calculatePercentage(price, percentage) {
  const percentageAmount = (price * percentage) / 100;
  const finalPrice = price - percentageAmount;
  return { finalPrice, percentageAmount };
}

module.exports = calculatePercentage;
