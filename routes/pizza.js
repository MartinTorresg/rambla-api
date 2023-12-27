const express = require('express');
const router = express.Router();
const pizzaController = require('../controllers/pizza');

router.post('/pizzas', pizzaController.crearPizza);
router.get('/pizzas/:id', pizzaController.obtenerPizza);
router.put('/pizzas/:id', pizzaController.actualizarPizza);
router.delete('/pizzas/:id', pizzaController.eliminarPizza);

module.exports = router;
