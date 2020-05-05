class applicationError {
    constructor(display_message, error_code, status, message) {
      this.display_message = display_message || '';
      this.error_code = error_code || 200;
      this.status = status || 0;
      this.message = message || "";

    }
}

module.exports = applicationError;