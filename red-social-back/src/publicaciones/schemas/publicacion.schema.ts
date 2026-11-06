import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Usuario } from '../../usuarios/schemas/usuario.schema.js';

export type PublicacionDocument = HydratedDocument<Publicacion>;

@Schema({ timestamps: true })//createdAt y updatedAt automáticos
export class Publicacion {
    @Prop({ required: true, trim: true })
    titulo: string;

    @Prop({ required: true, trim: true })
    mensaje: string;

    @Prop()
    imagen?: string;

    // Relación con el usuario (clave foránea de Mongo)
    @Prop({ type: Types.ObjectId, ref: Usuario.name, required: true })
    autor: Types.ObjectId;

    // Lista de usuarios que dieron like
    @Prop({ type: [{ type: Types.ObjectId, ref: Usuario.name }], default: [] })
    meGusta: Types.ObjectId[];

    // Contador numérico para ordenar rápido
    @Prop({ default: 0 })
    cantidadMeGusta: number;
    
    // Contador de comentarios: sube de a uno cada vez que alguien comenta (igual que cantidadMeGusta)
    @Prop({ default: 0 })
    cantidadComentarios: number;

    // Bandera para borrado lógico
    @Prop({ default: false })
    eliminada: boolean;
}

export const PublicacionSchema = SchemaFactory.createForClass(Publicacion);