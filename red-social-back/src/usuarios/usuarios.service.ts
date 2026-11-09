import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import bcrypt from 'bcryptjs';
import { isValidObjectId } from 'mongoose';
import type { Model } from 'mongoose';
import { CloudinaryService } from '../cloudinary/cloudinary.service.js';
import type { ArchivoSubido } from '../cloudinary/interfaces/archivo-subido.interface.js';
import { CrearUsuarioAdminDto } from './dto/crear-usuario-admin.dto.js';
import { CrearUsuarioDto } from './dto/crear-usuario.dto.js';
import { Usuario } from './schemas/usuario.schema.js';

@Injectable()
export class UsuariosService {
    constructor(
        @InjectModel(Usuario.name) private usuarioModel: Model<Usuario>,
        private cloudinaryService: CloudinaryService,
    ) {}

    // [CICLO REGISTRO · paso 5/6]
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

        // registro() de auth.service.ts
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

    // ─── [CICLO ADMIN USUARIOS] ─────────────────────────────────────

    // GET /usuarios: todos los usuarios, los más nuevos primero, sin la contraseña
    async listar() {
        return this.usuarioModel.find().select('-contrasena').sort({ _id: -1 });
    }

    // POST /usuarios: el admin crea un usuario (con imagen opcional y el perfil elegido)
    async crearComoAdmin(datos: CrearUsuarioAdminDto, archivo?: ArchivoSubido) {
        let imagenPerfil: string | undefined;
        if (archivo) {
            imagenPerfil = await this.cloudinaryService.subirImagen(archivo);
        }

        const usuario = await this.crear({ ...datos, imagenPerfil });
        const { contrasena, ...sinContrasena } = usuario.toObject();
        return sinContrasena;
    }

    // DELETE /usuarios/:id y PUT /usuarios/:id/habilitar: baja y alta lógica
    async cambiarHabilitado(id: string, habilitado: boolean, idAdmin: string) {
        if (!isValidObjectId(id)) {
            throw new BadRequestException('El id del usuario no es válido');
        }
        if (!habilitado && id === idAdmin) {
            throw new BadRequestException('No podés deshabilitar tu propia cuenta');
        }

        const usuario = await this.usuarioModel
            .findByIdAndUpdate(id, { habilitado }, { new: true })
            .select('-contrasena');

        if (!usuario) {
            throw new NotFoundException('Usuario no encontrado');
        }
        return usuario;
    }
}