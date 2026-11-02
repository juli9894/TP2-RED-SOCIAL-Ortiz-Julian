import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, type UploadApiOptions } from 'cloudinary';

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

    // Foto de perfil: cuadrada de 400x400
    subirImagen(archivo: ArchivoSubido): Promise<string> {
        return this.subir(archivo, {
            folder: 'teresuelvo/perfiles',
            transformation: [{ width: 400, height: 400, crop: 'fill' }],
        });
    }

    // Imagen de publicación: se respeta la proporción, con un ancho máximo de 1200
    subirImagenPublicacion(archivo: ArchivoSubido): Promise<string> {
        return this.subir(archivo, {
            folder: 'teresuelvo/publicaciones',
            transformation: [{ width: 1200, crop: 'limit' }],
        });
    }

    private subir(archivo: ArchivoSubido, opciones: UploadApiOptions): Promise<string> {
        return new Promise((resolve, reject) => {
            const flujo = cloudinary.uploader.upload_stream(opciones, (error, resultado) => {
                if (error || !resultado) {
                    return reject(error ?? new Error('No se pudo subir la imagen'));
                }
                resolve(resultado.secure_url);
            });
            flujo.end(archivo.buffer);
        });
    }
}