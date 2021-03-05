import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useSubscription, gql } from "@apollo/client";

const TODOS = gql`
  query Todos {
    todos {
      id
      todo
      dateAdded
      priority
    }
  }
`;

const INSERT_TODO = gql`
  mutation InsertTodo(
    $id: ID!
    $todo: String!
    $dateAdded: String!
    $priority: Priority!
  ) {
    insertTodo(
      id: $id
      todo: $todo
      dateAdded: $dateAdded
      priority: $priority
    ) {
      id
      todo
      dateAdded
      priority
    }
  }
`;

const SUBSCRIBE_TODO = gql`
  subscription TodoSubscription {
    todoInserted {
      id
      todo
      dateAdded
      priority
    }
  }
`;

export default function Todo() {
  const [todo, setTodo] = useState({ todo: "", priority: "" });
  const selectData = ["Urgent", "Normal"];

  const { data: todos, loading, error } = useQuery(TODOS);

  const [todoData, { data: insertTodo }] = useMutation(INSERT_TODO);

  useEffect(() => {
    console.log(todos);
  }, [todos]);

  const handleTodoChange = ({ target }) => {
    setTodo({ ...todo, [target.name]: target.value });
  };

  const addTodo = () => {
    const id = Math.random().toString();
    const date = new Date();
    const month = date.getMonth();
    const monthDate = date.getDate();
    const year = date.getFullYear();
    const currentDate = month + " " + monthDate + " " + year;
    todoData({
      variables: {
        id: id,
        todo: todo.todo,
        dateAdded: currentDate,
        priority: todo.priority,
      },
    });
  };

  return (
    <>
      {!loading && (
        <div className="container">
          <h1>Todo</h1>
          <div className="row">
            <div className="col-md-4">
              <input
                type="text"
                className="form-control"
                placeholder="New Todo"
                name="todo"
                onChange={handleTodoChange}
              />
            </div>
            <div>
              <select
                className="form-control"
                name="priority"
                onChange={handleTodoChange}
              >
                <option value="">-- select priority --</option>
                {selectData.map((item) => (
                  <option value={item}>{item}</option>
                ))}
              </select>
            </div>
            <div className="col-md-4">
              <button className="btn btn-primary" onClick={addTodo}>
                Add
              </button>
            </div>
            <div className="container" style={{ marginTop: "5vh" }}>
              {todos.todos &&
                todos.todos.map((data) => (
                  <ul>
                    <li>{data.todo}</li>
                  </ul>
                ))}
              {!todos && <p>You have no todo(s) added</p>}
            </div>
          </div>
        </div>
      )}
    </>
  );
}