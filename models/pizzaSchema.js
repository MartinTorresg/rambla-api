const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const pizzaSchema = new Schema({
    nombre: { type: String, required: true },
    precios: {
        mediana: { type: Number, required: true },
        familiar: { type: Number, required: true }
    },
    ingredientes: [{ type: String, required: true }],
    // Puedes agregar más campos según sea necesario, como imágenes, categorías, etc.
}, { timestamps: true });

pizzaSchema.path('precios.mediana').validate((precio) => {
    return precio > 0;
}, 'El precio mediano debe ser mayor que 0');

pizzaSchema.path('precios.familiar').validate((precio) => {
    return precio > 0;
}, 'El precio familiar debe ser mayor que 0');

pizzaSchema.path('ingredientes').validate((ingredientes) => {
    return ingredientes.length > 0;
}, 'Debe haber al menos un ingrediente');


const Pizza = mongoose.model('Pizza', pizzaSchema);

module.exports = Pizza;
