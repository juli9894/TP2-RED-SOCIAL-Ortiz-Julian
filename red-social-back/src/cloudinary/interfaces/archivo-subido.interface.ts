// Forma del archivo que Multer (FileInterceptor) deja en req.file.
// Se usa con @UploadedFile() en los controllers y al subir a Cloudinary.
export interface ArchivoSubido {
    buffer: Buffer;
    mimetype: string;
    size: number;
    originalname: string;
}
