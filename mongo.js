const mongoose = require('mongoose');

if (process.argv.length < 3) {
    console.log('give password as argument');
    process.exit(1);
}

if (process.argv.length !== 3 && process.argv.length !== 5) {
    console.log('Wrong number of arguments');
    process.exit(1);
}

const isUpdate = process.argv.length === 5;

const [, , password, name, number] = process.argv;

const url = `mongodb+srv://aivlev:${password}@fullstackopen.mw2xvzg.mongodb.net/?retryWrites=true&w=majority`;

mongoose.set('strictQuery', false);
mongoose.connect(url);

const personSchema = new mongoose.Schema({
    name: String,
    number: String,
});

const Person = mongoose.model('Person', personSchema);

if (isUpdate) {
    const person = Person({
        name,
        number,
    });

    person.save().then(() => {
        console.log(`Person ${name} is added`);
        mongoose.connection.close();
    });
} else {
    Person.find({}).then((persons) => {
        console.log('phonebook:');
        console.log(
            persons
                .map((person) => `${person.name} ${person.number}`)
                .join('\n')
        );
        mongoose.connection.close();
    });
}
