// Ejecuta mongo
const mongoose = require('mongoose');
// verifica los parámetros en desarrollo
if (process.argv.length < 3) {
  console.log('ingresar los demás argumento');
  process.exit(1);
}
console.log(process.argv[3], process.argv[4]);
const password = process.argv[2];
const name = process.argv[3];
const number = process.argv[4];
// agrega la url de la db
const url = `mongodb+srv://mtckzudev:${password}@cluster1.zpyekxh.mongodb.net/?retryWrites=true&w=majority`;
mongoose.set('strictQuery', false);
//hace la conexion
mongoose.connect(url);
//contructor. Esquema
const personSchema = new mongoose.Schema({
  name: String,
  number: String,
});
//modelo
const Person = mongoose.model('Person', personSchema);
//uso del modelo
const person = new Person({
  name: name,
  number: number,
});

if (process.argv.length === 3) {
  Person.find({}).then((result) => {
    result.forEach((person) => {
      console.log(person.name, person.number);
    });
    mongoose.connection.close();
  });
} else {
  // Guardado del modelo
  person.save().then(() => {
    console.log(`Se agregó a ${name} con el número: ${number} a la Phonebook`);
    mongoose.connection.close();
  });
}
