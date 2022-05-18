let AWS = require("aws-sdk");

//Tabela w bazie danych gdzie przechowujemy rekordy
const tableName = "math-quiz-db";

let dbHelper = function () {};
let docClient = new AWS.DynamoDB.DocumentClient();

dbHelper.prototype.addUser = (userID) => {
  return new Promise((resolve, reject) => {
    const params = {
      TableName: tableName,
      Item: {
        userId: userID,
      },
    };
    docClient.put(params, (err, data) => {
      if (err) {
        console.log("Unable to insert =>", JSON.stringify(err));
        return reject("Unable to insert");
      }
      resolve(data);
    });
  });
};

dbHelper.prototype.getData = (userID) => {
  return new Promise((resolve, reject) => {
    const params = {
      TableName: tableName,
      ExpressionAttributeValues: {
        ":user_id": userID,
      },
      KeyConditionExpression: "userId = :user_id",
    };
    docClient.query(params, (err, data) => {
      if (err) {
        console.error(
          "Unable to read item. Error JSON:",
          JSON.stringify(err, null, 2)
        );
        return reject(JSON.stringify(err, null, 2));
      }
      resolve(data.Items[0]);
    });
  });
};

module.exports = new dbHelper();
