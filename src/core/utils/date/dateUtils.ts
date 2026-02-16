const getEmailConfirmationCodeExpirationDate = (addMinutes = 10) => {
  const date = new Date();
  date.setHours(date.getMinutes() + addMinutes);
  return date.toISOString();
};

const getCreatedAtDate = () => new Date().toISOString();

const dateUtils = {
  getCreatedAtDate,
  getEmailConfirmationCodeExpirationDate,
};

export { dateUtils };
