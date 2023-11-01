require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const Persons = require('./persons');

const app = express();

app.use(express.static('dist'));

morgan.token('postBody', (req) => {
    if (req.method === 'POST') {
        return JSON.stringify(req.body);
    }
    return null;
});

app.use(express.json());
app.use(
    morgan(
        ':method :url :status :res[content-length] - :response-time ms :postBody'
    )
);

app.get('/info', (request, response, next) => {
    Persons.countDocuments({})
        .then((length) => {
            response.send(`
        <p> Phonebook has info for ${length} </p>
        <p> ${new Date()} </p>`);
        })
        .catch(() => next);
});

app.get('/api/persons/:id', (request, response, next) => {
    Persons.findById(request.params.id)
        .then((person) => {
            if (person) {
                response.json(person);
            } else {
                response.status(404).end();
            }
        })
        .catch((error) => {
            next(error);
        });
});

app.get('/api/persons', (request, response, next) => {
    Persons.find({})
        .then((persons) => {
            response.json(persons);
        })
        .catch((error) => {
            next(error);
        });
});

app.put('/api/persons/:id', (request, response, next) => {
    const newPerson = request.body;

    Persons.find({ name: newPerson.name })
        .then((persons) => {
            const person = persons[0];
            if (person) {
                Persons.findByIdAndUpdate(
                    person.id,
                    { number: newPerson.number },
                    { new: true, runValidators: true, context: 'query' }
                )
                    .then(() => response.json(person))
                    .catch((error) => {
                        next(error);
                    });
            } else {
                response.status(404).end();
            }
        })
        .catch((error) => {
            next(error);
        });
});

app.post('/api/persons/', (request, response, next) => {
    Persons(request.body)
        .save()
        .then((person) => {
            response.json(person);
        })
        .catch((error) => {
            next(error);
        });
});

app.delete('/api/persons/:id', (request, response, next) => {
    Persons.findByIdAndDelete(request.params.id)
        .then(() => {
            response.status(204).end();
        })
        .catch((error) => {
            next(error);
        });
});

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' });
};

// handler of requests with unknown endpoint
app.use(unknownEndpoint);

const errorHandler = (error, request, response, next) => {
    // eslint-disable-next-line no-console
    console.error(error.message);

    if (error.name === 'CastError') {
        response.status(400).send({ error: 'malformatted id' });
        return;
    }
    if (error.name === 'ValidationError') {
        response.status(400).json({ error: error.message });
        return;
    }

    next(error);
};

// handler of requests with result to errors
app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Server running on port ${PORT}`);
});
