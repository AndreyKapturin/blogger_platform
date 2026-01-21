class BusinessLogicError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export { BusinessLogicError };
