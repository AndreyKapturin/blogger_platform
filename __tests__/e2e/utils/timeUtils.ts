const sleep = async (timeInSeconds: number) => {
  return new Promise((resolve) => setTimeout(resolve, timeInSeconds * 1000));
};

export { sleep }