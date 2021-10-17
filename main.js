const app = require("express")();
const request = require('request');

const APP_ID;

app.use(require("cookie-parser")());

app.get("/callback", (req, res) => {
    if(req.query.error) {
        console.log("An error occured: " + req.query.error);
        res.send("An error occured " + req.query.error);
    } else if(req.query.token) {
        console.log("Token: " + req.query.token);
        res.cookie('token', req.query.token, { maxAge: 90000 });
        res.redirect("/");
    } else {
        console.log("User clicked back");
        res.send("YOU CLICKED BACK! HOW DARE YOU! <a href='/'>Log in</a>");
    }
});

app.get("/cfplogin", (req, res) => {
    res.redirect("https://cfp.gotdns.ch/auth?redirect=http://localhost/callback&appid=" + APP_ID);
});

app.get("/unfavo", (req, res) => {
    // Get Vkey and Token by looking in your cookies
    // Favo Cat: https://cfp.gotdns.ch/api/memes/favoCat/?vkey=INSERTVKEYHERE&id=12&token=INSERTTOKENHERE
    if(!req.cookies.token) {
        res.redirect("/cfplogin");
        return;
    }
    request('https://cfp.gotdns.ch/api/accounts/getAppInfo/?token=' + req.cookies.token, function (error, response, body) {
        console.log(body);
        const appInfo = JSON.parse(body);
        console.log(appInfo.vkey);
        request("https://cfp.gotdns.ch/api/memes/unfavoCat/?vkey=" + appInfo.vkey + "&id=12&token=" + req.cookies.token, (err, resp, body) => {
            console.log(body);
            res.send(body + " <a href='/'>Go back</a>");
        });
    });
})

app.get("/logout", (req, res) => {
    res.cookie('token', "", { maxAge: 0 });
    res.redirect("/");
});

app.get("/", (req, res) => {
    if(!req.cookies.token) res.send("<h1>Ms memes unfavo</h1><a href='/cfplogin'>Log in using cfp</a>")
    else res.send("<h1>Ms memes unfavo</h1><a href='/logout'>Log out</a> <a href='/unfavo'>Unfavo Cat 12</a>")
});

app.listen(80, () => {
    console.log("Example app running");
});