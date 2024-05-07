const { cloneDeep } = require('lodash');

let instances = [];
let instanceTypes = [];

const getInstanceTypes = () => {
	return cloneDeep(instanceTypes);
};

const storeInstanceTypes = data => {
	instanceTypes = data;
};

const getInstances = () => {
	return cloneDeep(instances).filter(instance => instance.status !== 'deleted');
};

const addInstance = data => {
	instances.push(data);
};

const deleteInstance = id => {
	const instance = instances.find(instance => instance.id === id);
	if (instance) {
		(instance.status = 'deleted'),
			(instance.deleted_at = new Date().toISOString());
	}
};

module.exports = {
	getInstances,
	addInstance,
	deleteInstance,
	storeInstanceTypes,
	getInstanceTypes,
};
