import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UsuarioDocument = HydratedDocument<Usuario>;

@Schema()
export class Usuario {
    @Prop({ required: true, trim: true })
    nombre: string;

    @Prop({ required: true, trim: true })
    apellido: string;

    @Prop({ required: true, unique: true, lowercase: true, trim: true })
    correo: string;

    @Prop({ required: true, unique: true, lowercase: true, trim: true })
    usuario: string;

    @Prop({ required: true })
    contrasena: string;

    @Prop({ required: true })
    fechaNacimiento: Date;

    @Prop({ required: true, trim: true })
    descripcion: string;

    @Prop()
    imagenPerfil?: string;

    @Prop({ enum: ['usuario', 'administrador'], default: 'usuario' })
    perfil: string;
}

export const UsuarioSchema = SchemaFactory.createForClass(Usuario);