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

const DELETE_TODO = gql`
  mutation DeleteTodo($id: ID!) {
    deleteTodo(id: $id) {
      id
      todo
      dateAdded
      priority
    }
  }
`;

const SUBSCRIBE_TODO = gql`
  subscription TodoSubscription {
    todoUpdate {
      id
      todo
      dateAdded
      priority
    }
  }
`;

const TodosComponent = ({ data, subscribe, deleteTodo }) => {
  useEffect(() => {
    subscribe();
  }, []);

  return (
    <div className="col-md-8">
      <table className="table">
        <tr>
          <th>#</th>
          <th>Task</th>
          <th>Priority</th>
          <th></th>
        </tr>
        {data.todos.map((item, index) => (
          <tr key={item.id}>
            <td>{index + 1}</td>
            <td>{item.todo}</td>
            <td>{item.priority}</td>
            <td>
              <button
                className="btn btn-danger btn-sm"
                onClick={deleteTodo.bind(null, item.id)}
              >
                delete
              </button>
            </td>
          </tr>
        ))}
      </table>
    </div>
  );
};

export default function Todo() {
  const [todo, setTodo] = useState({ todo: "", priority: "" });
  const selectData = ["Urgent", "Normal"];

  const { data: todos, loading, subscribeToMore } = useQuery(TODOS);

  const [todoData] = useMutation(INSERT_TODO);
  const [deleteTodoData] = useMutation(DELETE_TODO);
  const { data: todoInserted } = useSubscription(SUBSCRIBE_TODO);

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

  const deleteTodo = (id) => {
    deleteTodoData({
      variables: {
        id: id,
      },
    });
  };

  const insertedTodo = todoInserted?.todo;

  return (
    <>
      <div className="container" style={{ marginTop: "5vh" }}>
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
            <div></div>
            {!loading && (
              <>
                {insertedTodo && insertedTodo}
                <TodosComponent
                  deleteTodo={deleteTodo}
                  data={todos}
                  subscribe={() =>
                    subscribeToMore({
                      document: SUBSCRIBE_TODO,

                      updateQuery: (prev, { subscriptionData }) => {
                        if (!subscriptionData.data) return prev;
                        const inserted = subscriptionData.data.todoUpdate;

                        return Object.assign({}, prev, {
                          todos: [...inserted],
                        });
                      },
                    })
                  }
                />
              </>
            )}

            {!todos && <p>You have no todo(s) added</p>}
          </div>
        </div>
      </div>
    </>
  );
}
