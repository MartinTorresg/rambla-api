const Pizza = require('../models/pizzaSchema');

const crearPizza = async (req, res) => {
    const { nombre, precios, ingredientes } = req.body;

    if (!nombre || !precios || !ingredientes) {
        return res.status(400).json({ mensaje: "Faltan campos necesarios para la pizza" });
    }

    if (precios.mediana <= 0 || precios.familiar <= 0) {
        return res.status(400).json({ mensaje: "Los precios deben ser mayores a 0" });
    }

    if (ingredientes.length === 0) {
        return res.status(400).json({ mensaje: "Debe haber al menos un ingrediente" });
    }

    try {
        const nuevaPizza = new Pizza(req.body);
        const pizzaGuardada = await nuevaPizza.save();
        res.status(201).json(pizzaGuardada);
    } catch (error) {
        res.status(500).json({ mensaje: "Error al crear la pizza", error });
    }
};


const obtenerPizza = async (req, res) => {
    try {
        const pizza = await Pizza.findById(req.params.id);
        if (!pizza) {
            return res.status(404).json({ mensaje: "Pizza no encontrado" });
        }
        res.status(200).json(pizza);
    } catch (error) {
        res.status(500).json({ mensaje: "Error al obtener el pizza", error });
    }
};

const actualizarPizza = async (req, res) => {
    try {
        const pizzaActualizado = await Pizza.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!pizzaActualizado) {
            return res.status(404).json({ mensaje: "Pizza no encontrado" });
        }
        res.status(200).json(pizzaActualizado);
    } catch (error) {
        res.status(500).json({ mensaje: "Error al actualizar el pizza", error });
    }
};

const eliminarPizza = async (req, res) => {
    try {
        const pizzaEliminado = await Pizza.findByIdAndDelete(req.params.id);
        if (!pizzaEliminado) {
            return res.status(404).json({ mensaje: "Pizza no encontrado" });
        }
        res.status(200).json({ mensaje: "Pizza eliminado" });
    } catch (error) {
        res.status(500).json({ mensaje: "Error al eliminar la pizza", error });
    }
};

module.exports = {
    crearPizza,
    obtenerPizza,
    actualizarPizza,
    eliminarPizza

}