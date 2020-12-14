const express = require("express");
const { body, check, validationResult } = require("express-validator");
const { spawn } = require("child_process");

const {isURL} = require("validator");


const Calculations = require("../models/calculations");
const Feedbacks = require("../models/feedbacks");

const metricEvaluator = require("../metrics");
const summarizeEvaluator = require("../summarizers");

const router = express.Router();


const validateMiddleware = async (req, res, next) => {
  try {
    validationResult(req).throw();
  } catch (err) {
    return res.status(400).json({ errors: err.mapped() });
  }
  next();
};

const download = (url) => new Promise((resolve, reject) => {
  const p = spawn("python3", ["download_article.py", url]);
  let text = ""
  let errorText = ""

  p.stdout.on("data", (data) => text += data.toString())
  p.stderr.on("data", (err) => errorText += err.toString())
  p.on("exit", (e) => e ? reject(errorText) : resolve(text))
  p.on("error", (e) => reject(e.message))
})

const allIsIn = (validElements) => (list) =>
  list.every((el) => validElements.has(el));

const setDefault = (defaultValue) => {
  return (v) => (v === undefined ? defaultValue : v);
};

const isListOfStrings = (field, validElements) => {
  let val = field
    .isArray()
    .withMessage("has to be non-empty List of Strings")
    .bail()
    .notEmpty()
    .withMessage("has to be non-empty List of Strings")
    .bail()
    .custom((list) => list.every((el) => typeof el === "string"))
    .withMessage("has to be non-empty List of Strings");
  if (validElements !== undefined) {
    val = val
      .custom(allIsIn(validElements))
      .withMessage(
        `has to only contain elements from ${JSON.stringify(
          Array.from(validElements)
        )}`
      );
  }
  return val;
};

const evaluateValidator = [
  isListOfStrings(body("hypdata")),
  isListOfStrings(body("refdata")),
  isListOfStrings(body("metrics"), metricEvaluator.AVAILABLE_METRICS),
];

const validateHypRefMiddleware = (req, res, next) => {
  const { refdata, hypdata } = req.body;
  if (refdata.length !== hypdata.length) {
    return res
      .status(400)
      .json({ message: "hypdata and refdata have to be same size" });
  }
  next();
};

router.post(
  "/evaluate",
  evaluateValidator,
  validateMiddleware,
  validateHypRefMiddleware,
  async (req, res, next) => {
    try {
      const { metrics, refdata, hypdata } = req.body;
      return res.json({
        metrics: await metricEvaluator.evaluate(metrics, refdata, hypdata),
      });
    } catch (err) {
      next(err);
    }
  }
);

const summarizeValidator = [
  body("text").isString().withMessage("has to be String"),
  body("ratio")
    .customSanitizer(setDefault(0.2))
    .isFloat({ gt: 0.0, lt: 1.0 })
    .withMessage("has to be between 0.0 and 1.0"),
  isListOfStrings(
    body("summarizers"),
    summarizeEvaluator.AVAILABLE_SUMMARIZERS
  ),
];

router.post(
  "/summarize",
  summarizeValidator,
  validateMiddleware,
  async (req, res, next) => {
    try {
      const { summarizers, text, ratio } = req.body;
      const original = isURL(text) ? (await download(text)) : text;
      const summaries = await summarizeEvaluator.summarize(summarizers, original, ratio)
      return res.json({original, summaries});
    } catch (err) {
      next(err);
    }
  }
);

const _isNestedListOfStrings = (v) =>
  v instanceof Array
    ? v.every((e) => _isNestedListOfStrings(e))
    : typeof v === "string";
const isNestedListOfStrings = (v) =>
  v instanceof Array && _isNestedListOfStrings(v);

const scoresValidator = (v) =>
  allIsIn(metricEvaluator.AVAILABLE_METRICS)(Object.keys(v)) &&
  Object.values(v).map((el) =>
    Object.entries(el).every(
      (key, value) => typeof key === "string" && typeof value === "number"
    )
  );

const calculationsValidator = [
  body("name").isString().trim().notEmpty(),
  body("comparisons").custom(isNestedListOfStrings),
  body("scores").optional().custom(scoresValidator),
];

router
  .route("/calculations")
  .get(async (req, res, next) => {
    try {
      return res.json(await Calculations.allWithoutComparisons());
    } catch (err) {
      next(err);
    }
  })
  .post(calculationsValidator, validateMiddleware, async (req, res, next) => {
    try {
      await Calculations.insert(req.body);
      return res.status(200).end();
    } catch (err) {
      next(err);
    }
  });

const successOr404 = (val, res) => (val ? res.json(val) : res.status(404).end());
const calculationValidator = [check("name").isString().notEmpty()];
router
  .route("/calculation/:name")
  .get(calculationValidator, validateMiddleware, async (req, res, next) => {
    try {
      return successOr404(await Calculations.get(req.params.name), res);
    } catch (err) {
      next(err);
    }
  })
  .delete(calculationValidator, validateMiddleware, async (req, res, next) => {
    try {
      const val = await Calculations.delete(req.params.name)
      return successOr404(val, res);
    } catch (err) {
      next(err);
    }
  });

const feedbackValidator = [
  body("summarizer").isIn([...summarizeEvaluator.AVAILABLE_SUMMARIZERS]),
  body("summary").isString(),
  body("reference").isString(),
  body("url").optional().isURL(),
  body("feedback").isString(),
];
router.post(
  "/feedback",
  feedbackValidator,
  validateMiddleware,
  async (req, res, next) => {
    try {
      await Feedbacks.insert(req.body);
      return res.status(200).end();
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;