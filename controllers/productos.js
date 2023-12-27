const Producto = require('../models/productoSchema');

const crearProducto = async (req, res) => {
    const { nombre, precio, categoria } = req.body;

    if (!nombre || precio == null || !categoria) {
        return res.status(400).json({ mensaje: "Nombre, precio y categoría son obligatorios" });
    }

    if (precio < 0) {
        return res.status(400).json({ mensaje: "El precio no puede ser negativo" });
    }

    // Otras validaciones según sea necesario

    try {
        const nuevoProducto = new Producto(req.body);
        const productoGuardado = await nuevoProducto.save();
        res.status(201).json(productoGuardado);
    } catch (error) {
        res.status(500).json({ mensaje: "Error al crear el producto", error });
    }
};


const obtenerProducto = async (req, res) => {
    try {
        const producto = await Producto.findById(req.params.id);
        if (!producto) {
            return res.status(404).json({ mensaje: "Producto no encontrado" });
        }
        res.status(200).json(producto);
    } catch (error) {
        res.status(500).json({ mensaje: "Error al obtener el producto", error });
    }
};

const actualizarProducto = async (req, res) => {
    try {
        const productoActualizado = await Producto.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!productoActualizado) {
            return res.status(404).json({ mensaje: "Producto no encontrado" });
        }
        res.status(200).json(productoActualizado);
    } catch (error) {
        res.status(500).json({ mensaje: "Error al actualizar el producto", error });
    }
};

const eliminarProducto = async (req, res) => {
    try {
        const productoEliminado = await Producto.findByIdAndDelete(req.params.id);
        if (!productoEliminado) {
            return res.status(404).json({ mensaje: "Producto no encontrado" });
        }
        res.status(200).json({ mensaje: "Producto eliminado" });
    } catch (error) {
        res.status(500).json({ mensaje: "Error al eliminar el producto", error });
    }
};

module.exports = {
    crearProducto,
    obtenerProducto,
    actualizarProducto,
    eliminarProducto

}