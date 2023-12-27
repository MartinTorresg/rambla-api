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

const exportarDatosAExcel = (datos, nombreHoja, nombreArchivo, totalVentas, totalPedidos) => {
    const wb = XLSX.utils.book_new();
    const dir = "C:\\Users\\dtimm\\OneDrive\\Escritorio\\rambla\\excels";

    // Asegurarse de que el directorio existe
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    // Agregar filas de totales al principio
    const totales = [
        { A: 'Venta total:', B: totalVentas.toLocaleString('es-CL') },
        { A: 'Pedidos totales:', B: totalPedidos.toString() },
        {}, // fila vacía como separador
    ];

    // Agregar la fila de encabezados justo antes de los datos
    const encabezados = [
        { A: 'Fecha Pedido', B: 'Precio Total' }
    ];

    // Convertir los datos de pedidos a un formato adecuado para una hoja de Excel
    const ws = XLSX.utils.json_to_sheet(totales, { origin: 'A1' });
    XLSX.utils.sheet_add_json(ws, encabezados, { origin: -1, skipHeader: true });
    XLSX.utils.sheet_add_json(ws, datos, { origin: -1, skipHeader: true });

    // Ajustar el ancho de las columnas si es necesario
    ws['!cols'] = [{ wch: 20 }, { wch: 15 }];

    // Agregar la hoja al libro de trabajo
    XLSX.utils.book_append_sheet(wb, ws, nombreHoja);

    // Construir la ruta del archivo y escribir el libro de trabajo en un archivo
    const rutaArchivo = path.join(dir, nombreArchivo);
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
            'Fecha Pedido': moment(pedido.fechaPedido).format('YYYY-MM-DD HH:mm'),
            'Precio Total': pedido.precioTotal.toLocaleString('es-CL')
        }));


        const totalVentas = ventas.reduce((acc, pedido) => acc + pedido.precioTotal, 0);
        const totalPedidos = ventas.length;

        // Luego llama a la función para exportar los datos a Excel
        const nombreArchivo = `Ventas_${fechaInicio.format('YYYYMMDD')}.xlsx`;
        const rutaArchivo = exportarDatosAExcel(datosParaExcel, 'Ventas', nombreArchivo, totalVentas, totalPedidos);

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