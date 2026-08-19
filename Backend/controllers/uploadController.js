const MAX_ATTEMPTS = 5;
const UPLOAD_TIMEOUT_MS = 30000;

const uploadToCloudinary = async (req) => {
  const form = new FormData();
  form.append(
    "file",
    new Blob([req.file.buffer], { type: req.file.mimetype }),
    req.file.originalname
  );
  form.append("upload_preset", process.env.CLOUDINARY_UPLOAD_PRESET);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), UPLOAD_TIMEOUT_MS);

  try {
    const cloudRes = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`,
      { method: "POST", body: form, signal: controller.signal }
    );
    const result = await cloudRes.json();
    return { ok: cloudRes.ok, result };
  } finally {
    clearTimeout(timeout);
  }
};

const uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Please provide an image file", status: 400 });
    }

    let lastError = null;
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      try {
        const { ok, result } = await uploadToCloudinary(req);

        if (ok) {
          return res.json({
            data: { url: result.secure_url },
            message: "Image uploaded successfully",
          });
        }

        return res.status(400).json({
          error: result.error ? result.error.message : "Image upload failed",
          status: 400,
        });
      } catch (err) {
        lastError = err;
        if (attempt < MAX_ATTEMPTS) {
          await new Promise((resolve) => setTimeout(resolve, 1000 * 2 ** (attempt - 1)));
        }
      }
    }

    console.error("Cloudinary upload failed after retries:", lastError && lastError.message);
    res.status(502).json({
      error: "Image upload service is unreachable, please try again",
      status: 502,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { uploadImage };
