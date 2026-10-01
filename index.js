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
  "Content-Type": "application/json",
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
        },
      },
    );

    res.render("view", {
      title: `My ${car.properties.name}`,
      car: res.data,
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

app.get("/create", (_, res) => {
  res.render("view", {
    title: "Create Car",
    car: {
      id: null,
      properties: {
        name: "",
        manufacturer: "",
        model: "",
        year: null,
      },
    },
    state: "create",
    error: null,
  });
});

// * Code for Route 3 goes here
const createOrUpdate = async (req, res) => {
  const body = {
    properties: {
      name: req.body.name,
      model: req.body.model,
      manufacturer: req.body.manufacturer,
      year: req.body.year,
    },
  };
  const method = req.route.path === "/create" ? "post" : "patch";
  const url =
    method === "post" ? `${BASE_URL}` : `${BASE_URL}/${req.params.id}`;

  try {
    await axios[method](url, body, {
      headers: {
        ...BASE_HEADER,
      },
    });
  } catch (e) {
    console.error(e);
  }

  res.redirect("/");
};

app.post("/create", createOrUpdate);
app.post("/update/:id", createOrUpdate);

// * Localhost
app.listen(3000, () => console.log("Listening on http://localhost:3000"));
