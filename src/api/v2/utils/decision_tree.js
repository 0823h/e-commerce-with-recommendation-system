const dfd = require("danfojs-node");
dfd
    .readCSV("./AmazonSaleReport.csv")
    .then((df) => {
        // df.head().print();
        let sub_df = df.loc({columns: ["Qty", "AmountVND", "isDeliveredFailed"]})
        sub_df.print()
    })
    .catch((err) => {
        console.log(err);
    });