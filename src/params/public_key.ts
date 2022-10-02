/** @type {import('@sveltejs/kit').ParamMatcher} */
export function match(param: string)
	{
	return /^[0-9a-fA-F]{66}$/.test(param);
	}
