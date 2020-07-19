require('dotenv').config();
const express = require('express');
const helmet = require('helmet');

const app = express();
const port = process.env.PORT;

app.use(helmet());
app.use(express.json());

app.listen(port, () => {
    console.log('Listening on port ' + port)
});

// Routes
app.get('/', (req, res) => {
    res.json({
        'message': 'Welcome to Flexonze.link - A url shortener that doesn\'t really shorten urls',
    });
});


/*
const { Client } = require('pg');
const client = new Client({
    user: '',
    password: '',
    host: '',
    port: 5432,
    database: ''
});

;(async () => {
    await client.connect()
    const res = await client.query('SELECT $1::text as message', ['Hello world!'])
    console.log(res.rows[0].message) // Hello world!
    await client.end()
  })();


console.log(process.env.TEST_VARIABLE);*/