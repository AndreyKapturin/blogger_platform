const getEmailConfirmationCodeExpirationDate = (addMinutes = 10) => {
  const date = new Date();
  date.setMinutes(date.getMinutes() + addMinutes);
  return date.toISOString();
};

const getCreatedAtDate = () => new Date().toISOString();

const dateIsExpired = (ISODateString: string) => {
  const now = new Date();
  const date = new Date(ISODateString);
  return now > date;
};

const dateUtils = {
  getCreatedAtDate,
  getEmailConfirmationCodeExpirationDate,
  dateIsExpired,
};

export { dateUtils };
