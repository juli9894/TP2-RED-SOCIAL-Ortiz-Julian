import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Publicacion } from '../../publicaciones/schemas/publicacion.schema.js';
import { Usuario } from '../../usuarios/schemas/usuario.schema.js';

export type ComentarioDocument = HydratedDocument<Comentario>;

@Schema({ timestamps: true }) // createdAt y updatedAt automáticos
export class Comentario {
    @Prop({ required: true, trim: true })
    mensaje: string;

    // A qué publicación pertenece
    @Prop({ type: Types.ObjectId, ref: Publicacion.name, required: true })
    publicacion: Types.ObjectId;

    // Quién lo escribió
    @Prop({ type: Types.ObjectId, ref: Usuario.name, required: true })
    autor: Types.ObjectId;

    // Pasa a true cuando el autor edita el comentario (el front muestra "editado")
    @Prop({ default: false })
    modificado: boolean;
}

export const ComentarioSchema = SchemaFactory.createForClass(Comentario);