// Simple cache using localStorage

const promise_store: {[key: string]: Promise<any>} = {};

export function now()
	{
	return Date.now();
	}

export function get(key: string)
	{
	if (promise_store.hasOwnProperty(key))
		return promise_store[key];
	const json = localStorage.getItem(key);
	if (!json)
		return null;
	const item = JSON.parse(json);
	if (item.expire <= now())
		{
		localStorage.removeItem(key);
		return null;
		}
	return item.value;
	}

export function set(key: string, ttl: number, value: any)
	{
	localStorage.setItem(key, JSON.stringify({expire: ttl_to_timestamp(ttl), value}));
	}

export function remember(key: string, ttl: number, callback: Function)
	{
	let item = get(key);
	if (!item)
		{
		item = callback();
		if (item instanceof Promise)
			{
			promise_store[key] = item;
			item.then(inner => set(key, ttl, inner))
				.finally(() => {delete promise_store[key]});
			}
		else
			set(key, ttl, item);
		}
	return item;
	}

export function clean()
	{
	for (let index = 0; index < localStorage.length; ++index)
		get(localStorage.key(index)!);
	}

export function ttl_to_timestamp(ttl: number)
	{
	return ttl + now();
	}

export function minutes(minutes: number)
	{
	return 60000 * minutes;
	}

export function hours(hours: number)
	{
	return 3600000 * hours;
	}



