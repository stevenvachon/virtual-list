import isObject from "is-object";



export default class VirtualList
{
	#config = null;
	#element = null;



	constructor(element, config)
	{
		if (!isObject(element) || element.nodeType!==Node.ELEMENT_NODE)
		{
			throw new Error("Element argument must be an HTMLElement");
		}
		else if (!isObject(config))
		{
			throw new Error("Config argument must be an object");
		}

		this.#config = config;
		this.#element = element;
	}
}
