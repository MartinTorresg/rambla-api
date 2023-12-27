const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productoSchema = new Schema({
    nombre: { type: String, required: true },
    precio: { type: Number, required: true },
    descripcion: { type: String, required: false },
    disponible: { type: Boolean, default: true },
    categoria: { type: String, required: true }, // Ejemplos: 'bebida', 'entrante', etc.
    // Puedes agregar más campos si es necesario
}, { timestamps: true });

productoSchema.path('precio').validate((precio) => {
    return precio >= 0;
}, 'El precio no puede ser negativo');

productoSchema.path('nombre').validate((nombre) => {
    return nombre.length > 0;
}, 'El nombre del producto no puede estar vacío');

productoSchema.path('categoria').validate((categoria) => {
    return categoria.length > 0;
}, 'La categoría no puede estar vacía');


const Producto = mongoose.model('Producto', productoSchema);

module.exports = Producto;
