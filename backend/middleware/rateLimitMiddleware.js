const buckets = new Map();

export const createRateLimiter = ({ windowMs = 60_000, max = 60, keyPrefix = "global" } = {}) => {
  return (req, res, next) => {
    const now = Date.now();
    const identity = req.user?._id || req.ip || "anonymous";
    const key = `${keyPrefix}:${identity}`;
    const bucket = buckets.get(key) || { count: 0, resetAt: now + windowMs };

    if (bucket.resetAt <= now) {
      bucket.count = 0;
      bucket.resetAt = now + windowMs;
    }

    bucket.count += 1;
    buckets.set(key, bucket);

    res.setHeader("X-RateLimit-Limit", String(max));
    res.setHeader("X-RateLimit-Remaining", String(Math.max(max - bucket.count, 0)));
    res.setHeader("X-RateLimit-Reset", String(bucket.resetAt));

    if (bucket.count > max) {
      return res.status(429).json({
        success: false,
        message: "Too many requests. Please wait before trying again.",
      });
    }

    next();
  };
};

export const campaignSendLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.CAMPAIGN_SEND_LIMIT || 20),
  keyPrefix: "campaign-send",
});

export const smsSendLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.SMS_SEND_LIMIT || 30),
  keyPrefix: "sms-send",
});
