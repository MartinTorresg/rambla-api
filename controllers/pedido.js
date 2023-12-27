const Pedido = require('../models/pedidoSchema');
const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');
const moment = require('moment-timezone');

const crearPedido = async (req, res) => {
    const { detalles, precioTotal } = req.body;

    if (!detalles || detalles.length === 0) {
        return res.status(400).json({ mensaje: "El pedido debe tener al menos un producto" });
    }

    if (detalles.some(detalle => !detalle.producto || detalle.cantidad <= 0)) {
        return res.status(400).json({ mensaje: "Detalles del pedido inválidos" });
    }

    // Aquí puedes añadir más validaciones según tus reglas de negocio

    try {
        const nuevoPedido = new Pedido(req.body);
        const pedidoGuardado = await nuevoPedido.save();
        res.status(201).json(pedidoGuardado);
    } catch (error) {
        res.status(500).json({ mensaje: "Error al crear el pedido", error });
    }
};


const obtenerPedido = async (req, res) => {
    try {
        const pedido = await Pedido.findById(req.params.id);
        if (!pedido) {
            return res.status(404).json({ mensaje: "Pedido no encontrado" });
        }
        res.status(200).json(pedido);
    } catch (error) {
        res.status(500).json({ mensaje: "Error al obtener el pedido", error });
    }
};

const actualizarPedido = async (req, res) => {
    try {
        const pedidoActualizado = await Pedido.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!pedidoActualizado) {
            return res.status(404).json({ mensaje: "Pedido no encontrado" });
        }
        res.status(200).json(pedidoActualizado);
    } catch (error) {
        res.status(500).json({ mensaje: "Error al actualizar el pedido", error });
    }
};

const eliminarPedido = async (req, res) => {
    try {
        const pedidoEliminado = await Pedido.findByIdAndDelete(req.params.id);
        if (!pedidoEliminado) {
            return res.status(404).json({ mensaje: "Pedido no encontrado" });
        }
        res.status(200).json({ mensaje: "Pedido eliminado" });
    } catch (error) {
        res.status(500).json({ mensaje: "Error al eliminar el pedido", error });
    }
};

const exportarDatosAExcel = (datos, nombreHoja, nombreArchivo) => {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(datos);
    XLSX.utils.book_append_sheet(wb, ws, nombreHoja);

    // Ruta absoluta donde se guardarán los archivos Excel
    const dir = "C:\\Users\\dtimm\\OneDrive\\Escritorio\\rambla\\excels";

    // Si el directorio no existe, créalo.
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    // Construye la ruta del archivo.
    const rutaArchivo = path.join(dir, nombreArchivo);

    // Escribe el archivo en la ruta especificada.
    XLSX.writeFile(wb, rutaArchivo);
    return rutaArchivo;
};


const obtenerVentasDelDia = async (req, res) => {
    const fechaInicio = moment.tz(req.params.fecha, "America/Santiago").startOf('day');
    const fechaFin = moment.tz(req.params.fecha, "America/Santiago").endOf('day');

    try {
        console.log('Obteniendo ventas...');
        const ventas = await Pedido.find({
            fechaPedido: {
                $gte: fechaInicio.toDate(),
                $lte: fechaFin.toDate()
            }
        });

        console.log(`Ventas encontradas: ${ventas.length}`);
        const datosParaExcel = ventas.map(pedido => ({
            FechaPedido: pedido.fechaPedido.toISOString(),
            PrecioTotal: pedido.precioTotal
            // Puedes añadir más campos si son necesarios
        }));

        const fechaFormato = fechaInicio.format('YYYYMMDD');
        const nombreArchivo = `Ventas_${fechaFormato}.xlsx`;
        const rutaArchivo = exportarDatosAExcel(datosParaExcel, 'Ventas', nombreArchivo);

        console.log(`Archivo generado: ${rutaArchivo}`);
        res.download(rutaArchivo, nombreArchivo, (err) => {
            if (err) {
                console.error('Error al enviar el archivo:', err);
                res.status(500).json({ mensaje: "Error al enviar el archivo" });
                return;
            }

            console.log('Archivo enviado exitosamente');
        });

    } catch (error) {
        console.error('Error al obtener las ventas del día:', error);
        res.status(500).json({ mensaje: "Error al obtener las ventas del día", error });
    }
};

const obtenerVentasDelMes = async (req, res) => {
    const year = parseInt(req.params.year);
    const month = parseInt(req.params.month) - 1; // Los meses en JS son 0-indexados

    // Asegúrate de utilizar la fecha en la zona horaria de Santiago de Chile
    const inicioMes = moment.tz([year, month], "America/Santiago").startOf('month');
    const finMes = moment.tz([year, month], "America/Santiago").endOf('month');

    try {
        const ventas = await Pedido.find({
            fechaPedido: {
                $gte: inicioMes.toDate(),
                $lte: finMes.toDate()
            }
        });

        // Calcular el total de las ventas del mes
        const totalVentasDelMes = ventas.reduce((total, pedido) => total + pedido.precioTotal, 0);

        res.status(200).json({
            year,
            month: month + 1, // Ajusta de nuevo para la presentación
            totalVentasDelMes,
            cantidadPedidos: ventas.length,
            pedidos: ventas
        });
    } catch (error) {
        res.status(500).json({ mensaje: "Error al obtener las ventas del mes", error });
    }
};

const obtenerVentasDelAnio = async (req, res) => {
    const year = parseInt(req.params.year);

    // Asegúrate de utilizar la fecha en la zona horaria de Santiago de Chile
    const inicioAnio = moment.tz([year], "America/Santiago").startOf('year');
    const finAnio = moment.tz([year], "America/Santiago").endOf('year');

    try {
        const ventas = await Pedido.find({
            fechaPedido: {
                $gte: inicioAnio.toDate(),
                $lte: finAnio.toDate()
            }
        });

        // Calcular el total de las ventas del año
        const totalVentasDelAnio = ventas.reduce((total, pedido) => total + pedido.precioTotal, 0);

        res.status(200).json({
            year,
            totalVentasDelAnio,
            cantidadPedidos: ventas.length,
            pedidos: ventas,

        });
    } catch (error) {
        res.status(500).json({ mensaje: "Error al obtener las ventas del año", error });
    }
};







module.exports = {
    crearPedido,
    obtenerPedido,
    actualizarPedido,
    eliminarPedido,
    exportarDatosAExcel,
    obtenerVentasDelDia,
    obtenerVentasDelMes,
    obtenerVentasDelAnio
}