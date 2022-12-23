const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const databasePath = path.join(__dirname, "todoApplication.db");

const app = express();

app.use(express.json());

let database = null;

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () =>
      console.log("Server Running at http://localhost:3000/")
    );
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

const convertToDoApplicationDbObjectToResponseObject = (dbObject) => {
  return {
    id: dbObject.id,
    todo: dbObject.todo,
    category: dbObject.category,
    priority: dbObject.priority,
    status: dbObject.status,
    dueDate: dbObject.due_date,
  };
};

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getToDosQuery = `
    SELECT
      *
    FROM
     todo
    WHERE
    id = ${todoId};`;

  const getArray = await database.get(getToDosQuery);
  response.send(convertToDoApplicationDbObjectToResponseObject(getArray));
});

app.get("/agenda", async (request, response)=>{
    const date = format(new Date(2021, 12, 12), 'yyyy-MM-dd')
    const getDate = `
    select * from todo where due_date = ${date};`
    const result = await database.get(getDate)
    response.send(result)

});


app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status, category, dueDate } = request.body;
  const postToDoData = `
    INSERT INTO todo (id, todo, priority, status, category, due_date)
    VALUES 
    ( ${id}, '${todo}', '${priority}', '${status}', '${category}', ${dueDate} );`;
    const updatedToDo = await database.run(postToDoData);
    response.send("Todo Successfully Added");

  if (updatedToDo.status !== "TODO" || "IN PROGRESS" || "DONE" ) {
    response.status(400);
    response.send("Invalid Todo Status");
  } 
  else if (updatedToDo.priority !== ("HIGH" || "MEDIUM" || "LOW")) {
    response.status(400);
     response.send("Invalid Todo Priority");
  } 
  else if (updatedToDo.category !== ("WORK" || "HOME" || "LEARNING")) {
    response.status(400);
     response.send(`Invalid Todo Category`);
  }
});

module.exports = app