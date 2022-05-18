let AWS = require("aws-sdk");

//Tabela w bazie danych gdzie przechowujemy rekordy
const tableName = "math-quiz-db";

let dbHelper = function () {};
let docClient = new AWS.DynamoDB.DocumentClient();

// Funkcja pozwalająca na dodanie użytkownika, w oparciu o jego ID
dbHelper.prototype.addUser = (userID) => {
  return new Promise((resolve, reject) => {
    const params = {
      TableName: tableName,
      Item: {
        userId: userID,
        runStreak: "0",
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

// Funkcja służąca do pobierania danych z bazy
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

// Aktualizacja poszczególnego użytkownika w oparciu o jego ID
dbHelper.prototype.updateStreak = (userID, runStreak) => {
  return new Promise((resolve, reject) => {
    const params = {
      TableName: tableName,
      Key: {
        userId: userID,
      },
      UpdateExpression: "set runStreak = :runStreak",
      ExpressionAttributeValues: {
        ":runStreak": runStreak,
      },
      ReturnValues: "UPDATED_NEW",
    };
    docClient.update(params, (err, data) => {
      if (err) {
        console.log(
          "Nie dało się zaaktualizować uzytkownika ------> ",
          JSON.stringify(err)
        );
        return reject("Nie dało się zaaktualizować");
      }
      resolve(data);
    });
  });
};

module.exports = new dbHelper();
