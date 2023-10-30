const express = require("express");
const app = express();

app.use(express.json());

let persons = [
    {
        id: 1,
        name: "Arto Hellas",
        number: "040-123456",
    },
    {
        id: 2,
        name: "Ada Lovelace",
        number: "39-44-5323523",
    },
    {
        id: 3,
        name: "Dan Abramov",
        number: "12-43-234345",
    },
    {
        id: 4,
        name: "Mary Poppendieck",
        number: "39-23-6423122",
    },
];

const IDRange = 1000000;

const nextId = () => {
    return Math.floor(Math.random() * IDRange);
};

const personCheck = (newPerson) => {
    if (!newPerson.name) {
        return "Empty person name";
    }

    if (!newPerson.number) {
        return "Empty person number";
    }

    if (persons.map((person) => person.name).includes(newPerson.name)) {
        return "Contact already exist";
    }

    return "";
};

app.get("/info", (request, response) => {
    response.send(`
        <p> Phonebook has info for ${persons.length} </p>
        <p> ${new Date()} </p>`);
});

app.get("/api/persons/:id", (request, response) => {
    const id = Number(request.params.id);
    const founded = persons.find((person) => person.id === id);
    if (founded) {
        response.json(founded);
    } else {
        response.status(404).end();
    }
});

app.get("/api/persons", (request, response) => {
    response.json(persons);
});

app.post("/api/persons/", (request, response) => {
    const person = request.body;
    const checkError = personCheck(person);
    if (checkError) {
        response.status(500).send(checkError);
        return;
    }
    person.id = nextId();
    persons.push(person);
    response.json(person);
});

app.delete("/api/persons/:id", (request, response) => {
    const id = Number(request.params.id);
    if (!persons.map((person) => person.id).includes(id)) {
        response.status(404).end();
        return;
    }
    persons = persons.filter((person) => person.id != id);
    response.status(204).end();
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
