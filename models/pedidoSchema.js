const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const detallePedidoSchema = new Schema({
    producto: { type: Schema.Types.ObjectId, ref: 'Producto', required: true },
    cantidad: { type: Number, default: 1 },
    precio: { type: Number, required: true },
    // Agrega campos adicionales si es necesario, como tamaño o personalizaciones.
});

detallePedidoSchema.path('cantidad').validate((cantidad) => {
    return cantidad > 0;
}, 'La cantidad debe ser mayor que 0');

detallePedidoSchema.path('precio').validate((precio) => {
    return precio >= 0;
}, 'El precio no puede ser negativo');

const pedidoSchema = new Schema({
    detalles: [detallePedidoSchema],
    precioTotal: { type: Number, required: true },
    fechaPedido: { type: Date, default: Date.now },
    notas: { type: String }, // Notas adicionales para el pedido.
    // Agrega campos adicionales como información de entrega si es necesario.
}, { timestamps: true });

pedidoSchema.path('detalles').validate((detalles) => {
    return detalles.length > 0;
}, 'Debe haber al menos un producto en el pedido');

pedidoSchema.path('precioTotal').validate((precioTotal) => {
    return precioTotal >= 0;
}, 'El precio total no puede ser negativo');

const Pedido = mongoose.model('Pedido', pedidoSchema);

module.exports = Pedido;
