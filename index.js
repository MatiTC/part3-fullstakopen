//<---Para las variables de entorno--->
require('dotenv').config();
//<---Express--->
const express = require('express');
const app = express();
//<---Exportación de módulos mongoose--->
const Person = require('./models/person');
//<---Port--->
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
// <--- Para hacer que express muestre contenido estático, la página index.html y el JavaScript, etc., necesitamos un middleware integrado de express llamado static. --->
app.use(express.static('dist'));
// <--- Necesario para una solicitud POST. Analiza el json del body --->
app.use(express.json());

// <--- Middleware --->
// morgan
const morgan = require('morgan');
app.use(morgan('tiny'));
morgan.token('body', (req, res) => {
  // Verificar si la solicitud es de tipo POST y si tiene un body
  if (req.method === 'POST' && req.body) {
    // Si la solicitud es de tipo POST y tiene un cuerpo, retornar el cuerpo como una cadena JSON
    return JSON.stringify(req.body);
  } else {
    // Si la solicitud no es de tipo POST o no tiene un cuerpo, retornar un guión (-)
    return '-';
  }
});
app.use(
  morgan(
    ':method :url :status :res[content-length] :req[header] :response-time ms :body'
  )
);
// cors intercambio de recursos
const cors = require('cors');
app.use(cors());

// <---Solicitudes--->
// GET
app.get('/api/persons', (request, response) => {
  Person.find({})
    .then((person) => {
      response.json(person);
    })
    .catch((error) => {
      console.log(error);
      response.status(500).send('Error al obtener los datos');
    });
});

app.get('/info', (request, response) => {
  Person.countDocuments()
    .then((numEntries) => {
      const time = new Date().toUTCString();
      console.log(Person);
      console.log(time);
      console.log(numEntries);
      const infoHTML = `
        <p>Agenda Telefónica tiene información de ${numEntries} personas</p>
        <p>${time}</p>
      `;
      response.send(infoHTML);
    })
    .catch((error) => {
      console.log(error);
      response.status(500).send('Error al obtener la información');
    });
});

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then((person) => {
      if (person) {
        response.json(person);
      } else {
        response.status(404).end();
      }
    })
    .catch((error) => next(error));
});

// DELETE
app.delete('/api/persons/:id', (request, response, next) => {
  const id = request.params.id;
  console.log('id de Delete:', id);
  Person.findByIdAndDelete(id)
    .then((result) => {
      response.status(204).end();
    })
    .catch((error) => next(error));
});
// UPDATE
app.put('/api/persons/:id', (request, response) => {
  const body = request.body;
  const id = request.params.id;
  console.log(id);
  console.log(body);

  const person = {
    name: body.name,
    number: body.number,
  };

  Person.findByIdAndUpdate(id, person, { new: true, runValidators: true })
    .then((updatedPerson) => {
      if (!updatedPerson) {
        return response
          .status(404)
          .json({ error: 'No se encontró a la persona' });
      }
      response.json(updatedPerson);
    })
    .catch((error) => {
      console.log(error);
      if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message });
      }
      response
        .status(500)
        .json({ error: 'Error al actualizar la persona en la base de datos' });
    });
});

// POST
app.post('/api/persons', (request, response, next) => {
  const body = request.body;
  if (!body.number || !body.number) {
    return response.status(400).json({ error: 'Falta el nombre o el número' });
  }

  // Verificar si el nombre ya está presente en la lista de personas
  const person = new Person({
    name: body.name,
    number: body.number,
  });

  person
    .save()
    .then((savedPerson) => {
      response.json(savedPerson);
    })
    .catch((error) => next(error));
});

//<---Middleware--->

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' });
};

const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' });
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message });
  }

  next(error);
};
// controlador de solicitudes con endpoint desconocido
app.use(unknownEndpoint);
// este debe ser el último middleware cargado
app.use(errorHandler);
