function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    if (!result.success) {
      return res.status(400).json({
        message: "Validation error",
        issues: result.error.issues,
      });
    }

    req.validated = result.data;
    return next();
  };
}

module.exports = { validate };

