require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const app = express();
const port = process.env.PORT;
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

app.use(helmet());
app.use(express.json());

app.listen(port, () => {
    console.log('Listening on port ' + port);
});


// Functions
async function getUrlFromSlug(slug) {
    const client = await pool.connect();
    let result = await client.query(`SELECT (slug, url, counter) from links WHERE slug='${slug}';`);
    client.release();

    if (result.rows.length === 0) {
        return null;
    }

    return result.rows[0].row.split(',')[1];
}

async function insertNew(slug, url) {
    const client = await pool.connect();
    let result = await client.query(`INSERT INTO links (slug, url, counter) VALUES ('${slug}', '${url}', 0) RETURNING *;`);
    client.release();
    
    if (result.rows.length === 0) {
        return null;
    }

    return result.rows[0].row.split(',')[1];
}


async function displayError(res, message) {
    await res.json({
        'error': message,
    });
    return;
}

async function redirectTo(res, url) {
    console.log('You are getting redirected to ' + url);
    await res.status(301).redirect('https://' + url); 
}


// Routes
app.get('/', (req, res) => {
    res.json({
        'message': 'Welcome to Flexonze.link - A url shortener that doesn\'t really shorten urls',
    });
});

app.get('/:slug', async (req, res) => {
    try {
        let slug = req.params.slug;
        let url = await getUrlFromSlug(slug);
        
        if (url === null) {
            await displayError(res, 'This link is invalid.');
            return;
        }

        await redirectTo(res, url);
      }
       catch (error) {
        await displayError(res, error.message);
      }
});

app.get('/create/:password/:slug/:url', async (req, res) => {
    try {
        let password = req.params.password;
        let slug = req.params.slug;
        let url = req.params.url;

        if (password !== process.env.PASSWORD) {
            await displayError(res, 'The password is invalid.');
            return;
        }

        let urlAvailability = await getUrlFromSlug(slug);
        if (urlAvailability !== null) {
            await displayError(res, 'This slug is unavailable: ' + urlAvailability);
            return;
        }
        
        let result = insertNew(slug, url);

        res.json({'message': result});
        await redirectTo(res, url);
      }
      catch (error) {
        await displayError(res, error.message);
      }
});

process.on('unhandledRejection', error => {}); // Silencing the unhandledRejection warning. I know this isn't clean, but I think I will still be able to sleep at night