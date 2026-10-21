# Simple CRUD App (No Delete)

A small product manager that can **Create, Read and Update** records. Delete is deliberately not supported: there's no delete button, and the API answers `405 Method Not Allowed` to `DELETE` requests.

## Run

```
npm start
```

Then open http://localhost:3000. It has no dependencies, so `npm install` isn't needed. Data is saved in `data.json`.

## API

| Method | Endpoint          | Action              |
|--------|-------------------|---------------------|
| GET    | /api/items        | List all items      |
| GET    | /api/items/:id    | Get one item        |
| POST   | /api/items        | Create an item      |
| PUT    | /api/items/:id    | Update an item      |
| DELETE | /api/items/:id    | ❌ 405 Not Allowed  |

Request body for POST/PUT: `{ "name": "Pen", "price": 1.5, "quantity": 10 }`
# rapidapps
