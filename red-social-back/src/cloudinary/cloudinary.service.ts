import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, type UploadApiOptions } from 'cloudinary';
import type { ArchivoSubido } from './interfaces/archivo-subido.interface.js';

@Injectable()
export class CloudinaryService {
    constructor(config: ConfigService) {
        cloudinary.config({
            cloud_name: config.getOrThrow<string>('CLOUDINARY_CLOUD_NAME'),
            api_key: config.getOrThrow<string>('CLOUDINARY_API_KEY'),
            api_secret: config.getOrThrow<string>('CLOUDINARY_API_SECRET'),
        });
    }

    // [CICLO REGISTRO · paso 4/6] Foto de perfil: cuadrada de 400x400
    subirImagen(archivo: ArchivoSubido): Promise<string> {
        return this.subir(archivo, {
            folder: 'teresuelvo/perfiles',
            transformation: [{ width: 400, height: 400, crop: 'fill' }],
        });
    }

    // [CICLO PUBLICAR · paso 5/7] Imagen de publicación: se respeta la proporción, con un ancho máximo de 1200
    subirImagenPublicacion(archivo: ArchivoSubido): Promise<string> {
        return this.subir(archivo, {
            folder: 'teresuelvo/publicaciones',
            transformation: [{ width: 1200, crop: 'limit' }],
        });
    }

    // Validación única para todas las subidas: el archivo tiene que ser una imagen (400 si no)
    private validarImagen(archivo: ArchivoSubido) {
        if (!archivo.mimetype.startsWith('image/')) {
            throw new BadRequestException('El archivo debe ser una imagen');
        }
    }

    // Sube el archivo a Cloudinary y devuelve la URL pública (https) de la imagen
    private subir(archivo: ArchivoSubido, opciones: UploadApiOptions): Promise<string> {
        this.validarImagen(archivo);

        return new Promise((resolve, reject) => { //callback porque cloudinary no tiene promesas
            const flujo = cloudinary.uploader.upload_stream(opciones, (error, resultado) => {
                if (error || !resultado) {
                    return reject(error ?? new Error('No se pudo subir la imagen'));
                }
                resolve(resultado.secure_url);//retorna la URL pública de la imagen
            });
            flujo.end(archivo.buffer);//sube la imagen desde el buffer del archivo
        });
    }
}
