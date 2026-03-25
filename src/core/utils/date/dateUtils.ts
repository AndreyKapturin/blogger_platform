const getCreatedAtDate = () => new Date().toISOString();

const dateIsExpired = (date: Date) => new Date() > date;

const getDatePlusMinutes = (minutes = 0): Date => {
  const now = new Date();
  now.setMinutes(now.getMinutes() + minutes);
  return now;
};

const getDatePlusSeconds = (seconds = 0): Date => {
  const now = new Date();
  now.setSeconds(now.getSeconds() + seconds);
  return now;
};

const getDateMinusMinutes = (minutes = 0): Date => {
  const now = new Date();
  now.setMinutes(now.getMinutes() - minutes);
  return now;
};

const dateUtils = {
  getCreatedAtDate,
  getDatePlusMinutes,
  dateIsExpired,
  getDatePlusSeconds,
  getDateMinusMinutes,
};

export { dateUtils };
