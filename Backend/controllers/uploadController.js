const uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Please provide an image file", status: 400 });
    }

    const form = new FormData();
    form.append(
      "file",
      new Blob([req.file.buffer], { type: req.file.mimetype }),
      req.file.originalname
    );
    form.append("upload_preset", process.env.CLOUDINARY_UPLOAD_PRESET);

    const cloudRes = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`,
      { method: "POST", body: form }
    );

    const result = await cloudRes.json();

    if (!cloudRes.ok) {
      return res.status(400).json({
        error: result.error ? result.error.message : "Image upload failed",
        status: 400,
      });
    }

    res.json({
      data: { url: result.secure_url },
      message: "Image uploaded successfully",
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { uploadImage };
