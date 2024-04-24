class OperationalError extends Error {
    constructor(message) {
      super(message);
      this.name = "OperationalError";
      this.isOperational = true;
    }
  }
  
  class ProgrammerError extends Error {
    constructor(message) {
      super(message);
      this.name = "ProgrammerError";
      this.isOperational = false;
    }
  }
  
  module.exports = {
    OperationalError,
    ProgrammerError
  };
  