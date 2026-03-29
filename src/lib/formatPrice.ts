export const formatPrice = (price: number): string => {
  // Format the price to two decimal places and add thousand separators
  const formattedPrice = price.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  return `${formattedPrice} TND`;
};