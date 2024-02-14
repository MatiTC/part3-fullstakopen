const express = require('express');
const app = express();
const PORT = process.env.PORT || 3001
// <--- Necesario para una solicitud POST. Analiza el json del body --->
app.use(express.json());
// <--- Para hacer que express muestre contenido estático, la página index.html y el JavaScript, etc., necesitamos un middleware integrado de express llamado static. --->
app.use(express.static('dist'))
// variable de datos
let persons = [
  {
    id: 1,
    name: 'Arto Hellas',
    number: '040-123456',
  },
  {
    id: 2,
    name: 'Ada Lovelace',
    number: '39-44-5323523',
  },
  {
    id: 3,
    name: 'Dan Abramov',
    number: '12-43-234345',
  },
  {
    id: 4,
    name: 'Mary Poppendieck',
    number: '39-23-6423122',
  },
];

// <--- Middleware --->
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
// morgan(format, options)
// formant ->(tokens, req,res)
// formant -> predefined cadena string name, cadena de formant , or function
// formant -> predefined format string name

/*
// formant -> predefined string of predefine tokens
morgan(':method :url :status :res[content-length] - :response-time ms')
//formant -> custom format function
morgan(function (tokens, req, res) {
  return [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'), '-',
    tokens['response-time'](req, res), 'ms'
  ].join(' ')
})
//options -> immediate, skip, stream
 */
const cors = require('cors');
app.use(cors());
// <---Solicitudes--->
app.get('/api/persons', (request, response) => {
  console.log(persons);
  response.json(persons);
});

app.get('/info', (request, response) => {
  const numEntries = persons.length;
  const time = new Date().toUTCString();
  console.log(time);
  console.log(numEntries);
  const infoHTML = `
      <p>Agenda Telefónica tiene información de ${numEntries} personas</p>
      <p>${time}</p>
    `;
  response.send(infoHTML);
});

app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id);
  console.log(id);
  const person = persons.find((person) => person.id === id);
  if (person) {
    response.json(person);
  } else {
    response.status(404).end();
  }
});

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id);
  persons = persons.filter((person) => person.id !== id);
  response.status(204).end();
});

app.post('/api/persons', (request, response) => {
  const body = request.body;

  if (!body.number || !body.number) {
    return response.status(400).json({ error: 'Falta el nombre o el número' });
  }

  // Verificar si el nombre ya está presente en la lista de personas
  const duplicatePerson = persons.find((person) => person.name === body.name);
  if (duplicatePerson) {
    return response
      .status(400)
      .json({ error: 'El nombre ya se encuentra en la lista de personas' });
  }
  const idAleatorio = Math.floor(Math.random() * 100) + 1;
  console.log(body);
  const person = {
    name: body.name,
    number: body.number,
    id: idAleatorio,
  };
  persons = persons.concat(person);
  console.log(person);
  response.json(person);
});

// Inicia el servidor
app.listen(PORT, () => {
  console.log(
    `Servidor de agenda telefónica escuchando en el puerto:${PORT}`
  );
});
