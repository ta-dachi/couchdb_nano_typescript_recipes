import axios from "axios";
import Nano from "nano";

let nano = Nano("http://localhost:5984");

interface User {
  name: string;
}

interface DBResponse {
  data: any;
}

const DB_ERROR = "DB_ERROR";

interface DBError {
  type: string;
  error: any;
}

class UserView implements Nano.ViewDocument<User> {
  _id: string;
  // Use any so that emit works for now.
  views: { [name: string]: Nano.View<User> };
  constructor() {
    this.views = {
      all: {
        map: function(doc) {
          // Do not use ES6 arrow functions as CouchDB cannot understand ES6 arrows.
          /**
           * emit is a function in CouchDB Database, not found currently in Nano
           * We ignore it so that the typescript compiler does not create errors.
           * And we can freely compile it and let CouchDB use the emit method properly.
           * If there is a better method than @ts-ignore, please let me know!
           */
          // @ts-ignore
          emit(doc.name, doc._id); // emit((key), (value)) <-- Corresponds to key in db.view(... method
        }
      }
    };
  }
}

(async () => {
  const dbName = "pagination";
  // curl -X DELETE http://127.0.0.1:5984/database name
  try {
    const response: DBResponse = await axios.delete<DBResponse>(
      `http://127.0.0.1:5984/${dbName}`
    );
    console.log(response.data);
  } catch (error) {
    const e: DBError = { type: DB_ERROR, error: error.response.data };
    console.log(e);
  }
  // curl -X PUT http://127.0.0.1:5984/pagination

  try {
    const response: DBResponse = await axios.put<DBResponse>(
      `http://127.0.0.1:5984/${dbName}`
    );
    console.log(response.data);
  } catch (error) {
    const e: DBError = { type: DB_ERROR, error: error.response.data };
    console.log(e);
  }

  try {
    const db = await nano.use("pagination");
    await db.insert(new UserView(), "_design/user_view");
  } catch (error) {
    const e: DBError = { type: DB_ERROR, error: error.Error };
    // console.log(e);
  }

  // // curl -X PUT http://127.0.0.1:5984/pagination/001 -d '{"name": "your_name"}'
  try {
    await axios.put<DBResponse>(`http://127.0.0.1:5984/${dbName}/001`, {
      name: "Ilya"
    });
    await axios.put<DBResponse>(`http://127.0.0.1:5984/${dbName}/002`, {
      name: "Shirou"
    });
    await axios.put<DBResponse>(`http://127.0.0.1:5984/${dbName}/003`, {
      name: "Archer"
    });
    await axios.put<DBResponse>(`http://127.0.0.1:5984/${dbName}/004`, {
      name: "Saber"
    });
    await axios.put<DBResponse>(`http://127.0.0.1:5984/${dbName}/005`, {
      name: "Rin"
    });
    await axios.put<DBResponse>(`http://127.0.0.1:5984/${dbName}/006`, {
      name: "Berserker"
    });
    await axios.put<DBResponse>(`http://127.0.0.1:5984/${dbName}/007`, {
      name: "Sakura"
    });
    await axios.put<DBResponse>(`http://127.0.0.1:5984/${dbName}/008`, {
      name: "Taiga"
    });
    await axios.put<DBResponse>(`http://127.0.0.1:5984/${dbName}/009`, {
      name: "Caster"
    });
    await axios.put<DBResponse>(`http://127.0.0.1:5984/${dbName}/010`, {
      name: "Kotomine"
    });
  } catch (error) {
    const e: DBError = { type: DB_ERROR, error: error.response.data };
    console.log(e);
  }
})();
