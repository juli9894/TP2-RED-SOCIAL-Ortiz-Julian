import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import bcrypt from 'bcryptjs';
import type { Model } from 'mongoose';
import { CrearUsuarioDto } from './dto/crear-usuario.dto.js';
import { Usuario } from './schemas/usuario.schema.js';

@Injectable()
export class UsuariosService {
    constructor(
        @InjectModel(Usuario.name) private usuarioModel: Model<Usuario>,
    ) {}

    // [CICLO REGISTRO · paso 5/6]
    async crear(datos: CrearUsuarioDto & { imagenPerfil?: string }) {
        // 409 si el correo ya existe
        const correoExistente = await this.usuarioModel.findOne({
            correo: datos.correo.toLowerCase(),
        });
        if (correoExistente) {
            throw new ConflictException('El correo ya está registrado');
        }

        // 409 si el nombre de usuario ya existe
        const usuarioExistente = await this.usuarioModel.findOne({
            usuario: datos.usuario.trim().toLowerCase(),
        });
        if (usuarioExistente) {
            throw new ConflictException('El nombre de usuario ya está en uso');
        }

        // La contraseña se guarda hasheada, nunca en texto plano
        const contrasenaHasheada = await bcrypt.hash(datos.contrasena, 10);

        // Devuelve el documento a registro() de auth.service.ts
        return this.usuarioModel.create({
            ...datos,
            contrasena: contrasenaHasheada,
        });
    }

    // [CICLO LOGIN · paso 5/6]
    async buscarPorUsuarioOCorreo(valor: string) {
        const normalizado = valor.trim().toLowerCase();

        return this.usuarioModel.findOne({
            $or: [{ usuario: normalizado }, { correo: normalizado }],
        });
    }
}
