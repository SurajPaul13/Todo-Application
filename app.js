const { format } = require("date-fns");
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

//app.get("/todos/", async (request, response) => {
//const query = `SELECT * FROM todo ORDER BY id;`;
//const result = await db.all(query);
//response.send(result);
//});

const invalidStatusCheck = (request, response, next) => {
  const { status } = request.body;
  if (status !== undefined) {
    if (status == "TO DO" || status == "DONE" || status == "IN PROGRESS") {
      next();
    } else {
      response.status(400);
      response.send("Invalid Todo Status");
    }
  } else {
    next();
  }
};
const invalidPriorityCheck = (request, response, next) => {
  const { priority } = request.body;
  if (priority !== undefined) {
    if (priority == "HIGH" || priority == "MEDIUM" || priority == "LOW") {
      next();
    } else {
      response.status(400);
      response.send("Invalid Todo Priority");
    }
  } else {
    next();
  }
};
const invalidCategoryCheck = (request, response, next) => {
  const { category } = request.body;
  if (category !== undefined) {
    if (category == "WORK" || category == "HOME" || category == "LEARNING") {
      next();
    } else {
      response.status(400);
      response.send("Invalid Todo Category");
    }
  } else {
    next();
  }
};

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
const hasCategoryAndPriorityParameter = (requestBody) => {
  return (
    requestBody.category !== undefined && requestBody.priority !== undefined
  );
};

app.get("/todos/", async (request, response) => {
  const { status, priority, category, due_date, search_q = "" } = request.query;
  let getTodosQuery = "";

  const runQuery = async (getTodosQuery) => {
    const todoObject = await db.all(getTodosQuery);
    response.send(
      todoObject.map((eachItem) => {
        return {
          id: eachItem.id,
          todo: eachItem.todo,
          priority: eachItem.priority,
          status: eachItem.status,
          category: eachItem.category,
          dueDate: eachItem.due_date,
        };
      })
    );
  };
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
        runQuery(getTodosQuery);
      } else {
        response.status(400);
        response.send("Invalid Todo Status");
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
        runQuery(getTodosQuery);
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
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
      runQuery(getTodosQuery);
      break;
    case hasCategoryAndStatusParameter(request.query):
      getTodosQuery = `
        SELECT
         * 
        FROM
         todo 
        WHERE
          category = '${category}' 
          AND status = '${status}' 
          AND todo LIKE '%${search_q}%';`;
      runQuery(getTodosQuery);
      break;
    case hasCategoryParameter(request.query):
      if (category == "WORK" || category == "HOME" || category == "LEARNING") {
        getTodosQuery = `
        SELECT
         * 
        FROM
         todo 
        WHERE category = '${category}' 
          AND todo LIKE '%${search_q}%';`;
        runQuery(getTodosQuery);
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
      break;
    case hasCategoryAndPriorityParameter(request.query):
      getTodosQuery = `
        SELECT
         * 
        FROM
         todo 
        WHERE
          category = '${category}' 
          AND priority = '${priority}' 
          AND todo LIKE '%${search_q}%';`;
      runQuery(getTodosQuery);
      break;
    default:
      getTodosQuery = `
        SELECT * FROM todo
        WHERE todo LIKE '%${search_q}%';`;
      runQuery(getTodosQuery);
  }
});

// API 2
app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getSpecificTodoQuery = `
    SELECT * 
    FROM
      todo
    WHERE
      id = '${todoId}';`;

  const todoObject = await db.get(getSpecificTodoQuery);
  response.send({
    id: todoObject.id,
    todo: todoObject.todo,
    priority: todoObject.priority,
    status: todoObject.status,
    category: todoObject.category,
    dueDate: todoObject.due_date,
  });
});

// API 3
app.get("/agenda/", async (request, response) => {
  const { date } = request.query;
  try {
    const formattedDate = format(new Date(date), "yyyy-MM-dd");
    const getTodoDueDateQuery = `
    SELECT *
    FROM
      todo
    WHERE due_date = '${date}'
    ORDER BY id`;
    const dueDateObject = await db.all(getTodoDueDateQuery);
    response.send(
      dueDateObject.map((eachItem) => {
        return {
          id: eachItem.id,
          todo: eachItem.todo,
          priority: eachItem.priority,
          status: eachItem.status,
          category: eachItem.category,
          dueDate: eachItem.due_date,
        };
      })
    );
  } catch (e) {
    response.status(400);
    response.send("Invalid Due Date");
  }
});

//API 4
app.post(
  "/todos/",
  invalidStatusCheck,
  invalidPriorityCheck,
  invalidCategoryCheck,
  async (request, response) => {
    const { id, todo, priority, category, status, dueDate } = request.body;
    try {
      let formattedDate = format(new Date(dueDate), "yyyy-MM-dd");
      const createTodoQuery = `
    INSERT INTO
     todo(id, todo, priority, category, status, due_date)
    VALUES
     (${id}, '${todo}', '${priority}', '${category}', '${status}', '${formattedDate}');`;

      await db.run(createTodoQuery);
      response.send("Todo Successfully Added");
    } catch (e) {
      response.status(400);
      response.send("Invalid Due Date");
    }
  }
);

// API 5
app.put(
  "/todos/:todoId/",
  invalidStatusCheck,
  invalidPriorityCheck,
  invalidCategoryCheck,
  async (request, response) => {
    const { todoId } = request.params;
    let updateColumn = "";
    const requestBody = request.body;
    switch (true) {
      case requestBody.status !== undefined:
        updateColumn = "Status";
        break;
      case requestBody.priority !== undefined:
        updateColumn = "Priority";
        break;
      case requestBody.todo !== undefined:
        updateColumn = "Todo";
        break;
      case requestBody.category !== undefined:
        updateColumn = "Category";
        break;
      case requestBody.dueDate !== undefined:
        updateColumn = "Due Date";
        break;
    }
    const previousTodoQuery = `
    SELECT
      *
    FROM
      todo
    WHERE 
      id = ${todoId};`;
    const previousTodo = await db.get(previousTodoQuery);

    const {
      todo = previousTodo.todo,
      priority = previousTodo.priority,
      status = previousTodo.status,
      category = previousTodo.category,
      dueDate = previousTodo.due_date,
    } = request.body;
    try {
      const formattedDate = format(new Date(dueDate), "yyyy-MM-dd");
      const updateTodoQuery = `
    UPDATE
      todo
    SET
      todo='${todo}',
      priority='${priority}',
      status='${status}',
      category='${category}',
      due_date='${formattedDate}'
    WHERE
      id = ${todoId};`;

      await db.run(updateTodoQuery);
      response.send(`${updateColumn} Updated`);
    } catch (e) {
      response.status(400);
      response.send("Invalid Due Date");
    }
  }
);

// DELETE TODO
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteTodoQuery = `
  DELETE FROM
    todo
  WHERE
    id = ${todoId};`;

  await db.run(deleteTodoQuery);
  response.send("Todo Deleted");
});

module.exports = app;
