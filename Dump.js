const format = require("date-fns");
const express = require("express");
const { open } = require("sqlite");
const path = require("path");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

let db = null;

let dbPath = path.join(__dirname, "todoApplication.db");

// Initialize Database and Server
const initializeDB = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () => {
      console.log("Server is up and running on 3000");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
  }
};

initializeDB();

//APT 1
const hasStatusParameter = (requestBody) => {
  return requestBody.status !== undefined;
};
const hasPriorityParameter = (requestBody) => {
  return requestBody.priority !== undefined;
};
const hasPriorityAndStatusParameter = (requestBody) => {
  return requestBody.status !== undefined && requestBody.status !== undefined;
};
const hasCategoryAndStatusParameter = (requestBody) => {
  return requestBody.category !== undefined && requestBody.status !== undefined;
};
const hasCategoryParameter = (requestBody) => {
  return requestBody.category !== undefined;
};
const hasCategoryAndPriority = (requestBody) => {
  return (
    requestBody.category !== undefined && requestBody.priority !== undefined
  );
};

app.get("/todos/", async (request, response) => {
  const { status, priority, category, due_date, search_q = "" } = request.query;
  let getTodosQuery = "";

  switch (true) {
    case hasStatusParameter(request.query):
      if (status == "TO DO" || status == "DONE" || status == "IN PROGRESS") {
        getTodosQuery = `
        SELECT
          *
        FROM
          todo
        WHERE 
          status LIKE '${status}' 
          AND todo LIKE '%${search_q}%';`;
      } else {
        response.status(400);
        response.send("Invalid Todo Status");
        process.exit(1);
      }
      break;
    case hasPriorityParameter(request.query):
      if (priority == "HIGH" || priority == "MEDIUM" || priority == "LOW") {
        getTodosQuery = `
        SELECT
          *
        FROM
          todo
        WHERE
         priority LIKE '${priority}'
         AND todo LIKE '%${search_q}%';`;
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
        process.exit(1);
      }
      break;
    case hasPriorityAndStatusParameter(request.query):
      getTodosQuery = `
        SELECT *
        FROM
          todo
        WHERE
          priority = '${priority}'
          AND status = '${status}'
          AND todo LIKE '%${search_q}%'`;
      break;
    case hasCategoryAndStatusParameter(request.query):
      getTodosQuery = `
        SELECT * 
        FROM todo 
        WHERE category = '${category}' 
          AND status = '${status}' 
          AND todo LIKE '%${search_q}%';`;
      break;
    case hasCategoryParameter(request.query):
      if (category == "WORK" || category == "HOME" || category == "LEARNING") {
        getTodosQuery = ``;
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
        process.exit(1);
      }
      break;
    default:
      getTodosQuery = `
        SELECT * FROM todo
        WHERE todo = '%${search_q}%';`;
      break;
  }
  const todoObject = await db.all(getTodosQuery);
  response.send(todoObject);
});
