const dfd = require("danfojs-node");
dfd
    .readCSV("./csv/AmazonSaleReport.csv")
    .then((df) => {
        //display top 5 rows
        df.head().print();
    })
    .catch((err) => {
        console.log(err);
    });