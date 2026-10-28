import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

export interface ArchivoSubido {
    buffer: Buffer;
    mimetype: string;
    size: number;
    originalname: string;
}

@Injectable()
export class CloudinaryService {
    constructor(config: ConfigService) {
        cloudinary.config({
            cloud_name: config.getOrThrow<string>('CLOUDINARY_CLOUD_NAME'),
            api_key: config.getOrThrow<string>('CLOUDINARY_API_KEY'),
            api_secret: config.getOrThrow<string>('CLOUDINARY_API_SECRET'),
        });
    }

    subirImagen(archivo: ArchivoSubido): Promise<string> {
        return new Promise((resolve, reject) => {
            const flujo = cloudinary.uploader.upload_stream(
                {
                    folder: 'teresuelvo/perfiles',
                    transformation: [{ width: 400, height: 400, crop: 'fill' }],
                },
                (error, resultado) => {
                    if (error || !resultado) {
                        return reject(error ?? new Error('No se pudo subir la imagen'));
                    }
                    resolve(resultado.secure_url);
                },
            );
            flujo.end(archivo.buffer);
        });
    }
}