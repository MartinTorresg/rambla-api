const mongoose = require("mongoose");

const connection = async() => {

    try{
        await mongoose.connect("mongodb://0.0.0.0:27017/rambla-pos");

        console.log("Conectado correctamente a bd: rambla-pos");

    } catch(error) {
        console.log(error);
        throw new Error("No se ha podido conectar a la base de datos !!");
    }

}

module.exports = connection