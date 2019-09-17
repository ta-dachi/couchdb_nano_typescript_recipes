import axios from "axios";
import { rejects } from "assert";

(async () => {
  const response = await axios.get("http://localhost:5984");

  console.log(response.data);

  const all_dbs = await axios.get("http://localhost:5984/_all_dbs");

  console.log(all_dbs.data);

  try {
    const create_db = await axios.put("http://localhost:5984/baseball");
    console.log(create_db.data);
  } catch (error) {
    console.log(error.response.data);
  }
})();
