require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const pretty = require('express-prettify');
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
app.set('json spaces', 2);

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
    try {
        const client = await pool.connect();
        let result = await client.query(`INSERT INTO links (slug, url, counter) VALUES ('${slug}', '${url}', 0);`);
        client.release();
    
        if (result.rows.length === 0) {
            return null;
        }

        return result.rows[0].row.split(',')[1];
    } catch (error) {

        await displayError(res, error.message);
    }

}

async function deleteLink(slug) {
    try {
        const client = await pool.connect();
        let result = await client.query(`DELETE FROM links WHERE slug = '${slug}' RETURNING *;`);
        client.release();
        return 'success';
    } catch (error) {
        await displayError(res, error.message);
    }
}

async function incrementCounter(slug) {
    try {
        const client = await pool.connect();
        let result = await client.query(`UPDATE links SET counter = counter + 1 WHERE slug = '${slug}';`);
        client.release();
        return 'success';
    } catch (error) {
        await displayError(res, error.message);
    }
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
app.get('/', async (req, res) => {
    const client = await pool.connect();
    let result = await client.query(`SELECT * from links;`);
    client.release();
    res.header("Content-Type",'application/json');
    res.json({
        'message': 'Welcome to Flexonze.link - A personnal url shortener that doesn\'t really shortens urls',
        'Available links' : result.rows,
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

        await incrementCounter(slug);

        await redirectTo(res, url);
      }
       catch (error) {
        await displayError(res, error.message);
        return null;
      }
});

app.get('/create/:password/:slug/*', async (req, res) => {
    try {
        let password = req.params.password;
        let slug = req.params.slug;
        let url = req.originalUrl;

        // Now prepare to see the single greatest line of code I've ever written:
        url = url.replace('/' + url.split('/')[1], '').replace('/' + url.split('/')[2], '').replace('/' + url.split('/')[3] + '/', '');

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

        await redirectTo(res, url);
      }
      catch (error) {
        await displayError(res, error.message);
      }
});

app.get('/delete/:password/:slug', async (req, res) => {
    try {
        let password = req.params.password;
        let slug = req.params.slug;
        let url = req.params.url;

        if (password !== process.env.PASSWORD) {
            await displayError(res, 'The password is invalid.');
            return;
        }

        let urlAvailability = await getUrlFromSlug(slug);

        if (urlAvailability === null) {
            await displayError(res, 'This slug does not exist');
            return;
        }
        
        let result = await deleteLink(slug);

        if (result !== 'success') {
            await displayError(res, 'Could not delete this slug');
        }

        res.json({
            'message': `The link has been deleted succesfully (${slug})`,
        });
      }
      catch (error) {
        await displayError(res, error.message);
      }
});

process.on('unhandledRejection', error => {}); // Silencing the unhandledRejection warning. I know this isn't clean, but I think I will still be able to sleep at night