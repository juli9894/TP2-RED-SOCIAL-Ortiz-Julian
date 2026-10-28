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

    async crear(datos: CrearUsuarioDto & { imagenPerfil?: string }) {
        const correoExistente = await this.usuarioModel.findOne({
        correo: datos.correo.toLowerCase(),
        });
        if (correoExistente) {
        throw new ConflictException('El correo ya está registrado');
        }

        const usuarioExistente = await this.usuarioModel.findOne({
            usuario: datos.usuario.trim().toLowerCase(),
        });
        if (usuarioExistente) {
            throw new ConflictException('El nombre de usuario ya está en uso');
        }

        const contrasenaHasheada = await bcrypt.hash(datos.contrasena, 10);

        return this.usuarioModel.create({
        ...datos,
        contrasena: contrasenaHasheada,
        });
    }

    async buscarPorUsuarioOCorreo(valor: string) {
        const normalizado = valor.trim().toLowerCase();

        return this.usuarioModel.findOne({
            $or: [{ usuario: normalizado }, { correo: normalizado }],
        });
    }
    
}