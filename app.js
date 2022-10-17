const express = require("express");
const sqlite3 = require("sqlite3");
const path = require("path");
const { open } = require("sqlite");

app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "todoApplication.db");

let db = null;

const initializeServerAndDB = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Started");
    });
  } catch (e) {
    console.log(`DB err: ${e.message}`);
    process.exit(1);
  }
};
initializeServerAndDB();

//API 1
app.get("/todos/", async (request, response) => {
  const { search_q = "", priority = "", status = "" } = request.query;
  const dbQuery = `SELECT * FROM todo
      WHERE priority = "${priority}" OR status = "${status}" OR todo LIKE "%${search_q}%";`;
  const dbResponse = await db.all(dbQuery);
  response.send(dbResponse);
});

//API 2 //working
app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const dbQuery = `SELECT * FROM todo WHERE id = ${todoId};`;
  const dbResponse = await db.get(dbQuery);
  response.send(dbResponse);
});

//API 3 //working
app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status } = request.body;
  const dbQuery = `INSERT INTO todo (id,todo,priority,status)
    VALUES ("${id}","${todo}","${priority}","${status}");`;
  await db.run(dbQuery);
  response.send("Todo Successfully Added");
});

//API 4 //working

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const previousDataQuery = `SELECT * FROM todo WHERE id = ${todoId};`;
  const previousData = await db.get(previousDataQuery);

  let key = Object.keys(request.body);
  let col = key[0];
  let colName = col[0].toUpperCase() + col.slice(1);

  const {
    todo = previousData.todo,
    priority = previousData.priority,
    status = previousData.status,
  } = request.body;

  const dbQuery = `UPDATE todo SET
  todo = "${todo}",status = "${status}",priority = "${priority}" WHERE id = ${todoId};`;
  await db.run(dbQuery);
  response.send(`${colName} Updated`);
});

//API 5 //working
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const dltQuery = `DELETE FROM todo WHERE id = ${todoId};`;
  await db.run(dltQuery);
  response.send("Todo Deleted");
});

module.exports = app;
