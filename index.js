require("dotenv").config();
const express = require("express");
const axios = require("axios");
const e = require("express");
const app = express();

app.set("view engine", "pug");
app.use(express.static(__dirname + "/public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// * Please DO NOT INCLUDE the private app access token in your repo. Don't do this practicum in your normal account.
const PRIVATE_APP_ACCESS = process.env.PRIVATE_APP_ACCESS;
const CUSTOM_OBJ_ID = process.env.CUSTOM_OBJ_ID;

if (!PRIVATE_APP_ACCESS || !CUSTOM_OBJ_ID) {
  console.error("PRIVATE_APP_ACCESS and CUSTOM_OBJ_ID must be set.");
  process.exit(1);
}

const BASE_URL = `https://api.hubapi.com/crm/v3/objects/${CUSTOM_OBJ_ID}`;
const BASE_HEADER = {
  Authorization: `Bearer ${PRIVATE_APP_ACCESS}`,
};

// * Code for Route 1 goes here
app.get("/", async (_, res) => {
  const title = "Cars";

  try {
    const r = await axios.get(
      `${BASE_URL}?properties=name,model,manufacturer,year`,
      {
        headers: {
          ...BASE_HEADER,
          "Content-Type": "application/json",
        },
      },
    );
    const cars = r.data.results;

    res.render("index", { title, cars, error: null });
  } catch (e) {
    console.error(e);
    res.render("index", { title, cars: [], error: "Unable to load cars" });
  }
});

// * Code for Route 2 goes here
const viewOrEdit = async (req, res, state) => {
  const id = req.params.id;

  try {
    const r = await axios.get(
      `${BASE_URL}/${id}?properties=name,model,manufacturer,year`,
      {
        headers: {
          ...BASE_HEADER,
          "Content-Type": "application/json",
        },
      },
    );
    const car = r.data;
    console.log(car);

    res.render("view", {
      title: `My ${car.properties.name}`,
      car,
      state,
      error: null,
    });
  } catch (e) {
    console.error(e);
    res.redirect(404, "/");
  }
};

app.get("/view/:id", (req, res) => viewOrEdit(req, res, "view"));

app.get("/update/:id", (req, res) => viewOrEdit(req, res, "edit"));

// * Code for Route 3 goes here

/** 
* * This is sample code to give you a reference for how you should structure your calls. 

* * App.get sample
app.get('/contacts', async (req, res) => {
    const contacts = 'https://api.hubspot.com/crm/v3/objects/contacts';
    const headers = {
        Authorization: `Bearer ${PRIVATE_APP_ACCESS}`,
        'Content-Type': 'application/json'
    }
    try {
        const resp = await axios.get(contacts, { headers });
        const data = resp.data.results;
        res.render('contacts', { title: 'Contacts | HubSpot APIs', data });      
    } catch (error) {
        console.error(error);
    }
});

* * App.post sample
app.post('/update', async (req, res) => {
    const update = {
        properties: {
            "favorite_book": req.body.newVal
        }
    }

    const email = req.query.email;
    const updateContact = `https://api.hubapi.com/crm/v3/objects/contacts/${email}?idProperty=email`;
    const headers = {
        Authorization: `Bearer ${PRIVATE_APP_ACCESS}`,
        'Content-Type': 'application/json'
    };

    try { 
        await axios.patch(updateContact, update, { headers } );
        res.redirect('back');
    } catch(err) {
        console.error(err);
    }

});
*/


// * Localhost
app.listen(3000, () => console.log('Listening on http://localhost:3000'));