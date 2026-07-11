const multer = require('multer');
const streamifier = require('streamifier');
const cloudinary = require('../config/cloudinary.config');

const upload = multer({ storage: multer.memoryStorage() });

const uploadToCloudinary = (fileBuffer, folder) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder: `E-Commerce/${folder}` },
            (error, result) => {
                if (error) return reject(error);
                resolve(result);
            }
        );
        streamifier.createReadStream(fileBuffer).pipe(stream);
    });
};

const uploadSingle = (folder) => {
    return [
        upload.single('image'),
        async (req, res, next) => {
            try {
                if (!req.file) return next();
                const result = await uploadToCloudinary(req.file.buffer, folder);
                req.file.path = result.secure_url;
                next();
            } catch (error) {
                console.log('Cloudinary Single Upload Error', error);
                return res.status(500).json({ status: 500, error: true, massage: 'Image upload failed' });
            }
        },
    ];
};

const uploadMultiple = (folder, maxCount = 5) => {
    return [
        upload.array('images', maxCount),
        async (req, res, next) => {
            try {
                if (!req.files || req.files.length === 0) return next();
                const uploads = req.files.map((file) => uploadToCloudinary(file.buffer, folder));
                const results = await Promise.all(uploads);
                req.files = req.files.map((file, index) => ({
                    ...file,
                    path: results[index].secure_url,
                }));
                next();
            } catch (error) {
                console.log('Cloudinary Multiple Upload Error', error);
                return res.status(500).json({ status: 500, error: true, massage: 'Images upload failed' });
            }
        },
    ];
};

module.exports = { uploadSingle, uploadMultiple };
