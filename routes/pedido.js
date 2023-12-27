const express = require('express');
const router = express.Router();
const pedidoController = require('../controllers/pedido');

router.post('/pedidos', pedidoController.crearPedido);
router.get('/pedidos/:id', pedidoController.obtenerPedido);
router.put('/pedidos/:id', pedidoController.actualizarPedido);
router.delete('/pedidos/:id', pedidoController.eliminarPedido);
router.get('/ventas/del-dia/:fecha', pedidoController.obtenerVentasDelDia);
router.get('/ventas/del-mes/:year/:month', pedidoController.obtenerVentasDelMes);
router.get('/ventas/del-ano/:year', pedidoController.obtenerVentasDelAnio);


module.exports = router;
