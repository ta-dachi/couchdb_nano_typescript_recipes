import { nano } from "../../connect";
import * as Nano from "nano";

// We implement Nano.Document because various Nano methods require its properties to be used in the methods.
class Residence implements Nano.Document {
  _id: string;
  _rev: string;
  name: string;
  city: string;

  constructor(name, city) {
    this.name = name;
    this.city = city;
  }

  processAPIResponse(response: Nano.DocumentInsertResponse) {
    if (response.ok === true) {
      this._id = response.id;
      this._rev = response.rev;
    }
  }
}

// We implement Nano.ViewDocument<T>, in this case it is Nano.ViewDocument<Residence>
// The specific properties that are implemented are _id and views.
// VSCode will check and write the types for you using the yellow lightbulb when you hover over code that gives warnings.
class ResidenceView implements Nano.ViewDocument<Residence> {
  _id: string;
  // Use any so that emit works for now.
  views: { [name: string]: Nano.View<Residence> };
  constructor() {
    this.views = {
      all: {
        map: function(doc) {
          // Do not use ES6 arrow functions as this is CouchDB cannot understand ES6 arrows.
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
  try {
    // Check if database is there
    await nano.db.get("residence");
    // Destroy/Clear/Delete database
    await nano.db.destroy("residence");
    await nano.db.create("residence");
  } catch (error) {
    // Make database again
    await nano.db.create("residence");
  }

  // Start using it
  const db = await nano.use("residence");
  // Make a view
  try {
    const getView = await db.get("_design/residence_view", { revs_info: true });
    console.log(getView);
    const destroyDesign = await db.destroy(
      "_design/residence_view",
      getView._rev
    );
  } catch (error) {
    await db.insert(new ResidenceView(), "_design/residence_view");
  }
  // Insert some typed objects that implements the proper Nano interfaces
  await db.insert(new Residence("Jule", "Shenzhen"));
  await db.insert(new Residence("Ange", "Fukuoka"));
  await db.insert(new Residence("Shelly", "Macao"));
  const tryView = await db.view("residence_view", "all", {
    key: "Shelly" // **Important** Corresponds to the (key) in views' map's emit function
  });

  // Output:
  /**
   { total_rows: 3,
      offset: 1,
      rows:
   [ { id: 'bdcaab0e2362a0852348d2dc30037f0b',
       key: 'Shelly',       value: 'bdcaab0e2362a0852348d2dc30037f0b' } ] }
   */
  console.log(tryView);
})();
