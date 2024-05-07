const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const { randomIP } = require('./utils');
const {
	getInstances,
	addInstance,
	deleteInstance,
	storeInstanceTypes,
	getInstanceTypes,
} = require('./db');

dotenv.config();
const app = express();
app.use(cors());
app.use(bodyParser.json());

app.listen(8080, () => {
	console.log('server listening on port 8080');

	// Fetch and store instance types on server start to reduce calls to shadeforms api
	// If instance types are modified, the server will continue providing stale data unless restarted
	const options = {
		method: 'GET',
		headers: { 'X-API-KEY': process.env.API_KEY },
	};
	fetch('https://api.shadeform.ai/v1/instances/types', options)
		.then(res => res.json())
		.then(data => storeInstanceTypes(data.instance_types))
		.catch(err => console.error(err));
});

app.get('/instances/types', (req, res) => {
	const instanceTypes = getInstanceTypes();
	res.send(instanceTypes);
});

app.get('/instances', (req, res) => {
	const instances = getInstances();
	res.send(instances);
});

app.post('/instance', (req, res) => {
	if (!req.body) {
		res.status(400).send({ message: 'Instance config is required' });
		return;
	}

	const { cloud, shadeInstanceType, region, shadeCloud, name, os } = req.body;
	const instanceTypes = getInstanceTypes();
	const selectedInstanceType = instanceTypes.find(
		instance =>
			instance.cloud === cloud &&
			instance.shade_instance_type === shadeInstanceType
	);

	if (!selectedInstanceType) {
		res.status(404).send({ message: 'Instance type does not exist' });
		return;
	}

	const createdInstance = {
		...selectedInstanceType,
		id: uuidv4(),
		region: region,
		cloud_assigned_id: uuidv4(),
		shade_cloud: shadeCloud,
		name: name,
		ip: randomIP(),
		ssh_user: 'shadeform',
		ssh_port: 22,
		cost_estimate: (Math.random() * 100).toFixed(2),
		status: 'active',
		created_at: new Date().toISOString(),
		deleted_at: null,
	};
	createdInstance.configuration.os = os;

	addInstance(createdInstance);

	res.status(201).send({
		id: createdInstance.id,
		cloud_assigned_id: createdInstance.cloud_assigned_id,
	});
});

app.post('/instance/:id/delete', (req, res) => {
	if (!req.params.id) {
		res.status(400).send({ message: 'Instance ID is required' });
	}

	deleteInstance(req.params.id);
	res.send({ message: `Instance ${req.params.id} deleted successfully` });
});
