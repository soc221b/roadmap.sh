import express from "express";
import registerAdmin from "./routes/admin/index.ts";
import registerArticle from "./routes/article/index.ts";
import registerEdit from "./routes/edit/index.ts";
import registerHome from "./routes/home/index.ts";
import registerIndex from "./routes/index/index.ts";
import registerLogin from "./routes/login/index.ts";
import registerLogout from "./routes/logout/index.ts";
import registerNew from "./routes/new/index.ts";
import registerRefresh from "./routes/refresh/index.ts";
import bodyParser from "body-parser";

const PORT = 8080;
const HOSTNAME = "localhost";

const app = express();
app.set("view engine", "pug");
app.use(bodyParser.json());

registerAdmin(app);
registerArticle(app);
registerEdit(app);
registerHome(app);
registerIndex(app);
registerLogin(app);
registerLogout(app);
registerNew(app);
registerRefresh(app);

app.listen(PORT, HOSTNAME, (err) => {
  if (err) {
    console.error(err);
  } else {
    console.log(`App listening on http://${HOSTNAME}:${PORT}`);
  }
});
