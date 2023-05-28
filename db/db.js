const cassandra = require("cassandra-driver");
const datacenter="datacenter1";
const contactPoints = ['localhost'];

const client = new cassandra.Client({
    contactPoints: contactPoints,
});


module.exports = client;

// exports.init_cassandra = function(req, res){
//     console.log("called");
//     client.connect()
// 		.then(()=>{
// 			const query = "CREATE KEYSPACE IF NOT EXISTS tester2 WITH replication =" +
// 			  "{'class': 'SimpleStrategy', 'replication_factor': '1' };";
// 			return client.execute(query);
// 		})
//         .then(()=>{
//             let use_query = "USE tester2;";
//             return client.execute(use_query);
//         })
// 		.then(()=>{
// 			const query = "CREATE TABLE IF NOT EXISTS employee_by_car_make" +
// 				" (car_make text, id INT, car_model text, PRIMARY KEY(car_make, id));";
// 			return client.execute(query);
// 		})
// 		.catch(function (err) {
// 			console.error('There was an error', err);
// 			return client.shutdown();
// 		});
// }