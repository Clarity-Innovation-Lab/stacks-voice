export function input_error(_node: HTMLElement, {duration, easing}: {duration: number, easing: Function})
	{
	return {
		duration,
		css: (t: number) => {
			const eased = easing ? easing(t) : t;
			return `transform: scale(${1+(eased/100)}); box-shadow: inset 0px 0px .2em 0px rgba(255,0,0,${1-eased});`;
			}
		};
	}
